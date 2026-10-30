---
title: '3x Lenovo M720q in a 10-Inch Rack: The Cluster Hardware Build'
description: 'The parts and build for my Proxmox cluster: three M720q Tiny PCs with dual 10GbE, a DeskPi RackMate T1 Plus, 10GbE switch and PDU, plus one build-order lesson.'
date: '2026-10-27 13:00:00 +0100'
categories: [Hardware, Homelab]
tags: [m720q, 10 inch rack, deskpi rackmate, 10gbe, homelab, 3d printing, youtube]
image: {path: /assets/img/posts/a3ho8IB7p0U.jpg, alt: 3x Lenovo M720q in a 10-Inch Rack}
series: Proxmox Cluster Build
series_order: 1
---

These are the parts for my Proxmox cluster, and everything in this post I bought myself. Three Lenovo M720q Tiny PCs, each with a dual-port 10GbE card, going into a 10-inch rack with a 10GbE switch and a PDU. This post covers the hardware and the rack build; [part 3](/posts/proxmox-cluster-without-a-monitor/) is the Proxmox install.

> **TL;DR**: The M720q is the right tiny PC for this because it has a riser slot that takes a real PCIe card, so each node gets two 10GbE ports. The rack is a DeskPi RackMate T1 Plus (6U), the nodes sit in 3D-printed cradles, and the one lesson from the build is to dry-fit every tray before you screw in the first device. The full parts list is on my [Amazon list](https://www.amazon.com/shop/mylemansonline/list/BJY1P8GA3V64?tag=marcmylemans-20) (affiliate).
{: .prompt-tip }

{% youtube a3ho8IB7p0U %}

## The nodes

Each node is a Lenovo ThinkCentre M720q Tiny with an i5-9400T, 32 GB of RAM and a 2 TB NVMe. The network card is a YuanLey dual-port 10GbE card on the nandfarm riser board made specifically for this model.

That riser is the whole reason I picked the M720q. Most tiny PCs have no room for a real PCIe card, but this one has a slot for a riser, so a full 10GbE card fits. To get it in, the lid comes off and the whole tray slides out; the riser goes in the slot, the card on the riser, and the tray slides back. One node done, the other two get exactly the same treatment.

For a cluster, the view that matters is the back: two 10GbE ports on every node. One port is for storage and the other for everything else, and I deliberately do not bond them; the reasoning is in [Proxmox Ceph Networking: Why I Split My 10GbE NICs](/posts/proxmox-ceph-10gbe-network-design/).

## The rack

The rack is a DeskPi RackMate T1 Plus, a 6U 10-inch rack, and nobody sent me this one either.

{% youtube luNCoZl64aM %}

In the box: the acrylic top cover, a metal blank panel, a 12-port keystone patch panel, two aluminium handles, rubber feet, all the aluminium rods for the frame, and two screwdrivers (a cross-head and a hex), so you don't need tools of your own.

The manual lists every part with a count, and I started by sorting the screws into rows by length, because they all look alike and the manual calls for a specific one at every step. The side frames are a long rod and a short rod screwed into an L and then closed into a rectangle. Tighten every corner while checking against the manual; a frame that's slightly out of square makes the panels hard to slide in later. The protective film comes off the acrylic side panels and they slide into the channel of the frame. The long punched rails are what your gear screws into, front and back.

Rubber feet with anti-slip mats under them, then the cross rails between the two sides and the vented shelf into the bottom. There is a fixing plate for an 80 or 120 mm fan; the fan isn't in the box and I didn't fit one. The manual warns you not to overtighten the handles because they go straight into the acrylic and can crack it, so I tightened until they stopped moving and left it. Last step: the blank panel and the patch panel go into the front rails.

What I think of it: the manual goes page by page and is very clear, every screw is in the box, and it feels solid once it's together. The tinted side panels look good but reflect the whole room, so on camera you will see yourself in them. For mounting you get one vented shelf and one blank panel, so for mini PCs you will be printing or buying your own trays.

## Putting the cluster in

Each node sits in a 3D-printed cradle that screws into the front rails, with a honeycomb panel underneath. I print these in PETG now; the PLA ones softened during the summer heat.

Then the mistake. The switch sits on a sloped tray that screws in above the nodes, and that tray has to go in first. So everything came out again. If you're building one of these: dry-fit every tray and cradle before you screw in the very first device, then put the switch tray in first.

The three power bricks go inside the rack behind the nodes and plug into a 1U PDU with four sockets, so the whole rack needs one power cable. The switch is a XikeStor SKS8300-8T with eight 10GbE ports. Every node gets two cables, and I don't want them together, so storage on one port and everything else on the other. There's no cable management yet; all six leads just hang at the back.

And that's the finished rack: three nodes, a 10GbE switch, one power cable, and the top slot empty on purpose, because something goes in there next: the [Comet X KVM](/posts/glinet-comet-x-kvm-review/).

## Verdict

The M720q with the riser and the dual 10GbE card is a really good fit for a 10-inch rack. The printed cradles work. Plan the order of everything before you start, because I didn't.

All the parts are on the [Amazon list](https://www.amazon.com/shop/mylemansonline/list/BJY1P8GA3V64?tag=marcmylemans-20) (affiliate link, costs you nothing extra), and the hardware I run today is kept up to date on the [My lab](/hardware.html) page.

