---
title: 'GL.iNet Comet X Review: 4-Port KVM over IP for a 10-Inch Rack'
description: 'Hands-on with the GL.iNet Comet X, the four-port KVM over IP that installed my whole Proxmox cluster without a monitor: unboxing, rack mount, setup, the one gotcha, and what I would improve.'
date: '2026-10-27 13:30:00 +0100'
categories: [Reviews, Hardware]
tags: [gl.inet, comet x, kvm over ip, homelab, 10 inch rack, review, youtube]
image: {path: /assets/img/posts/oTdKprLL6Xk.jpg, alt: GL.iNet Comet X review}
series: Proxmox Cluster Build
series_order: 2
---

One of my Proxmox nodes is booting and I'm watching it from a browser tab. The box doing that is the GL.iNet Comet X, a four-port KVM over IP, and it lives in the top slot of my cluster rack. I bought this one myself; nobody sent it.

> **TL;DR**: Four HDMI+USB ports, PoE or USB-C power, rack ears that fit 10-inch rails, and all the cables in the box. It gave me the screen and keyboard of all three nodes in one browser tab, down to the BIOS, which is what I used to [install the whole cluster without a monitor](/posts/proxmox-cluster-without-a-monitor/). Two annoyances: when the first setup fails it only says "connection lost", and it adds eight cables to the back of a small rack.
{: .prompt-tip }

{% youtube oTdKprLL6Xk %}

## In the box

The unit, two rack ears, a bag of screws and a quick-start guide. On the front: two USB ports, a small display and a button to switch between ports. On the back: four ports, each with an HDMI and a USB, one per machine. It comes with four HDMI cables and four USB cables, so you have the cables for all four machines without buying anything. Power is USB-C or PoE.

## Into the rack

The rack ears screw onto the sides and fit 10-inch rails straight away. It goes into the one slot I left empty in the [rack build](/posts/m720q-10-inch-rack-cluster-build/), at the top. Every node gets one HDMI for the screen and one USB for keyboard and mouse, two cables per node, and the rack's top slot is filled.

## Setup

The first time you open the web interface it asks for an admin password, then shows the port list. I renamed the first three ports pve1, pve2 and pve3. Settings cover video, keyboard, mouse and network; the one I changed is mouse mode to **absolute**, so the pointer lands where you click.

On the first address I got no picture on any port. After it moved to a new address the picture was there immediately, so if you see nothing, check what address the unit actually has before you check cables. From then on I could switch between all three nodes and get each console in the same browser tab.

One gotcha that cost me a login: my first password attempt on a node failed, and the KVM showed me why at the same moment. Num Lock was off on the node. If a password with numbers fails through a KVM, check Num Lock first.

## The part I bought it for

I reboot a node and see the whole boot in the browser, from the Lenovo logo to the login prompt. That means I can get into the BIOS without a monitor anywhere near the rack, which is how node 3 got its boot order fixed during the cluster install.

## The Comet Q

I also picked up the Comet Q, the small single-port one with the round screen. It powers over USB-C and the first thing it asks for is your Wi-Fi; once connected, the screen shows its address so you know where to find it. So far I've only done the Wi-Fi setup on it and haven't connected it to a machine, so no verdict on that one yet.

## Verdict

Seeing a machine boot in a browser tab is exactly what I want from a KVM in a home lab, and four ports fits a three or four node rack. All the cables were in the box and the rack ears fit. What I'd improve: when the first setup didn't work, the screen only said the connection was lost, not why. And it adds eight cables to the back of a 10-inch rack that already had none of them managed.

It's on the [My lab](/hardware.html) page and in the [cluster parts list](https://www.amazon.com/shop/mylemansonline/list/BJY1P8GA3V64?tag=marcmylemans-20) (affiliate).

