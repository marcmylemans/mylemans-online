---
title: 'Point and Print: Trusted Print Servers via Group Policy'
description: Configure the Point and Print Restrictions GPO on Server 2022 to trust your internal print server so clients install its drivers without elevation prompts.
date: '2023-01-07 08:00:00'
categories: [Windows Server]
tags: [server 2022, printserver, point and print, trusted printserver, group policy, printer management, tutorial, youtube]
image: {path: /assets/img/posts/TcTFFKfjLTQ.jpg, alt: Server 2022 - Configure Point and Print - Trusted Printserver}
---
{% youtube "https://youtu.be/TcTFFKfjLTQ" %}

## Introduction:

Configuring a trusted PrintServer and managing Point and Print settings are critical for enhancing security and operational efficiency within a Windows Server environment. This guide focuses on setting up a Group Policy in Windows Server 2022 to specify trusted internal PrintServers, thus streamlining printer management and improving security against potential vulnerabilities.

### Video Tutorial:

For a visual walkthrough of the configuration process, please watch our detailed video tutorial:

### Step-by-Step Configuration Guide:

1) **Open Group Policy Management Console (GPMC):** Access GPMC from the Server Manager dashboard or by searching for it in the start menu.

2) **Create or Edit a Group Policy Object (GPO):** Either create a new GPO linked to the domain or organizational unit where your print servers and clients reside or edit an existing GPO.

3) **Navigate to Printer Settings:** Within the GPO, go to Computer Configuration -> Policies -> Administrative Templates -> Printers.

4) **Configure Point and Print Restrictions:** Find the "Point and Print Restrictions" setting and set it to Enabled. Here, you can specify your internal PrintServer as a trusted source. Ensure to configure the options to show warning and elevation prompts appropriately for your environment.

5) **Apply and Test the GPO:** After configuring the settings, apply the GPO and use the gpupdate /force command on client machines to test the policy. Ensure that clients can install printers from the specified trusted PrintServer without encountering unnecessary warnings or restrictions.

## Understanding the Importance:

This configuration is particularly important in light of security advisories and vulnerabilities associated with printer installations from untrusted sources. By specifying trusted PrintServers, administrators can mitigate risks and ensure that only authorized devices are being installed and used within the network.

## Additional Resources:

For more detailed information about managing new Point and Print default driver installation behavior and addressing specific vulnerabilities, refer to the official Microsoft support documentation:

[Manage new Point and Print default driver installation behavior (CVE-2021-34481)](https://support.microsoft.com/en-gb/topic/kb5005652-manage-new-point-and-print-default-driver-installation-behavior-cve-2021-34481-873642bf-2634-49c5-a23b-6d8e9a302872)

## Conclusion:

Implementing a Group Policy to specify a trusted internal PrintServer is a crucial step in securing your printing environment and ensuring efficient printer management in Windows Server 2022. Following the steps outlined above will help administrators maintain control over printer installations and mitigate potential security risks.

