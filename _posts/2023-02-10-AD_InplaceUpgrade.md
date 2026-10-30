---
title: 'Upgrade Domain Controllers to a Newer Windows Server'
description: Run adprep /forestprep and adprep /domainprep /gpprep before an in-place domain controller upgrade, with the supported paths from Server 2008 to 2022.
date: '2023-02-10 08:00:00'
categories: [Windows Server]
tags: [upgrade, domain controller, ad, windows server, tutorial]
image: {path: /assets/img/posts/covers/ad-inplaceupgrade.jpg, alt: Upgrade domain controllers to a newer version of Windows Server}
---

For an in-place upgrade of an existing DC, you must run adprep /forestprep and adprep /domainprep manually. You need to run Adprep /forestprep only once in the forest for each newer version of Windows Server. Run Adprep /domainprep once in each domain in which you have DCs that you're upgrading for each newer version of Windows Server.

Adprep.exe is a command-line tool that is available on the Windows Server 2008 installation disc in the \sources\adprep folder, and it is available on the Windows Server 2008 R2, and newer, installation disk in the \support\adprep folder. You must run adprep from an elevated command prompt. To open an elevated command prompt, click Start, right-click Command Prompt, and then click Run as administrator.

In this table you can see the supported upgrade paths, based on the version you're currently on.

Upgrade from / to|Windows Server 2008 R2|Windows Server 2012|Windows Server 2012 R2|Windows Server 2016|Windows Server 2019|Windows Server 2022
Windows Server 2008|Yes|Yes|-|-|-|-
Windows Server 2008 R2|-|Yes|Yes|-|-|-
Windows Server 2012|-|-|Yes|Yes|-|-
Windows Server 2012 R2|-|-|-|Yes|Yes|-
Windows Server 2016|-|-|-|-|Yes|Yes
Windows Server 2019|-|-|-|-|-|Yes

So we need to run the following command to prepare the Forest:

```powershell
adprep /forestprep
```

And then for each Domain controller we want to upgrade:

```powershell
Adprep /domainprep /gpprep
```

