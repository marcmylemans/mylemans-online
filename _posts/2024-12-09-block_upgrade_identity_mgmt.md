---
title: 'Fix the Identity Management for UNIX Upgrade Block'
description: 'Windows Server in-place upgrade blocked by Identity Management for UNIX: remove IDMU with DISM or comment out IDMUUpgradeComplianceCheck in compliance.ini.'
date: '2024-12-09'
categories: [Windows Server]
tags: [upgrade, domain controller, server 2012 r2, server 2019, adprep, tutorial, youtube, nis]
image: {path: /assets/img/posts/covers/block-upgrade-identity-mgmt.jpg, alt: How to Resolve Identity Management for UNIX Upgrade Blocks on Windows Server}
---

{% include google-adsense.html %}


## Introduction
Upgrading Windows Server from **2008 R2 to 2012 R2** or **2012 R2 to 2019** often encounters a roadblock due to the presence of **Identity Management for UNIX (IDMU)**. This guide provides step-by-step instructions to fix the issue, including removing IDMU components and editing the `compliance.ini` file to bypass upgrade checks.

---

## Step 1: Remove Identity Management for UNIX Components
The first step is to disable and remove IDMU features using PowerShell.

### Instructions:
1. Open **PowerShell as Administrator**.
2. Execute the appropriate command based on what needs to be removed:

   - **Remove all Identity Management for UNIX components:**
     ```powershell
     Dism.exe /online /disable-feature /featurename:adminui
     ```

   - **Remove only Server for NIS:**
     ```powershell
     Dism.exe /online /disable-feature /featurename:nis
     ```

   - **Remove only Password Synchronization:**
     ```powershell
     Dism.exe /online /disable-feature /featurename:psync
     ```

3. **Restart the server** to apply the changes.  
   Use the `/quiet` parameter to restart automatically:
   ```powershell
   Dism.exe /online /disable-feature /featurename:adminui /quiet
   ```
## Step 2: Edit `compliance.ini` to Bypass Compatibility Checks
If the upgrade still fails after removing Identity Management for UNIX (IDMU), you may need to bypass the upgrade compliance check.

### Instructions:
1. **Copy the Windows Server setup ISO/DVD contents** to a writable location, such as your local drive.
2. Navigate to the following file within the copied setup content:
  ```plaintext
  sources\compliance.ini
  ```
3. Open the file using a text editor (e.g., Notepad).
4. Locate the line containing:
  ```plaintext
  IDMUUpgradeComplianceCheck
  ```
5. Comment out the line by adding a # at the beginning or delete the line entirely:
```plaintext
# IDMUUpgradeComplianceCheck
```
6. Save the file and retry the upgrade process.
