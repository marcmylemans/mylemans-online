---
title: 'PrivateGlue Walkthrough: One UI for Your Homelab'
description: 'Walkthrough of PrivateGlue, my self-hosted Flask app for homelab documentation: device inventory with CSV import, encrypted credentials and Markdown notes.'
date: '2025-04-28'
categories: [Self-hosting, Homelab]
tags: []
image: {path: /assets/img/posts/covers/privateglue.jpg, alt: 'Take Control of Your Homelab: PrivateGlue UI Walkthrough & Demo'}
---

Welcome to the **PrivateGlue UI Walkthrough**!  
This guide offers a concise overview of the PrivateGlue web interface, showcasing key workflows and steps to get started.

---

## What is PrivateGlue?

**PrivateGlue** is a simple, self-hosted web app for linking devices, notes, and credentials — helping IT professionals and homelabbers stay organized and secure.

Ideal for:
- Freelancers and consultants juggling multiple client systems
- Home lab enthusiasts documenting hardware and setups
- Small businesses needing internal IT asset tracking
- Anyone looking for a secure, encrypted credential store

---

## Key Features

- **Markdown Notes** linked to devices
- **Secure Password Manager** with encryption
- **Device Inventory** management with tagging
- **Dark Mode Support** for a sleek UI
- **Flask, SQLite, and Bootstrap 5** based, making it lightweight and easy to deploy

---

## 1. First-Run Wizard

On first launch (when no users exist), you can restore a backup or skip straight to creating your first admin account.

![Skip restore and register new user](/assets/img/privateglue/step-0.png)  
*Step 1: Skip restore to register a new user.*

![Create your first admin user](/assets/img/privateglue/step-2.png)  
*Step 2: Enter username and password for the initial admin account.*

---

## 2. Dashboard Overview

The Dashboard provides an at-a-glance view of your registered devices, recent activity, and quick-action links.

![Dashboard overview](/assets/img/privateglue/step-3.png)  
*Device inventory, status updates, and shortcuts.*

---

## 3. Managing Devices

Navigate to **Devices** in the sidebar to add, edit, or bulk-import your hosts.

### 3.1 Add a Device

Click **Add Device**, then fill in the form with your host’s details.

![Enter device details](/assets/img/privateglue/step-9.png)  
*Provide device name, host address, credentials reference, etc.*

### 3.2 Bulk Import

For multiple hosts, choose **Import Devices**, download the CSV template, populate it, and upload.

![Import devices screen](/assets/img/privateglue/step-10.png)  
*Upload your completed CSV.*

![Download CSV template](/assets/img/privateglue/step-15.png)  
*Template format for bulk imports.*

---

## 4. Managing Credentials

Under **Credentials**, securely store and manage your Proxmox (or other) login details.

![Credentials list](/assets/img/privateglue/step-37.png)  
*All saved credentials at a glance.*

Click **View** next to any credential to see details or fetch Proxmox-specific information.

![View credential details](/assets/img/privateglue/step-38.png)  
*Inspect username, URL, fingerprint, etc.*

![Fetch Proxmox data](/assets/img/privateglue/step-45.png)  
*Retrieve license key, version, and other metadata.*

---

## 5. Notes & Live Preview

On each device page, use the **Notes** tab to author Markdown-formatted text. Toggle **Live Preview** to see it rendered instantly.

![Adding notes](/assets/img/privateglue/step-18.png)  
*Compose notes in Markdown.*

![Live preview of notes](/assets/img/privateglue/step-23.png)  
*Render output updates in real time.*

---

## 6. System Settings & Backup

From the user menu (top-right), access **System Information** and **Your Profile** to update personal settings or download a full configuration backup.

![System Information & Profile menu](/assets/img/privateglue/step-60.png)  
*Access system info, profile settings, and backup options.*

![Download backup](/assets/img/privateglue/step-63.png)  
*Save your entire configuration as a ZIP file.*

---

## Getting Started

Want to deploy PrivateGlue yourself? Here's how:

1. Clone the repository:
    ```bash
    git clone https://github.com/marcmylemans/privateglue-public.git
    ```
2. Run it with Docker:
    ```bash
    cd privateglue-public
    docker-compose up
    ```
3. Open your browser and go to:
    ```
    http://localhost:5000
    ```
4. Create your admin account and start documenting your gear!

For a live demo, check out: [PrivateGlue Demo](https://privateglue.demo.mylemans.online/)

---

## Final Thoughts

PrivateGlue is designed to make managing your home lab devices, notes, and credentials easy and secure.  
If you haven't yet, try deploying it today — and feel free to leave feedback, report issues, or contribute on [GitHub](https://github.com/marcmylemans/privateglue-public)!
