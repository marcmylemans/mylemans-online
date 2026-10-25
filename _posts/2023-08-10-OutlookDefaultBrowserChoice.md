---
title: Outlook and Teams open links on Microsoft Edge
description: 'Stop Outlook and Teams from opening links in Edge regardless of your default browser: set the BrowserChoice registry value under Office\16.0\common\links.'
date: '2023-08-10 08:00:00'
categories: [Microsoft 365]
tags: [office, office365, outlook, regkey, teams, edge]
image: {path: /assets/img/posts/covers/outlookdefaultbrowserchoice.jpg, alt: Outlook and Teams open links on Microsoft Edge}
---

Microsoft decided to change the behavior of Outlook and Teams. From now Outlook and Teams will open hyperlinks with Edge despite if another browser has been selected as the default browser.

To change this behaviour you can download the newest Office 365 ADMX files. Or create the registry key below.

To resolve this we need to run the following Powershell:

```powershell
Set-ItemProperty -Path “HKCU:\SOFTWARE\Policies\Microsoft\Office\16.0\common\links” -Name ‘BrowserChoice’ -Value 0 -Type DWORD –Force
```

To revert back to Edge as the default browser in Outlook:

```powershell
Set-ItemProperty -Path “HKCU:\SOFTWARE\Policies\Microsoft\Office\16.0\common\links” -Name ‘BrowserChoice’ -Value 1 -Type DWORD –Force
```

After this you need to close Outlook and open it again.
