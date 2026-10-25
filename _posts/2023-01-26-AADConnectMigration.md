---
title: AAD Connect / Cloud Sync with Existing Cloud Users
description: 'Avoid duplicate users when linking an existing Office 365 tenant to AD Connect: scripts to match users, sync proxyAddresses and set ImmutableIDs.'
date: '2023-01-26 08:00:00'
categories: [Entra ID & Intune]
tags: [entra id, ad, sync, aad connect, cloud sync, powershell, tutorial]
image: {path: /assets/img/posts/covers/aadconnectmigration.jpg, alt: AAD Connect / Cloud Sync with Existing Cloud Users}
---

{% include google-adsense.html %}

# Tackling Duplicate Users in AAD Connect / Cloud Sync

Integrating your existing Active Directory with Azure AD using AD Connect or Cloud Sync can sometimes result in duplicate user entries. This video demonstrates how to link existing ImmutableIDs from Active Directory to Azure Directory users and ensure that all proxy addresses in Office 365 are present in Active Directory.

# Disclaimer for Script Usage

Please note that these scripts are provided for informational purposes and should be used with caution. Always test scripts in a non-production environment first, and ensure you have backups of your data. I am not responsible for any issues that may arise from the use of these scripts. Users should have an understanding of PowerShell and Active Directory operations before proceeding.

# Prerequisites

The following PowerShell command will install the Powershell Azure AD Module.

```powershell
Install-Module AzureAD
```

### Step 1: Exporting User Data from Office 365

The following PowerShell script will export all user data from Office 365, which serves as both an information source and a backup.
The script will exclude Guest and Contact users.

```powershell
# Define the Temp folder path
$FolderName = "C:\Temp"

# Check if the folder exists and create it if it doesn't
if (-not (Test-Path -Path $FolderName)) {
    Write-Host "Folder Doesn't Exist. Creating folder..."
    New-Item -Path $FolderName -ItemType Directory
} else {
    Write-Host "Folder Exists"
    Get-ChildItem -Path $FolderName | Where-Object {$_.CreationTime -gt (Get-Date).Date}
}

# Connect to Azure AD
Connect-AzureAD

# Initialize an array to store user reports
$reportoutput = @()

# Get all Azure AD users
$users = Get-AzureADUser -All $true

# Process each user
$users | ForEach-Object {
    # Filter out external users or contacts
    if ($_.UserType -ne 'Guest' -and $_.UserType -ne 'Contact') {
        $SMTP_Addresses = $_.ProxyAddresses -join ";"
        
        # Get license details for the user
        $licenses = Get-AzureADUserLicenseDetail -ObjectId $_.ObjectId
        $licenseNames = $licenses.SkuPartNumber -join ";"
        
        $reportoutput += [PSCustomObject]@{
            UserPrincipalName = $_.UserPrincipalName
            SamAccountName = $_.SamAccountName
            ImmutableID = $_.ImmutableID
            DisplayName = $_.DisplayName
            ProxyAddresses = $SMTP_Addresses
            Licenses = $licenseNames
        }
    }
}

# Export the user reports to a CSV file
$reportoutput | Export-Csv -Path "$FolderName\Users_AAD.csv" -NoTypeInformation -Encoding UTF8

Write-Host "Export completed. The report is saved at $FolderName\Users_AAD.csv"


```

### Step 2: Exporting Data from Active Directory

This script performs a similar export from Active Directory.

```powershell
#Check for Existing c:\Temp folder and if needed create the c:\Temp folder
$FolderName = "C:\Temp"

if([System.IO.Directory]::Exists($FolderName))
{
    Write-Host "Folder Exists"
    Get-ChildItem -Path $FolderName | Where-Object {$_.CreationTime -gt (Get-Date).Date}   
}
else
{
    Write-Host "Folder Doesn't Exists"
    
    #PowerShell Create directory if not exists
    New-Item $FolderName -ItemType Directory
}


$reportoutput=@()
$users = Get-ADUser -Filter * -Properties *
$users | Foreach-Object {
 
    $user = $_
    $objectid = $user.ObjectGUID
    $immutableid = [Convert]::ToBase64String([guid]::New($objectid).ToByteArray())

    $SMTP_Addresses = $user.ProxyAddresses
    $SMTP_List = $SMTP_Addresses -join ";" 

    $report = New-Object -TypeName PSObject
    $report | Add-Member -MemberType NoteProperty -Name 'UserPrincipalName' -Value $user.UserPrincipalName
    $report | Add-Member -MemberType NoteProperty -Name 'SamAccountName' -Value $user.samaccountname
    $report | Add-Member -MemberType NoteProperty -Name 'ImmutableID' -Value $immutableid
    $report | Add-Member -MemberType NoteProperty -Name 'ProxyAddresses' -Value $SMTP_List
    $reportoutput += $report
}
 # Report
$reportoutput | Export-Csv -Path c:\temp\Users_AD.csv -NoTypeInformation -Encoding UTF8

```

### Step 3: Comparing Data Between AD and AAD

To compare and identify differences, we will be using 2 scripts:

#### Prepare AD Update List:

Compare Azure AD users (AADUsers) against AD users (ADUserHash):

- If a match is found, add the user details to the update list with Skip_Import set to "No".
- If no match is found, add the user details to the update list with Skip_Import set to "Yes".

This script will generate two files:

- AD_Update_List.csv: Contains users that need to be updated in AD, with a Skip_Import column indicating if they should be skipped because they don't match between AD and AAD. Verify the Skip_Import "Yes" users and manually correct the UPN if needed in AD and run the script again.
- Unmatched_AD_Users.csv: Contains users from AD that do not have a match in Azure AD, marked with Skip_Import as "Yes". These users will be newly created if synced to AAD, adjust the UPN if needed.


```powershell
# Load CSV files
$AADUsers = Import-Csv -Path C:\Temp\Users_AAD.csv
$ADUsers = Import-Csv -Path C:\Temp\Users_AD.csv

# Create hash tables for quick lookup
$AADUserHash = @{}
$ADUserHash = @{}

$AADUsers | ForEach-Object {
    $AADUserHash[$_.UserPrincipalName] = $_
}

$ADUsers | ForEach-Object {
    $ADUserHash[$_.UserPrincipalName] = $_
}

# Prepare list for AD updates and unmatched AD users
$ADUpdateList = @()
$UnmatchedADUsers = @()

# Compare AAD users against AD users
$AADUsers | ForEach-Object {
    $AADUser = $_
    if ($ADUserHash.ContainsKey($AADUser.UserPrincipalName)) {
        $ADUser = $ADUserHash[$AADUser.UserPrincipalName]
        $ADUpdateList += [PSCustomObject]@{
            UserPrincipalName = $AADUser.UserPrincipalName
            SamAccountName = $ADUser.SamAccountName
            ImmutableID = $ADUser.ImmutableID  # Ensure ImmutableID from AD is captured here
            DisplayName = $AADUser.DisplayName
            ProxyAddresses = $AADUser.ProxyAddresses
            Licenses = $AADUser.Licenses
            Skip_Import = "No"
        }
    } else {
        $ADUpdateList += [PSCustomObject]@{
            UserPrincipalName = $AADUser.UserPrincipalName
            SamAccountName = $AADUser.SamAccountName
            ImmutableID = $AADUser.ImmutableID
            DisplayName = $AADUser.DisplayName
            ProxyAddresses = $AADUser.ProxyAddresses
            Licenses = $AADUser.Licenses
            Skip_Import = "Yes"
        }
    }
}

# Identify unmatched AD users
$ADUsers | ForEach-Object {
    if (-not $AADUserHash.ContainsKey($_.UserPrincipalName)) {
        $UnmatchedADUsers += $_
    }
}

# Export the AD update list to a CSV file
$ADUpdateList | Export-Csv -Path C:\Temp\AD_Update_List.csv -NoTypeInformation -Encoding UTF8

# Export the unmatched AD users to a CSV file
$UnmatchedADUsers | ForEach-Object {
    $_ | Add-Member -MemberType NoteProperty -Name Skip_Import -Value "Yes" -Force
}
$UnmatchedADUsers | Export-Csv -Path C:\Temp\Unmatched_AD_Users.csv -NoTypeInformation -Encoding UTF8

Write-Host "Export completed. The AD update list is saved at C:\Temp\AD_Update_List.csv"
Write-Host "The unmatched AD users are saved at C:\Temp\Unmatched_AD_Users.csv"
```


#### Create the AAD Update List
Now, create a script to filter out users with Skip_Import set to "No" and prepare the AAD_Update_List.csv including the SamAccountName:
This approach ensures that only the users who need to be updated are included in the AAD_Update_List.csv and subsequently updated in Azure AD.

```powershell
# Load AD Update List
$ADUpdateList = Import-Csv -Path C:\Temp\AD_Update_List.csv

# Filter users who should be imported (Skip_Import is "No")
$AADUpdateList = $ADUpdateList | Where-Object { $_.Skip_Import -eq "No" } | ForEach-Object {
    [PSCustomObject]@{
        UserPrincipalName = $_.UserPrincipalName
        ImmutableID = $_.ImmutableID
        SamAccountName = $_.SamAccountName
    }
}

# Export the AAD update list to a CSV file
$AADUpdateList | Export-Csv -Path C:\Temp\AAD_Update_List.csv -NoTypeInformation -Encoding UTF8

Write-Host "Export completed. The AAD update list is saved at C:\Temp\AAD_Update_List.csv"
```

### Step 4: Importing Proxy Addresses into Active Directory

It's crucial that Active Directory's data reflects all proxyAddresses in AAD. Use the following script to import these addresses:

```powershell
# Load the AD Update List with Skip Information
$ADUpdateList = Import-Csv -Path C:\Temp\AD_Update_List.csv

# Import the Active Directory module
Import-Module ActiveDirectory

# Iterate through the list and update AD users
$ADUpdateList | ForEach-Object {
    if ($_.Skip_Import -eq "No") {
        # Get the AD user
        $ADUser = Get-ADUser $_.SamAccountName -Properties ProxyAddresses
        
        if ($ADUser) {
            # Update the AD user's ProxyAddresses
            Set-ADUser -Identity $ADUser -Replace @{
                ProxyAddresses = $_.ProxyAddresses -split ";"
            }

            Write-Host "Updated ProxyAddresses for AD user: $($_.UserPrincipalName)"
        } else {
            Write-Host "AD user not found: $($_.UserPrincipalName)"
        }
    } else {
        Write-Host "Skipping import for user: $($_.UserPrincipalName)"
    }
}

Write-Host "AD update process for ProxyAddresses completed."
```

### Step 5: Creating a Hard Link Between AD and AAD Users

Finally, this script will write the ObjectID from Active Directory to the corresponding user in Azure Directory.

```powershell
# Connect to Azure AD
Connect-AzureAD

# Load AAD Update List
$AADUpdateList = Import-Csv -Path C:\Temp\AAD_Update_List.csv

# Update ImmutableID for each user in Azure AD
$AADUpdateList | ForEach-Object {
    $user = Get-AzureADUser -Filter "UserPrincipalName eq '$($_.UserPrincipalName)'"
    if ($user) {
        Set-AzureADUser -ObjectId $user.ObjectId -ImmutableId $_.ImmutableID
        Write-Host "Updated ImmutableID for user: $($_.UserPrincipalName)"
    } else {
        Write-Host "User not found in Azure AD: $($_.UserPrincipalName)"
    }
}

Write-Host "Azure AD update completed."
```

Rename C:\Temp\Users_AAD.csv C:\Temp\Users_AAD.old and re run the script from Step 1: Exporting User Data from Office 365

Next you can run the following script to compare the Hard Link between AAD and AD.

```powershell
# Load the CSV files
$AADUsers = Import-Csv -Path C:\Temp\Users_AAD.csv
$ADUsers = Import-Csv -Path C:\Temp\Users_AD.csv

# Create hash tables for quick lookup
$AADUserHash = @{}
$ADUserHash = @{}

$AADUsers | ForEach-Object {
    $AADUserHash[$_.UserPrincipalName] = $_
}

$ADUsers | ForEach-Object {
    $ADUserHash[$_.UserPrincipalName] = $_
}

# Prepare list for comparison results
$ComparisonResults = @()

# Compare AD users against Azure AD users
$ADUsers | ForEach-Object {
    $ADUser = $_
    if ($AADUserHash.ContainsKey($ADUser.UserPrincipalName)) {
        $AADUser = $AADUserHash[$ADUser.UserPrincipalName]
        $ComparisonResults += [PSCustomObject]@{
            UserPrincipalName = $ADUser.UserPrincipalName
            AD_ImmutableID = $ADUser.ImmutableID
            AAD_ImmutableID = $AADUser.ImmutableID
            Match = if ($ADUser.ImmutableID -eq $AADUser.ImmutableID) { "Yes" } else { "No" }
        }
    } else {
        $ComparisonResults += [PSCustomObject]@{
            UserPrincipalName = $ADUser.UserPrincipalName
            AD_ImmutableID = $ADUser.ImmutableID
            AAD_ImmutableID = "Not Found"
            Match = "No"
        }
    }
}

# Export the comparison results to a CSV file
$ComparisonResults | Export-Csv -Path C:\Temp\ImmutableID_Comparison.csv -NoTypeInformation -Encoding UTF8

Write-Host "Comparison completed. The results are saved at C:\Temp\ImmutableID_Comparison.csv"
```


# Closing Thoughts

Successfully merging existing Azure/Office 365 tenant users with your Active Directory environment requires careful planning and execution. This tutorial is designed to guide you through this process, helping you avoid the common pitfall of duplicate user entries.

Your experiences, insights, or any questions about this process are invaluable. Please share them in the comments below. Your input helps us all learn and grow in our understanding of Azure AD and Active Directory integrations.

Stay tuned for more informative guides and tutorials!
