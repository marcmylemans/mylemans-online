---
title: Find Your Hyper-V VM’s Host Name with PowerShell
description: One PowerShell command that reads the Hyper-V guest registry key to tell you which Hyper-V host a VM is running on, handy when you manage several hosts.
date: '2023-01-05 08:00:00'
categories: [Windows Server]
tags: [windows, server, powershell, hyper-v]
image: {path: /assets/img/posts/covers/powershellfindoutvmhost.jpg, alt: Find Your Hyper-V VM’s Host Name with PowerShell}
---

{% include google-adsense.html %}

### Introduction:

Discovering the host name of your Hyper-V virtual machine (VM) can be essential for various administrative tasks, especially in environments where multiple Hyper-V servers are managing several VMs. If you need to quickly identify the Hyper-V server on which a particular VM is running, PowerShell offers a straightforward command to fetch this information.

### How to Use the PowerShell Command:

To retrieve the host name of your VM, you will need to run a specific PowerShell command. This operation requires administrative privileges because it accesses the system registry where VM details are stored.

### Step-by-Step Guide:

Open PowerShell as an Administrator: Right-click the PowerShell icon and select "Run as administrator" to ensure you have the necessary permissions.

Execute the Command: Copy and paste the following command into your PowerShell window and press Enter:

```powershell
(get-item "HKLM:\SOFTWARE\Microsoft\Virtual Machine\Guest\Parameters").GetValue("HostName")
```

This command performs the following actions:

- **Accesses the Registry:** It navigates to the registry key where Hyper-V stores VM parameters.
- **Retrieves the Host Name:** It fetches the value associated with the "HostName" entry, which represents the name of the Hyper-V server hosting your VM.

### Understanding the Output:

The output of this command is the host name of the Hyper-V server. If no host name is returned, it could indicate that the VM is either not running under Hyper-V management or the registry entry is missing or corrupted.

### Conclusion:

This PowerShell command is a quick and effective way to ascertain the host server of a Hyper-V VM. It can be particularly useful in large environments where tracking VM placements is crucial. If you encounter any issues or receive no output, verify that the VM is properly configured under Hyper-V and that you have administrative privileges to access the required registry paths.
