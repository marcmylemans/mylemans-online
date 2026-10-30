# MDT 8456 Setup Files (Archive)

This folder contains the original installer for **Microsoft Deployment Toolkit (MDT) build 8456** together with the **KB4564442 hotfix**. Keep both together: a fresh MDT 8456 install is broken out of the box when paired with the Windows ADK for Windows 10, version 2004 or later.

## Contents

| File | Description |
|---|---|
| `MicrosoftDeploymentToolkit_x64.msi` | MDT build 8456 installer (final MDT release) |
| `MDT_KB4564442.exe` | Self-extracting hotfix containing updated `Microsoft.BDD.Utility.dll` (x86 + x64, version 6.3.8456.1001) |

## Why the hotfix is required

Windows 10 deployments with MDT 8456 fail on machines with **legacy BIOS firmware** when using ADK for Windows 10, version 2004. MDT incorrectly detects the firmware type as UEFI, so the refresh scenario tries UEFI-style partitioning on an MBR disk and the deployment dies.

Symptoms you'll see in `smsts.log`:

```
UEFI: true
Marking partitions active is only supported for MBR disks.
Unable to activate partition (0x80004001)
Failed to make volume C:\ bootable. Code 0x80004001.
Failed to run the action: Apply Operating System. Error -2147467263
```

And in the Deployment Summary:

```
Failure (5616) 15299 Verify BCDBootEx
LiteTouch deployment failed, Return Code = 2147467259 0x80004005
Failed to run the action: Install Operating system
```

The fix is a replacement `Microsoft.BDD.Utility.dll` that detects the firmware type correctly.

## Installation order

1. Install MDT 8456 from the MSI.
2. Extract `MDT_KB4564442.exe`.
3. Close the Deployment Workbench.
4. Back up the existing `Microsoft.BDD.Utility.dll` in both template locations:
   - `%ProgramFiles%\Microsoft Deployment Toolkit\Templates\Distribution\Tools\x86\`
   - `%ProgramFiles%\Microsoft Deployment Toolkit\Templates\Distribution\Tools\x64\`
5. Copy the extracted DLLs over the old versions.
6. Repeat the file replacement in **every deployment share** you have:
   - `<DeploymentShare>\Tools\x86\`
   - `<DeploymentShare>\Tools\x64\`
7. Open the Deployment Workbench, right-click each deployment share, choose **Update Deployment Share**, and select **completely regenerate the boot images**. Do this for every share.

## Prerequisites and notes

- The hotfix is only intended for MDT build 8456. Earlier MDT versions don't support ADK 2004 at all.
- If you skip step 6 or 7, existing shares and boot images keep the broken DLL and BIOS deployments will still fail.
- MDT 8456 is the last release; there is no newer build that includes this fix, hence keeping the hotfix archived alongside the installer.

## File details (KB4564442)

| File | Version | Size | Date (UTC) | Platform |
|---|---|---|---|---|
| MDT_KB4564442.exe | 6.2.29.0 | 167,296 | 28-May-2020 | n/a |
| Microsoft.BDD.Utility.dll | 6.3.8456.1001 | 127,488 | 27-May-2020 | x86 |
| Microsoft.BDD.Utility.dll | 6.3.8456.1001 | 145,408 | 27-May-2020 | x64 |

## References

- [KB article: Windows 10 deployments fail with MDT on computers with BIOS type firmware](https://support.microsoft.com/en-US/servicing/management-tools/update/2020/06/windows-10-deployments-fail-with-microsoft-deployment-toolkit-on-computers-with-bios-type-firmware)
- [Hotfix download (MDT_KB4564442.exe)](https://download.microsoft.com/download/3/0/6/306AC1B2-59BE-43B8-8C65-E141EF287A5E/KB4564442/MDT_KB4564442.exe)
- [MDT download page](https://www.microsoft.com/download/details.aspx?id=54259)
- [MDT documentation](https://docs.microsoft.com/mem/configmgr/mdt/)
