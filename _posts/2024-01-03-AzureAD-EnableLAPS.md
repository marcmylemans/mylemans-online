---
title: Implementing LAPS in Microsoft Entra and Intune
description: Enable Windows LAPS in Microsoft Entra, create the Intune account protection policy, turn on the built-in Administrator and read the password in Intune.
date: '2024-01-03 08:00:00'
categories: [Entra ID & Intune]
tags: [entraid, entra id, intune, laps]
image: {path: /assets/img/posts/lEVq0h2qNvQ.jpg, alt: Implementing LAPS in Microsoft Entra and Intune}
---

# Implementing LAPS in Microsoft Entra and Intune

{% youtube "https://youtu.be/lEVq0h2qNvQ" %}

## Essential Preparations

Before integrating LAPS (Local Administrator Password Solution) with Intune, verify that your Windows platform is supported:

* Windows 10 version 20H2 or later, updated with the security patch from April 11, 2023
* Windows 11 version 21H2 or later, also updated as of April 11, 2023
* Windows Server 2019 and subsequent versions, with the April 11, 2023 security update

> Note: Activation of Azure AD Local Administrator Password Solution (LAPS) in your Azure Tenant may be necessary.
{: .prompt-tip }

## Activating LAPS in Your Azure Tenant
 
To enable LAPS in Microsoft Entra, navigate through: EntraID -> Devices -> Device Settings -> Enable Microsoft Entra Local Administrator Password Solution (LAPS).

# Configuring LAPS via Intune

## Setting Up an Account Protection Policy

1) Access Microsoft Intune at Intune.Microsoft.com. Navigate to Endpoint Security > Account Protection and select + Create Policy.

2) Choose “Windows 10 or later” for the Platform and “Local admin password solution (Windows LAPS)” for the Profile. Then, click Create.

3) Assign a relevant name and an optional description to your policy, and proceed by clicking Next.

**Configuration Options Overview**

Here's a breakdown of the configuration settings available. Microsoft also provides detailed documentation for these settings.

**Backup Directory:** Option to backup the Local Administrator password to Azure Active Directory or Active Directory.

**Administrator Account Name:** This setting allows management of a specific account's password through the policy. If left unspecified, the policy targets the default built-in local administrator account, identified by its well-known SID.

**Note:** Specifying a custom managed local administrator account here implies that the account exists; this setting doesn't create a new account.

**Password Complexity:** Configure the complexity requirements for the local administrator account's password.

**Password Length:** Set the password length, with a default of 14 characters, minimum of 8, and a maximum of 64.

**Post Authentication Actions:** Determines actions post-successful authentication. By default, it logs off and resets the password of the managed account.

**Post Authentication Reset Delay:** Time delay before executing the specified Post Authentication Actions, defaulting to 24 hours.

4) In the Assignments tab, assign this policy to either specific device groups or to all devices.

5) Review and verify the policy's details in the Review + Create section before finalizing.

## Enable the local administrator account:

1) Go to Microsoft Intune admin center > Devices > Configuration profiles > + Create Profiles > select Windows 10 and later for Platform and Settings catalog for Profile type and then click Create.

2) Add a Name and Description to your Configuration Profile policy and click Next. 

3) Click on +Add settings. 

4) Search for the Local Policies Security Options category > Select Accounts Enabled Administrator Account Status and then Enable it.

5) Assign to the Included groups you want. In my case I will + Add all devices. > Click Next and create to deploy policy. 

# Accessing a Device's Local Admin Password

## Via the Intune Portal
To view a device's local admin password, visit intune.microsoft.com, select Devices, then choose a device. The Local admin password option is available in the left pane.

# Troubleshooting Windows LAPS

## Examining Windows LAPS Event Logs

For insights into Windows LAPS activities, refer to the Windows Event Viewer under Applications and Services Logs > Microsoft > Windows > LAPS.
