---
title: Setting Up a Hyper-V Cluster on Windows Server Core
description: 'Build a Hyper-V failover cluster on Windows Server Core with PowerShell: Failover Clustering, Test-Cluster, New-Cluster, shared storage, failover test.'
date: '2023-10-15 08:00:00'
categories: [Windows Server]
tags: [hyper-v, cluster, virtualization]
image: {path: /assets/img/posts/covers/hyper-v-core-cluster.jpg, alt: Setting Up a Hyper-V Cluster on Windows Server Core}
---

# Setting Up a Hyper-V Cluster on Windows Server Core

## Introduction

In this guide, we will walk you through the process of setting up a Hyper-V cluster on Windows Server Core. A Hyper-V cluster provides high availability and load balancing for virtual machines, making it a crucial component in a virtualized environment.

## Prerequisites

Before you begin, ensure that you have the following:

- Two or more Windows Server Core machines with Hyper-V installed.
- A dedicated network for cluster communication (usually Ethernet) with a unique IP address range.
- Shared storage or a storage area network (SAN) accessible to all cluster nodes.

## Step 1: Configure Networking

1) Log in to each Windows Server Core machine using remote management tools or directly at the console.

2) Configure static IP addresses and DNS settings for each machine. Make sure they can communicate over the dedicated network.

## Step 2: Install Failover Clustering Feature

1) Open PowerShell with elevated privileges.

2) Install the Failover Clustering feature on all nodes.

```powershell
   Install-WindowsFeature -Name Failover-Clustering -IncludeManagementTools
```

3) Restart the nodes if prompted.

## Step 3: Validate the Cluster Configuration

1) In PowerShell, run the cluster validation test on one of the nodes.

```powershell
   Test-Cluster -Node Node1, Node2
```

2) Review the validation report to ensure that all tests pass without errors.

## Step 4: Create the Cluster

1) In PowerShell, create a new cluster using the New-Cluster cmdlet.

```powershell
   New-Cluster -Name MyHyperVCluster -Node Node1, Node2 -NoStorage
```

2) Configure cluster networks, ensuring that the dedicated network is set for cluster communication.

## Step 5: Add Shared Storage

1) Ensure that your shared storage or SAN is properly configured and accessible by all cluster nodes.

2) In the Failover Cluster Manager, add the shared storage to the cluster by selecting "Add Storage" and following the wizard.

## Step 6: Configure Hyper-V

1) Install the Hyper-V role on each cluster node.

```powershell
   Install-WindowsFeature -Name Hyper-V
```

2) Use Hyper-V Manager or PowerShell to create and manage virtual machines on the cluster.

## Step 7: Test High Availability

1) Create a test virtual machine and place it on the cluster.

2) Safely shut down or migrate one of the cluster nodes to confirm that the virtual machine fails over to the remaining node.

## Conclusion

You've successfully set up a Hyper-V cluster on Windows Server Core. This cluster provides high availability and load balancing for your virtual machines, ensuring the reliability of your virtualized environment.

