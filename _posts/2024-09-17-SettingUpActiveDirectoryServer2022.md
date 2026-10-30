---
title: 'Set Up Active Directory on Windows Server 2022'
description: Install Active Directory on Windows Server 2022 via Server Manager or PowerShell, pick a domain name, enable the AD Recycle Bin and build an OU structure.
date: '2024-09-17 17:00:00'
categories: [Active Directory]
tags: []
image: {path: /assets/img/posts/bNvEHfJWZE0.jpg, alt: 'Setting Up Active Directory on Windows Server 2022: A Step-by-Step Guide'}
---

Are you ready to set up Active Directory on your Windows Server 2022? Whether you're managing a small office or a larger enterprise, this guide will walk you through the essential steps to get everything up and running smoothly. Let’s dive in!

{% youtube "https://youtu.be/bNvEHfJWZE0" %}

## Prerequisites Before You Begin:

Before starting, make sure your server meets the following requirements:

- **Processor**: Minimum 2 cores, with 1 extra core for every 1,000 concurrent users.
- **Memory**: At least 4 GB of RAM, but we recommend starting with 6–8 GB if you plan to sync users with Entra ID using Entra Connect.
- **Storage**: 64 GB minimum, but 80 GB is better to ensure there's room for Windows updates.
- **Storage Type**: A mechanical HDD works, but SSDs are cheap and will give you a much faster experience.
- **Network**: Assign a static IP address to your network card.

## Installing Active Directory: Two Ways to Get Started

You have two primary options for installing Active Directory Domain Services (ADDS)—you can use the Server Manager Wizard or PowerShell. Both methods get the job done, so choose what feels right for you.

---

### Option 1: Using the Server Manager Wizard

1. **Install ADDS and DNS Role**: When you install Active Directory, the DNS role will also be installed. This is crucial for name resolution within your network.
   
2. **Select a Domain Name**: During setup, you’ll need to choose your root domain name. We recommend using something like `domain.local` or `domain.internal`. Avoid using a public domain like `domain.com` unless you add a subdomain, such as `ad.domain.com` or `internal.domain.com`. This keeps your internal resources from conflicting with your public website.

3. **NETBIOS Name**: Your NETBIOS name will be `DOMAIN` if you choose `domain.local` or `AD` for `ad.domain.com`, but you can change it to whatever fits your needs.

Once the installation is complete, restart your server to apply the changes.

---

### Option 2: Installing via PowerShell

For those who like working from the command line, PowerShell is a faster, no-nonsense approach. Here’s how to install Active Directory using PowerShell:

1. Open PowerShell and run the following commands:

   ```powershell
   Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools
   Install-ADDSForest -DomainName "domain.local"
   ```

2. After installation, reboot your server:

   ```powershell
   Restart-Computer
   ```

---

## Post-Installation: What to Do Next

Once Active Directory is installed, you’ll want to configure a few additional settings to ensure everything runs smoothly.

### 1. Set Up DNS  
Configure your newly set-up server as the DNS server in your DHCP scope. This lets computers in your network automatically discover the Active Directory server when they join the domain.

### 2. Enable the Active Directory Recycle Bin  
Mistakes happen—if you accidentally delete a user or computer, the Active Directory Recycle Bin lets you restore them easily.

- **Option 1: Use the GUI**
  1. Open the **Active Directory Administrative Center**.
  2. Click on your domain in the left panel.
  3. Under the "Tasks" pane, click **Enable Recycle Bin**.

- **Option 2: Use PowerShell**

   ```powershell
   Enable-ADOptionalFeature -Identity 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target "domain.local"
   ```

### 3. Create Organizational Units (OUs)  
Organize users, computers, and servers into **OUs** for easier management. For example, create OUs for Users, Groups, Servers, and Computers. You can later apply group policies (GPOs) to these OUs for better control over your network. 

```
<Company>
│
├── Onpremise-Only
│   ├── Users
│   │   └── Service Accounts 
│   ├── Computers
│   ├── Servers
│   │   ├── RDS
│   │   ├── WEB
│   │   ├── Database
│   │   └── Application
│   └── Groups
│       └── Security
│           ├── Departments
│           ├── Shares
│           └── Applications
└── EntraAD-Synced
    ├── Users
    ├── Hybrid Joined Computers
    └── Groups
        ├── Security
        │   ├── Departments
        │   ├── Shares
        │   └── Applications
        └── Distribution

```

### 4. Change Default OUs for New Users and Computers  
By default, new user and computer accounts go into generic containers. You can redirect them to specific OUs to keep things organized.

   ```powershell
   redirusr "OU=Users,OU=Company,DC=domain,DC=local"
   redircmp "OU=Computers,OU=Company,DC=domain,DC=local"
   ```

---

## Next Steps: Managing Your Active Directory Environment

Now that Active Directory is installed and configured, you’re on your way to managing your organization’s users, computers, and policies effectively. But there’s more to explore! Here are a few tools you’ll want to get familiar with:

- **Group Policy Management**: This lets you control user and computer settings across your network, like password policies, software installations, and security settings.
- **ADMX Templates**: These templates allow you to apply consistent Group Policy settings across multiple devices. In our next guide, we’ll cover how to create and manage Group Policies using ADMX templates.

---

## Conclusion

With these steps, you’ve laid the foundation for a powerful Active Directory setup. Take some time to explore the additional tools and configurations available to fine-tune your environment for better security and performance.

In the next guide, we’ll show you how to master Group Policy and ADMX templates—key elements for keeping your Active Directory environment organized and secure!
