---
title: 'Install and Configure Office on RDS / RemoteApp (Part 2)'
description: Install Microsoft 365 Apps on an RDS host with the Office Deployment Tool and shared computer licensing, tune Office via ADMX policies, publish RemoteApps.
date: '2024-10-24'
categories: [Windows Server, Remote Desktop Services]
tags: [windows server 2022, remote desktop services, rds, microsoft office, group policy, admx, office 365, office deployment tool, remote apps, fslogix]
image: {path: /assets/img/posts/a803d385944d.png, alt: A Step-by-Step Guide - Installing and Configuring Office on RemoteAPP/Desktop Services}
series: The Complete Remote Desktop Services Guide
series_order: 2
---

# A Step-by-Step Guide to Installing and Configuring Office on Remote Desktop Services

Hey there! Welcome to our follow-up guide on Remote Desktop Services (RDS). If you've already set up your RDS environment with Windows Server 2022 from our previous tutorial, congrats—you've laid a solid foundation! Now, we’re going to make your setup even more productive by installing and configuring Office applications. And hey, we’ll even throw in a few power tips using ADMX files for Group Policy, so you can enhance productivity with minimal manual work. Let’s dive in!

{% youtube "https://youtu.be/m6SQ8XtJki0" %}

## Prerequisites

Before we get started, make sure you’ve got a working Remote Desktop Services environment. If not, no worries! We’ve got you covered with our [Step-by-Step RDS Guide](/posts/Remote-Desktop-Services-Part1/).

### What you need:
- **Group Policy Knowledge**: You’ll need a basic understanding of Group Policy. If you need a quick refresher, check out our [Group Policy Best Practices guide](/posts/GroupPolicyBestPracticesServer2022/).
- **(Optional)**: An extra virtual machine (VM) for deploying Remote Apps. I like to call mine **RDS2**.

---

## Part 1: Installing Office on Your Remote Desktop Host Server

First things first, we’ll install Microsoft Office on your remote desktop host. Let’s make sure your users can work remotely without skipping a beat.

### Step 1: Download the Office Deployment Tool

1. Download the **Office Deployment Tool** from the official Microsoft website [here](https://www.microsoft.com/en-us/download/details.aspx?id=49117).
2. Once downloaded, extract the contents to a folder on your server. I suggest using a directory like `c:\temp` for easy access.

### Step 2: Create and Configure Your Office Installation

1. Head over to [config.office.com](https://config.office.com) to create a custom configuration file for your Office installation.
   - Select **Microsoft 365 Apps for Enterprise** (or **Business**, depending on your license).
   - Choose the applications you want to install. Maybe you're a fan of Word and Excel but don’t need PowerPoint—your choice!
   - Don’t forget to add all the languages you need. Office will default to the operating system’s language, but you can install multiple languages and proofing tools.

2. Select **Office Content Delivery Network (CDN)** as your source location. This ensures you’re always installing the latest version. You can also set up a local source as a fallback if bandwidth is an issue.

3. Enable **automatic architecture upgrades** (like from 32-bit to 64-bit). If you’ve still got some 32-bit installations hanging around, this is your chance to upgrade!

4. Under **Licensing and Activation**:
   - Accept the EULA.
   - Make sure to select **Shared Computer Licensing**—crucial for remote desktop environments.

5. Once you’ve tweaked all the settings, **export the configuration**. Save the `.xml` file alongside the Office setup files you downloaded earlier.

### Step 3: Install Office on the RDS Host

Now that we’ve got the configuration ready, let’s get Office installed!

1. Open **Control Panel**, set the view to "Small Icons" (trust me, it makes life easier), and select **Install Applications on Remote Desktop**.
   
2. Navigate to your Office setup file and run the command below, making sure to point it to your configuration file:
   ```bash
   c:\temp\setup.exe /configure c:\temp\yourconfigfile.xml
   ```
3. Wait for the installation to finish, and don’t close the wizard until you’re done!

### Step 4: Add Shortcuts for Users

Since you’re in a multi-user environment, it’s handy to put application shortcuts on the desktop for all users.

1. Navigate to the Start Menu shortcuts, copy them, and drop them in the public desktop folder (%public%\desktop). This way, every user gets easy access, and since they don’t have admin rights, they can’t delete them.

## Part 2: Configuring Office Using Administrative Templates (ADMX Files)

Time to unlock the real power of Group Policy and ADMX files! This step will help you manage Office settings across all users like a pro.

### Step 1: Download and Set Up ADMX Files

You can grab the latest ADMX files for Office [here](https://www.microsoft.com). Copy these files to your central store or a local folder on your server.

Need a refresher on setting up a central store? Check out our [Group Policy Best Practices guide](/posts/GroupPolicyBestPracticesServer2022/).

### Step 2: Configure Policies for Office

- **Configure Default Office Settings**: For smooth sailing, set default options for Word, Excel, and other Office apps. You can tweak everything from default file locations to user privacy settings.

Create a Group Policy called **User Policy - Office - Default Settings** your users will thank you!
Here are a few policies I love configuring to enhance user experience:

#### 1. Disable the Office Start Screen for Excel

- **Path:** `User Configuration > Administrative Templates > Microsoft Excel 2016 > Miscellaneous > Disable the Office Start screen for Excel`
- **State:** Enabled
- **Description:** 
   - This policy controls whether the Office Start screen appears when Excel is launched.
   - If **Enabled**, the Office Start screen will not be shown when Excel boots.
   - If **Disabled** or **Not Configured**, the Start screen will be displayed.

---

#### 2. Disable First Run Movie

- **Path:** `User Configuration > Administrative Templates > Microsoft Office 2016 > First Run > Disable First Run Movie`
- **State:** Enabled
- **Description:** 
   - This policy controls whether the video about signing in to Office is shown during Office's first run.
   - If **Enabled**, the video will not run.
   - If **Disabled** or **Not Configured**, the video will play the first time Office is launched.

---

#### 3. Disable Office First Run on Application Boot

- **Path:** `User Configuration > Administrative Templates > Microsoft Office 2016 > First Run > Disable Office First Run on Application Boot`
- **State:** Enabled
- **Description:** 
   - This policy determines whether the Office First Run screen is shown when an Office application is booted for the first time.
   - If **Enabled**, the First Run screen will not appear.
   - If **Disabled** or **Not Configured**, users will see the Office First Run screen on first application boot.

---

#### 4. Disable Office Animations

- **Path:** `User Configuration > Administrative Templates > Microsoft Office 2016 > Miscellaneous > Disable Office Animations`
- **State:** Enabled
- **Description:** 
   - This setting disables Office animations such as fading between views.
   - If **Enabled**, all Office animations will be turned off.
   - If **Disabled** or **Not Configured**, animations will be enabled by default.

---

#### 5. Disable the Office Start Screen for All Office Applications

- **Path:** `User Configuration > Administrative Templates > Microsoft Office 2016 > Miscellaneous > Disable the Office Start screen for all Office applications`
- **State:** Enabled
- **Description:** 
   - This policy controls whether the Office Start screen appears when any Office application is booted.
   - If **Enabled**, users will not see the Office Start screen for any Office app.
   - If **Disabled** or **Not Configured**, the Start screen will be displayed when users launch Office applications.

---

#### 6. Do Not Use Hardware Graphics Acceleration

- **Path:** `User Configuration > Administrative Templates > Microsoft Office 2016 > Miscellaneous > Do Not Use Hardware Graphics Acceleration`
- **State:** Enabled
- **Description:** 
   - This policy controls whether Office uses hardware graphics acceleration.
   - If **Enabled**, hardware graphics acceleration will be turned off.
   - If **Disabled** or **Not Configured**, hardware graphics acceleration will be used.

---

#### 7. Show Screen Tips

- **Path:** `User Configuration > Administrative Templates > Microsoft Office 2016 > Miscellaneous > Show Screen Tips`
- **State:** Disabled
- **Description:** 
   - This policy controls whether Office displays screen tips (tooltips) when users hover over commands on the Ribbon.
   - If **Disabled**, no screen tips will be shown.
   - If **Enabled**, you can configure the display to show feature descriptions or only feature names.
   - If **Not Configured**, Office will show both feature names and descriptions.

---

#### 8. Disable Opt-in Wizard on First Run

- **Path:** `User Configuration > Administrative Templates > Microsoft Office 2016 > Privacy/Trust Center > Disable Opt-in Wizard on First Run`
- **State:** Enabled
- **Description:** 
   - This policy controls whether users see the Opt-in Wizard the first time they run an Office application.
   - If **Enabled**, the Opt-in Wizard will not appear.
   - If **Disabled** or **Not Configured**, users will see the Opt-in Wizard the first time they run Office.

---

#### 9. Disable the Office Start Screen for PowerPoint

- **Path:** `User Configuration > Administrative Templates > Microsoft PowerPoint 2016 > Miscellaneous > Disable the Office Start screen for PowerPoint`
- **State:** Enabled
- **Description:** 
   - This policy controls whether the Office Start screen appears when PowerPoint is launched.
   - If **Enabled**, the Start screen will not appear for PowerPoint.
   - If **Disabled** or **Not Configured**, the Start screen will be displayed when PowerPoint is launched.

---

#### 10. Prevent Microsoft Teams from Starting Automatically After Installation

- **Path:** `User Configuration > Administrative Templates > Microsoft Teams > Prevent Microsoft Teams from starting automatically after installation`
- **State:** Enabled
- **Description:** 
   - This policy controls whether Microsoft Teams automatically starts when users log into a device after Teams is installed.
   - If **Enabled**, Teams will not start automatically after installation.
   - If **Disabled** or **Not Configured**, Teams will start automatically after installation.

---

#### 11. Disable the Office Start Screen for Word

- **Path:** `User Configuration > Administrative Templates > Microsoft Word 2016 > Miscellaneous > Disable the Office Start screen for Word`
- **State:** Enabled
- **Description:** 
   - This policy controls whether the Office Start screen appears when Word is launched.
   - If **Enabled**, the Start screen will not appear for Word.
   - If **Disabled** or **Not Configured**, the Start screen will be displayed when Word is launched.

---

## Part 3: Optional - Deploying RemoteApps

{% youtube "https://youtu.be/hdwa0Wq1XTI" %}

If you want to streamline the experience and save server resources, **RemoteApps** might be your solution. Instead of offering full desktops, you can let users access individual applications as if they were installed locally. Here’s how you do it:

1. Open **Server Manager**, right-click **All Servers**, and add **RDS2** (or your chosen VM).
2. Go to **Remote Desktop Services** and create a **Session Collection**. Name it something like "Remote Applications."
3. Assign a security group (default: **Domain Users**), and make sure to **deselect user profile disks**. We’ll use **FS Logix** instead for profile management.
4. Publish your desired apps through the wizard.

Now your users can access Office (or any other app) directly from their local desktops, without the overhead of a full desktop session. 

---

## Wrapping Up

And there you have it! You’ve now installed and configured Microsoft Office on a Remote Desktop Services host, set up Group Policies using ADMX files, and optionally deployed RemoteApps for a sleek, lightweight user experience.

If you’re looking for more tips, tricks, or need help troubleshooting, check out our other [guides](https://mylemans.online) or drop us a comment below. We’re here to help!

Happy configuring!
