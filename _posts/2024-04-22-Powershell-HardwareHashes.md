---
title: 'Efficient Intune Autopilot Setup: PowerShell Automation for Hardware Hashes and Device Management!'
description: PowerShell scripts that unzip MDMDiagReport.zip exports from Windows 11 devices, merge the Autopilot hardware hashes into one CSV and log serial numbers.
date: '2024-04-22 08:00:00'
categories: [Scripts]
tags: [scripts, powershell, intune, autopilot, hardware hashes, device management, automation, windows11, intunewinapputil, mdm]
image: {path: /assets/img/posts/covers/powershell-hardwarehashes.jpg, alt: 'Efficient Intune Autopilot Setup: PowerShell Automation for Hardware Hashes and Device Management!'}
---

## Simplifying Intune Autopilot Setup with PowerShell

In modern IT environments, efficient device management is paramount. Microsoft Intune, a cloud-based service, offers robust tools for managing devices, applications, and security policies. One of its standout features is Autopilot, which streamlines device provisioning and enrollment.

When deploying Windows 11 devices with Autopilot, importing hardware hashes is a crucial step. Hardware hashes uniquely identify devices and facilitate enrollment into Intune during Autopilot setup. However, managing multiple hardware hashes can be cumbersome, especially when dealing with numerous devices.

Thankfully, PowerShell scripts can significantly simplify this process. Below, we'll discuss how two PowerShell scripts can streamline the import of hardware hashes extracted from Windows 11 devices into Microsoft Intune.

### Prerequisite: Understanding Hardware Hash Export from Windows Devices

Before diving into the automation process with PowerShell scripts, it's essential to familiarize yourself with the process of exporting hardware hashes from Windows devices using the Diagnostics page in Autopilot. Microsoft provides detailed guidance on this topic in their documentation, which you can access [here](https://learn.microsoft.com/en-us/autopilot/add-devices#diagnostics-page-hash-export).
> During OOBE, press Ctrl-Shift-D to bring up the Diagnostics Page. From this page, you can export logs to a thumb drive. The logs include a CSV file with the hardware hash.
{: .prompt-tip }

This guide outlines the steps to export hardware hashes from individual Windows devices using the Diagnostics page in Autopilot. Familiarizing yourself with this process will provide valuable context for leveraging PowerShell automation to streamline the import of hardware hashes into Microsoft Intune for Autopilot setup.


### Extracting Hardware Hashes from MDMDiagReport.zip Files

Windows 11 devices generate MDMDiagReport.zip files, which contain valuable hardware information, including the hardware hash. However, manually extracting and managing these hashes from multiple devices can be time-consuming.

Our first PowerShell script automates this process. By traversing through folders containing MDMDiagReport.zip files, the script extracts the hardware hash from each file, facilitating easy access to essential device information.


```powershell
# Set the path to the root folder where you want to start searching
$rootFolder = "C:\Path\To\Root\Folder"

# Recursively search for zip files in all subfolders of the root folder
$zipFiles = Get-ChildItem -Path $rootFolder -Filter "*.zip" -Recurse

# Loop through each zip file found
foreach ($zipFile in $zipFiles) {
    # Get the folder path where the zip file is located
    $extractPath = $zipFile.DirectoryName
    
    # Extract the contents of the zip file to the same folder
    Expand-Archive -Path $zipFile.FullName -DestinationPath $extractPath -Force
}


```

### Consolidating Hardware Hashes and Creating a Log
Once we have extracted hardware hashes from MDMDiagReport.zip files, managing them becomes more manageable with our second PowerShell script. This script consolidates all hardware hashes into a single CSV file while also creating a log file for reference.

```powershell
# Set the path to the root folder where you want to start searching
$rootFolder = "C:\Path\To\Root\Folder"

# Set the output file paths
$outputCSV = "C:\Path\To\Output\consolidated.csv"


# Recursively search for CSV files in all subfolders of the root folder
$csvFiles = Get-ChildItem -Path $rootFolder -Filter "*.csv" -Recurse

# Loop through each CSV file found
foreach ($csvFile in $csvFiles) {
    # Get the folder name containing the CSV file
    $folderName = $csvFile.Directory.Name
    
    # Read the content of the CSV file
    $csvContent = Get-Content -Path $csvFile.FullName -Raw
    
}


# Combine all CSV files into one file
Get-ChildItem -Path $rootFolder -Filter "*.csv" -Recurse | 
    ForEach-Object { Import-Csv $_.FullName | Export-Csv -Append -Path $outputCSV -NoTypeInformation }

```

### Simplified Import into Intune
With our PowerShell scripts, importing hardware hashes and serial numbers into Microsoft Intune becomes a breeze. Administrators can effortlessly gather hardware information and device identifiers from Windows 11 devices, consolidate them into structured formats, and import them into Intune for Autopilot setup.

By automating these tasks, IT teams can save time, reduce errors, and ensure a smoother deployment experience for Windows 11 devices with Microsoft Intune and Autopilot.

In conclusion, PowerShell scripts offer a powerful solution for managing hardware hashes, PC names, and serial numbers, and simplifying Intune Autopilot setup. By leveraging automation, IT administrators can streamline device provisioning processes and enhance overall efficiency in modern workplace management.

If you store each MDMDiagReport.zip file in individual folders named after the computer names, you can employ the subsequent script to compile a list featuring all the computer names alongside their corresponding serial numbers. This list can then be utilized for manual adjustments of the computer names within Autopilot. Alternatively, you can follow this guide for assistance: [Bulk Autopilot Device Renaming](https://niklastinner.medium.com/bulk-autopilot-device-renaming-656ba517d94b).

Below is the script for your reference:

```powershell
# Set the path to the root folder where you want to start searching
$rootFolder = "C:\Path\To\Root\Folder"

# Set the output file path for the log file
$logFile = "C:\Path\To\Output\log.txt"

# Initialize an empty string to store log file content
$logContent = ""

# Recursively search for CSV files in all subfolders of the root folder
$csvFiles = Get-ChildItem -Path $rootFolder -Filter "*.csv" -Recurse

# Loop through each CSV file found
foreach ($csvFile in $csvFiles) {
    # Get the folder name containing the CSV file
    $folderName = $csvFile.Directory.Name
    
    # Append folder name to log content
    $logContent += "$folderName, "
    
    # Read the content of the CSV file, excluding the header
    $csvContent = Get-Content -Path $csvFile.FullName | Select-Object -Skip 1
    
    # Get the first column from CSV content
    $firstColumn = $csvContent.Split(',')[0]
    
    # Append first column to log content
    $logContent += "$firstColumn`r`n"
}

# Write log content to log file
$logContent | Out-File -FilePath $logFile -Encoding utf8

```
