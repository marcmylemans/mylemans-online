---
title: Networking in Hyper-V - Virtual Switches and Network Configuration
description: 'Chapter 3 of the Hyper-V guide: External, Internal and Private virtual switches, attaching VMs, setting guest IPs, VLAN IDs and bandwidth limits.'
date: '2024-06-03'
categories: [Windows Server, Hyper-V]
tags: [hyper-v, windows server, networking, virtual machines, virtual switches, microsoft]
image: {path: /assets/img/posts/Hyper-V-Chapter3.PNG, alt: Networking in Hyper-V - Virtual Switches and Network Configuration}
series: The Complete Hyper-V Guide
series_order: 3
---

{% youtube "https://youtu.be/5ykKvlbBMR0" %}

---

Welcome back to our **Hyper-V series**! In **Chapter 3**, we’re diving into an essential part of virtualization: **Networking in Hyper-V**. We’ll cover the basics of virtual networking, the different types of virtual switches, how to create them, and how to connect your virtual machines (VMs) to a network.

If you’ve been following along, you should already have a VM created from **Chapter 2**. If you missed it, check out the guide here: [Setting Up Your First Virtual Machine](/posts/Hyper-V-Chapter2/).

---

### **Understanding Virtual Networking in Hyper-V**

In Hyper-V, **virtual networking** allows your VMs to communicate with each other, the host machine, and the physical network. This is done using **virtual switches**, which act like the physical network switches that connect devices in traditional networks.

---

### **Types of Virtual Switches in Hyper-V**

Hyper-V gives you three types of **virtual switches** to choose from. Each one serves a different networking need:

#### 1. **External Virtual Switch:**
   - Connects VMs to the **physical network** and allows communication with external devices (like the internet).
   
#### 2. **Internal Virtual Switch:**
   - Connects VMs to each other and the **host machine**, but **not** to the external network. Useful for testing or internal communications.

#### 3. **Private Virtual Switch:**
   - Isolates VMs so they can only communicate with each other. **No connection** to the host or external networks, ideal for highly secure environments or testing labs.

---

### **Step-by-Step Guide: Creating a Virtual Switch**

Now let’s create a **virtual switch** in Hyper-V. Here’s a step-by-step guide:

#### 1. **Open Hyper-V Manager:**
   - Launch **Hyper-V Manager** from the Start menu or **Server Manager**.

#### 2. **Access Virtual Switch Manager:**
   - In the right pane of Hyper-V Manager, click **Virtual Switch Manager**.

#### 3. **Create a New Virtual Switch:**
   - Choose the type of virtual switch (**External**, **Internal**, or **Private**) and click **Create Virtual Switch**.

#### 4. **Configure Switch Settings:**
   - **Name:** Enter a name for your switch (e.g., "ExternalSwitch").
   - If you’re creating an **External switch**, select the **network adapter** that will be used for the connection.
   - For **Internal** and **Private switches**, you don’t need to select an adapter.

#### 5. **Apply and Save:**
   - After configuring the switch, click **Apply** and then **OK** to finalize the setup.

---

### **Connecting Virtual Machines to a Virtual Switch**

Once you’ve created a virtual switch, you’ll need to connect your VMs to it. Here’s how:

#### 1. **Open VM Settings:**
   - Right-click the VM in **Hyper-V Manager** and select **Settings**.

#### 2. **Add Network Adapter:**
   - In the left pane, select **Add Hardware**, then choose **Network Adapter** and click **Add**.

#### 3. **Connect to Virtual Switch:**
   - In the **right pane**, select your virtual switch from the dropdown menu (e.g., "ExternalSwitch").
   - Click **Apply** and then **OK**.

---

### **Configuring Network Settings Inside the VM**

Once your VM is connected to a virtual switch, you’ll need to configure the network settings inside the VM:

#### 1. **Static IP Address:**
   - Open **Network and Sharing Center** inside your VM.
   - Select the **network connection**, click **Properties**, and then choose **Internet Protocol Version 4 (TCP/IPv4)**.
   - Enter the **IP address**, **subnet mask**, **default gateway**, and **DNS servers** manually.

#### 2. **Dynamic IP Address:**
   - If your network uses **DHCP**, leave the settings on **Obtain an IP address automatically**. Your VM will receive an IP address from the DHCP server.

---

### **Advanced Networking Features in Hyper-V**

Hyper-V offers several **advanced networking features** to optimize your setup:

#### **VLAN Support:**
   - You can configure **VLAN IDs** on network adapters inside your VMs to segment network traffic.

#### **Bandwidth Management:**
   - Limit the **bandwidth** of each VM in the **Network Adapter settings** to ensure that no single VM hogs all the network resources.

#### **Network Isolation:**
   - Use **Private** and **Internal switches** to isolate VMs from the external network for testing or security reasons.

---

### **Troubleshooting Network Issues**

Running into network problems? Here are a few common issues and how to fix them:

- **No Network Connectivity:** Double-check your **virtual switch** and **network adapter** settings.
- **IP Address Conflicts:** Make sure each VM has a **unique IP address** if you’re using static IPs.
- **Slow Network Performance:** Check if any **bandwidth limitations** are applied in the network settings.

#### **Diagnostic Tools:**
- Use **Ping** to test connectivity between your VMs and external devices.
- Use **ipconfig** inside the VM to check IP address settings.
- Review the **Hyper-V Manager logs** for network-related errors.

---

### **Want the Full Written Guide? Get Early Access on Ko-fi**

Are you enjoying the series so far? If you want to dive deeper into Hyper-V and learn all the tips and tricks, you can get the **full written guide** with detailed step-by-step instructions on Ko-fi. Your support helps us continue creating useful content for the community.

Grab your copy here: [Download the Full Guide on Ko-fi](https://ko-fi.com/s/4dd04dba14)

---

### **Conclusion**

That wraps up **Chapter 3: Networking in Hyper-V**! You now have a solid understanding of virtual switches and how to configure network settings for your VMs. In the next chapter, we’ll take a closer look at **storage in Hyper-V**, including creating and managing virtual hard disks (VHDs).

If you found this post and video helpful, don’t forget to **like, share, and subscribe** for more tutorials. Drop any questions or thoughts in the comments below—we’d love to hear from you!

**Next Up:** [Chapter 4: Storage in Hyper-V](/posts/Hyper-V-Chapter4/)
