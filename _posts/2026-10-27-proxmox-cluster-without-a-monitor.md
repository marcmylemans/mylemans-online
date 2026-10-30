---
title: 'Build a 3-Node Proxmox Ceph Cluster Without a Monitor'
description: 'Three Lenovo M720q nodes from bare metal to a Proxmox cluster with Ceph, a backup server and Let''s Encrypt certificates, installed entirely through a KVM over IP.'
date: '2026-10-27 14:00:00 +0100'
categories: [Proxmox, Homelab]
tags: [proxmox, ceph, cluster, corosync, kvm over ip, lets encrypt, homelab, youtube]
image: {path: /assets/img/posts/qUpjmH_u_bY.jpg, alt: Build a 3-Node Proxmox Ceph Cluster Without a Monitor}
series: Proxmox Cluster Build
series_order: 3
---

I installed three mini PCs, built a cluster with shared storage, restored a VM onto it and put real certificates on every node, and there was no monitor or keyboard anywhere near the rack. Every keystroke went through the KVM in the top slot. Halfway through I also wiped a node that was working fine and installed it again because of one word I typed into the wrong field. This post is the written version of that build, in the order I did it, including the parts that went wrong.

> **TL;DR**: Install Proxmox on each node through the KVM with the ISO mounted as virtual USB. Give the network ports fixed names and split the two 10GbE ports by job (one for Ceph with jumbo frames, one bridge with VLANs for management, Corosync and VMs). Create the cluster with two links, install Ceph from the wizard, wipe the NVMe disks before you let Ceph touch them, add your backup server, then get Let's Encrypt certificates through the Cloudflare DNS challenge. Get the hostname right at install time; everything after it inherits that name.
{: .prompt-tip }

{% youtube qUpjmH_u_bY %}

The short version above is the main-channel video. The full click-by-click guide, about ten minutes, is on the second channel:

{% youtube rHQe3w7m8V4 %}

## What I'm building

Three Lenovo ThinkCentre M720q Tiny PCs, each with an i5-9400T, 32 GB of RAM, a 2 TB NVMe and a dual-port 10GbE card on a riser. Each machine runs Proxmox, so one box becomes several separate computers. The three of them agree on who runs what, which is the cluster. The disks in all three act like one shared disk, which is Ceph. The whole thing sits in a 10-inch rack with a 10GbE switch and a PDU; the hardware and the rack build are in [part 1 and 2 of this series](/posts/m720q-10-inch-rack-cluster-build/).

The grey box at the top of the rack is a [GL.iNet Comet X](/posts/glinet-comet-x-kvm-review/), a four-port KVM over IP. My desktop can't even reach the management network of these nodes, the ping fails three times, but the KVM doesn't care about my network. It's plugged into the HDMI and USB port of each node, so I get the screen and keyboard of all three in a browser tab, right down to the BIOS.

## The network plan

Every node has two 10GbE ports and I didn't bond them. I split them:

- **nic1** does nothing but storage traffic, with an MTU of 9000, because that is what Ceph wants.
- **nic2** becomes a bridge for the VMs with no address of its own. On top of that bridge, **VLAN 2** is management (with the gateway) and **VLAN 51** is Corosync, the cluster's heartbeat.
- The onboard 1GbE port stays unused.

The downside is that each cable is now the only path for its job: if the storage cable goes, that node's disk drops out of the cluster even though the machine is fine. I chose that on purpose, and the full reasoning is in [Proxmox Ceph Networking: Why I Split My 10GbE NICs](/posts/proxmox-ceph-10gbe-network-design/).

In the installer I tick **pin network interface names**, so the ports keep their names after a kernel update or a new card. Without that, a rename can break the whole network config behind your back.

## Installing node 1

I upload the Proxmox ISO to the KVM, it shows up on the node as a USB stick, and the node boots from it like it was plugged in. The red lines on every boot are harmless on this hardware.

Target disk, country (which fills in the time zone), keyboard, root password and an email for alerts. Then the page to take your time on: the hostname is the **full** name, `pve1.lab.mylemans.online`, and I type a static address over the one it got from DHCP. Keep an eye on that field, because it's where node 2 goes wrong.

The first thing a fresh node does is fail on update, because it's pointed at the paid repository and I don't have a subscription. I run the community post-install script, say yes to the free repositories, no to the test repository and no to disabling high availability. Later I also run the CPU governor script and the fix for the Intel network card on the onboard port.

## Node 2, twice

The KVM switches over and the same installer comes up. Here I typed the domain into the IP field, so the hostname was just `pve`. The summary page showed me that before anything was written, and I pressed install anyway. Now the node calls itself `pve`, and `/etc/hosts` thinks so too.

Renaming a Proxmox node touches several places, and once it's in a cluster it gets a lot worse. On a fresh node a reinstall is about four minutes, so I mounted the ISO again and installed it properly as `pve2`. From then on I read the summary page like a checklist. Why the name matters so much comes back at the end, with the certificates.

> Read the installer's summary page before you press install. A wrong hostname is four minutes to fix now and an afternoon to fix later.
{: .prompt-warning }

## Node 3

Node 3 kept booting its old install instead of the ISO, so I went into the Lenovo BIOS through the KVM and picked the ISO from the startup menu. It couldn't detect the country, which doesn't matter, I filled it in by hand. A few read errors at the end of the install, but it finished and booted fine. It asked me to remove the boot media, so I unmounted it in the KVM panel.

## Putting the network plan on the real nodes

On each node: nic1 gets the storage address and MTU 9000. nic2 becomes `vmbr0` with no address. On the bridge, VLAN 2 gets the management address and the gateway, VLAN 51 gets the Corosync address. Then I move the node's own name onto the management VLAN and reconnect on that address, because that's where the other nodes will look for it.

## Creating the cluster

On pve1, **Datacenter → Cluster → Create Cluster**, name `labcluster`, with two links: the heartbeat VLAN as link 0 and the storage port as link 1. If one network dies, the nodes can still talk over the other.

Node 2's first join failed in the same second, so a check refused it before anything changed: link 1 had come up empty in the join dialog. I picked it again and the second join worked. When node 3 joined I got "authentication failed", which is normal: the cluster service restarts and logs your browser out. Log in again and it's there.

## Ceph

Ceph gets installed on all three nodes from the wizard. The red warning straight after is expected; there are no disks in Ceph yet. Then monitors and managers on the two other nodes.

Node 2 said it had **no unused disks**, while the 2 TB NVMe was sitting right there. I created the OSD from the shell and it came up wrong: an "SSD" of 1 KB, not in use. So I stopped it, destroyed it and created it again from the GUI with the device class set to NVMe by hand. After that, three OSDs, all up and in.

> Wipe the disks before you start. A disk with an old partition table on it is what produced the 1 KB OSD. `wipefs -a /dev/nvme0n1` on a fresh node saves the detour.
{: .prompt-tip }

Then a pool for the VM disks and CephFS on top for ISOs and templates, so every node sees the same files. I turn off the local storage on each node so nothing lands on one node by accident.

## Backups

My Proxmox Backup Server already exists ([install guide here](/posts/proxmox-backup-server/)), so I attach it as storage. The fastest way to prove the shared storage works is to restore a real VM from backup straight onto Ceph, so that's what I did. Then an Ubuntu ISO downloaded straight into CephFS, and a nightly backup job for everything at 21:00.

That's a working cluster.

## Real certificates on internal nodes

Every node still shows a certificate warning. These nodes aren't reachable from the internet, so Let's Encrypt can't check them directly. Instead it checks a DNS record at Cloudflare, which works for machines that stay internal.

1. **Datacenter → ACME**: register an account with Let's Encrypt.
2. Add the **Cloudflare DNS plugin** with an API token that has one permission: edit DNS on that one zone, nothing else.
3. On each node, **System → Certificates → ACME**: add the node's name, select the plugin, order. It waits for the DNS record to spread before Let's Encrypt checks it.

The second the certificate goes on, the browser refuses the page: the tab is still on the IP address, and the certificate is issued to `pve1.lab.mylemans.online`. Open it by name and it's trusted. Same for the other two.

And that is why I reinstalled node 2. The certificate is issued to a name and the cluster finds each node by name too, so everything you build on top depends on it. If the name is wrong at install, everything after it inherits the wrong name.

## What I'd do differently

From first install to last certificate it took about an hour and a half, with one node installed twice. If I did it again I'd wipe the disks before starting and read every summary page.

The parts I'm not proud of yet: there is no cable management in this rack at all, and the whole cluster hangs off one switch, which is the one thing I didn't build redundancy for.

I built this because the same shape shows up in a small business server room: a few machines sharing storage, backup and a network that somebody has to understand. The hardware here is cheaper, but the decisions are the same. If quorum, Ceph and Corosync are new words to you, the [virtualization path on Mylemans Labs](https://labs.mylemans.online/?path=virtualization) takes you through them in order, for free.

{% include google-adsense.html %}
