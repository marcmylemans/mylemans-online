---
title: 'MFA for Remote Desktop Gateway with Entra ID (NPS Extension)'
description: 'Add Microsoft Entra MFA to RD Gateway with the NPS extension: central RD CAP store, RADIUS timeouts, the RDG_CAP policy, and why SMS codes fail on RDP.'
date: '2024-12-01'
categories: [Remote Desktop Services, Security]
tags: [multi factor authentication, mfa, microsoft entra id, azure active directory, nps extension, remote desktop gateway, rd gateway, network policy server, nps, radius, step by step guide, remote access, secure remote access, authentication, it infrastructure, windows server, azure mfa]
image: {path: /assets/img/posts/b5WL7PgEmaY.jpg, alt: Simplifying MFA Setup for Remote Desktop Gateway with Microsoft Entra ID}
---

Securing remote work access doesn't have to be complicated. Multi-factor authentication (MFA) is one of the most effective ways to protect your Remote Desktop Gateway (RD Gateway). This guide will walk you through how to integrate Microsoft Entra ID (formerly Azure Active Directory) with RD Gateway using the Network Policy Server (NPS) extension.

---

{% youtube "https://youtu.be/b5WL7PgEmaY" %}

## Why This Matters  

In a world of remote work, safeguarding sensitive company data is crucial. By adding MFA to your RD Gateway, you add an essential extra layer of defense. This setup not only protects against unauthorized access but also enhances trust within your IT ecosystem.

Here’s what you’ll achieve by the end of this guide:

- **MFA-Enabled RD Gateway:** More secure remote connections.
- **Optimized NPS Configuration:** Seamless MFA integration.
- **Peace of Mind:** A safer remote access experience for users and administrators.

---

## Ready to Get Started?  

Before diving in, make sure you have:

1. **An RD Gateway Server:** [Installed and operational](/posts/Remote-Desktop-Services-Part1/).  
2. **Microsoft Entra ID:** [With user accounts synced](/posts/EntraID_Cloud_Sync_SSO/).  
3. **Microsoft Entra P1 or P2 License:** Required for MFA functionality.  
4. **NPS Role:** Installed on a domain member server or controller.  
5. **Administrator Access:** To configure server settings and Microsoft Entra ID.  

---

## Step 1: Prepping Your Environment  

### 1. Install the NPS Role  
1. Open **Server Manager** on your NPS-designated server.  
2. Select **Add roles and features** and proceed to **Server Roles**.  
3. Check **Network Policy and Access Services**, then complete the wizard.  

### 2. Sync Users with Microsoft Entra ID  
Please make sure your on-premises Active Directory users are synced with [Microsoft Entra ID](/posts/EntraID_Cloud_Sync_SSO/). This allows seamless integration of existing accounts.  

---

## Step 2: Setting Up MFA in Microsoft Entra ID  

### 1. Enable MFA for Users  
1. Log in to the [Microsoft Entra admin center](https://entra.microsoft.com).  
2. Navigate to **Users** > **All Users**, then select the desired accounts.  
3. Click **Multi-Factor Authentication** and enable MFA for selected users.  

### 2. Guide Users to Register for MFA  
1. Have users visit [https://aka.ms/mfasetup](https://aka.ms/mfasetup).  
2. Walk them through setting up their preferred MFA method (e.g., the Microsoft Authenticator app).

> The sign-in behavior for Remote Desktop Gateway doesn't provide the option to enter a verification code with Microsoft Entra multifactor authentication. Users must be configured for phone verification or the Microsoft Authenticator App with **Approve**/**Deny** push notifications.
>
> - If neither phone verification nor the Microsoft Authenticator App with **Approve**/**Deny** push notifications is configured for a user, they won't be able to complete the Microsoft Entra multifactor authentication challenge and sign in to Remote Desktop Gateway.
> - The SMS text method doesn't work with Remote Desktop Gateway because it doesn't provide the option to enter a verification code.
{: .prompt-warning }

---

## Step 3: Installing the NPS Extension  

### 1. Download & Install  
- Download the NPS extension for Microsoft Entra ID [here](https://aka.ms/npsmfa).  
- Run the installer on your NPS server and follow the prompts.  

### 2. Configure the Extension  
1. Open **PowerShell** as an administrator.  
2. Navigate to the config folder:  
   ```powershell
   cd "C:\Program Files\Microsoft\AzureMfa\Config"
   ```
3. Run the setup script:
   ```powershell
   .\AzureMfaNpsExtnConfigSetup.ps1
   ```
4. sign in with your Microsoft Entra ID admin credentials when prompted.
5. Enter your Tenant ID when prompted (you can find this in the Microsoft Entra admin center under Identity > Overview).

---

## Step 4: Configure NPS Components on Remote Desktop Gateway

**Disclaimer:** The following steps are crucial and must be followed exactly as described to ensure proper integration of MFA with your RD Gateway. These instructions are based on the [official Microsoft documentation](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-mfa-nps-extension-rdg#configure-nps-components-on-remote-desktop-gateway) to provide accurate guidance.

In this step, we'll configure the Remote Desktop Gateway to communicate with the NPS server where the NPS extension is installed. This involves setting up connection authorization policies and adjusting RADIUS settings to ensure proper authentication flow between the RD Gateway and the NPS server.

### **Configure RD Gateway to Use Central NPS Policies**

Remote Desktop Connection Authorization Policies (RD CAPs) define who can connect through the RD Gateway. By default, these policies are stored locally, but we'll configure the RD Gateway to use a central NPS server for these policies.

1. **Open Remote Desktop Gateway Manager:**

   - On your RD Gateway server, open **Server Manager**.
   - Navigate to **Tools** > **Remote Desktop Services** > **Remote Desktop Gateway Manager**.

2. **Access RD Gateway Properties:**

   - In the RD Gateway Manager, right-click your server name (e.g., **[YourServerName] (Local)**) and select **Properties**.

3. **Configure RD CAP Store:**

   - Go to the **RD CAP Store** tab.
   - Select **Central server running NPS**.
   - In the **Enter a name or IP address for the server running NPS** field, type the **IP address** or **server name** of your NPS server (where the NPS extension is installed).

4. **Add and Configure Shared Secret:**

   - Click **Add**.
   - In the **Shared Secret** dialog box, enter a **shared secret**. This is a password that establishes trust between the RD Gateway and the NPS server. Make sure to create a strong, complex password and keep it secure.
     - **Tip:** A quick and easy way to generate a random, strong password is to open PowerShell and run the following command:

       ```powershell
       new-guid
       ```

       This command generates a new GUID, which you can use as your shared secret.
   - Click **OK** to save.

5. **Finalize Configuration:**

   - Click **OK** to close the RD Gateway Properties dialog box.

### **Adjust RADIUS Timeout Values**

To allow enough time for MFA authentication, we need to adjust the RADIUS timeout settings on the RD Gateway server.

1. **Open Network Policy Server Console:**

   - On the RD Gateway server, open **Server Manager**.
   - Navigate to **Tools** > **Network Policy Server**.

2. **Access Remote RADIUS Server Groups:**

   - In the **NPS (Local)** console, expand **RADIUS Clients and Servers**.
   - Click on **Remote RADIUS Server Groups**.

3. **Edit TS GATEWAY SERVER GROUP:**

   - In the details pane, double-click on **TS GATEWAY SERVER GROUP**.
   - This group was created when you configured the RD Gateway to use a central NPS server.

4. **Edit NPS Server Settings:**

   - In the properties dialog, select your NPS server's IP address or name, and click **Edit**.

5. **Set Load Balancing Timeout Values:**

   - Go to the **Load Balancing** tab.
   - Change **Number of seconds without response before request is considered dropped** from **3** to **30** seconds (you can set it between 30 and 60 seconds).
   - Change **Number of seconds between requests when server is identified as unavailable** from **30** to **30** seconds or more.

6. **Save Changes:**

   - Click **OK** to close the **Edit RADIUS Server** dialog.
   - Click **OK** again to close the **TS GATEWAY SERVER GROUP Properties** dialog.

### **Verify Connection Request Policies**

Ensure that the RD Gateway is correctly forwarding authentication requests to the NPS server.

1. **Access Connection Request Policies:**

   - In the **NPS (Local)** console on the RD Gateway server, expand **Policies**.
   - Click on **Connection Request Policies**.

2. **Review TS GATEWAY AUTHORIZATION POLICY:**

   - Double-click on **TS GATEWAY AUTHORIZATION POLICY**.
   - Go to the **Settings** tab.

3. **Verify Authentication Settings:**

   - Under **Authentication**, ensure that **Authenticate requests on this server** is selected, and that the **Forwarding Connection Request** settings are correctly pointing to your NPS server group.

4. **Close Dialog:**

   - Click **Cancel** to close the properties dialog.

### **Configure NPS Server to Accept Requests from RD Gateway**

Now, we'll configure the NPS server (where the NPS extension is installed) to accept RADIUS requests from the RD Gateway server.

#### **Register NPS Server in Active Directory**

1. **Open Network Policy Server Console:**

   - On the NPS server, open **Server Manager**.
   - Navigate to **Tools** > **Network Policy Server**.

2. **Register Server:**

   - In the **NPS (Local)** console, right-click **NPS (Local)** and select **Register server in Active Directory**.
   - Click **OK** twice to confirm.

#### **Add RD Gateway as a RADIUS Client**

1. **Create New RADIUS Client:**

   - In the **NPS (Local)** console, right-click **RADIUS Clients** and select **New**.

2. **Configure RADIUS Client Settings:**

   - **Friendly Name**: Enter a name like **RD Gateway**.
   - **Address (IP or DNS)**: Enter the **IP address** or **DNS name** of your RD Gateway server.
   - **Shared Secret**: Enter the same shared secret you used earlier when configuring the RD Gateway.

3. **Save Configuration:**

   - Click **OK** to add the RD Gateway as a RADIUS client.

#### **Create Network Policy for RD Gateway Connections**

1. **Duplicate Existing Policy:**

   - Under **Policies**, click on **Network Policies**.
   - Right-click **Connections to other access servers** and select **Duplicate Policy**.

2. **Rename and Edit Policy:**

   - Right-click the duplicated policy (e.g., **Copy of Connections to other access servers**) and select **Properties**.
   - **Policy Name**: Rename it to something meaningful like **RDG_CAP**.
   - Ensure **Policy enabled** is checked.
   - Under **Access Permission**, select **Grant access**.

3. **Set Conditions (Optional):**

   - Go to the **Conditions** tab.
   - Add any conditions required for your environment, such as **User Groups** to specify which users are allowed to connect.

4. **Adjust Constraints:**

   - Go to the **Constraints** tab.
   - Under **Authentication Methods**, uncheck all methods except **Unencrypted authentication (PAP, SPAP)**.
   - **Important**: For security, ensure that your RD Gateway is using SSL/TLS to encrypt the connection since we're allowing unencrypted authentication at this stage.

5. **Finalize Policy:**

   - Click **OK** to save the policy.
   - Ensure your new policy (**RDG_CAP**) is at the top of the list in the **Network Policies** and that it is enabled.

---

## Step 5: Verify the Configuration

### **Test the Connection**

1. **Set Up Remote Desktop Connection:**

   - On a client computer, open **Remote Desktop Connection**.
   - Click on **Show Options** > **Advanced** > **Settings**.
   - Select **Use these RD Gateway server settings**.
   - Enter your RD Gateway server name.
   - Ensure **Bypass RD Gateway server for local addresses** is unchecked.

2. **Connect to Remote Resource:**

   - Go back to the **General** tab.
   - Enter the name of the remote computer you want to connect to.
   - Click **Connect**.

3. **Authenticate:**

   - Enter your user credentials when prompted.
   - After submitting your credentials, you should receive an MFA prompt (e.g., a push notification on your Authenticator app or a phone call).

4. **Complete MFA Challenge:**

   - Approve the MFA prompt using your registered method.
   - Once authenticated, you should gain access to the remote resource.

### **Confirm Access**

- If you successfully connect, your configuration is correct.
- If not, revisit the previous steps to ensure all settings are properly configured.

---

## Troubleshooting Like a Pro  

If users are not receiving the MFA prompt or the connection fails during authentication, you may need to adjust the NPS extension settings to support your authentication methods.

**Solution:**

1. On the NPS server, open the **Registry Editor**.
2. Navigate to the following key:
   ```
   HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\AzureMfa
   ```
3. If the `AzureMfa` key doesn't exist, create it.
4. Within the `AzureMfa` key, create a new **String Value** with the following details:
- **Name**: `OVERRIDE_NUMBER_MATCHING_WITH_OTP`
- **Value**: `FALSE`

> This configuration disables the number matching feature, which can interfere with certain authentication methods like TOTP codes when used with RD Gateway.
{: .prompt-info }

5. Close the Registry Editor.
6. Restart the **Network Policy Server (NPS)** service for the changes to take effect.

**Explanation:**

This registry setting tells the NPS extension not to enforce number matching, which can cause issues with RD Gateway connections if users are registered for certain MFA methods like TOTP codes. Setting the value to `FALSE` allows the NPS extension to fallback to push notifications or phone call methods that are compatible with RD Gateway.

If you run into issues:  
- **Event Logs:** Check **Event Viewer** > **Microsoft** > **AzureMfa** for errors.  
- **Verify MFA Registration:** Ensure users are correctly set up in [https://aka.ms/mfasetup](https://aka.ms/mfasetup).  
- **Network Connectivity:** Confirm RD Gateway can reach your NPS server over the required ports.

---

## Conclusion  

Congrats! You've added a powerful layer of security to your RD Gateway with Microsoft Entra ID. Your organization’s remote access is now safer, and your users can work confidently knowing their data is protected.  

---

## Watch the Video Guide

Need a visual walkthrough? Check out our detailed step-by-step video [here](https://youtu.be/b5WL7PgEmaY).

*This video links to an older recording. A new version based on this guide is currently being recorded and will be available as soon as possible.*

---

We’d love to hear from you! Did this guide help? Drop us a comment or connect with us on social media.  

