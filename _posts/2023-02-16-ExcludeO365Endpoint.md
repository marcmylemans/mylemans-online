---
title: Unexpected Autodiscover behavior when you have registry settings under the \Autodiscover key
description: 'Outlook asks for Office 365 credentials while the mailbox is still on Exchange on-premises: set ExcludeExplicitO365Endpoint under the Autodiscover key.'
date: '2023-02-16 08:00:00'
categories: [Entra ID & Intune, Microsoft 365]
tags: [exchange, office365, migration, azure, autodiscover, troubleshooting]
image: {path: /assets/img/posts/covers/excludeo365endpoint.jpg, alt: Unexpected Autodiscover behavior when you have registry settings under the \Autodiscover key}
---

{% include google-adsense.html %}

During a migration from an Onpremise Exchange to O365 i encountered the issue that Outlook would ask for the credentials from O365.
Because the mailbox was still on the Onpremise Exchange Outlook could not find a mailbox.

To resolve this we need to run the following Powershell:

```powershell
Set-ItemProperty -Path “HKCU:\Software\Microsoft\Office\16.0\Outlook\AutoDiscover” -Name ‘ExcludeExplicitO365Endpoint’ -Value 1 -Type DWORD –Force
```

```powershell
Set-ItemProperty -Path “HKCU:\Software\Policies\Microsoft\Office\16.0\Outlook\AutoDiscover” -Name ‘ExcludeExplicitO365Endpoint’ -Value 1 -Type DWORD –Force
```

After this you need to close Outlook and open it again, sometimes it can take a few minutes.
