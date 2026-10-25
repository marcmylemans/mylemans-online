---
title: Automating Your RDS Lab, From ISO to Full Deployment with PowerShell
description: 'Build a full RDS lab on Hyper-V from a Windows Server ISO with my HomeLab PowerShell project: VHDX template, then DC, domain join and RDS from JSON.'
date: '2024-05-07 08:00:00'
categories: [Homelab, Scripts]
tags: [automation, powershell, scripting, network, homelab, virtualization, hyper-v, infrastructure, it management]
image: {path: /assets/img/posts/6wGd47lPLmU.png, alt: 'Automating Your RDS Lab, From ISO to Full Deployment with PowerShell'}
---

{% include google-adsense.html %}

Setting up a Remote Desktop Services (RDS) lab doesn't need to take hours of manual work. With my PowerShell-based [HomeLab project](https://github.com/marcmylemans/HomeLab), you can build a fully automated Hyper-V test environment—from converting an ISO into a deployable template all the way to configuring your RDS stack.

In this blog post, I’ll walk you through the complete process, combining two core automation scripts:

1. **Template Builder** – Converts a Windows Server ISO into a fully-prepped VHDX using Unattended setup.
2. **Remote Desktop Services** – Spins up VMs, creates a domain, joins servers, and configures RDS—all from a JSON config.

---

## Step 1: Creating the VHDX Template from ISO

### Windows Server Evaluation Download Links

**Server 2019:**
[Windows Server 2019 | Microsoft Evaluation Center](https://www.microsoft.com/en-us/evalcenter/download-windows-server-2019)

**Server 2022:**
[Windows Server 2022 | Microsoft Evaluation Center](https://www.microsoft.com/en-us/evalcenter/download-windows-server-2022)

**Server 2025:**
[Windows Server 2025 | Microsoft Evaluation Center](https://www.microsoft.com/en-us/evalcenter/download-windows-server-2025)

Before we can automate the lab deployment, we need a Windows Server template disk image. That’s where the `TemplateBuilder/main.ps1` script comes in.

It uses the excellent [Convert-WindowsImage](https://github.com/x0nn/Convert-WindowsImage) PowerShell module to:

- Extract a chosen Windows edition from an ISO  
- Apply an **Unattend.xml** file for automatic setup. A sample file is included `TemplateBuilder/unattend.xml`, or you can generate an answer file on the [Windows Answer File Generator](https://www.windowsafg.com/).
- Output a bootable VHDX, ready for Hyper-V deployment  

### PowerShell Snippet

```powershell
Convert-WindowsImage -SourcePath $isoPath `
    -VHDFormat "VHDX" `
    -DiskLayout "UEFI" `
    -Edition "Windows Server 2022 Standard (Desktop Experience)" `
    -VHDPath $vhdPath `
    -SizeBytes 64GB `
    -UnattendPath $unattendPath `
    -Feature "NetFx3"
```

Once this runs, you’ve got a pre-configured VHDX ready to be cloned into multiple VMs.

---

## Step 2: Deploying the RDS Lab

Now that we have our base image, the real magic begins.

Edit the `Remote Desktop Services/config.json` file to set up your environment. It should include:

- VM names, IPs.
- Domain controller configuration.
- RDS setup details.
- VM template paths.
- Network configurations.
- Change the AdminPassword to the same password as the `TemplateBuilder/unattend.xml`.

Example:
```json
{
    "VMs": [
        {"Name": "dc1", "IP": "192.168.48.10"},
        {"Name": "rdgw", "IP": "192.168.48.11"},
        {"Name": "rds1", "IP": "192.168.48.12"},
        {"Name": "rds2", "IP": "192.168.48.13"}
    ],
    "DomainController": "dc1",
    "TemplateVHDXPath": "C:\\Hyper-V\\Virtual Hard Disks\\Templates\\template_server2019.vhdx",
    "VMStoragePath": "C:\\Hyper-V\\Virtual Machines",
    "VMSwitch": "vSwitch",
    "DomainName": "homelab.local",
    "AdminUsername": "Administrator",
    "AdminPassword": "Azerty123!",
    "SubnetMask": 24,
    "Gateway": "192.168.48.254",
    "DNS": "192.168.48.10",
    "RDS": {
        "connectionBrokerVM": "dc1",
        "ConnectionBroker": "rdgw.homelab.local",
        "WebAccessServer": "rdgw.homelab.local",
        "SessionHost": "rds1.homelab.local",
        "LicenseServer": "rdgw.homelab.local",
        "HostRemoteApp": "rds2.homelab.local",
        "GatewayExternalFqdn": "rdgw.homelab.com",
        "SessionCollectionName": "RDS Host",
        "RemoteAppCollectionName": "RDS Remote App",
        "UserGroupSession": ["homelab\\domain users", "homelab\\domain admins"],
        "UserGroupRemoteApp": ["homelab\\domain users", "homelab\\domain admins"]
    }
}
```

The `Remote Desktop Services/main.ps1` script handles:

- VM creation and static IP assignment  
- Network configuration via PowerShell remoting  
- Domain controller promotion  
- Domain join for other VMs  
- Full Remote Desktop Services role setup  

### How to Use It

1. **Clone the repo**

```bash
git clone https://github.com/marcmylemans/HomeLab.git
```

2. **Edit `config.json`**  
Define your VM names, IPs, domain name, and RDS preferences.

3. **Run the script**

Set execution policy to Unrestricted for the current session

```powershell
Set-ExecutionPolicy Unrestricted -Scope Process -Force
```

Unblock all files in the folder

```powershell
Get-ChildItem | Unblock-File
```
Run the script

```powershell
.
.\main.ps1
```

And voilà: Your test lab is online!

---

## Repository Overview

The GitHub repo includes:

- ✅ `TemplateBuilder/main.ps1`: VHDX template builder  
- ✅ `Remote Desktop Services/main.ps1`: Main deployment script for your Remote Desktop Lab 
- ✅ `Remote Desktop Services/config.json`: Central configuration  
- ✅ Modular helper scripts:  
  - `Setup-DomainController.ps1`  
  - `Join-Domain.ps1`  
  - `New-VMFromTemplate.ps1`  
  - `Configure-VMNetwork.ps1`  
  - `Set-VMStaticIP.ps1`  
  - `Set-RDSConfiguration.ps1`  
  - ...and more  

Everything is structured for reusability and easy tweaking.

---

## Who Is This For?

This project is ideal for:

-  IT pros testing RDS, AD, and GPO scenarios  
-  Admins learning PowerShell and infrastructure automation  
-  Instructors building classroom labs  
-  Certification students practicing real-world setups  

---

## Watch the Walkthrough

I cover the full process in my video, from ISO to fully automated lab setup.

👉 **[Watch here](https://youtu.be/WaNzzhy1Qoc)**

{% youtube "https://youtu.be/WaNzzhy1Qoc" %}

---

## Customize and Extend

Since it’s 100% PowerShell, the project is easy to expand:

- Add GPO baseline automation   
- Modify the Unattend.xml for software installs  
- Extend the RDS config

Have an idea? Fork the repo and share your setup!

---

## Final Thoughts

PowerShell isn’t just for fixing problems—it’s for **scaling your skills**. This project makes it easy to go from ISO to enterprise-style RDS lab in a fraction of the time.

Whether you're learning, testing, or just geeking out:  
**Automate the boring stuff—then tweak it for fun.**

Stay efficient, stay curious,  
**Marc @ Mylemans Online**

