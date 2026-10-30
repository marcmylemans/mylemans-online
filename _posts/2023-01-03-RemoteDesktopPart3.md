---
title: Remote Desktop Services - FSLogix
description: 'Part 3 of the Server 2022 RDS series: install and configure FSLogix so user profiles live on a file share instead of the Remote Desktop Session Host.'
date: '2023-01-03 09:00:00'
categories: [Windows Server]
tags: [server 2022, rdp, remote desktop services, rds, fslogix, tutorial, youtube, part3]
image: {path: /assets/img/posts/dRf8k7loXQ0.jpg, alt: Remote Desktop Services - FSLogix}
series: Remote Desktop Services on Server 2022
series_order: 3
---

{% youtube "https://youtu.be/rmZewkdN91U" %}

---

**Update:** We’ve recently created a comprehensive guide that covers everything you need to know about setting up **FSLogix**, along with other essential **Remote Desktop Services (RDS)** configurations. You can check out the detailed guide here: [A Step-by-Step Guide - Setting Up Remote Desktop Services With FS Logix And Single Sign On!](/posts/Remote-Desktop-Services-Part1/).

---

Welcome back to our series on **Remote Desktop Services (RDS)** in **Windows Server 2022**! In Part 3, we’re diving into **FSLogix**—a powerful solution for managing user profiles and data in RDS environments.

---

### **Exploring FSLogix in RDS**

In this video, we cover the installation and configuration of **FSLogix**, focusing on:

- **Centralizing User Data**: How FSLogix helps you move user data off the Remote Desktop Host and store it on a dedicated fileshare.
- **Enhancing Flexibility and Scalability**: With FSLogix, user data roaming becomes more efficient, and expanding Remote Desktop Hosts becomes a streamlined process.

---

### **Key Resources and Links**

- **Learn About FSLogix**: For a deeper understanding, check out the official FSLogix documentation here: [FSLogix Overview](https://learn.microsoft.com/en-us/fslogix/overview).
- **FSLogix Download**: Grab the latest version of FSLogix here: [Download FSLogix](https://aka.ms/fslogix-latest).

---

### **Catch Up on the Series**

If you've missed the earlier parts of this series, here’s where to start:

- [Server 2022 - Remote Desktop Services - Part 1]({% link _posts/2022-12-27-RemoteDesktopPart1.md %})
- [Server 2022 - Remote Desktop Services - Part 2]({% link _posts/2022-12-31-RemoteDesktopPart2.md %})

---

### **Why FSLogix?**

Integrating **FSLogix** into your RDS setup offers several major benefits:

- **Profile Management**: Manage user profiles more efficiently, especially in non-persistent VDI environments.
- **Data Separation and Security**: Store user data securely, separate from the Host environment, enhancing both security and performance.
- **Streamlined User Experience**: Ensure consistent user experience across RDS sessions, with seamless roaming of data and settings.

---

### **Concluding Thoughts**

Adding **FSLogix** to your RDS environment is a smart move for anyone looking to improve efficiency and scalability in their setup. By centralizing user data and optimizing profile management, FSLogix makes your remote desktop environment smoother and faster.

For a more detailed guide that covers these topics and more, be sure to check out our comprehensive post: [A Step-by-Step Guide - Setting Up Remote Desktop Services With FS Logix And Single Sign On!](/posts/Remote-Desktop-Services-Part1/).

We’d love to hear how FSLogix has worked for you in your RDS setup. Share your insights, questions, or any challenges you’ve encountered in the comments below. Your feedback helps us continue improving our content for the broader RDS community.

Stay tuned for more advanced tutorials and tips as we continue to explore the full potential of **Remote Desktop Services** in **Windows Server 2022**!

