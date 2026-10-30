---
title: 'Switch AD User Language Dynamically with PowerShell'
description: Set each AD user's preferredLanguage attribute, build EN, NL and FR language GPOs with security filtering, then a scheduled PowerShell script sorts users.
date: '2024-10-25'
categories: [Active Directory, Scripts]
tags: [active directory, powershell, group policy, automation, language settings]
image: {path: /assets/img/posts/3ee97659683e.png, alt: Dynamic User Language Switching in Active Directory Using PowerShell}
---

Managing language preferences in a diverse organization is more than just a nice-to-have; it’s about creating an efficient and user-friendly environment. In this post, we’ll dive into how to automatically apply language settings for users in Active Directory (AD) based on their preferences using PowerShell. This solution saves time, minimizes errors, and ensures each user interacts with Windows in their preferred language.

This post was inspired by reading the topic [Implementing Dynamic Groups in Active Directory with PowerShell](https://woshub.com/active-directory-dynamic-user-groups-powershell/).

Imagine a workplace with employees who speak different languages—some prefer English, others French or Dutch. Configuring language settings for each person individually? That’s tedious and prone to mistakes. Instead, we can automate this process using Active Directory attributes and Group Policy Objects (GPOs). By letting a PowerShell script handle the heavy lifting, we ensure everyone gets the right settings consistently and with minimal effort from IT.

Ready to simplify your admin life? Let’s break it down.

{% youtube "https://youtu.be/qD0PJClRmhA" %}

## Prerequisites

Before we jump into the fun part, here’s what you’ll need:

- **Active Directory Environment**: A working AD setup with user accounts. If you haven’t set up Active Directory yet, check out our previous post, [Setting Up Active Directory on Windows Server 2022: A Step-by-Step Guide](/posts/SettingUpActiveDirectoryServer2022/).
- **Group Policy Management**: Three GPOs tailored to French (FR), English (EN), and Dutch (NL) language settings. For an introduction to Group Policies, including templates, preferences, and best practices, refer to our post on [Group Policy, Templates, Preferences, Loopback Policy, and Best Practices](/posts/GroupPolicyBestPracticesServer2022/).
- **Security Groups**: You’ll need three security groups, each corresponding to a language policy:
  - `User Policy Language FR`
  - `User Policy Language EN`
  - `User Policy Language NL`
- **PowerShell Access**: You’ll be running a PowerShell script on your AD server.

## Changing the preferredLanguage Attribute

To make sure each user is assigned the correct language settings, you’ll need to set the `preferredLanguage` attribute in Active Directory for each user. This attribute follows the [RFC 1766](https://tools.ietf.org/html/rfc1766) format, such as `"en-US"` for English (United States) or `"fr-FR"` for French (France). 

Here’s how to update this attribute for a user in Active Directory Users and Computers (ADUC) or via PowerShell.

### Using Active Directory Users and Computers (ADUC)

1. **Open ADUC** and find the user you want to modify.
2. Right-click the user and select **Properties**.
3. Go to the **Attribute Editor** tab. (If you don’t see this tab, you may need to enable **Advanced Features** in the **View** menu.)
4. Find the `preferredLanguage` attribute in the list, select it, and click **Edit**.
5. Enter the desired language code (e.g., `"en-US"` for English or `"nl-NL"` for Dutch).
6. Click **OK** to save your changes.

### Using PowerShell

If you need to update the `preferredLanguage` attribute for multiple users or automate the process, PowerShell is a great option.

- **To set the `preferredLanguage` attribute for a single user**:
  
  ```powershell
  # Replace 'username' and 'en-US' with the target username and preferred language code
  Set-ADUser -Identity username -Replace @{preferredLanguage = "en-US"}
  ```

- **To update the `preferredLanguage` attribute for multiple users using a CSV file**:
   
  ```powershell
  # Import users from a CSV file with 'Username' and 'Language' columns
  $users = Import-Csv -Path "C:\path\to\your\file.csv"
  
  foreach ($user in $users) {
      Set-ADUser -Identity $user.Username -Replace @{preferredLanguage = $user.Language}
      Write-Output "Updated preferredLanguage for $($user.Username) to $($user.Language)"
  }
  ```
  If you'd like to quickly create a CSV file, you can copy the following content into a text editor and save it as users_language.csv

  ```csv
  Username,Language
  jdoe,en-US
  asmith,fr-FR
  mbrown,nl-BE
  ljohnson,en-GB
  kgarcia,fr-BE
  ```

### Supported Values

The `preferredLanguage` attribute uses language codes specified in [Microsoft's official documentation for locale settings](https://learn.microsoft.com/en-us/previous-versions/commerce-server/ee825488(v=cs.20)?redirectedfrom=MSDN). Make sure to use the correct language codes for your organization’s requirements.

This allows you to set a wide range of languages based on user preferences, making your environment more inclusive and tailored to individual needs.

## Creating Language-Specific GPOs in Active Directory

In a multilingual organization, managing user preferences for regional and language settings can be streamlined by creating dedicated GPOs for each language. This setup allows users to interact with their Windows environment in their preferred language, enhancing productivity and comfort. Here’s how to create GPOs for **English (EN)**, **Dutch (NL)**, and **French (FR)** in Active Directory.

### Step 1: Open Group Policy Management Console

1. **Log into your domain controller** with an account that has permissions to create and manage Group Policy Objects.
2. Open the **Group Policy Management Console (GPMC)** by searching for "Group Policy Management" in the Start menu or running `gpmc.msc`.

### Step 2: Create a New GPO for Each Language

We’ll create three separate GPOs for the languages **English (EN)**, **Dutch (NL)**, and **French (FR)**. Each GPO will be configured with the necessary settings to enforce language-specific regional options.

1. In the **Group Policy Management Console**, navigate to your **domain** (e.g., `domain.local`) in the left pane.
2. Right-click on the **Group Policy Objects** folder, select **New**, and name your GPO according to the language. For example:
   - **User Policy - Language EN** for English
   - **User Policy - Language NL** for Dutch
   - **User Policy - Language FR** for French

3. Click **OK** to create each GPO.

### Step 3: Edit the GPO and Configure Language Settings

Now, we’ll configure the settings for each GPO individually to apply the correct regional and language options for each target language.

#### 1. Configure Regional Options for Each Language

For each GPO (**User Policy - Language EN**, **User Policy - Language NL**, **User Policy - Language FR**), follow these steps:

1. Right-click on the newly created GPO (e.g., **User Policy - Language EN**) and select **Edit**.
2. In the Group Policy Management Editor, navigate to: User Configuration > Policies > Administrative Templates > Control Panel > Regional and Language Options

3. Double-click **Restrict selection of Windows menus and dialogs language** and configure it as follows:
- **State**: Enabled
- **Restrict users to the following language**: Set the language according to the GPO:
  - **English (EN)**: Select **English**
  - **Dutch (NL)**: Select **Dutch**
  - **French (FR)**: Select **French**
- Click **Apply** and **OK**.

#### 2. Configure Office Language Settings

If you are also managing Microsoft Office language preferences, you can set the Office display and editing languages for each GPO.

1. In the Group Policy Management Editor for each language-specific GPO, navigate to: User Configuration > Policies > Administrative Templates > Microsoft Office 2016 > Language Preferences

2. Configure the following settings:

- **Display menus and dialog boxes in**:
  - **State**: Enabled
  - **Display menus and dialog boxes in**: Select the appropriate language
    - **English (EN)**: Set to **English**
    - **Dutch (NL)**: Set to **Dutch**
    - **French (FR)**: Set to **French**

- **Primary Editing Language**:
  - **State**: Enabled
  - **Primary Editing Language**: Select the appropriate language
    - **English (EN)**: Set to **English**
    - **Dutch (NL)**: Set to **Dutch (Belgium)**
    - **French (FR)**: Set to **French (France)**

3. Click **Apply** and **OK** for each setting.

> **Note:** These Office-specific settings require that users have Microsoft Office 2016 or later. The settings are applied when Office applications are launched and can be used to ensure users see Office in their preferred language.

### Step 4: Assign Security Groups to the GPOs Using Security Filtering

Now that each GPO is configured, we can use **Security Filtering** to assign the GPOs to the appropriate security groups, rather than linking them to specific OUs. This approach makes it easier to manage language settings across different departments or user locations without needing a specific OU structure.

1. In the **Group Policy Management Console**, locate the GPO you created for each language (e.g., **User Policy - Language EN**).
2. Click on the GPO to open its **Scope** tab.
3. Under **Security Filtering**, click **Add** and select the security group corresponding to that GPO:
   - For the **User Policy - Language EN** GPO, add the **User Policy Language EN** group.
   - For the **User Policy - Language NL** GPO, add the **User Policy Language NL** group.
   - For the **User Policy - Language FR** GPO, add the **User Policy Language FR** group.
4. Remove **Authenticated Users** from the **Security Filtering** list to restrict the GPO to only members of the specified security group.

This method ensures that only users within the designated security group will receive the GPO settings. If a user’s preferred language changes, you can simply move them to a different language group without adjusting the OU structure or GPO links.
By following these steps, you can create dedicated GPOs that apply language and regional settings based on user preferences. This approach ensures consistency across your organization and allows users to work in the language that suits them best, while automating the process for IT administrators. 
For more information on language codes and locale settings, refer to the [official Microsoft documentation on language locale settings](https://learn.microsoft.com/en-us/previous-versions/commerce-server/ee825488(v=cs.20)?redirectedfrom=MSDN).

## Implementation Strategy

Here’s the game plan: we’ll use the `preferredLanguage` attribute in AD to assign users to specific language groups, which in turn link to GPOs for language settings. This way, as user language preferences change, AD will automatically handle the adjustments.

Here’s how it works:

1. **Retrieve Users**: Pull all AD users who have a `preferredLanguage` attribute set.
2. **Determine Language**: For each user, extract the language code from their `preferredLanguage` attribute.
3. **Assign to Group**: Add the user to the corresponding security group based on their language code.
4. **Remove from Other Groups**: Make sure they’re not in any other language groups to avoid conflicts.
5. **Handle Undefined/Unsupported Languages**: If a user’s `preferredLanguage` isn’t set or isn’t supported, remove them from all language groups.

Automating these steps with PowerShell means language settings stay up-to-date, hassle-free.

## The PowerShell Script

Here’s the PowerShell script that does it all. This script should be saved (e.g., as `Update-UserLanguageGroups.ps1`) on your AD server and run as a scheduled task.

```powershell
<#
    .DESCRIPTION
    Assigns users to language-specific security groups based on the language portion of their preferredLanguage attribute in Active Directory.
    .NOTES
        Version:        1.0
        Author:         Marc Mylemans
        Creation Date:  25/10/2024
        Purpose/Change: Initial script development
    .EXAMPLE
        .\Update-UserLanguageGroups.ps1

#>

# Import Active Directory module
Import-Module ActiveDirectory

#-----------------------------Error Action-------------------------------

$ErrorActionPreference= 'silentlycontinue'

#-----------------------------Variables----------------------------------

$DirectoryPath = "C:\temp"
$logFile = "C:\temp\Update-UserLanguageGroups.log"

#Change working Directory
if(!(Test-Path -path $DirectoryPath))  
{  
 New-Item -ItemType directory -Path $DirectoryPath
 Log-Message "Folder path has been created successfully at: " $DirectoryPath    
 }
else 
{ 
Write-Host "The given folder path $DirectoryPath already exists"; 
}
Write-Host "Change working Directory"
Set-Location -Path $DirectoryPath

# Define the security groups corresponding to each language policy
$languageGroups = @{
    "FR" = "User Policy Language FR"
    "EN" = "User Policy Language EN"
    "NL" = "User Policy Language NL"
}

# Define the distinguished names of the security groups using -Identity
$groupDNs = @{
    "FR" = (Get-ADGroup -Identity $languageGroups["FR"]).DistinguishedName
    "EN" = (Get-ADGroup -Identity $languageGroups["EN"]).DistinguishedName
    "NL" = (Get-ADGroup -Identity $languageGroups["NL"]).DistinguishedName
}

# Function to remove user from all language groups
function Remove-FromAllLanguageGroups {
    param (
        [Parameter(Mandatory = $true)]
        [string]$UserDN
    )
    foreach ($groupDN in $groupDNs.Values) {
        Remove-ADGroupMember -Identity $groupDN -Members $UserDN -Confirm:$false
    }
}

# Function to log messages
function Log-Message {
    param (
        [string]$Message
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $Message" | Out-File -FilePath $logFile -Append
}

# Get all users with the 'preferredLanguage' attribute
$users = Get-ADUser -Filter { preferredLanguage -like "*" } -Properties preferredLanguage, DistinguishedName, SamAccountName

foreach ($user in $users) {
    # Extract the language code from the preferredLanguage attribute (e.g., 'en' from 'en-US')
    $preferredLanguageFull = $user.preferredLanguage
    $preferredLanguageCode = $preferredLanguageFull.Split('-')[0].ToUpper()
    $userDN = $user.DistinguishedName
    $samAccountName = $user.SamAccountName

    if ($languageGroups.ContainsKey($preferredLanguageCode)) {
        $targetGroupDN = $groupDNs[$preferredLanguageCode]
        
        # Add user to the target group if not already a member
        if (-not (Get-ADGroupMember -Identity $targetGroupDN -Recursive | Where-Object { $_.DistinguishedName -eq $userDN })) {
            Add-ADGroupMember -Identity $targetGroupDN -Members $userDN -Confirm:$false
            Log-Message "Added $samAccountName to $($languageGroups[$preferredLanguageCode])"
        }

        # Remove user from other language groups
        foreach ($lang in $languageGroups.Keys) {
            if ($lang -ne $preferredLanguageCode) {
                $otherGroupDN = $groupDNs[$lang]
                Remove-ADGroupMember -Identity $otherGroupDN -Members $userDN -Confirm:$false
                Log-Message "Removed $samAccountName from $($languageGroups[$lang])"
            }
        }
    }
    else {
        # If preferredLanguage is not set correctly, remove from all language groups
        Remove-FromAllLanguageGroups -UserDN $userDN
        Log-Message "Removed $samAccountName from all language groups due to undefined or unsupported preferredLanguage: $preferredLanguageFull"
    }
}

Log-Message "Language group update completed at $(Get-Date)"
```

## Setting Up the Scheduled Task

1. **Open Task Scheduler** on your AD server.
2. **Create a New Task** and give it a name like “User Language Group Update.”
3. **Set the Trigger** to run daily or weekly, depending on how frequently you need updates.
4. **Set the Action** to run `PowerShell.exe` with the argument pointing to your script’s location (e.g., `-File "C:\Scripts\Update-UserLanguageGroups.ps1"`).
5. **Configure the Task** to run with the highest privileges and to use a service account that has permissions to modify AD groups.

> **Note:** It is not recommended to run scheduled scripts as a domain administrator. Instead, create a dedicated non-admin user account and delegate Active Directory group management privileges to it, or utilize a Group Managed Service Account (gMSA). For more information, refer to [Delegate Control in Active Directory](https://woshub.com/delegate-control-active-directory/) and [Group Managed Service Accounts in Windows Server 2012](https://woshub.com/group-managed-service-accounts-in-windows-server-2012/).

## Testing and Validation

Before rolling this out, test it on a few user accounts to make sure everything is working as expected:

1. **Assign test values** to the `preferredLanguage` attribute for sample users.
2. **Run the script manually** and observe the output to verify users are being added to the correct groups.
3. **Check the Group Membership** of test users in AD to confirm changes.

Once you’re confident it’s working, schedule the task to automate the process!

## Conclusion

This PowerShell-based approach makes it easy to keep user language settings aligned with their preferences without manual intervention. It’s a set-it-and-forget-it solution that adapts as your organization grows and changes. Automating tasks like this is a great way to free up your time for more strategic IT initiatives.

Happy automating!

