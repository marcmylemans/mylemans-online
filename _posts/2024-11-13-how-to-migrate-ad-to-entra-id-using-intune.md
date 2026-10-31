---
title: 'Migrate On-Prem Active Directory to Entra ID with Intune'
description: 'Move from on-premises AD to Entra ID with Intune: an Autopilot profile and dynamic device group, GPO import via Group Policy analytics, apps and hashes.'
date: '2024-11-13'
categories: [Entra ID & Intune]
tags: [entra id, microsoft intune, active directory migration, autopilot, group policy migration, device enrollment, company portal, application deployment, remote work, cloud kerberos trust, windows hello, onedrive, microsoft edge, modern workplace, mdm]
image: {path: /assets/img/posts/e7a4ee8db2ad.png, alt: How to Migrating from On-Premise Active Directory to Entra ID with Intune}
---
{% youtube "https://youtu.be/xrNkSVDas5E" %}

# Guide to Setting Up Autopilot and Migrating to Entra ID with Intune

## 1. Creating an Autopilot Profile

Windows Autopilot streamlines the setup of new devices, allowing users to get up and running with minimal IT intervention.

### Step 1: Create a Dynamic Security Group

To automatically group Autopilot devices:

1. Navigate to the [Azure portal](https://entra.microsoft.com) and select **Azure Active Directory > Groups > New Group**.
2. Set the following:
   - **Group Type:** Security  
   - **Group Name:** `SG_AutoPilotDevices`  
   - **Membership Type:** Dynamic Device  
3. Under **Dynamic device members**, enter the following rule:

    ```plaintext
    (device.devicePhysicalIDs -any (_ -startsWith "[ZTDId]"))
    ```

   This rule ensures all Autopilot devices are automatically added to the group.

### Step 2: Create an Autopilot Deployment Profile

1. In [Intune](https://intune.microsoft.com), go to **Devices > Windows > Windows enrollment > Deployment Profiles**.
2. Click **+ Create profile** and select **Windows PC**.
3. Configure the profile:
   - **Name:** `Autopilot`  
   - **Convert all targeted devices to Autopilot:** Yes  
   - **Deployment mode:** User-Driven  
   - **Join to Azure AD as:** Azure AD joined  
   - **User account type:** Standard  
   - **Language (Region):** Operating system default  
   - **Automatically configure keyboard:** No  
4. Assign the profile to **All Devices**.
5. Click **Create**.

> **Note:** The device conversion process can take up to 48 hours. To expedite, you can manually register devices using the `Get-WindowsAutopilotInfo.ps1 -Online` script.

---

## 2. Migrating Group Policies to Entra ID

Migrating your Group Policy Objects (GPOs) to Intune allows for centralized management and supports devices that are not connected to the corporate network.

### Step 1: Export Group Policy

1. Open **Group Policy Management Console** on your domain controller.
2. Right-click the desired GPO and select **Save Report**.
3. Save the report as an **XML** file.

### Step 2: Import into Intune

1. In Intune, navigate to **Devices > Group Policy analytics (preview)**.
2. Click **Import** and select the XML file.
3. Once analyzed, you'll see a compatibility report.
4. Select the policy and click **Migrate** to create an equivalent Intune policy.

### Step 3: Assign the Policy

1. Assign the new policy to the `SG_AutoPilotDevices` group.
2. Review and modify settings as necessary.

---

## 3. Configuring Applications in Intune

Deploy essential applications to devices to ensure users have the tools they need.

### Deploying Company Portal

The Company Portal app allows users to install available applications and manage their devices.

1. In Intune, go to **Apps > Windows > + Add**.
2. Select **Microsoft Store app (new)**.
3. Search for **Company Portal** and select it.
4. Configure the app information as needed.
5. Under **Assignments**, set it as **Required** for the appropriate user or device groups.
6. Click **Next** and then **Create**.

### Deploying Other Applications

Repeat the steps above to deploy:

- **Microsoft Office**
- **Microsoft Edge**

For applications that users can choose to install:

1. Set **Assignment** to **Available for enrolled devices**.
2. Assign to the relevant user groups.

---

## 4. Migrating Users to Entra ID Devices

When moving users to new devices:

1. **Inventory Applications:** Ensure all required applications are available in Intune.
2. **Backup Data:** Use OneDrive to back up user data from Desktop, Documents, and Pictures.
3. **Browser Settings:** Import bookmarks and settings to Microsoft Edge and enable synchronization.
4. **Assign User to Device:** Use Autopilot to assign the user to the new device.

### **Device Setup Process**

Before setting up the device, you’ll need to gather the necessary hardware information to register it in Intune. We’ll be using the **Get-WindowsAutoPilotInfo** PowerShell script for this process.

Here’s how to get the devices ready for Intune:

---

#### **Step 1: Install the Windows AutoPilot Info Script**
The **Get-WindowsAutoPilotInfo** script is available on the PowerShell Gallery. Follow these steps to install it:

1. Open **PowerShell** as an administrator.
2. Run the following command to install the script:
   ```powershell
   Install-Script -Name Get-WindowsAutoPilotInfo
   ```
3. When prompted to trust the repository, type Y to confirm.

The script will now be installed in the default PowerShell scripts directory:

  ```plaintext
  cd "C:\Program Files\WindowsPowerShell\Scripts"
  ```

#### **Step 2: Use the Script to Gather Device Info**

Once the script is installed, you can use it to gather the hardware hash and device information for Autopilot registration. You have two options:

1. **Import a Single Device**  
   For this demonstration, we’ll focus on gathering information for a single device and importing it directly into Intune.

   - Run the following command:
     ```powershell
     WindowsAutoPilotInfo.ps1 -Online
     ```
   > **Note:** If you encounter an error saying that scripts are not allowed to run, you can temporarily allow scripts by running the following command:
    ```powershell
    Set-ExecutionPolicy Unrestricted -Scope Process
    ```

   - This command uploads the device’s hardware hash directly to Intune using your authenticated session.

1. **Gather Information for Multiple Devices**  
   If you need to gather hardware information for multiple devices over the network, you can use the `Get-ADComputer` cmdlet to retrieve a list of devices and pipe that into the **Get-WindowsAutoPilotInfo** script.

   - Use the following command to gather information for multiple devices and export it to a CSV file:
     ```powershell
     Get-ADComputer -Filter * | .\GetWindowsAutoPilotInfo.ps1 -OutputFile .\MyComputers.csv
     ```
   - To enable this method, you’ll need to ensure the appropriate firewall rules are activated on the target devices. Specifically, enable the following rules in the firewall settings:
     - **Windows Management Instrumentation (WMI-In)**  
     - **Windows Remote Management (HTTP-In)**  

   > **Note:** This method is ideal for bulk device setup but requires network configuration and elevated permissions.

#### **Step 3: Device Setup Process**

Once the device has been registered in Intune, proceed with the following steps:

1. **Connect the Device to the Internet**  
   - Use Ethernet or configure Wi-Fi during the initial setup process.

2. **Sign in with the User's Work Account**  
   - When prompted, the user signs in with their organizational account (e.g., their Microsoft 365 credentials).

3. **Configure Windows Hello**  
   - The user sets up Windows Hello, which can include a PIN, fingerprint, or facial recognition, depending on the device’s capabilities.

4. **Automatic Policy and Application Deployment**  
   - After signing in, the device setup will complete automatically.  
   - Company policies and applications are deployed to the device as configured in Intune.

---

## Conclusion

Migrating from an on-premise Active Directory environment to Entra ID using Intune enhances flexibility, security, and user experience. With this setup, users can work remotely without relying on VPNs for policy updates or application installations.

For any questions or further assistance, feel free to leave a comment below. Don't forget to subscribe for more guides on modernizing your IT infrastructure.
