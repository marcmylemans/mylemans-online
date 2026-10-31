---
title: Storage in Hyper-V - Managing Virtual Hard Disks (VHDs)
description: 'Chapter 4 of the Hyper-V guide: VHD vs VHDX, fixed, dynamic and differencing disks, creating and attaching disks, expanding them and extending the volume.'
date: '2024-06-10'
categories: [Windows Server, Hyper-V]
tags: [hyper-v, windows server, virtual hard disk, vhd, storage, virtualization, microsoft]
image: {path: /assets/img/posts/Hyper-V-Chapter4.webp, alt: Storage in Hyper-V - Managing Virtual Hard Disks (VHDs)}
series: The Complete Hyper-V Guide
series_order: 4
---

---

Welcome back to our **Hyper-V series**! In **Chapter 4**, we’ll dive into **storage in Hyper-V** and everything you need to know about **Virtual Hard Disks (VHDs)**. We’ll cover the different types of VHDs, how to create and manage them, and some best practices for configuring and optimizing storage in your Hyper-V environment.

If you missed the earlier chapters, check them out here: [Chapter 1: Introduction to Hyper-V](/posts/Hyper-V-Chapter1/), [Chapter 2: Setting Up Your First VM](/posts/Hyper-V-Chapter2/), and [Chapter 3: Networking in Hyper-V](/posts/Hyper-V-Chapter3/).

---

{% youtube "https://youtu.be/P6eEdg1CrCI" %}

### **Understanding Virtual Hard Disks (VHDs)**

In Hyper-V, **Virtual Hard Disks (VHDs)** act as the virtual storage drives for your virtual machines (VMs). Everything from the operating system to the applications and data is stored in these VHDs.

There are **two main types** of VHD formats:

#### 1. **VHD (Virtual Hard Disk):**
   - The older format, compatible with legacy Hyper-V environments and other virtualization platforms.
   - Maximum disk size: **2 TB**.

#### 2. **VHDX (Virtual Hard Disk Extended):**
   - The newer format, introduced in Windows Server 2012, which offers better performance, larger storage capacity, and increased reliability.
   - Supports disk sizes up to **64 TB**.
   - Provides better resilience against data corruption during power outages.

---

### **Creating and Managing Virtual Hard Disks in Hyper-V**

Let’s walk through how to create and manage VHDs in Hyper-V:

#### **Step-by-Step Guide: Creating a New VHD**

1. **Open Hyper-V Manager:**
   - Start by opening **Hyper-V Manager** from the Start menu or **Server Manager**.

2. **Access the New Virtual Hard Disk Wizard:**
   - In the right-hand pane, click **New**, then select **Hard Disk**.

3. **Select Disk Format:**
   - Choose either **VHD** (for older systems) or **VHDX** (for larger, modern environments).

4. **Choose Disk Type:**
   - **Fixed Size**: Allocates the entire disk size immediately (better performance).
   - **Dynamically Expanding**: Expands as data is added, using disk space only when needed.
   - **Differencing Disk**: Tracks changes from a parent disk, useful for test environments.

5. **Specify Name and Location:**
   - Enter a **name** for the VHD and select the **location** to store the disk.

6. **Specify Disk Size:**
   - Set the **maximum size** for the virtual hard disk (e.g., 50 GB).

7. **Complete the Wizard:**
   - Review your settings and click **Finish**.

---

### **Attaching a VHD to a Virtual Machine**

Once you’ve created a VHD, you can attach it to a VM for storage:

#### **Step-by-Step Guide: Attaching a VHD to a VM**

1. **Open VM Settings:**
   - In **Hyper-V Manager**, right-click your VM and select **Settings**.

2. **Add a Hard Drive:**
   - In the left-hand pane, select **SCSI Controller** or **IDE Controller**, then click **Add** next to **Hard Drive**.

3. **Select Virtual Hard Disk:**
   - Browse and select the **VHD** you created earlier.

4. **Apply and Save:**
   - Click **Apply** and then **OK** to save the changes.

---

### **Managing VHD Storage in Hyper-V**

You might need to expand or modify your VHDs as your virtual environment grows. Here’s how:

#### **Expanding a VHD**

1. **Open Hyper-V Manager:**
   - In the right-hand pane, click **Edit Disk**.

2. **Select the VHD:**
   - Browse to the VHD file and select **Expand**.

3. **Enter the New Size:**
   - Enter the new, larger size for your virtual disk (e.g., increase from 50 GB to 100 GB).

4. **Complete the Wizard:**
   - Review your settings and click **Finish**.

#### **Extend Volume Inside the VM**

After expanding the VHD, you’ll also need to extend the volume inside the VM:

1. **Open Disk Management:**
   - Inside the VM, open **Disk Management** (search for it in the Start menu).

2. **Extend Volume:**
   - Right-click the volume and select **Extend Volume** to use the newly expanded space.

---

### **Backup and Restore of VHDs**

Backing up your VHDs is crucial for protecting your data. Here are some best practices:

#### **Backup Options:**

- **Windows Server Backup**: A built-in tool to back up Hyper-V VMs and their VHDs.
- **Third-Party Solutions**: Tools like **Veeam**, **Acronis**, and **Altaro VM Backup** offer robust backup solutions with additional features like deduplication and cloud storage.

#### **Restoring a VHD from Backup:**

1. Use your backup software to **restore the VHD**.
2. **Reattach the VHD** to your VM in **Hyper-V Manager**.

---

### **Best Practices for Managing Storage in Hyper-V**

#### **Separate OS and Data VHDs:**
   - Store the **operating system** and **user data** on separate VHDs to improve performance and make management easier.

#### **Use VHDX for Newer VMs:**
   - **VHDX** provides better resilience and performance, making it the preferred format for modern virtual environments.

#### **Monitor Disk Performance:**
   - Use **Performance Monitor** to keep an eye on disk I/O and resource usage, especially in high-demand environments.

---

### **Conclusion**

That’s it for **Chapter 4: Storage in Hyper-V**! Now you know how to create, attach, and manage **Virtual Hard Disks (VHDs)** in Hyper-V. Storage is one of the most critical aspects of any virtualization environment, and mastering it will help you optimize your VMs.

If you found this post and video helpful, don’t forget to **like, share, and subscribe** for more tutorials. Stay tuned for **Chapter 5**, where we’ll explore advanced features like **Live Migration, Hyper-V Replica, and more**!

**Next Up:** [Chapter 5: Advanced Hyper-V Features](/posts/Hyper-V-Chapter5/)
