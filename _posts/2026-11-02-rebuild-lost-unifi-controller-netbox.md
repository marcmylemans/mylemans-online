---
title: 'Rebuilding a Lost UniFi Controller With NetBox'
description: 'My UniFi controller was gone. How I pulled the config back out of the devices, rebuilt it through the API and made NetBox the source of truth for the whole lab.'
date: '2026-11-02 16:00:00 +0100'
categories: [Networking, Homelab]
tags: [netbox, unifi, source of truth, automation, homelab, proxmox, sophos, python]
image: {path: /assets/img/posts/netbox-source-of-truth/cover.png, alt: Rebuilding a lost UniFi controller with NetBox as source of truth}
---

<!-- ADD: one or two sentences on how the controller actually got lost -->
My UniFi controller was gone, site and all. The strange part was that nothing broke. The switches and the access point kept forwarding traffic on the last config they'd been given, the Wi-Fi worked, and everyone in the house carried on as normal. I just couldn't change anything anymore, and the backup I did have refused to restore into anything useful.

So on a Saturday afternoon I set out to get my network back. By the end of it I had a rebuilt controller, NetBox as the one place that describes the whole network, and a healthy respect for API calls that say "200 OK" and then quietly throw your data away. That last one is the best part of the story, so hang on.

> **The short version:** an adopted UniFi device keeps running its last config without a controller, and you can read all of it: `show running-config` on the switches, `/tmp/system.cfg` on the access point. Rebuild the controller from that through its API rather than by hand. Then put the whole network in NetBox (racks, devices, cables, VLANs, IPs) and let scripts push from it and sync back into it. The trap that cost me the most time: this controller version silently drops `tagged_networkconf_ids` on port profiles and stores the networks a port does *not* carry instead. Read back everything you write.
{: .prompt-tip }

## The devices were the backup all along

My first instinct was to dig through old backups. My second, better instinct was to ask the devices themselves, because a UniFi switch that has lost its controller doesn't forget its config. It just keeps running it, like a train with no driver that happens to be on the right track.

On the two UniFi switches (a US-24-G1 at the core and a US-8-60W for PoE), I SSH'd in, typed `telnet localhost` because the older firmware wants that, then `enable` and `show running-config`. Out came plain FASTPATH config: the VLAN database, the native VLAN per port (`vlan pvid`), the tagged VLANs per port (`vlan tagging`), IGMP snooping, STP priority, the management VLAN. Every port's `vlan participation` and `vlan tagging` lines turn out to map one to one onto a UniFi port profile, which made the rest of the day a lot easier.

The access point (a UAP-AC-Pro) was even friendlier. SSH in, `cat /tmp/system.cfg`, and there's every SSID with its VLAN, security mode and radio settings, as simple `key=value` lines.

> `/tmp/system.cfg` also contains your Wi-Fi passwords in plain text. Treat the copy you pull off the AP like the secret it is.
{: .prompt-warning }

What about that backup? A UniFi `.unf` file is an encrypted zip with a dump of the controller database inside, and the key is the same for every controller and has been public for years. Opening it takes a short script. I got optimistic, put the recovered config into it, encrypted it again and gave it to the new controller. It thought about it for a while and restored a beautifully empty site. I took the hint.

I also rebuilt into a brand-new site rather than the old one. That way nothing stale could sneak back in, and I could compare old and new side by side.

## Rebuilding the controller without clicking

You can rebuild a controller by clicking through the web UI with a printout of the old config next to you. You can also mistype VLAN 334 and find out three weeks later. The web UI talks to an API anyway, so I fed the recovered config straight into that API: networks, port profiles, Wi-Fi networks, user groups, site settings. If you've never used it, my posts on [creating a VLAN](/posts/UnifiAPI_CreateVlan/) and [creating a site](/posts/UnifiAPI_CreateNewSite/) with the UniFi API are a gentle start.

What you need to know on UniFi OS Server <!-- VERIFY: behaviour on newer Network application versions -->:

1. Log in with `POST /api/auth/login` and keep the session cookie.
2. Grab the CSRF token from the `x-csrf-token` response header and send it as `X-CSRF-Token` on every write, or you get a 403. Responses keep handing you a fresh one in `x-updated-csrf-token`.
3. The network endpoints live under `/proxy/network/api/s/<site>/`. The old `/api/s/<site>/` path just gives you a 404 on UniFi OS.
4. Read with `stat/device`, `stat/sta` and `rest/setting`; write with `rest/networkconf`, `rest/portconf`, `rest/wlanconf` and `rest/usergroup`.
5. Wi-Fi networks need an AP group ID, and `rest/apgroups` answers with a 400 on this version. The v2 endpoint, `/proxy/network/v2/api/site/<site>/apgroups`, works.

One network per VLAN, an access profile per VLAN, hybrid profiles for the trunks, IGMP snooping where the old switches had it, and the SSIDs straight from `system.cfg`, so every phone and laptop in the house reconnected without anyone typing a password. Every single call came back 200. Remember that number, because it comes back later.

## Why I didn't stop there

At this point I could have closed the laptop. The controller was back, the network was the same as before. But the whole mess had a cause: the only complete description of my network lived inside one application, and the rest of it was spread over three other switches with three other web interfaces (an Aruba 2530 on my desk, an EdgeSwitch on the workbench and the XikeStor behind my [Proxmox cluster](/posts/m720q-10-inch-rack-cluster-build/)). Lose one app and you're doing archaeology on a Saturday.

So I made [NetBox](https://netbox.dev/) the source of truth. In plain words: NetBox describes what the network *should* look like, config gets generated from it, and scripts check every hour that reality still agrees.

Filling it is mostly a matter of doing things in the right order, because everything points at something you made earlier. Device types first (one per model, so every switch arrives with its ports already listed), then the site and the two racks, the lab rack and the small one on my desk. Then roles and platforms, then the devices, then VLANs and prefixes, then each port's mode with its VLANs copied from the switch configs. Then the cables, which I named end to end ("CORE-24 to POE-1") after actually following each one, because "I'm pretty sure that one goes to the PoE switch" is how this kind of day goes wrong. IP addresses last. If you're designing VLANs from scratch rather than writing down existing ones, my [VLAN planning post](/posts/how-to-plan-vlans-with-networkdesigner/) is the better starting point.

<!-- SCREENSHOT: NetBox rack elevation of the lab rack -->

Stock NetBox covered nearly everything. I added a handful of custom fields, and the useful trick is splitting them into two kinds. Some are mine: which tool manages a device (the UniFi controller, a NetBox template, or me by hand), its UniFi MAC address, whether a VLAN should exist in UniFi. The others belong to the scripts: firmware, controller state, LLDP results, which clients sit on which port. I never touch the second kind. If a person and a script both write to the same field, sooner or later neither of them knows which value is true.

Anything odd I found while documenting got a journal entry and a `finding` tag instead of an immediate fix. Otherwise I'd have ended up fixing my Ceph VLAN that evening and still not have had a working controller.

## Config for the switches UniFi doesn't touch

The Aruba, the EdgeSwitch and the XikeStor now get their config from a Jinja2 template in NetBox, one per platform, filled with that switch's ports, VLANs and a few settings of its own. I kept three rules for the templates. Render only what differs from the switch's defaults, in the same layout the switch uses itself, so a diff stays short and an empty diff means "matches". Work things out instead of typing them twice, so the VLAN list comes from the ports. And check every template line by line against the real switch before trusting it.

A small Python script, `switch_provision.py`, takes it from there. It asks NetBox to render the config, reads the live config from the switch (over SSH with Netmiko for the Aruba and EdgeSwitch, through the web interface for the XikeStor), and shows the difference. That's all it does by default. Only with `--push` does it actually send the lines, report anything the switch rejects, save and compare again.

```bash
python3 switch_provision.py SW-DESK            # dry run: just the diff
python3 switch_provision.py SW-WORKBENCH --push
```

It merges rather than wipes, so anything that only exists on the switch survives and keeps nagging you in every diff until you deal with it. The XikeStor gets an extra `--first-push` flag, because I haven't proven its SSH push yet and I'd like to be in the room when I do.

> Keep a second way into a switch (a console cable, or a machine that isn't behind it) whenever a push touches its uplink or the management VLAN.
{: .prompt-warning }

## Four scripts that keep NetBox honest

A source of truth that nobody checks turns into a wiki within a month. So four NetBox custom scripts keep it in line with reality. I wrote them with help from AI tools; testing them against my own gear, and deciding what each one is allowed to touch, was my part.

- **Proxmox sync**, hourly: every VM and container becomes a NetBox VM, with its disks, network cards, VLAN and IP.
- **Sophos sync**, hourly: VLANs, gateway addresses, DHCP pools, reserved addresses and DNS names from the firewall.
- **UniFi inventory**, hourly: firmware and state of each UniFi device, which clients sit on which port, and a check of every port's LLDP neighbour against the cable in NetBox.
- **UniFi provision**, only when I run it: pushes networks, port profiles, port settings, names, IPs and STP from NetBox to the controller.

They all behave the same way, and I'd steal these habits for any sync you write. They do a dry run unless you tick "Commit changes" (NetBox then rolls everything back and shows you what *would* have happened). They never delete anything: a VM that disappears from Proxmox becomes "decommissioning" so its history stays. They only read from the other system, apart from the UniFi provision script, and only when told to. And they use their own accounts with the least rights the other side allows, like a read-only Proxmox token and a read-only Sophos API user.

The dry runs earned their keep straight away. The first Sophos run would have put my public IP address in IPAM, under-counted my DHCP reservations because one lease can hold several of them, and overwritten DNS names with aliases. It also flagged a few DNS records pointing at machines that no longer exist, which is a polite way of saying I hadn't cleaned up in a while.

My favourite is the LLDP check. Every hour it asks each switch port who it actually sees on the other end and compares that with the cable in NetBox. If they disagree, either NetBox is wrong or the cable is, and the device gets a `finding` tag until I sort it out.

## Adoption day, or: how my desk went offline three times

Everything was ready. NetBox was full, the dry runs were clean, and the three UniFi devices only had to be adopted by the new controller. That took about three hours and cost my desk three short outages.

The preparation went fine. I moved the controller into the same management VLAN as the devices it manages, gave it a DNS name and a Let's Encrypt certificate (the scripts refuse to connect by IP for exactly that reason; see my [UniFi in Docker with Let's Encrypt](/posts/InstallingUnifiDockerLetsEncrypt/) post), opened inform (TCP 8080) and STUN (UDP 3478) to it, and pointed every device at it with `set-inform http://<controller-name>:8080/inform`.

Then the access point needed a factory reset, and it fooled me. `syswrapper.sh restore-default` looked like it worked: the SSIDs disappeared. So I pulled the power while it was still rebooting, which interrupted the erase, and the old config came right back. The reset pin did work: hold it for 10 seconds on a running AP, then leave it completely alone for 5 minutes. Hold it while powering on and you start TFTP recovery instead, which is a different afternoon.

Next, the PoE switch. Adopting it made it reboot, and because the AP's passthrough port feeds my desk switch, my entire desk went with it: Wi-Fi, desk switch, workbench, the PC I was working on. It came back on factory settings with a new DHCP address, a factory name, and every port on the "All" profile. My scripts couldn't find it anymore, because its name and IP had both changed. Matching on the MAC address first, then name, then IP, fixed that for good.

> Adoption resets a UniFi switch to factory port settings, so every access port lands in VLAN 1 until you provision it. Have the dry run ready before you click Adopt, and switch off automatic firmware upgrades so you get one reboot instead of two.
{: .prompt-warning }

Before adopting the core switch, I compared its CLI config with NetBox port by port, and I'm glad I did. Two ports were hybrids, native VLAN 30 *with VLAN 1 tagged on top*, and NetBox only had that in a description, which no script reads. Provisioning would have quietly stripped VLAN 1 from both ports, and I'd have spent the evening wondering why two devices had stopped talking.

Getting the core switch adopted meant moving cables around, and at one point the core reached the PoE switch through a port NetBox had down as an access port in a different VLAN. One provisioning run later and the core would have cut itself off. So I wrote the order down and moved one cable at a time, never adding a second link between two switches before removing the first. Not exciting, but it's what kept the house online.

## Remember the 200?

With everything adopted, I did one more dry run. It wanted to create port profiles: the same profiles I had created that afternoon.

So I read them back from the controller. Every hybrid profile had saved without its VLAN list. This controller version accepts `tagged_networkconf_ids`, answers with a cheerful 200, and throws the field away. A profile with no VLAN list passes *every* VLAN tagged, which is why everything had kept working all afternoon, and also why two of my ports were a lot more open than they used to be.

The controller stores the opposite instead: `excluded_networkconf_ids`, the networks a port does *not* carry. I tested that on an unused profile first, then changed the script to send the complement:

```python
every = [i for i in all_ids + [net_id.get(1)] if i]      # every network, Default included
excluded = sorted(i for i in every if i != nid and i not in tagged) if tagged else []
body = {"name": name, "forward": "customize" if tagged else "native",
        "native_networkconf_id": nid,
        "tagged_vlan_mgmt": "custom" if tagged else "block_all",
        "excluded_networkconf_ids": excluded}
```

The same silent drop happens to per-port speed and disabled ports, and I haven't cracked that format yet <!-- VERIFY: still true after the open-items session -->. The lesson I'm keeping: after the first write of any new kind, read the object back. A 200 only means the controller didn't object, not that it listened.

<!-- SCREENSHOT: dry-run log showing the profile VLAN set being tightened -->

## What I'd tell a friend doing this

Before you panic about a lost controller, SSH into your devices: they're probably holding the backup you're looking for. Rebuild through the API from that data instead of retyping it. Compare the live config with your documentation port by port before the first push, because that one check saved me two broken ports. Write cable moves down while you make them. And keep the WAN off your switches unless you have a reason: my modem used to reach the firewall through a VLAN on the core switch, which tied the whole house's internet to the riskiest adoption of the day. It now plugs straight into the firewall.

These days the rule is simple: change NetBox first, do a dry run, read the diff, then commit. A port change on a UniFi switch is an edit in NetBox plus a provision run. On the other switches it's an edit plus `switch_provision.py`. A new VLAN gets created in NetBox and on the firewall, and the hourly sync fills in the rest.

And if the controller dies again? A new controller, a site, one env file and one provision run rebuild the networks, profiles and port settings. The SSIDs are the one thing still living only in the controller and the AP, so the controller gets proper backups now. NetBox's database does too, since that's what everything gets rebuilt from.

## FAQ

### Can you recover a UniFi network without the controller?

Yes. Adopted UniFi devices keep running their last provisioned config. You can read the full switch config with `show running-config` over SSH and the access point's SSIDs and radio settings from `/tmp/system.cfg`, then rebuild a controller from that.

### Can you restore an old .unf backup by hand?

You can decrypt it, since the encryption key is the same for every controller, and inside is a dump of the controller database. Editing it and encrypting it again didn't give me a usable restore, though; the controller came up with an empty site. Rebuilding through the API was faster and more reliable.

### Is NetBox overkill for a homelab?

For three switches and a firewall, documentation alone would be overkill. It earns its place once config is generated from it and scripts check it against reality: then it's the thing you rebuild from, not a wiki that slowly drifts out of date.

### Does NetBox talk to UniFi out of the box?

Not in my setup: the UniFi integration here is my own pair of NetBox custom scripts using the controller's API. There are community plugins and projects for UniFi and NetBox, but I didn't use one. <!-- VERIFY: current state of community UniFi/NetBox integrations -->

### Why are my UniFi port profile VLANs not saving?

On the controller version I used, `tagged_networkconf_ids` is accepted and silently dropped. The profile stores `excluded_networkconf_ids`, the networks the port does not carry, so send the complement of your tagged list instead.

## Learn the network side properly

> If VLANs, trunks and native VLANs still feel like guesswork, the networking path on [Mylemans Labs](https://labs.mylemans.online) walks through them in order, free.
{: .prompt-info }
