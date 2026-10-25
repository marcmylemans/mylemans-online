---
title: Drivemapping with Registery key's
description: Map a network drive for the current user with a .reg file under HKEY_CURRENT_USER\Network, plus a cmd loop to import several .reg files at once.
date: '2023-11-28 08:00:00'
categories: [Windows Server]
tags: [windows, register, drivemapping, networkdrive]
image: {path: /assets/img/posts/covers/drivemapregistery.jpg, alt: Drivemapping with Registery key's}
---

# Configuring Drivemapping with Registeryg Keys!


Save the following as **Drivemap.reg**, make sure you replace HKEY_CURRENT_USER\Network\Z with the Driveletter you want to use, for example **Z**. take note that these settings are for the **Current User** that is logged on to the system.

```
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Network\Z]
"ConnectFlags"=dword:00000000
"ConnectionType"=dword:00000001
"DeferFlags"=dword:00000004
"ProviderName"="Microsoft Windows Network"
"ProviderType"=dword:00020000
"RemotePath"="\\\\servername\\folder"
"UserName"=dword:00000000

```

Run the **Drivemap.reg** as the user


You can create a **.reg** file for each Driveletter and push these to your clients.

To import multiple .reg files all at once you can use the following cmd:

```
for /f "tokens=*" %%a in ('dir /b *.reg') do (
	echo  Importing Settings: %%a
	regedit /S "%%a"
)
```
