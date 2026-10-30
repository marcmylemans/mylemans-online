---
title: 'Plan VLANs for a New Site with Network Designer'
description: A practical walkthrough of using networkdesigner.app to plan VLANs and subnets for a new network site
date: '2026-03-30'
categories: [Networking, Homelab]
tags: [vlan, networking, network design, unifi, homelab, ip planning, networkdesigner]
image: {path: /assets/img/posts/covers/how-to-plan-vlans-with-networkdesigner.jpg, alt: How to Plan VLANs for a New Network Site Using Network Designer}
---

## The Problem: Configuring VLANs Without a Plan

Picture this: You've just decided to segment your network into separate VLANs. You're excited to isolate your IoT devices from your home servers, lock down a management VLAN, and keep guest traffic separate. But you dive straight in - configuring VLAN IDs on your switch, assigning IP ranges on the fly, picking gateway addresses as you go.

Two hours later, you realize your IoT devices are on the same subnet as your critical servers. A guest laptop can't reach the internet because a gateway conflicts with your router's address. You're editing interface configurations from scratch and cursing yourself for not spending 15 minutes planning first.

I built [networkdesigner.app](https://networkdesigner.app) because I kept running into this exact scenario. After years of managing networks - both small homelabs and larger deployments - I realized that **the best networks are planned before hardware is touched**. This guide walks you through how the tool works.

## The Design Model: One Site, One /16

Network Designer uses a clean, opinionated model: **every site gets a single `10.x.0.0/16` block**. You pick the second octet (the "Site ID"), and all your VLANs carve subnets out of that /16.

So if your site ID is `10`, your entire site lives in `10.10.0.0/16`. Management VLAN might be `10.10.2.0/24`, Office LAN `10.10.20.0/24`, and so on. This makes multi-site VPN and IPsec routing predictable - no accidental subnet overlaps between sites.

## Step 1: Enter a Site ID

Open [networkdesigner.app](https://networkdesigner.app) and enter a Site ID - any number from 1 to 254 (except 99, which is reserved for guest VLANs). This becomes the second octet of your entire site's address space.

For a homelab, `10` or `1` works fine. For a business with multiple sites, use meaningful numbers - `10` for HQ, `20` for branch 1, `30` for branch 2.

The tool shows you the base block immediately: `Base: 10.{x}.0.0/16`. Everything else flows from here.

## Step 2: Select Your VLANs

The wizard offers four preset VLAN types that cover most environments:

| Preset | VLAN ID | Purpose |
|--------|---------|---------|
| Management | 2 | Router/switch admin interfaces, monitoring, restricted access |
| Voice (VoIP) | 10 | IP phones, voice infrastructure |
| Office / Client LAN | 20 | Laptops, workstations, printers |
| Guest (Isolated) | 99 | Guest Wi-Fi, untrusted devices, internet-only |

You can enable any combination of these, and you can add custom VLANs on top - just give them a VLAN ID and a name. For a homelab, Management + Office LAN + a custom "Servers" or "IoT" VLAN is a common starting point.

## Step 3: Enter Device Counts

For each VLAN, enter how many devices you expect to connect. This is what the tool uses to automatically size subnets.

- **Under ~250 devices**: the tool assigns a `/24` (254 usable hosts)
- **250 to ~500 devices**: it steps up to a `/23` (510 usable hosts)

You don't need to calculate this yourself. Just enter realistic numbers and the tool picks the right size. If you're unsure, err on the side of more - subnets are cheap.

## Step 4: Review the Generated Plan

Once you hit Continue, the tool presents your complete network plan as a table:

| VLAN | Name | Subnet | Gateway | Usable Range |
|------|------|--------|---------|--------------|
| 2 | Management | 10.10.2.0/24 | 10.10.2.1 | 10.10.2.2 - 10.10.2.254 |
| 20 | Office / Client LAN | 10.10.20.0/24 | 10.10.20.1 | 10.10.20.2 - 10.10.20.254 |
| 99 | Guest (Isolated) | 10.10.99.0/24 | 10.10.99.1 | 10.10.99.2 - 10.10.99.254 |

If any subnets overlap or there's a configuration issue, warnings appear at the bottom. Fix the inputs and regenerate. No spreadsheet, no manual subnet math.

## Step 5: Export and Use Your Plan

With the plan confirmed, you have three export options:

**Export CSV** - downloads a spreadsheet-ready file with all VLANs, subnets, gateways, usable ranges, and IPsec routing flags. Reference this while configuring your switch.

**Export PDF** - downloads a clean PDF with the full VLAN table. Useful for documentation, printing, or handing off to someone else configuring the network.

**Export IPsec Handover** - downloads a DOCX template pre-filled with your local subnets for IPsec tunnel configuration. If you're setting up a site-to-site VPN, this gives the remote side exactly what they need: your encryption domains, proposed tunnel ranges, and a checklist.

There's also a **CLI Preview** - a modal that shows you the vendor-specific commands to configure your switches based on the plan. Check this before you start typing on the actual hardware.

## Why I Built It This Way

The `10.x.0.0/16` model is opinionated by design. A tool that lets you do anything also lets you make every mistake. By constraining to one /16 per site, the tool eliminates a whole category of problems:

- No accidental overlaps between sites (each has its own /16)
- No "which subnet was that again?" confusion (VLAN 20 is always in the `.20.x` range)
- No manual subnet math (device count determines size automatically)
- IPsec handover is straightforward because subnets are predictable

That said, if your existing network doesn't use `10.x` addressing, the tool won't fit perfectly. It's built for greenfield sites and new deployments, not for restructuring an existing `192.168.x.x` setup.

## Start Planning

[Open networkdesigner.app](https://networkdesigner.app) - it's free, runs in the browser, and requires no sign-up. Enter a site ID, pick your VLANs, enter device counts, and you'll have a complete addressing plan in under five minutes.

Have questions about the tool or VLAN planning in general? Drop a comment below.
