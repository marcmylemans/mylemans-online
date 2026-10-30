---
title: Server 2022 - Remote Desktop Services - Part 1
description: 'Part 1 of the Server 2022 RDS series: deploy Connection Broker, Session Host, Web Access and Gateway on two VMs with a Let''s Encrypt certificate.'
date: '2022-12-27 09:00:00'
categories: [Windows Server]
tags: [server 2022, rdp, remote desktop services, rds, tutorial, youtube, part1]
image: {path: /assets/img/posts/bkTFagCdycc.jpg, alt: Server 2022 - Remote Desktop Services - Part 1}
series: Remote Desktop Services on Server 2022
series_order: 1
---

{% youtube "https://youtu.be/rmZewkdN91U" %}

---

**Update:** We've recently created a comprehensive guide that consolidates all the steps needed to set up Remote Desktop Services (RDS) in **Windows Server 2022**. This new post provides a detailed, step-by-step walkthrough. Check it out here: [A Step-by-Step Guide - Setting Up Remote Desktop Services With FS Logix And Single Sign On!](/posts/Remote-Desktop-Services-Part1/).

---

Welcome to Part 1 of our series on setting up **Remote Desktop Services (RDS)** in Windows Server 2022! Whether you're just getting started or want to brush up on the fundamentals, this guide will walk you through the key components needed to build a solid RDS environment.

---

### **Deploying Key RDS Components**

In Part 1, we focus on setting up the core components of RDS, which include:

1. **Remote Desktop Broker**: The central hub that manages RDS connections.
2. **Remote Desktop Host**: The server where your applications and resources will run.
3. **Web Access and Gateway**: Enabling remote access to your RDS environment via the web.

---

### **Prerequisites for Deployment**

Before diving into the setup, make sure you have the following in place:

- **Two Domain-Joined Servers (Virtual Machines)**: These will serve as the backbone of your RDS setup.
- **Public Domain Name**: This is essential for accessing your RDS environment externally.
- **Public Certificate**: In this tutorial, we use a Let's Encrypt certificate for our lab, but you may want to use a paid certificate for production environments.
- **Network Configuration**: One server will host the **Broker/Web Access/Gateway services** and will require a fixed IP with ports 80 and 443 forwarded in your router/firewall.

---

### **Setting Up Your RDS Environment**

This video will guide you through each step of the process, from the initial server setup to configuring each core RDS component. You’ll learn how to:

- **Broker/Web Access and Gateway Server Setup**: Configure and optimize your first server for these roles.
- **RDS Host Configuration**: Set up your second server to host remote desktop sessions for users.

---

### **Why Use Remote Desktop Services?**

Remote Desktop Services in Windows Server 2022 offers several key benefits:

- **Flexibility**: Access applications and data from anywhere.
- **Scalability**: Easily adjust to changing workloads and user numbers.
- **Security**: Maintain centralized control over access and data while ensuring high levels of security.

---

### **Concluding Thoughts**

This tutorial marks the beginning of your journey toward setting up a fully functional RDS environment in Windows Server 2022. If you’re ready for more in-depth configurations, including Group Policy settings, FSLogix for profile management, and Single Sign-On (SSO), make sure to check out our full guide: [A Step-by-Step Guide - Setting Up Remote Desktop Services With FS Logix And Single Sign On!](/posts/Remote-Desktop-Services-Part1/).

Feel free to share your feedback and experiences with this setup. Your insights help us create better content and support the RDS community. Stay tuned for more parts in this series as we dive deeper into optimizing your RDS environment!
