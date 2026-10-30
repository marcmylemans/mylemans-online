---
title: 'IntuneWinAppUtil: Package and Deploy a Win32 App in Intune'
description: 'Turn a custom .exe or .msi into an .intunewin file with IntuneWinAppUtil, then deploy it as a Win32 app in Intune with install, uninstall and detection rules.'
date: '2024-01-03 08:00:00'
categories: [Entra ID & Intune]
tags: [entraid, entra id, intune, intunewinapputil]
image: {path: /assets/img/posts/covers/intunewinapputil.jpg, alt: Deploying a Custom Application with IntuneWinAppUtil in Microsoft Intune}
---

# Deploying a Custom Application with IntuneWinAppUtil in Microsoft Intune

Deploying custom applications in Microsoft Intune can be efficiently managed using the `IntuneWinAppUtil` tool. This guide provides a step-by-step approach to packaging and deploying a custom application.

## Prerequisites

- Windows-based application (`.exe`, `.msi`, `.bat`, etc.)
- Microsoft Intune subscription
- IntuneWinAppUtil tool (downloadable from [Microsoft](https://github.com/Microsoft/Microsoft-Win32-Content-Prep-Tool))

## Step 1: Prepare Your Application

Ensure your application is ready for deployment:

- **Compile your application**: The application should be in a supported format (`.exe`, `.msi`, `.bat`, etc.).
- **Test the application**: Ensure it functions as expected on your target OS.

## Step 2: Download and Run IntuneWinAppUtil

- Download the `IntuneWinAppUtil` tool.
- Run the tool and follow the prompts:
  - **Source folder**: The location of your application files.
  - **Setup file**: The executable or installer file for your application.
  - **Output folder**: Where the `.intunewin` file will be saved.

## Step 3: Sign in to Microsoft Endpoint Manager Admin Center

- Navigate to the [admin center](https://endpoint.microsoft.com/).
- Sign in with your admin account.

## Step 4: Add Your Packaged Application

- In the admin center, go to **Apps** > **All apps** > **Add**.
- Under **App type**, select **Windows app (Win32)**.
- Click **Select app package file** and upload the `.intunewin` file.

## Step 5: Configure App Information

- Fill in the details like **Name**, **Description**, **Publisher**.
- Specify the **Install command** (e.g., `setup.exe /silent` or `Powershell.exe -NoProfile -ExecutionPolicy ByPass -File '.\script.ps1'`).
- Set the **Uninstall command** if applicable.

## Step 6: Set Requirements and Detection Rules

- Specify the **Operating system architecture** and **Minimum operating system**.
- Configure the **Detection rules** to define how Intune recognizes the app is installed.

## Step 7: Assign and Deploy

- Go to the **Assignments** tab and select your target user or device groups.
- Choose the type of deployment (required, available, uninstall).
- Click **Create** to deploy your application.

## Conclusion

Your custom application is now packaged and deployed through Microsoft Intune. Users in the assigned groups will receive the application via the company portal or automatically, depending on your settings.
