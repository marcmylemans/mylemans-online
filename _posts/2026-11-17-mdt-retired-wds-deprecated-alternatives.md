---
title: 'MDT Is Retired, WDS Is Next: What to Use Instead'
description: 'My MDT server still deploys Windows 11, but plain WDS installs already broke. What I checked on my server and the free tools I''d move to: DeployR or OSDCloud.'
date: '2026-11-17 13:00:00 +0100'
categories: [Windows Server, Windows 11]
tags: [mdt, wds, deployr, osdcloud, pxe, windows 11, windows server, youtube]
image: {path: /assets/img/posts/VIDEO_ID.jpg, alt: 'MDT Is Retired, WDS Is Next: What to Use Instead'}
---


My MDT server put Windows 11 on a test machine this week, long after Microsoft retired it in January 2026. If you still run MDT, yours didn't stop working in January either. What changed is that it will never get another fix. Then in September Microsoft put WDS on the same list, which is the part that network boots the machines in the first place.

So I went through my own setup to see what still works on a patched server, what already stopped working and what I'd move to. I built the first MDT version of this server in [a five-part series](/posts/MDTPart1/) back in 2023, so this is also me finding out how long those posts will stay useful.

> **The short version:** MDT was retired in January 2026. It still runs but it gets no updates, no security fixes and no work for new Windows releases. WDS stays in Windows Server 2025 and is planned for deprecation in the release after that. What already broke is installing Windows 11 straight from WDS with the `boot.wim` from the ISO: Microsoft blocks that workflow. On a Server 2025 WDS it ends in `A media driver your computer needs is missing`. Hands-free WDS installs with an answer file are off by default since the April 2026 updates (the registry value is `AllowHandsFreeFunctionality`). A custom boot image still works, which is why MDT keeps going. For a domain with task sequences I'd try DeployR Community first; for a few machines without a server, OSDCloud.
{: .prompt-tip }

## First, the three jobs that server does

You know how it goes with a deployment server. You build it once, it works and you don't look at it again for three years. So before changing anything I split mine into the three jobs it does, because each one has a different end date.

1. **The first boot.** Something has to hand a blank PC its first boot over the network cable. That's PXE. On my server WDS does it.
2. **The steps.** Something has to partition the disk, put Windows on it, join the domain and install the apps. That list is the task sequence and it's MDT's job.
3. **The image.** Windows itself. Microsoft still ships that, so it's the one part I don't have to worry about.

MDT is the retired one and WDS is the one on notice. The first real breakage came from the one that isn't retired yet.

## Retired didn't mean broken

I read [Microsoft's retirement notice](https://learn.microsoft.com/en-us/troubleshoot/mem/configmgr/mdt/mdt-retirement) closely, because "immediate retirement" sounds worse than what it says. Existing installations keep working as they are. What stops is everything around them: no updates, no security fixes, no compatibility work for new Windows releases. The download itself may disappear too.

For a server like mine that comes down to three things:

- It's frozen on build 8456, the last one Microsoft released.
- Every new Windows build and every new ADK is now a test I get to run myself. You do too.
- The retirement followed a security report about MDT that Microsoft chose not to fix. Michael Niehaus, who worked on MDT for years, wrote up [what the issue is and how to deal with it](https://oofhours.com/2026/01/23/following-up-on-the-mdt-security-issue/). His first piece of advice is the one I'd repeat: an MDT server has no business being reachable from the internet.

One habit I'd pass on: keep a copy of the MDT installer and the ADK version that works for you. If the download goes away, that copy is the only way to rebuild the server.

## The part that did break

Plenty of small shops never bothered with MDT. You might know one or you might be one. They took the boot image from the Windows ISO, added it to WDS and installed from there. I rebuilt that in my lab with a Windows 11 image and network booted a test VM.

<!-- VERIFY: replace the next paragraph with what your VM actually showed, with the exact text. If it doesn't fail on your WDS version, run the hands-free answer file test instead and rewrite this section around that. -->
It never got to a desktop. On a WDS server running Windows Server 2025, Setup stops with `A media driver your computer needs is missing`, which sends you looking for a storage driver that has nothing to do with it. On older WDS versions you get a notice that the WDS client is partly deprecated, with a link to Microsoft's support page.

Two separate changes are behind it:

- Microsoft [blocks the workflow](https://learn.microsoft.com/en-us/windows/deployment/wds-boot-support) where WDS serves the `boot.wim` from installation media and runs Windows Setup itself, for Windows 11 and for Server 2025.
- The hands-free version, where an answer file clicks through Setup for you, is disabled by default on any server with the updates from 14 April 2026 or later. That answer file travelled over the network without authentication. Answer files tend to contain a password. Microsoft tracks it as CVE-2026-0386 and explains it in [KB5074952](https://support.microsoft.com/en-us/servicing/os/windows/2025/12/windows-deployment-services-wds-hands-free-deployment-hardening-guidance-related-to-cve-2026-0386).

> If a PC network boots from WDS and Windows 11 Setup stops with `A media driver your computer needs is missing`, check which boot image WDS is serving. The `boot.wim` from the Windows ISO isn't supported there any more. Don't hunt for drivers and don't re-enable hands-free deployment in the registry; use a custom boot image from a deployment tool.
{: .prompt-warning }

What still works is exactly that: a custom boot image, a small Windows that a deployment tool builds for you. It's what MDT hands to WDS. I pointed the same VM at my MDT boot image and it booted, showed the wizard and deployed.

So the first thing to go was WDS doing the install by itself. The retired tool is what keeps my setup alive. It's also why every replacement further down brings its own boot image.

## Two checks I ran on my own server

Both run on the WDS server in an elevated PowerShell window.

Which boot images are loaded:

```powershell
Get-WdsBootImage | Format-List
```

If the only image in that list is the one you copied from the Windows ISO, you're on the workflow that's blocked.

Whether somebody forced hands-free deployment back on:

```powershell
reg query "HKLM\SYSTEM\CurrentControlSet\Services\WdsServer\Providers\WdsImgSrv\Unattend" /v AllowHandsFreeFunctionality
```

- `0x0`: disabled, which is the safe setting.
- `0x1`: somebody re-enabled it and the answer file is readable without authentication again.
- Value not found: on a server with the April 2026 updates or later, that means disabled by default.

That second one is the test I'd do on any WDS server I inherit. A `1` there means somebody chose to turn it back on.

## WDS is on notice, not gone

In September 2026 Microsoft published an [early notice](https://support.microsoft.com/en-us/help/5129631) that the WDS server role is planned for deprecation in the next Windows Server release: the role, its PXE boot, the management tools and multicast.

Two details matter. WDS stays available on Server 2025 and earlier for their whole supported life. Deprecated means Microsoft stops developing it and stops recommending it; removal comes later and has no date yet.

So nothing forces a move this month. I just don't want whatever I move to depending on WDS.

## What Microsoft says to use and why it didn't help me

Microsoft names two replacements for MDT.

**Windows Autopilot** takes a PC that already has Windows on it and sets it up from the cloud. For a new laptop straight from the box that's great. It needs an MDM service such as Intune plus Entra ID behind it. It also doesn't put Windows on an empty disk or a broken one.

**Configuration Manager** does everything MDT did and more. For thirty PCs I think it's too much server and too much licence.

If you're a small shop that just wants to wipe a machine and rebuild it, neither of them really helps. That leaves the tools Microsoft didn't make.

## The four I looked at

| Tool | Needs a server | Brings its own PXE | Works like | What it leaves to you |
| --- | --- | --- | --- | --- |
| DeployR Community | Yes, Windows | Yes | MDT task sequences | Support: community only |
| OSDCloud | No | No, USB or ISO | Downloads Windows and drivers at deploy time | Everything after Windows is on the disk |
| PSD | Yes, on top of MDT | Uses what you have | MDT with PowerShell scripts | The retired tool underneath |
| FOG | Yes, Linux | Yes | Capture one machine, clone it to others | Building and maintaining that reference machine |

### DeployR Community

If you liked MDT, [DeployR](https://www.2pintsoftware.com/products/deployr-community) from 2Pint Software is the one I'd look at first. Michael Niehaus works on it, so the ideas are the same: task sequences, driver handling, USB media. It brings its own PXE server, which means no WDS.

The Community edition is free and covers Windows 10, Windows 11, Server 2022 and Server 2025. You request a licence on their site; mine arrived. Support is the community on Reddit, so if it breaks on a Friday afternoon there's nobody you can call.

### OSDCloud

[OSDCloud](https://www.osdcloud.com/) is the opposite, because there's no server at all. You boot a USB stick or an ISO into a small Windows, it wipes the disk, downloads Windows from Microsoft and pulls the driver pack for that model from Dell, HP or Lenovo. So the machine you're building needs internet.

It's a free PowerShell module, these days maintained under Recast Software. What it leaves to you is everything after Windows is on the disk: the domain join, the apps and the settings are your own scripts or Intune's job.

### PSD

[PSD](https://github.com/FriendsOfMDT/PSD) (PowerShell Deployment) swaps MDT's old VBScript for PowerShell and keeps the Deployment Workbench you already know. It's a community project and the release listed in the README when I checked was from September 2024.

That's comfortable, but you're still sitting on top of the retired tool. I'd see it as buying time.

### FOG

[FOG](https://fogproject.org/) is a free, open source imaging server that runs on Linux and network boots machines itself. It captures a finished PC and clones it onto others, which is a different way of working from building each machine out of a clean image. It started in a school IT department.

There are paid products as well. I haven't tested any of them, so they're not in this post.

## What I'd tell a friend doing this

If you have a domain, a server on site and task sequences you want to keep, try DeployR Community first. It's the smallest change in how you work.

If you have a handful of machines, no server and Intune or nothing at all behind it, take OSDCloud on a USB stick. If you're already on Autopilot, keep one of those two around anyway for the day a disk dies.

If your MDT works today, don't panic. There's no deadline here: MDT deploys Windows 11 right now and WDS is staying in Server 2025. What nobody outside Microsoft can tell you is which Windows release will be the one that breaks it. I'd rather move while the old setup still works and I can fall back on it.

Where I am myself: my MDT server still runs, on Proxmox VMs with [the VirtIO driver fix](/posts/Proxmox_Import_drivers_in_MDT/) I wrote about earlier. I have the DeployR licence and I haven't done a real deployment with it yet, so no verdict from me. That's the next post. The one thing I want to see for myself is whether the [domain join](/posts/MDTPart5/) I automated in MDT carries over.

## FAQ

### Does MDT still work with Windows 11?

Yes, for now. Microsoft's notice says existing installations keep working. It also says there will be no compatibility updates for new Windows releases, so every new build is something you test yourself on build 8456.

### Why does WDS show "A media driver your computer needs is missing"?

Because WDS is serving the `boot.wim` from the Windows installation media. Microsoft no longer supports that for Windows 11 or on a WDS server running Windows Server 2025. This error is the expected result there. Use a custom boot image from a deployment tool.

### Is WDS being removed from Windows Server 2025?

No. WDS stays available on Windows Server 2025 and earlier for their supported lifecycle. The deprecation is planned for the next Windows Server release and removal comes later, without a date so far.

### What is the free replacement for MDT?

There isn't one from Microsoft. The closest free tool is DeployR Community from 2Pint Software, which runs task sequences and has its own PXE server. OSDCloud is free too and works without any server.

### Should I set AllowHandsFreeFunctionality to 1 to fix WDS?

No. That value brings back hands-free deployment and with it unauthenticated access to the answer file, which is the vulnerability Microsoft closed in April 2026 (CVE-2026-0386). Leave it at 0 or absent and move to a custom boot image.

## Get the network side right

> Network boot depends on DHCP and VLANs doing their job. If those still feel like guesswork, the networking path on [Mylemans Labs](https://labs.mylemans.online) walks through them in order, free.
{: .prompt-info }

Prefer to watch? The full look is in [the video coming soon](https://www.youtube.com/@mylemansonline), and there's more homelab and IT content over on Mylemans Online on YouTube.
