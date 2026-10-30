---
title: 'Home Server: 5 Things to Do First'
description: 'You installed Proxmox, now what? The five first steps that take a home server from installed to solid: fixed IP, no root, snapshots, updates, docs.'
date: '2026-06-22 08:00:00'
categories: [Homelab, Proxmox]
tags: [proxmox, homelab, tutorial, security, youtube]
image: {path: /assets/img/posts/43b86a272612.webp, alt: 'Home Server: 5 Things to Do First'}
series: Home server from scratch
series_order: 2
---

The install finished, the dashboard loaded, and now you're staring at a powerful machine with no idea what to do next. That's the moment nobody makes a video about, and it's exactly where good homelabs quietly go wrong.

The video version of these five steps:

{% youtube n08LhVszAZA %}

This post is the five things to do *first*, before you install a single app. They take maybe twenty minutes, and they're the difference between a server you own and a black box you're scared to touch in three weeks. Number five is the one almost everyone skips.

> The five first steps on a fresh home server: (1) give it a fixed IP so it stops moving, (2) stop logging in as root and make a normal admin user, (3) take a snapshot before you tinker, (4) set up updates, and (5) write down what you did. Do these before installing anything else.
{: .prompt-tip }

This is the companion to the video below, and it assumes you've already got a server running. If you haven't built one yet, start with [Build Your First Home Server in 30 Minutes](https://blog.mylemans.online/posts/build-your-first-home-server-proxmox/), then come back here.

## 1\. Give it a fixed address so it stops moving

By default, your home network hands out addresses like seats at a busy restaurant: you get whatever's free that day. That's fine for your phone. It's a problem for a server, because tomorrow it might sit at a different address and you won't know where to find it.

The fix is to reserve its spot. The technical name is a *DHCP reservation* (or a static lease), but the idea is simple: you tell your router "this machine always gets this address." You do it once, in your router, by tying the server's network card to a fixed address.

Pin it once and everything else you do gets easier, because the server never moves again.

> Avoid setting a static IP \*inside\* Proxmox that overlaps your router's automatic range. If the router later hands that same address to another device, you get an address clash and one of them drops off the network. Reserve it in the router, or set it statically in Proxmox \*\*and\*\* exclude it from the router's range. Don't do half of each.
{: .prompt-warning }

## 2\. Stop logging in as root

Right now you're almost certainly logging in as `root`, the top-level account that can do anything, including break everything with one wrong command.

Think of it like the master key to a building. You don't carry the master key around for daily work; you carry the key to your own office and fetch the master key when you genuinely need it. Same idea on a server: make yourself a normal user that can perform admin tasks when needed, and leave the all-powerful account in the drawer.

Create a dedicated admin user, then test it the honest way: log in as the new user and try an admin action *before* granting the rights. It should be refused. Good, that proves the account is limited. Then grant the proper permission and try again, and it works.

That refused-then-allowed moment is the whole point: you now work as a limited user by default, which is exactly how it should be.

## 3\. The proper way: groups and roles (optional)

If you're the only person who'll ever touch this server, step 2 is plenty and you can skip to the snapshot. But if other people will ever log in, or you just want to do it the way it's done in a real environment, this is how the pros structure it.

Instead of handing permissions to each person one by one, you create *roles*. Think of a role as a job title: each title carries exactly the powers that job needs, no more. Then you put people into *groups* that match the job, and the group gets the role. New person? Drop them in the group; they inherit everything. The magic part is that a role can be scoped to only part of the system.

Here are two genuinely useful roles to build:

* **VM operator:** can manage the virtual machines that already exist (start, stop, change settings, take snapshots) but **cannot create new ones** and **cannot touch the storage layer**. In Proxmox terms, the privilege that controls "can create a VM" is `VM.Allocate`. Leave it out and they can drive the cars but not build new ones. Give no `Datastore.\*` privileges and the storage layer stays invisible to them.
* **Full admin:** can create VMs (`VM.Allocate` included) and manage storage (`Datastore.Allocate`, `Datastore.AllocateSpace`, `Datastore.Audit`). Proxmox ships a built-in `PVEAdmin` role that already covers this, so you may not even build it by hand.

Then you wire it up: create a group per job, assign the role to the *group* at a *path* (a path is just where the permission applies, scope it to everything or to a single resource pool), and drop your user into the group. From then on, managing who-can-do-what is just managing group membership. That's how it's done in a real shop, and you just set it up at home.

## 4\. Take a snapshot before you tinker

A snapshot is a save point, exactly like in a game: a moment you can jump back to if you break something. Proxmox makes one in a couple of clicks.

The reason to do it *now* and not "someday" is that you're about to experiment. You'll install things, break things, and learn. A snapshot turns every one of those mistakes into a five-second undo instead of a full reinstall. Take one now, and take one before anything risky.

## 5\. Set up updates

The boring one that matters most. Your server needs updates for the same reason your phone does: the holes attackers use are the ones nobody patched. The command matters less than the habit. Updating isn't a one-time thing you did once; it's a small, regular check you start on day one.

> On a fresh Proxmox install without a subscription, the enterprise update repository will throw an error until you switch to the no-subscription repository. That's the most common "why won't it update" wall beginners hit.
{: .prompt-warning }

## 6\. Write down what you did (the one everyone skips)

It sounds too simple to matter. It's the most important thing on this list.

Here's the failure mode I've watched happen a hundred times: you build something brilliant on a quiet Sunday. Three weeks later something breaks, and you cannot remember the address, the account you made, or what you changed. The thing you built becomes a black box you're afraid to touch, so you never touch it, and eventually you wipe it and start over.

So keep a boring little note: the server's address, the admin account, where your snapshots are, what you've installed and why. A plain text file beats nothing. A small self-hosted documentation tool is even better, and it happens to be a great first thing to actually self-host, which is exactly where the next video goes.

That note is what turns a one-off weekend project into a system you own and can maintain. Not a fancy tool. A note.

## FAQ

### What should I do right after installing Proxmox?

Before installing any apps: reserve a fixed IP for the server in your router, create a non-root admin user, take a snapshot, configure updates (switch off the enterprise repo if you have no subscription), and write down the server's details. Those five steps take about twenty minutes and prevent the most common beginner problems.

### Do I really need to stop using the root account at home?

For a solo homelab it's not strictly required, but it's a good habit and it's free. The real value shows the moment a second person needs access, or you start running automation: a limited admin user means one wrong command or one compromised login can't quietly wreck everything.

### What's the difference between VM.Allocate and the other VM permissions in Proxmox?

`VM.Allocate` is the privilege that lets a user *create* (or remove) virtual machines. The other `VM.\*` privileges, like config, power management and snapshots, only let a user manage VMs that already exist. So a role with the config privileges but without `VM.Allocate` can run and tweak existing VMs but can't create new ones.

### Why does my fresh Proxmox install fail to update?

Most likely it's still pointed at the enterprise repository, which needs a paid subscription. Switching to the no-subscription repository fixes it for home use. This is the single most common "it won't update" issue on a new install.

### What's the best way to document a home server?

Anything you'll actually keep updated. A plain text file or a note in your password manager is fine to start. A small self-hosted wiki or documentation app is the step up, and self-hosting one is a useful beginner project in its own right.

## Recap

Five steps, about twenty minutes: pin the address, ditch root for daily use, snapshot before you tinker, set up updates, and write down what you did. That's the gap between a server that's merely *installed* and one that's genuinely solid, the foundation everything else gets built on.

The natural next step after this is putting your first real app on the server, which is the next video in the series.

> Want to do this properly, in order, with the reasoning behind each step? The free, hands-on \*\*Virtualization path on Mylemans Labs\*\* walks you through it from a fresh install to a server you can actually rely on. \[Start the path here.](https://labs.mylemans.online)
{: .prompt-info }

---
*Prefer to watch? This guide accompanies my video walkthrough. For the full build and more homelab tutorials, check out [Mylemans Online on YouTube](https://www.youtube.com/@MylemansOnline).*
