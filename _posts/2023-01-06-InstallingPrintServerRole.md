---
title: 'Install Print Management on Windows Server 2022'
description: 'Add the Print and Document Services role on Windows Server 2022, open Print Management, and deploy a shared printer to users with a Group Policy connection.'
date: '2023-01-06 08:00:00'
categories: [Windows Server]
tags: [server 2022, printserver, group policy, printer deployment, tutorial, youtube]
image: {path: /assets/img/posts/XQL3ma7Otg8.jpg, alt: Server 2022 - Installing PrintServer Role}
---

{% include google-adsense.html %}

## Introduction:

In this guide, we'll walk through the process of installing the PrintServer role on Windows Server 2022. Additionally, we will demonstrate how to deploy a demo printer using Group Policy. This setup is ideal for organizations looking to manage multiple printers efficiently across their network.


### Video Tutorial:

For a visual step-by-step guide, watch our comprehensive video tutorial:

{% youtube "https://youtu.be/XQL3ma7Otg8" %}


### Step-by-Step Installation Guide:

1) **Open Server Manager:** Start by opening the Server Manager dashboard. This is where you can manage roles and features on your server.

2) **Add Roles and Features:** Navigate to the "Manage" menu and select "Add Roles and Features". This launches the wizard to help you add new functionalities to your server.

3) **Select the Print and Document Services Role:** Follow the wizard steps until you reach the "Roles" section. Check the box next to "Print and Document Services" to install the PrintServer role.

4) **Configure Role Services:** Ensure that the "Print Server" role service is selected. You may also consider adding other related services like "LPD Service" or "Internet Printing" depending on your needs.

5) **Complete Installation:** Continue through the wizard and confirm your selections to install the role. Once the installation is complete, you can manage your printers and deploy new printers from the Server Manager.


## Deploying a Demo Printer with Group Policy:

1) **Create a New Group Policy Object (GPO):** Open the Group Policy Management Console (GPMC), right-click your domain, and choose "Create a GPO in this domain, and Link it here". Name your GPO appropriately, such as "Deploy Demo Printer".

2) **Configure Printer Deployment:** Edit the newly created GPO and navigate to "User Configuration -> Policies -> Windows Settings -> Printer Connections". Here, you can add the path to the printer that you want to deploy.

3) **Test the Policy:** Ensure that the policy applies correctly by using the "gpupdate /force" command on a client machine or by restarting the machine. Users should see the demo printer installed upon login.


## Conclusion:

Installing the PrintServer role and deploying printers through Group Policy on Windows Server 2022 can streamline your organization's printer management, reducing the manual setup required for each client machine.


## Software Download:

For the demo printer software used in our guide, download it here:

[Download Link - Demo Printer Software](https://www.colorpilot.com/emfprinter_versions.html)

