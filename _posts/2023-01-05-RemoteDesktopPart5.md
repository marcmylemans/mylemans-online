---
title: Installing the Remote Desktop Web Client
description: 'Part 5 of the Server 2022 RDS series: install the HTML5 Remote Desktop Web Client with the RDWebClientManagement module so users connect from a browser.'
date: '2023-01-05 08:00:00'
categories: [Windows Server]
tags: [server 2022, rdp, remote desktop services, rds, web client, html5, browser, tutorial, youtube, part5]
image: {path: /assets/img/posts/i87spvTzR6w.jpg, alt: Installing the Remote Desktop Web Client!}
series: The Complete Remote Desktop Services Guide
series_order: 3
---

In Part 5 of our Remote Desktop Services series for Windows Server 2022, we're introducing a game-changer: the Remote Desktop Web Client. This addition will enable your users to access the Remote Desktop Host from any HTML5-supported device or browser, including smartphones and tablets.

{% youtube "https://youtu.be/i87spvTzR6w" %}

### Setting Up the Remote Desktop Web Client

This video provides step-by-step guidance on:

- **Configuring the Web Client**: Learn how to set up the Remote Desktop Web Client on your server.
- **Enabling Access on Various Devices**: Users can now connect to the Remote Desktop Host using diverse devices that support HTML5, offering unprecedented flexibility.

### Powershell Commands for Installation

To install the Web Client, follow these PowerShell commands (run PowerShell as an Administrator):

1) Install the PowerShellGet module:

```powershell
Install-Module -Name PowerShellGet -Force
```
Close PowerShell afterwards!

2) Install the RDWebClientManagement module:

```powershell
Install-Module -Name RDWebClientManagement
```

3) Continue with the following commands:
```powershell
Install-RDWebClientPackage
```
    
```powershell
Import-RDWebClientBrokerCert <.cer file path>
```
    
```powershell
Publish-RDWebClientPackage -Type Production -Latest
```

### Why a Web Client?

- **Universal Access**: Users can connect to your RDS environment from almost any device, increasing mobility and flexibility.
- **Ease of Use**: No need for specific client software installation, as the web client runs directly in the browser.
- **Enhanced Compatibility**: Supports a wide range of devices and platforms.

### Further Reading

For more information on the Remote Desktop Web Client, check out the official Microsoft documentation: [Remote Desktop Web Client](https://learn.microsoft.com/en-us/windows-server/remote/remote-desktop-services/clients/remote-desktop-web-client-admin)

### Catch Up on the Series

If you've missed the earlier parts of this series, here are the links to get you up to speed:

- [RDS on Server 2022 with FSLogix and SSO: Step-by-Step Guide (Part 1)]({% link _posts/2024-10-20-Remote-Desktop-Services-Part1.md %})
- [Install and Configure Office on RDS / RemoteApp (Part 2)]({% link _posts/2024-10-24-Remote-Desktop-Services-Part2.md %})

### Concluding Thoughts

The addition of the Remote Desktop Web Client significantly enhances the versatility and accessibility of your RDS setup. This tutorial aims to guide you through a straightforward setup process, enabling your users to benefit from a flexible, browser-based RDS experience.

We’re eager to hear about your experiences with the Remote Desktop Web Client. Share your insights, questions, or any challenges you've encountered in the comments below. Your feedback is invaluable in helping us shape future content and assisting the wider community.

Stay tuned for more tutorials in this comprehensive series on Remote Desktop Services!

