---
title: 'Build a 3-Node Proxmox Cluster with Ceph Step by Step'
description: 'Build a three-node Proxmox cluster with Ceph: create the cluster, join two nodes, install Ceph and OSDs, then run a VM on Ceph storage and live migrate it.'
date: '2024-02-07 08:00:00'
categories: [Homelab, Hardware]
tags: [proxmox, homeserversetup, techguide, virtualization, ceph, cluster setup, high availability, infrastructure]
image: {path: /assets/img/posts/oQHi8IYxY-0.jpg, alt: 'How to Build a Three-Node Cluster with Proxmox and Ceph, A Fun and Easy Guide'}
---

Hey there, tech enthusiasts! Whether you’re a curious beginner or a seasoned IT pro, today’s post is going to show you how to set up a *three-node cluster* using **Proxmox** and **Ceph**. But don’t worry, we’re going to keep things simple, fun, and totally beginner-friendly.

So, why bother with this setup? Well, once you’re done, you’ll have your own powerful infrastructure that can handle multiple virtual machines, distribute data across several nodes, and ensure everything stays up and running, even if one part goes down. It’s a great way to dip your toes into the world of virtualization and distributed storage!

Let's break this process into easy steps and throw in some analogies and tips along the way to keep things light and fun.

{% youtube "https://youtu.be/oQHi8IYxY-0" %}

## What Are Proxmox and Ceph?

First, a quick introduction for those of you who are new to these tools:

- **Proxmox**: This is like your virtual playground. It allows you to run multiple virtual machines (VMs) and containers on one piece of hardware. You manage everything using a nice, simple web interface.
- **Ceph**: This is the magic behind the scenes that keeps your data safe and sound. Ceph takes data and spreads it across several computers (called nodes), making sure that even if one of them goes down, your important files stay intact.

Think of Proxmox as a multi-purpose tool (like a Swiss Army knife) for running virtual machines, and Ceph as the vault that guards all your data, making sure it’s always there when you need it.

Now, let’s dive in!

---

## Step 1: Setting Up the First Node (Your Cluster's Captain)

First, we need to set up the first node in your Proxmox cluster. This node is like the captain of a ship—it leads the way and connects everything together.

1. **Log into your first node**: You’ll need the IP address of your server and your login credentials (usually as the "root" user). Open your browser, punch in the IP address, and you’ll find yourself in the Proxmox web interface.
2. **Create the cluster**: Click on the **Data Center** menu, then head to **Cluster**. Here, give your cluster a name—pick something cool like "SuperCluster" Hit *Create* and ta-da! Your cluster is officially born.

At this point, you’ve got one node in your cluster. But what fun is a cluster with just one node? Let’s bring in some friends!

---

## Step 2: Adding the Second and Third Nodes (The Dream Team)

Now it’s time to bring the other two nodes into the mix. Think of them as the backup singers to your cluster's lead node.

1. **Go to Node Two**: Head to your second node, log in, and go to the **Cluster Join Information** section. This is where you’ll connect this node to your first one. Grab the information you need from your first node (like the join key and IP) and link them together.
2. **Repeat with Node Three**: Do the same thing on your third node.

Once you've finished, all three nodes will be connected, working together like a well-oiled machine.

---

## Step 3: Setting Up Ceph for Super Storage

Now that our nodes are in sync, let’s make sure we can store data across all of them using **Ceph**. This is the part where we make sure your data is safe, no matter what.

1. **Install Ceph**: On each node, go to the **Ceph** section and follow the prompts to install it. You'll be asked to confirm the installation—just say "yes" and let it do its thing.
2. **Configure Ceph storage**: Each node should have some extra disk space that you’ll use for Ceph storage. By setting this up, you’re creating a system that stores your data across all three nodes, so even if one node takes a nap, your data stays secure.
3. **Create OSDs**: OSD stands for Object Storage Daemons, but you don’t need to remember that. Just think of them as containers for your data. You’ll want to create an OSD on each of your nodes to spread the storage around evenly.

And that’s it! You’ve just set up a super reliable, distributed storage system using Ceph.

---

## Step 4: Creating Virtual Machines (The Fun Part)

Now that you have your Proxmox cluster and Ceph storage up and running, it’s time to create some virtual machines (VMs) and really see this setup in action!

1. **Create a VM**: In Proxmox, go to the **Create VM** option and select an operating system (like **Windows 10** or **Ubuntu**). You can assign the VM to use the Ceph storage, which means your virtual machine will be stored across all three nodes.
2. **Customize your VM**: Select how many CPU cores, how much RAM, and how much disk space you want to give your VM. You can also choose options like **QEMU Agent** (for better integration) and **VirtIO Disk** (for faster performance).
3. **Try VM Migration**: One of the coolest features of Proxmox is being able to migrate a virtual machine between nodes without shutting it down. If your VM is running on Node One and you want to move it to Node Two, just click *Migrate*. Your VM will move over to the other node almost instantly. It’s like teleporting, but for data!

---

## Step 5: Wrap-Up and Final Thoughts

Congratulations! You’ve successfully built a three-node cluster using Proxmox and Ceph. Here’s a quick recap of what you’ve accomplished:

- You created a cluster of three nodes that can work together and handle any task you throw at it.
- You set up Ceph to make sure all your data is safely distributed across multiple nodes.
- You created a virtual machine and even migrated it between nodes without a hitch.

This setup is perfect if you want to learn more about clustering, experiment with different virtual machines, or build a solid infrastructure for a small business or home lab. Best of all, it’s a scalable system, meaning you can keep adding nodes and storage as your needs grow.

Thanks for following along on this journey! I hope you had fun and learned a thing or two. Feel free to share this guide with others, and don’t forget to experiment with your new cluster. There’s so much more you can do!


