---
title: 'Allow Users to Install Printer Drivers Without Admin Rights'
description: 'Let standard users install printer drivers on Windows 10/11 with one Group Policy: allow device installation for the Printer and PNPPrinters class GUIDs.'
date: '2023-01-08 08:00:00'
categories: [Windows Server]
tags: [server 2022, printer, gpo, non admin, driver installation, group policy, tutorial, youtube]
image: {path: /assets/img/posts/sTIjM9f8e1Q.jpg, alt: Allow (Print) Driver installation (Non Admins)}
---

## Introduction:

Managing printer driver installations in a networked environment can often require administrative privileges. However, in many organizational settings, it's practical to allow non-administrator users to install printer drivers on their workstations. This guide will show you how to configure a Group Policy in Windows Server 2022 to enable this capability, enhancing usability without compromising security.

### Video Tutorial:

For a step-by-step visual guide, watch our video tutorial:
{% youtube "https://youtu.be/sTIjM9f8e1Q" %}

### Step-by-Step Configuration Guide:

1) **Open Group Policy Management Console (GPMC):** Start by accessing the GPMC through your Server Manager or by searching for it in the start menu.

2) **Create or Edit a Group Policy Object (GPO):** Choose to either create a new GPO linked to your domain or edit an existing GPO that applies to the users or groups who need these permissions.

3) **Navigate to Printer Driver Installation Settings:** Go to Computer Configuration -> Policies -> Administrative Templates -> System -> Device Installation -> Device Installation Restrictions.

4) **Allow Non-Admins to Install Printers:** Locate the setting "Allow installation of devices using drivers that match these device setup classes". Enable this setting and click on the "Show" button to add the device class GUIDs for printers:
- Class = Printer: {4658ee7e-f050-11d1-b6bd-00c04fa372a7}
- Class = PNPPrinters: {4d36e979-e325-11ce-bfc1-08002be10318}

> [System-Defined Device Setup Classes Available to Vendors](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/system-defined-device-setup-classes-available-to-vendors)
{: .prompt-info }

5) **Apply and Test the GPO:** After setting up the policy, apply it by linking it to the appropriate OU. Test the policy by attempting to install a printer on a non-admin user's workstation to ensure the policy is effectively allowing the installation.

## Understanding Device Classes:

The GUIDs provided specify the device classes for printers and PNP printers, ensuring that Group Policy precisely targets the devices intended for user installation without opening permissions broadly, which could lead to security risks.

## Additional Resources:

For more information on preventing or managing device installation, visit the following Microsoft documentation pages:

[Driver Installation Prevention](https://learn.microsoft.com/en-us/windows/security/threat-protection/security-policy-settings/devices-prevent-users-from-installing-printer-drivers)

[Manage Device Installation with Group Policy](https://learn.microsoft.com/en-us/windows/client-management/manage-device-installation-with-group-policy)

## Conclusion:

By configuring this Group Policy, you empower non-administrator users to install necessary printer drivers on their own, thereby reducing administrative overhead and enhancing productivity. This setup maintains control over what types of devices can be installed, keeping the network secure while providing flexibility where it is needed.

