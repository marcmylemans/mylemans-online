---
title: 'Upgrade Proxmox 8 to 9 Step by Step (pve8to9, Ceph, noout)'
description: 'How to upgrade Proxmox VE 8.4 to 9 on a 3-node cluster: run pve8to9, upgrade Ceph to Squid first, set the noout flag, switch apt to Trixie and dist-upgrade.'
date: '2025-08-06'
categories: [Proxmox]
tags: [proxmox, homelab, ceph, upgrade, cluster]
image: {path: /assets/img/posts/fdf42da4b243.webp, alt: Upgrading from Proxmox VE 8 to 9}
---

In this guide, I'll walk you through how I upgraded my **3-node Proxmox cluster** from version **8.4 to 9.0**, including the required **Ceph upgrade from Reef (18.2.2) to Squid**.

This guide is based on the official Proxmox upgrade documentation:
- [Proxmox 8 to 9 Upgrade](https://pve.proxmox.com/wiki/Upgrade_from_8_to_9)
- [Ceph Reef to Squid Upgrade](https://pve.proxmox.com/wiki/Ceph_Reef_to_Squid)

---

## System Overview

- **Proxmox Version:** 8.4 (before upgrade)
- **Ceph Version:** Reef (18.2.2)
- **Cluster Nodes:** 3
- **Storage:** Ceph cluster

---

## Step 1: (Optional) Upgrade Ceph from Reef to Squid

If you're running a **Ceph cluster**, it's important to upgrade Ceph **before** upgrading Proxmox to ensure compatibility.

We’ve written a detailed guide specifically for this process:  
[How to upgrade Ceph from Reef to Squid](/posts/Ceph-Upgrade-Reef-to-Squid/)

If you're **not using Ceph**, or just running a single-node setup without distributed storage, you can skip this step.

> **Important**: If you do use Ceph, always verify cluster health with `ceph status` before proceeding.

## Step 2: Upgrade All Proxmox Packages

On each node, update all packages to the latest version of Proxmox 8:

```bash
apt update && apt full-upgrade
```

Reboot the node if any kernel or low-level upgrades were applied.

---

## Step 3: Run the `pve8to9` Check Tool

Run the official upgrade checker:

```bash
pve8to9
```

This tool scans your node for potential problems or unsupported configurations. Resolve any critical issues before proceeding.

---

## Step 4: Update APT Sources to Trixie

Use `sed` to bulk-replace `bookworm` with `trixie` in all relevant APT source files:

```bash
sed -i 's/bookworm/trixie/g' /etc/apt/sources.list 
sed -i 's/bookworm/trixie/g' /etc/apt/sources.list.d/*.list 
```

If you're using custom repositories (like No-Subscription or Ceph), update those accordingly.

> Tip: Check that `pve-enterprise.list` or `pve-no-subscription.list` also point to `trixie`.

---

## Step 5: Update and Dist-Upgrade

Now refresh your APT cache and start the full distribution upgrade:

```bash
apt update
apt dist-upgrade
```

During the upgrade, you might be prompted about keeping or replacing configuration files. I selected the **default option** in all cases to avoid overwriting anything critical.

> Your experience may vary — if you've heavily customized Proxmox configs, review diffs before confirming.

---

## Step 6: Reboot the Node

Once the upgrade completes, **reboot** the node:

```bash
reboot
```

Verify everything is working properly once it comes back up:
- `pveversion`
- `systemctl status pvedaemon`
- `ceph status`

Repeat for all other nodes in the cluster.

---

## Final Check

After upgrading all nodes:
- Verify Ceph cluster is healthy
- Check all VMs and containers are running
- Confirm HA resources (if used) are behaving as expected

---

## Lessons Learned

- The `pve8to9` tool is extremely helpful — don't skip it!
- Make sure Ceph is upgraded **before** touching Proxmox.
- Doing one node at a time makes rollback easier in case of problems.
- Selecting the default config file options worked fine for me, but back up `/etc` just in case.

---

## Bonus: Quick Commands Recap

```bash
# Step-by-step upgrade commands
apt update && apt full-upgrade
pve8to9

sed -i 's/bookworm/trixie/g' /etc/apt/sources.list
sed -i 's/bookworm/trixie/g' /etc/apt/sources.list.d/*.list

apt update
apt dist-upgrade
reboot
```

---

## Got Questions?

Feel free to drop a comment on my [YouTube channel](https://youtube.com/@MylemansOnline) or reach out on [Bluesky](https://bsky.app/profile/mylemansonline.bsky.social)!

Happy upgrading and may your cluster run smooth!
