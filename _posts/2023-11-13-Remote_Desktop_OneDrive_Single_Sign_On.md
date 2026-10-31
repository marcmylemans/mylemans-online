---
title: Remote Desktop - OneDrive Single Sign On
description: Install OneDrive per-machine on a Remote Desktop Session Host and enable Files On-Demand, Known Folder Move and silent sign-in through Group Policy.
date: '2023-11-13 08:00:00'
categories: [Windows Server]
tags: [server 2022, rdp, onedrive, sso]
image: {path: /assets/img/posts/GFqTZh6xxb4.jpg, alt: Remote Desktop - OneDrive Single Sign On}
---
{% youtube "https://youtu.be/GFqTZh6xxb4" %}

# Configure OneDrive Single Sign On!

Following requests and discussions from our community members, this video focuses on a topic many of you have shown interest in: setting up and configuring OneDrive with Single Sign-On (SSO) in a Remote Desktop environment.

### Implementing OneDrive SSO in RDS

This tutorial provides a guide on:

- **Installing OneDrive**: Step-by-step instructions on setting up OneDrive in a Remote Desktop session.
- **Configuring SSO via Group Policy**: Ensuring a seamless login experience for users accessing OneDrive on their remote desktops.

### Getting Started

- **OneDrive Download**: Get the latest version of OneDrive here. [Download OneDrive](https://support.microsoft.com/en-us/office/onedrive-release-notes-845dcf18-f921-435e-bf28-4e24b95e5fc0?ui=en-us&rs=en-us&ad=us)
- **Installing OneDrive Policies**: For guidance on OneDrive Group Policy management, visit [Manage OneDrive using Group Policy](https://learn.microsoft.com/en-us/sharepoint/use-group-policy#manage-onedrive-using-group-policy).
- **Per-Machine Installation**: Follow these instructions to install OneDrive for **All Users**: [Per-Machine Installation Instructions](https://learn.microsoft.com/en-us/sharepoint/per-machine-installation#deployment-instructions).

### Configuring Group Policy for All Users

The new policy settings can be found under **Computer Configuration\Policies\Administrative Templates\OneDrive**. The following are recommended to be **enabled**:

- **Use OneDrive Files On-Demand**: Optimizes storage and accessibility of files.
- **Silently move Windows known folders to OneDrive**: Streamlines user data management.
- **Silently sign in users to the OneDrive sync app with their Windows credentials**: Facilitates SSO for a smoother user experience.

### Your Feedback Matters

Let me know in the comments if you're interested in a follow-up video. We could explore automating the OneDrive installation process for every user account, further streamlining the setup in Remote Desktop environments.

### Concluding Thoughts

Configuring OneDrive with SSO in a Remote Desktop setting enhances the user experience by providing seamless access to files and syncing capabilities. This tutorial aims to guide you through this setup, making your RDS environment more user-friendly and efficient.

We look forward to your feedback and suggestions. Share your experiences, questions, or the challenges you've encountered in the comments below. Your input is invaluable and helps shape our future content.

Stay tuned for more insights and tutorials in Remote Desktop Services and cloud integration!

