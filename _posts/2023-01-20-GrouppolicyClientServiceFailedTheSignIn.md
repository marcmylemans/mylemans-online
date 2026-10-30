---
title: FSLogix - Service group policy client prevents login
description: 'Fix the FSLogix ''Group Policy Client service failed the sign-in'' error: find the user''s SID and set RefCount to 0 under ProfileService\References.'
date: '2023-01-20 08:00:00'
categories: [Windows Server]
tags: [server 2022, gpo, bug, error, fslogix, wvd, troubleshooting]
image: {path: /assets/img/posts/covers/grouppolicyclientservicefailedthesignin.jpg, alt: FSLogix - Service group policy client prevents login}
---

![Assign users](/assets/GrouppolicyClientServiceFailedTheSignIn/error.png)

If you ever encounter the following error with FSLogix that a user can't login because of the error Service group policy client prevents login.

Here is how to fix it!

Find the SID for the affected user 'Local user'

```powershell
Get-LocalUser -Name 'johndoe' | Select-Object  sid
```

Find the SID for the affected user 'Active Directory'

```powershell
Import-Module ActiveDirectory
Get-AdUser -Identity toms | Select Name, SID, UserPrincipalName
```

Open Regedit and navigate to the following regkey:

```
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileService\References\<sid affected user>
```

Change the "RefCount" value to 0.

