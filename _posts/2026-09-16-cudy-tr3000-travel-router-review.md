---
title: 'Cudy TR3000 Review: A Budget OpenWrt Travel Router with VPN'
description: 'The Cudy TR3000 is a pocket travel router running OpenWrt underneath, with a 2.5GbE WAN port and a built-in VPN client. Unboxing, setup, connecting it to CloudConnexa with OpenVPN, and what I would improve.'
date: '2026-09-16 13:00:00 +0200'
categories: [Reviews, Networking]
tags: [cudy, tr3000, travel router, openwrt, openvpn, cloudconnexa, vpn, review, youtube]
image: {path: /assets/img/posts/8SUszRoc4bw.jpg, alt: Cudy TR3000 review}
---

By the end of this post the Cudy TR3000 is connected to my VPN all by itself, and every device behind it goes through the tunnel with one switch on the side to turn it off. First, the honest part: Cudy sent me this router for free. They are not paying for the review, they did not see it before you did, and I still mark it as sponsored because the unit was a gift.

> **TL;DR**: About 80 euros, 160 grams, OpenWrt underneath Cudy's own interface, five operation modes including hotel Wi-Fi (WISP), a 2.5GbE WAN port, one gigabit LAN port, and a VPN page with eleven options. The OpenVPN client worked on the first try once I had the config file; the page just doesn't tell you where that file comes from. The physical VPN switch is the best feature for travel.
{: .prompt-tip }

{% youtube 8SUszRoc4bw %}

## In the box

A white inner box with a start card on top. On the back of the router: a 2.5GbE WAN port for the internet connection coming in, one gigabit LAN port, a USB 3.0 port, and USB-C for power, so it runs off a phone charger or a laptop charger. Also in the box: a power adapter, a flat Ethernet cable and a quick installation guide.

When I plugged it in, the light on top started blinking red, which with that shape looks like a pair of eyes glaring at me before I'd even set it up. More on that below.

It's small, about 160 g, so it fits a jacket pocket. If you've looked at travel routers before it will look familiar: on paper it's almost the same hardware as a GL.iNet Beryl AX, the same MediaTek chip, the same memory and the same 2.5GbE port. I don't own a Beryl AX so I can only compare specs, but the Cudy is about 80 euros and the Beryl about 100.

## Setup

The first thing it asks for is an admin password, and if you look at the address bar it says LuCI. That is the web interface of OpenWrt, so underneath Cudy's design this is OpenWrt, and that matters when we get to the VPN.

Quick setup starts with the operation mode. Wireless router is the normal one with a cable into the WAN port. In a hotel it can connect to the hotel's Wi-Fi as its internet and make its own network for your devices; that's WISP mode. Router, access point and extender cover the usual cases at home.

Then the time zone, and this is where I found out why it was glaring at me: "no broadband access signal is detected", because I had never plugged in the internet cable. Cable in, light turns white.

Wi-Fi name and password, a summary, apply. On the dashboard the firmware said 2.4.22; a newer version came out in July, which I come back to at the end.

## The VPN

Under VPN there are eleven options: OpenVPN, WireGuard and ZeroTier, each as client or server, plus IPsec for site-to-site, and PPTP and L2TP. I'd skip PPTP; it's old and not considered secure anymore.

I went with the OpenVPN client, because that's what my VPN service uses, and this is where I got stuck. The router wants an OpenVPN config file and nothing on the page tells you where that file comes from. It comes from your own VPN provider. Mine is CloudConnexa, OpenVPN's cloud service, which I already use for the lab (full setup in [CloudConnexa + Intune: Zero-Trust Remote Access](/posts/cloudconnexa-intune-zero-trust-remote-access/)).

In CloudConnexa I added a new connector called TR3000. One honest note: my plan allows two connectors and this put me at two of two, so check your own plan before you count on it. It then asks what kind of router you have, and this is why I pointed at the address bar earlier: I just pick OpenWrt, because that's what the router runs. Download the profile, upload it on the router's VPN page, apply.

The router says connected and CloudConnexa shows the TR3000 online. From that moment every device on the router's Wi-Fi goes through the tunnel without any VPN software on the devices themselves. You don't have to send everything through it either: you can choose which devices or networks use the VPN and the rest goes out the normal way, which is split tunnelling.

## The rest of the interface

Under advanced settings you get most of what a normal home router has: a guest network, custom DNS, port forwarding. There's a diagnostics page with ping, traceroute and nslookup built in, which is handy when a hotel network is being difficult.

The most useful thing for travel is the switch on the side. It turns the VPN on and off, so I don't need to open a page to get in or out of the tunnel. You can also assign it to switch the light off instead, but it's one or the other.

## Firmware

I recorded all of this on 2.4.22. Version 2.5.21 came out in July with security fixes, DNS ad blocking and more VPN options, so I updated afterwards. If your screens look a bit different from the video, that's why.

## Verdict

The five modes cover pretty much every situation I can think of, and the VPN worked on the first try once I had the right file. The side switch is really handy. What I'd like Cudy to improve is the VPN page: it should tell you where the config file comes from. And there's only one LAN port. I haven't taken it on a trip yet, so I can't tell you how it deals with a hotel captive portal.

If you want a small router with OpenWrt underneath and a VPN client built in, for travel or as a separate router for your lab, I think this is a good one for the price.

{% include google-adsense.html %}
