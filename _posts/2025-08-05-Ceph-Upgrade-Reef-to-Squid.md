---
title: Upgrading Ceph from Reef to Squid (Proxmox 8.4 to 9)
description: A detailed, step-by-step guide to upgrading Ceph from Reef (18.2+) to Squid (19.2+) in a Proxmox VE 8 environment.
date: '2025-08-05'
categories: [Proxmox]
tags: [ceph, proxmox, storage, cluster, upgrade]
image: {path: /assets/img/posts/fdf42da4b243.webp, alt: Upgrading Ceph from Reef to Squid (Proxmox 8.4 to 9)}
---

This guide explains how to safely upgrade your **Ceph cluster from Reef to Squid** in a **Proxmox VE 8.4+** environment. It is based on the [official documentation](https://pve.proxmox.com/wiki/Ceph_Reef_to_Squid).

> **Before you begin:** Ensure your cluster is healthy (`ceph status`) and you're running **Ceph 18.2.4-pve3 or higher**.

---

## Prerequisites

- Proxmox VE ≥ 8.2
- Ceph Reef ≥ 18.2.4
- Cluster health: `HEALTH_OK`
- Backup configurations and monitor the upgrade closely

---

## Step 1: Update Ceph Repository (on all nodes)

Update the Ceph APT source from `reef` to `squid`:

```bash
sed -i 's/reef/squid/' /etc/apt/sources.list.d/ceph.list
```

For **no-subscription** users, the file should look like:

```
deb http://download.proxmox.com/debian/ceph-squid bookworm no-subscription
```

> For enterprise users with valid subscriptions, use:
> `deb https://enterprise.proxmox.com/debian/ceph-squid bookworm enterprise`

Then run:

```bash
apt update
```

---

## Step 2: Set the `noout` Flag (Optional but Recommended)

This prevents unnecessary rebalancing during the upgrade:

```bash
ceph osd set noout
```

Or set it via the GUI in the OSD tab.

---

## Step 3: Upgrade Ceph Packages (on all nodes)

Use the following commands on each node:

```bash
apt update
apt full-upgrade
```

Note: The system is still running Reef binaries after the upgrade.

If you see a 401 error using enterprise repos, try:

```bash
pvesubscription update --force
```

---

## Step 4: Restart Monitor Daemons (on monitor nodes only)

Restart one monitor at a time and wait for the cluster to stabilize:

```bash
systemctl restart ceph-mon.target
ceph -s
```

Then verify upgrade using:

```bash
ceph mon dump | grep min_mon_release
```

Expected output:

```
min_mon_release 19 (squid)
```

---

## Step 5: Restart Manager Daemons

If not already restarted with the monitors, restart managers manually:

```bash
systemctl restart ceph-mgr.target
ceph -s
```

---

## Step 6: Restart OSDs (one node at a time)

Restart all OSDs on one node at a time:

```bash
systemctl restart ceph-osd.target
ceph status
```

After all nodes are upgraded, you may see this warning:

```
all OSDs are running squid or later but require_osd_release < squid
```

Set the new minimum OSD version:

```bash
ceph osd require-osd-release squid
```

---

## Step 7: Upgrade CephFS MDS Daemons (if used)

For each filesystem (check with `ceph fs ls`):

```bash
# 1. Disable standby replay
ceph fs set <fs_name> allow_standby_replay false

# 2. Reduce MDS to a single rank
ceph fs get <fs_name> | grep max_mds
ceph fs set <fs_name> max_mds 1

# 3. Stop standby MDS daemons
systemctl stop ceph-mds.target

# 4. Restart the primary MDS daemon
systemctl restart ceph-mds.target

# 5. Restart standby MDS daemons
systemctl start ceph-mds.target

# 6. Restore original max_mds value
ceph fs set <fs_name> max_mds <original_max_mds>
```

---

## Step 8: Unset `noout` Flag

After all daemons are upgraded:

```bash
ceph osd unset noout
```

---

## Summary Checklist

- [x] Ceph source changed from `reef` to `squid`
- [x] `apt full-upgrade` run on all nodes
- [x] All MON, MGR, OSD, and MDS daemons restarted
- [x] Ceph status is `HEALTH_OK`
- [x] `require-osd-release squid` set
- [x] `noout` flag unset

---

## Need Help?

If you have questions or want to share your experience, join the conversation on [YouTube](https://youtube.com/@MylemansOnline) or [Bluesky](https://bsky.app/profile/mylemansonline.bsky.social).

Happy Cephing!
