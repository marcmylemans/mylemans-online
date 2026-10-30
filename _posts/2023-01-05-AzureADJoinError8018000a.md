---
title: 'Fix Error 8018000a: This Device Is Already Enrolled'
description: 'Entra (Azure AD) join fails with 8018000a, device already enrolled: a PowerShell script removes the stale enrollment, then you delete the old device.'
date: '2023-01-05 08:00:00'
categories: [Entra ID & Intune]
tags: [windows, '10', '11', powershell, error, entra id]
image: {path: /assets/img/posts/covers/azureadjoinerror8018000a.jpg, alt: Azure AD join error code 8018000a – This device is already enrolled}
---

### Introduction:

If you ever encounter the Azure AD join error code 8018000a, it indicates that the device was previously joined to Azure AD. This situation can prevent you from rejoining the device to Azure AD without first clearing certain settings.

### Solution:

To resolve this error, you will need to remove the existing device registration from your system registry. Below is a PowerShell script that automates this process. Before proceeding, ensure you execute this script with administrative privileges and back up your registry to prevent any accidental data loss.

```powershell
##This script checks for devices registered to AzureAD and removes them so you can successfully perform an AzureAD join. 
# We recommend you backup your registry prior to running. We take no responisbility for the use of this script.

$sids = Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\EnterpriseResourceManager\Tracked' -name |where-object {$_.Length -gt 25}

Foreach ($sid in $sids){

Write-host "Found a registered device. Would you like to remove the device registration settings for SID: $($sid)?" -ForegroundColor Yellow 
    $Readhost = Read-Host " ( y / n ) " 
    Switch ($ReadHost) 
     { 
       Y {Write-host "Yes, Remove registered device"; $removedevice=$true} 
       N {Write-Host "No, do not remove device registration"; $removedevice=$false} 
       Default {Write-Host "Default, Do not remove device registration"; $removedevice=$false} 
     } 

if ($removedevice -eq $true) {

$enrollmentpath = "HKLM:\SOFTWARE\Microsoft\Enrollments\$($sid)"
$entresourcepath = "HKLM:\SOFTWARE\Microsoft\EnterpriseResourceManager\Tracked\$($sid)"

##Remove device from enrollments in registry

$value1 = Test-Path $enrollmentpath
If ($value1 -eq $true) {

write-host "$($sid) exists and will be removed"

Remove-Item -Path $enrollmentpath -Recurse -confirm:$false
Remove-Item -Path $entresourcepath -Recurse -confirm:$false

} 
Else {Write-Host "The value does not exist, skipping"}

##Cleanup scheduled tasks related to device enrollment and the folder for this SID

Get-ScheduledTask -TaskPath "\Microsoft\Windows\EnterpriseMgmt\$($sid)\*"| Unregister-ScheduledTask -Confirm:$false

$scheduleObject = New-Object -ComObject Schedule.Service
$scheduleObject.connect()
$rootFolder = $scheduleObject.GetFolder("\Microsoft\Windows\EnterpriseMgmt")
$rootFolder.DeleteFolder($sid,$null)

Write-Host "Device registration cleaned up for $($sid). If there is more than 1 device registration, we will continue to the next one."
pause

} else { Write-host "Removal has been cancelled for $($sid)"}

}

write-host "Cleanup of device registration has been completed. Ensure you delete the device registration in AzureAD and you can now join your device."

```

### After Running the Script:

After executing the script, make sure to manually delete the device registration from Azure AD to avoid any conflicts. This ensures that your device is fully ready for a new Azure AD join operation.

### Conclusion:

Following these steps should clear the error and allow you to proceed with joining your device to Azure AD. If the problem persists, consider consulting Azure support for further assistance.

