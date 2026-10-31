---
title: 'Set Up VDI on Windows Server 2022 (RDS Part 8)'
description: 'What Virtual Desktop Infrastructure is, how it differs from session-based RDS, and how to build a VDI pool on Hyper-V from a Windows 10/11 template VM.'
date: '2023-10-19 08:00:00'
categories: [Windows Server]
tags: [server 2022, rdp, part8, vdi, remote desktop services, hyper-v]
image: {path: /assets/img/posts/RB4Z7Zrhsx4.jpg, alt: 'Remote Desktop Services, Virtual Desktop Infrastructure!'}
series: The Complete Remote Desktop Services Guide
series_order: 6
---

In the final installment of our Remote Desktop Services series for Windows Server 2022, we explore the setup of a Virtual Desktop Infrastructure (VDI) solution. This approach utilizes Hyper-V to host VDI templates and pools, providing a robust and flexible virtual desktop environment.

{% youtube "https://youtu.be/RB4Z7Zrhsx4" %}

### Setting Up VDI in Windows Server 2022

This video covers:

- **VDI Configuration**: Detailed instructions on configuring VDI, including setting up a Windows 10/11 template VM and VDI pool.
- **Leveraging Hyper-V**: Utilizing a Hyper-V server to host your VDI virtual machines.

### Essential Links and Resources

- **Recap of Previous Steps**: For those who might find the first part of the video quick, it revisits the wizard used in the first part of this series. [Remote Desktop Services - Part 1]({% link _posts/2024-10-20-Remote-Desktop-Services-Part1.md %})
- **Creating a VM Template**
- **Microsoft's VDI Recommendations**: For optimal configuration of your VDI VMs. [Microsoft Learn, RDS/VDI recommendations](https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/rds-vdi-recommendations)
- **Setting Up Hyper-V**: In case you need to set up a Hyper-V server for hosting VMs. [Installing the Hyper-V Role]({% link _posts/2022-12-17-Server2022-Installing-Hyper-V-Role.md %})

### Why VDI?

- **Flexibility and Scalability**: VDI offers a dynamic way to manage and deploy virtual desktops across your organization.
- **Enhanced Security and Control**: Centralizes data and application management, offering improved security and compliance.
- **Customizable User Experience**: Tailor desktop environments to meet the specific needs of different user groups.

### Catching Up on the Series

Here are the previous parts of the series for a comprehensive understanding of Remote Desktop Services:

- [RDS on Server 2022 with FSLogix and SSO: Step-by-Step Guide (Part 1)]({% link _posts/2024-10-20-Remote-Desktop-Services-Part1.md %})
- [Install and Configure Office on RDS / RemoteApp (Part 2)]({% link _posts/2024-10-24-Remote-Desktop-Services-Part2.md %})
- [Server 2022 - Remote Desktop Services - Part 5]({% link _posts/2023-01-05-RemoteDesktopPart5.md %})
- [Server 2022 - Remote Desktop Services - Part 6]({% link _posts/2023-01-23-Remote_DesktopPart6.md %})
- [Server 2022 - Remote Desktop Services - Part 7]({% link _posts/2023-09-07-RemoteDesktopPart7.md %})

### Concluding the Series

With the completion of this VDI setup tutorial, we wrap up our comprehensive series on Remote Desktop Services. We hope these tutorials have provided you with a wealth of knowledge and practical skills to enhance your RDS environment in Windows Server 2022.

We’re keen to hear about your experiences with setting up and managing VDI. Share your stories, questions, or challenges in the comments below. Your feedback enriches our content and supports the wider community in their tech endeavors.

Thank you for following this series, and stay tuned for more in-depth tutorials and insights in the world of Windows Server and remote desktop technologies!

