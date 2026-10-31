---
title: Migrating to a New Domain Controller
description: 'Migrate to a new domain controller: check functional levels, move SYSVOL from FRS to DFSR with dfsrmig, promote the new DC and transfer the FSMO roles.'
date: '2024-09-10 08:00:00'
categories: [Active Directory]
tags: []
image: {path: /assets/img/posts/3e10439b-a030-4834-b64a-8c8f44db25ac.webp, alt: Migrating to a New Domain Controller}
---
{% youtube "https://youtu.be/Y3kIJydyTzA" %}

# Migrating to a New Domain Controller: A Smooth Transition Guide

Migrating to a new domain controller might sound like a daunting task, but with the right steps and some preparation, you can make it a seamless process. Follow this guide to ensure everything runs smoothly!

## 1. Pre-Migration Checks: Get Ready Before You Start

Before you jump into the migration, it’s important to do a few checks to ensure everything’s good to go:

- **Check the functional level of the old domain controller** — make sure it’s supported!
- If you’re still using **FRS** (File Replication Service), it’s time to upgrade to **DFSR** (Distributed File System Replication) for **SYSVOL**. Remember, this requires a **domain functional level of 2008 or higher**.

### How to Check the Forest Functional Level

You can check your forest functional level using a simple PowerShell command:

```powershell
Get-ADForest | fl Name,ForestMode
```

### Raising the Forest Functional Level

If your forest functional level needs an upgrade, follow these steps:

1. Open **Administrative Tools** from the Start menu.
2. Launch **Active Directory Domains and Trusts**.
3. Right-click **Active Directory Domains and Trusts** in the left pane and choose **Raise Forest Functional Level**.

### Raising the Domain Functional Level

Need to raise the domain functional level? No problem:

1. From the **Server Manager** panel, click on Tools and then select **Active Directory Users and Computers**.
2. Right-click on the root domain from the pane on the left, and then click on **Properties**.
3. Choose the appropriate level from the list and click **Raise**.

> **Tip:** Speed up replication across your domain by running this command:
> ```powershell
> Repadmin /syncall /force /APed
> ```

## 2. Migrate SYSVOL from FRS to DFSR: Step-by-Step

Now that you’ve confirmed your domain is ready, it’s time to migrate SYSVOL from **FRS** to **DFSR**. Let’s break it down step by step.

### Step 1: Check SYSVOL Status

First, ensure that **SYSVOL** is shared and healthy. You can confirm this with:

```powershell
Dcdiag /e /test:sysvolcheck /test:advertising
```

### Step 2: Migrate to the Prepared State

Once everything checks out, start migrating to the **Prepared** state:

```powershell
Dfsrmig /setglobalstate 1
```

Now, wait until all Domain Controllers are in the **Prepared** state. You can monitor the migration status with:

```powershell
Dfsrmig /getmigrationstate
```

If the result shows that **SYSVOL** is already using DFSR and in the **eliminated** state, you’re all set! This means your domain is already using DFSR, and you can skip the migration steps.

### Step 3: Migrate to the Redirected State

Once you’re ready, migrate to the **Redirected** state:

```powershell
Dfsrmig /setglobalstate 2
```

Wait until all Domain Controllers are in the **Redirected** state. Again, check the status with:

```powershell
Dfsrmig /getmigrationstate
```

### Step 4: Migrate to the Eliminated State

Finally, migrate to the **Eliminated** state:

```powershell
Dfsrmig /setglobalstate 3
```

Once all Domain Controllers are in this state, the SYSVOL migration to DFSR is complete!

## 3. Installing Active Directory on the New Server

With SYSVOL now migrated and your domain controller at the correct functional level, it’s time to install Active Directory on your new server.

1. Install the **Active Directory Domain Services** (AD DS) role.
2. Promote the new server to a domain controller and add it to your existing forest.

## 4. Transfer FSMO Roles: Handing Over Responsibilities

Planning to decommission your old domain controller? You’ll need to transfer the **FSMO (Flexible Single Master Operation) roles** to your new server. Typically, these five roles are held by the first domain controller in your forest root domain.

### How to Check FSMO Roles

#### Domain-Level FSMO Roles:

```powershell
Get-ADDomain | select InfrastructureMaster, PDCEmulator, RIDMaster
```

#### Forest-Level FSMO Roles:

```powershell
Get-ADForest | select DomainNamingMaster, SchemaMaster
```

### How to Transfer FSMO Roles

Ready to move the FSMO roles? Here’s what you need to do:

#### Transfer the PDC Emulator Role:

```powershell
Move-ADDirectoryServerOperationMasterRole -Identity "dc2" PDCEmulator
```

#### Transfer the RID Master Role:

```powershell
Move-ADDirectoryServerOperationMasterRole -Identity "dc2" RIDMaster
```

#### Transfer the Infrastructure Master Role:

```powershell
Move-ADDirectoryServerOperationMasterRole -Identity "dc2" InfrastructureMaster
```

#### Transfer the Domain Naming Master Role:

```powershell
Move-ADDirectoryServerOperationMasterRole -Identity "dc2" DomainNamingMaster
```

#### Transfer the Schema Master Role:

```powershell
Move-ADDirectoryServerOperationMasterRole -Identity "dc2" SchemaMaster
```

## 5. Finalizing the Migration: Wrapping Things Up

You’re almost done! Once the FSMO roles have been transferred and your new server is fully functioning as the primary domain controller, there are just a few final touches to ensure everything is running smoothly.

Here are some important steps to finalize your migration:

- **Update your DHCP settings:** Make sure your **DHCP scope** is updated to include the new domain controller as a **DNS server**. This ensures clients are properly directed to the new controller.
- **Check static IP configurations:** Don’t forget to update any **statically configured network devices** (such as servers, printers, or network hardware) to point to the new domain controller for DNS and other services.
- **Backup your new domain controller:** Before decommissioning the old server, take a backup of your new domain controller to ensure you have a restore point if needed.

Once you’ve completed these checks, you can safely decommission the old server if it’s no longer needed.

---

By following this step-by-step guide, you'll ensure a smooth and successful migration to your new domain controller, keeping your Active Directory environment healthy and secure!
