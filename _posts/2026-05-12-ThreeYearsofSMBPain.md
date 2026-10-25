---
title: Three Years of SMB Pain From a Single Phantom DNS Record
description: A customer's random application time-outs traced through SMB client logs to a stale _msdcs delegation pointing at a demoted DC, and the cleanup.
date: '2026-05-12'
categories: [Windows Server]
tags: []
image: {path: /assets/img/posts/covers/threeyearsofsmbpain.jpg, alt: Three Years of SMB Pain From a Single Phantom DNS Record}
---

## The call that started it

A customer calls us about their main production application. Operators are complaining the system keeps timing out. They have to redo work, restart the app, sometimes lose a transaction. "It feels like it hangs randomly. We have no idea where to look. Here's an export of one day's event log, can you take a peek?"

A few thousand lines. Lots of normal activity, transactions, badge scans, photos per truck. On first read it looks fine. But once you start grouping the events, a small pattern emerges. Every workday has a handful of incidents like these:

```
08:50:56  Badge IN      Devices     : Timeout Error (8)
10:13:11  WS-OPS01      Exception   : Operating system network error.
                                       File: \\APP-SRV01\AppDB\Base.DB
10:13:54  Camera Out    Devices     : Timeout Error Photo 2 (6)
13:37:01  Camera Out    Devices     : Timeout Error Photo 2 (6)
```

A mix of peripheral device time-outs and one outright network error on the database share. Not many per day, but enough to drive operators up the wall when they hit during a busy moment. We ask for more logs. Ten days of exports plus a list of 26 specific timestamps where the customer said it was painful.

This is when things got interesting.

## Phase 1: what the logs are too honest to hide

I parsed the ten days of logs and went looking for events tagged as `Timeout` or `Error`. Maybe a dozen per day, no clear pattern. The actual finding came from a sequence that repeats around almost every one of those 26 customer-reported moments:

```
Scale out    Actions     : Start
Scale out    Actions     : OK <weight> kg
Photo 2      Actions     : Start (APP-SRV01)
Photo 2      Actions     : OK ...jpg     <-- 5 to 17 seconds later
```

In a healthy run, the gap between "Photo Start" and "Photo OK" is under a second. Throughout the reported incidents, that gap stretched to 5, 7, sometimes 17 seconds. Over the ten days I counted 145 slow photo uploads on a total of 2123, with 21 of them above 10 seconds.

That alone teaches you something important. **From the operator's chair, a slow action feels exactly like a failure.** They are standing at the terminal, the next truck is rolling onto the scale, and the screen does not respond. They click again. They tap a different field. In our logs that registers as a graceful sequence of `Modify` actions. In their head the app is hanging.

So the working theory at this point was: this is not really about the application timing out. It is about photo uploads being slow. Disk I/O on the server, antivirus scanning the new JPGs, or the IP cameras themselves dragging their feet.

But the customer's list also included one event on a specific day where the application actually did break, not just stall:

```
WS-OPS01  Exception: Operating system network error.
                     File: \\APP-SRV01\AppDB\Base.DB
```

A network error on the SMB share that holds the entire database. Not a stall, an outright break. The operator could not work for several minutes. That deserved a deeper look.

## Phase 2: when the application logs run out, ask Windows

If your application says "I cannot open this file," the truth lies one or two layers below. SMB, TCP, DNS. So we exported the SMB Client and Server event logs from the application server. A few lines of PowerShell with `wevtutil epl` and `Get-WinEvent -FilterHashtable` dumped everything to `.evtx` plus `.csv` for fast slicing.

The numbers were absurd. **7,737 SMB Connectivity events** on this single server, of which 2,110 errors and 2,160 warnings, going back to **May 2023**. Three years of records. The chart over time looks like a steady drip with the occasional spike.

The top event IDs told the story:

```
ID 30808  1536x  Connection to share has been re-established
                 -> \\DC01\Shares
ID 30807  1503x  Connection to share was lost
ID 30800  1282x  Server name could not be resolved
                 -> Server name: NT AUTHORITY
ID 30805   657x  Client session lost
ID 30803   389x  Device timeout
ID 30810   958x  TCP/IP transport interface added
ID 30811    69x  TCP/IP transport interface removed
```

Something has been flickering daily for three years. Not loudly, just 1 to 5 events per day on average, but constantly. The most frequent target of the failures: the domain controller, `DC01.contoso.local`. The second most frequent: `NT AUTHORITY`, which is not even a server name, it is a built-in Windows security principal. That kind of weird false lookup smells like a fallback path inside the name resolution stack.

And on the SMB Server side of the same machine, we found 1,485 events of `Reopen failed` on the database share, hitting the same handful of database index files. That event fires when a client had a file open, briefly lost the connection, came back, and tried to reopen the same handle that had already expired.

The conclusion forced itself on us: the customer's "slow application" was sitting on top of a chronic SMB instability that nobody had ever noticed in the right log. Time to walk over to the domain controller.

## Phase 3: the domain controller spills the beans

We ran our diagnostic script on the DC. Same recipe: SMB logs, system events, plus the DC-specific checks: `dcdiag /v /c`, `repadmin /replsummary`, DNS server configuration, time service, SMB configuration. PowerShell, read-only, output zipped.

Expect to spend an hour walking through that output. In this case the smoking gun was on **page three of the DCDiag DNS test**:

```
TEST: Delegations (Del)
   Delegation information for the zone: contoso.local.
      Delegated domain name: _msdcs.contoso.local.
         Error: DNS server: server01.contoso.local.
         IP:<Unavailable> [Missing glue A record]
         [Error details: 9714 - DNS name does not exist.]
```

A delegation pointing at a server that has not existed for years.

## A quick detour: why this is bad

If you are not deep in AD internals, here is why this one record breaks so much.

The zone `_msdcs.<domain>` is the one every Windows client uses to locate a domain controller. SRV records for LDAP, Kerberos, KDC, GC. Glue A records for each DC's name. Every single logon, GPO refresh, Kerberos ticket request, and secure channel check starts with a lookup in `_msdcs.<domain>` for a usable DC.

When that zone gets a delegation to a DNS server that does not exist, every client's DC discovery query has to time out on the dead delegation first. It eventually falls back to another path (the forwarder, the cache, another configured DNS server) and finds the real DC. But the time-out adds a few seconds. Sometimes one second, sometimes five.

That is plenty to break a fragile SMB session. SMB has a default KeepAlive of two minutes. A short DNS hiccup can fail a Kerberos ticket renewal. A failed renewal can drop the session. A dropped session triggers a reconnect. On a database file with an open handle, that becomes a `Reopen failed` on the server and an `Operating system network error` in the application.

The customer feels: "Sometimes it just hangs for a moment." We measure: "Three years of daily short SMB session drops."

## Phase 4: the cleanup

The cleanup itself is fast. The interesting part is realising what to look for, because a single demoted DC tends to leave traces in three places at once.

In **DNS Manager** on the surviving DC: any NS records pointing at the ghost server in `contoso.local`, any glue A records under `_msdcs.<domain>`, and any leftovers in the reverse lookup zones (`16.10.10.in-addr.arpa` and friends). All gone.

In **Active Directory Sites and Services**: walk to `Sites > Default-First-Site-Name > Servers` and see whether the orphaned DC still has its server object plus an `NTDS Settings` child. If yes, remove the NTDS Settings first, then the server object.

In **Active Directory Users and Computers**: search for the old DC name. If a computer account is still there, it is most likely orphaned. Delete it.

In some cases you also need `ntdsutil metadata cleanup`, but modern Windows handles most of that for you when you delete a DC computer object through ADUC.

In our case, the cleanup turned up not one but three ghost DCs in the DNS records, with IPs in the original DC range (`10.10.16.1`, `.3`, `.4`) next to the surviving DC on `.2`. Almost certainly remnants of two or three earlier domain controllers that had been demoted over the years without finishing the job. We cleaned all of them.

## Phase 5: verify, do not trust

The risk after this kind of cleanup is overconfidence. You ran a couple of `dcdiag` tests, they passed, you call it done. A week later somebody finds a record you missed.

We wrote a verification script that performs about twenty checks in 30 seconds, each one returning PASS or FAIL:

```
DNS
  - _msdcs delegation no longer points to the ghost DC
  - _msdcs zone contains no stale records
  - Glue A record for the ghost DC does not resolve

DCDiag
  - dcdiag /test:DNS /DnsDelegation         (was failing before)
  - dcdiag /test:VerifyEnterpriseReferences (was failing before)
  - dcdiag /test:Replications
  - dcdiag /test:KnowsOfRoleHolders

Active Directory
  - No ghost DC computer object
  - No ghost DC in Sites > Servers container
  - No NTDS Settings remnants
  - Known DC list returns only the surviving DC

DC discovery
  - nltest /dsgetdc returns the surviving DC
  - SRV records for _ldap._tcp.dc._msdcs.<domain> point only to live DC(s)

SMB events since cleanup
  - No new SMB 1016 (Reopen failed) events in the last 2 hours
  - No new DNS Client 1014 timeouts mentioning _msdcs
```

It is read-only, runs in 30 seconds, can be re-run a week later, and gives you something objective to show the customer or paste into a ticket.

## What still has to be fixed for the slow photos

To be clear, the ghost DC explains the **real outages** (the 11/05 incident in our case) and the **chronic one-to-five-second freezes** that operators perceive as glitches. But it does not fully explain the 145 slow photo uploads.

For that second track we lined up a few changes:

**Archive the camera folders.** `C:\App\Cam2\` and `C:\App\Cam3\` on the application server had been filling up for years. At 200 photos per day, never archived, you easily end up with hundreds of thousands of files in one folder. NTFS slows down measurably at that scale, especially when antivirus rescans the folder on every new file.

**Antivirus exclusions** for the application folder and the database share. This is standard guidance from pretty much every ERP and database vendor, and gets forgotten every time the AV product is replaced.

**SMB Bandwidth Throttling** was enabled on the clients (`EnableBandwidthThrottling: True`). Useful on a laptop occasionally syncing OneDrive. Bad idea on a fixed workstation hitting a database share all day long.

**Time service drift.** The DC was pulling time from `pool.ntp.org` and occasionally failed even to resolve the NTP pool name in DNS. With drift exceeding five seconds we were genuinely lucky Kerberos did not start failing. We moved that to a reliable local NTP source.

**SMB1 was still enabled** on the DC. No reason for that in 2026. Disabled it. Also closes a noisy protocol negotiation step that some clients still try first.

## What this case teaches

One. **Application time-outs are symptoms, not causes.** The application is being honest when it says "I cannot open this file." The cause sits two or three layers below, in the network, SMB, or DNS stack. The deeper layer rarely shows up in the application log itself.

Two. **A good log export is gold.** SMB Client Connectivity, SMB Server Operational, Directory Service. They are sitting on every Windows server right now, switched on by default, untouched by most admins. They are slightly buried under `Applications and Services Logs > Microsoft > Windows` in Event Viewer, which is enough to keep them out of sight.

Three. **What `dcdiag` flags today, was created years ago.** AD has a long memory. A DC that was once demoted without proper cleanup will keep generating phantom events for three, five, sometimes ten years. Do the cleanup at decommissioning time, not after a slow trickle of weird incidents.

Four. **Automate your first-pass diagnostics.** We built two scripts during this engagement, one for the DC and one for the application server. Read-only, output zipped, ready to send to the customer. The next time someone calls about "weird SMB issues," we can run them in five minutes and have facts on the table instead of guesses.

Five. **Always finish with a verification script.** Not by clicking through tabs in DCDiag to confirm something is clean. A PASS or FAIL output is faster, repeatable, and you can paste it into the customer email as proof.

## The tools

Nothing exotic on this case. The breakdown:

`pdftotext` and a bit of Python for parsing the application's PDF event log exports. PowerShell `Get-WinEvent` and `wevtutil` for the SMB and system log exports. `dcdiag`, `repadmin`, `nltest`, and `w32tm` for the DC checks. `Resolve-DnsName` and `Get-DnsServerResourceRecord` for DNS validation. Excel for pivot tables of timeouts per day per camera.

All Windows built-in or trivially installed. The difference is not in the tools, it is in the method: structured logging, structured correlation, structured validation.

## Closing thought

Three years. One forgotten DNS record. An entire production environment slightly miserable, never bad enough to escalate, always bad enough to annoy. The cleanup itself took thirty minutes. The hardest part will be re-training the operators to believe the application is not going to freeze on them anymore.

If any of this sounds familiar in your own environment, do me a favour. Open DNS Manager today, navigate to `_msdcs.<your domain>`, and check which name servers are listed for the delegation. If even one of them does not exist anymore, you now know what you are doing this weekend.

---

*Found this case study useful? I am planning a short companion video on my [Mylemans Online YouTube channel](https://www.youtube.com/@mylemans) covering the diagnostic and verification scripts in detail. Drop your questions in the comments and I will answer them in the next post.*
