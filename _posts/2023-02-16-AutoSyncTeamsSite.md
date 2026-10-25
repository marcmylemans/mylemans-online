---
title: Configure team site libraries to sync automatically
description: 'Make SharePoint team site libraries sync automatically in OneDrive: copy the library ID, decode it with UnescapeDataString and set TenantAutoMount.'
date: '2023-02-16 08:00:00'
categories: [Entra ID & Intune]
tags: [sharepoint, teams, onedrive, azure, sync, tutorial]
image: {path: /assets/img/posts/covers/autosyncteamssite.jpg, alt: Configure team site libraries to sync automatically}
---

{% include google-adsense.html %}

This setting lets you specify SharePoint team site libraries to sync automatically the next time users sign in to the OneDrive sync app (OneDrive.exe), within an eight-hour window, to help distribute network load. To use this setting, the computer must be running Windows 10 Fall Creators Update (version 1709) or later, and you must enable OneDrive Files On-Demand. This feature is not enabled for on-premises SharePoint sites.

If you enable this setting, the OneDrive sync app automatically syncs the contents of the libraries you specified as online-only files the next time the user signs in. The user isn't able to stop syncing the libraries.

If you disable this setting, team site libraries that you've specified aren't automatically synced for new users. Existing users can choose to stop syncing the libraries, but the libraries won't stop syncing automatically.

To configure the setting, in the Options box, select Show, and then enter a friendly name to identify the library in the Value Name field, and the entire library ID (tenantId=xxx&siteId=xxx&webId=xxx&listId=xxx&webUrl=httpsxxx&version=1) in the Value field.

To find the library ID, sign in as a global or SharePoint admin in Microsoft 365, browse to the library, and select Sync. In the Starting sync dialog, select the Copy library ID link.


The special characters in this copied string are in Unicode and must be converted to ASCII according to the following table.

Find	Replace
%2D	-
%7B	{
%7D	}
%3A	:
%2F	/
%2E	.
Alternatively, you can run the following command in PowerShell, replacing "Copied String" with the library ID:

```powershell
[uri]::UnescapeDataString("Copied String")
```
Or if you want to place it directly into you clipboard

```powershell
[uri]::UnescapeDataString("Copied String") | clip.exe
```

Enabling this policy sets the following registry key, using the entire URL from the library you copied:

```
[HKCU\Software\Policies\Microsoft\OneDrive\TenantAutoMount]"LibraryName"="LibraryID"
```
