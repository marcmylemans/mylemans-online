---
title: Upgrading A Server 2012 R2 Domain Controller To Server 2019!
description: 'In-place upgrade of a Server 2012 R2 domain controller to Server 2019: run adprep /forestprep and /domainprep first and check the supported upgrade paths.'
date: '2023-02-17 08:00:00'
categories: [Windows Server]
tags: [upgrade, domain controller, server 2012 r2, server 2019, adprep, tutorial, youtube]
image: {path: /assets/img/posts/61H8PYeK0sw.jpg, alt: Upgrading A Server 2012 R2 Domain Controller To Server 2019!}
---

{% youtube "https://youtu.be/61H8PYeK0sw" %}

Welcome to our tutorial on upgrading an older Server 2012 R2 domain controller to Server 2019. While the typical approach involves installing a new domain controller and migrating FSMO roles, there are scenarios where an in-place upgrade is necessary. This video guides you through this process.

### Key Steps for In-Place Domain Controller Upgrade

- **Preparing for Upgrade**: Before initiating the upgrade, ensure you run `adprep /forestprep` and `adprep /domainprep` manually. These commands prepare your forest and domain for the new server version.
  
- **Understanding Adprep**: Adprep.exe is a crucial tool for this process. It's found on the Windows Server installation disk in the \support\adprep folder. Remember to run adprep from an elevated command prompt: Click Start, right-click Command Prompt, and then click Run as administrator.

### Supported Upgrade Paths

Here’s a quick reference table for supported upgrade paths:

| Upgrade from / to | WS 2008 R2 | WS 2012 | WS 2012 R2 | WS 2016 | WS 2019 | WS 2022 |
| ----------------- | ---------- | ------- | ---------- | ------- | ------- | ------- |
| Windows Server 2008 | Yes | Yes | - | - | - | - |
| Windows Server 2008 R2 | - | Yes | Yes | - | - | - |
| Windows Server 2012 | - | - | Yes | Yes | - | - |
| Windows Server 2012 R2 | - | - | - | Yes | Yes | - |
| Windows Server 2016 | - | - | - | - | Yes | Yes |
| Windows Server 2019 | - | - | - | - | - | Yes |

### Running the Necessary Commands

To prepare the Forest, run:

```powershell
adprep /forestprep
```

Then, for each domain controller you wish to upgrade, execute:

```powershell
Adprep /domainprep /gpprep
```

### Conclusion

Upgrading your domain controller directly to Server 2019 can be a straightforward process if done correctly. This video aims to provide clear, step-by-step guidance to ensure a smooth transition.

We're keen to hear about your experiences with upgrading your domain controller. Share your stories or any questions you might have in the comments section below. Your input helps us improve our tutorials and assists others in the community with similar tasks.

Stay tuned for more helpful guides and insights into server management and upgrades!

