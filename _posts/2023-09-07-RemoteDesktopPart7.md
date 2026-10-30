---
title: Remote Desktop Services, Securing it with Azure MFA!
description: 'Part 7 of the Server 2022 RDS series: install the Azure MFA NPS Extension on the RD Gateway, plus the REQUIRE_USER_MATCH and number-matching registry keys.'
date: '2023-09-07 08:00:00'
categories: [Windows Server]
tags: [server 2022, rdp, remote desktop services, rds, mfa, azure mfa, tutorial, youtube, part7]
image: {path: /assets/img/posts/b5WL7PgEmaY.jpg, alt: 'Remote Desktop Services, Securing it with Azure MFA!'}
series: Remote Desktop Services on Server 2022
series_order: 7
---

{% youtube "https://youtu.be/b5WL7PgEmaY" %}

Part 7 of our Remote Desktop Services series for Windows Server 2022 dives into enhancing security with Azure Multi-Factor Authentication (MFA). In this tutorial, we'll install the Azure MFA NPS Extension to secure the Remote Desktop Gateway connections.

### Implementing Azure MFA in RDS

We cover:

- **Azure MFA NPS Extension Installation**: Step-by-step guidance on integrating Azure MFA with your Remote Desktop Services.
- **Configuring for Enhanced Security**: How to use Azure AD's multifactor authentication to secure RDS connections.

### Key Installation Steps

Here are the essential PowerShell commands and registry settings for setting up Azure MFA:

1) Download the NPS Extension: [Download NPS Extension](https://www.microsoft.com/en-us/download/details.aspx?id=54688)

2) Run these PowerShell commands:
   
    ```powershell
    cd 'c:\Program Files\Microsoft\AzureMfa\Config'
    .\AzureMfaNpsExtnConfigSetup.ps1
    ```

4) To allow Non MFA users to connect, add this registry key:

    ```cmd
    reg add HKLM\Software\Microsoft\AzureMFA /v REQUIRE_USER_MATCH /t REG_SZ /d FALSE
    ```
    Then, reboot the server for the changes to take effect.

5) To override Number Matching, add this registry key:
   
    ```cmd
    reg add HKLM\Software\Microsoft\AzureMFA /v OVERRIDE_NUMBER_MATCHING_WITH_OTP /t REG_SZ /d FALSE
    ```
    Then, reboot the server for the changes to take effect.
     

### Why Azure MFA?

- **Enhanced Security**: Adding an extra layer of authentication significantly reduces the risk of unauthorized access.
- **Flexibility**: Azure MFA offers various methods of verification, accommodating different user preferences and scenarios.
- **Compliance**: Meet security standards and compliance requirements for remote access.

### Catching Up on the Series

If you've missed any of the previous parts in this series, here are the links to catch up:

- [Server 2022 - Remote Desktop Services - Part 1]({% link _posts/2022-12-27-RemoteDesktopPart1.md %})
- [Server 2022 - Remote Desktop Services - Part 2]({% link _posts/2022-12-31-RemoteDesktopPart2.md %})
- [Server 2022 - Remote Desktop Services - Part 3]({% link _posts/2023-01-03-RemoteDesktopPart3.md %})
- [Installing Office 365 on a Remote Desktop Host!]({% link _posts/2023-01-04-RemoteDesktopPart4.md %})
- [Server 2022 - Remote Desktop Services - Part 5]({% link _posts/2023-01-05-RemoteDesktopPart5.md %})
- [Server 2022 - Remote Desktop Services - Part 6]({% link _posts/2023-01-23-Remote_DesktopPart6.md %})

### Concluding Thoughts

Integrating Azure MFA into your RDS setup is a critical step in securing your remote desktop environment. This tutorial aims to guide you through a seamless setup process, ensuring your network's security and integrity.

We’re looking forward to hearing about your experiences with Azure MFA in your RDS environment. Your insights, questions, or challenges are invaluable for our community, so please share them in the comments below.

Stay tuned for the next part in this series, where we'll continue to explore advanced features and best practices in Remote Desktop Services!

