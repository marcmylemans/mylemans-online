---
title: Windows hello - Disable PIN
description: Disable the Windows Hello PIN requirement on Windows 10 and 11 with a PowerShell script that sets the PassportForWork key and deletes existing PIN data.
date: '2023-01-05 08:00:00'
categories: [Windows 11]
tags: [windows 10, windows 11, powershell, windows hello, windows hello for business, disable pin]
image: {path: /assets/img/posts/covers/windowshello-disablepin.jpg, alt: Windows hello - Disable PIN}
---

### Introduction:

Windows Hello enhances security by using biometric data or a PIN to access Windows 10 and Windows 11 devices. However, there might be scenarios where you need to disable the PIN requirement after it's been set up. This can be especially useful in environments where simpler or traditional login methods are preferred.

### Disabling the PIN Requirement:

To disable the Windows Hello PIN requirement, you need to edit specific registry settings and remove existing PIN configuration files. This operation requires administrative rights.

### Detailed Steps and Script Explanation:

1) **Open PowerShell as an Administrator:** To do this, type "PowerShell" in the Windows search bar, right-click on the PowerShell app, and select "Run as administrator."

2) **Run the PowerShell Commands:** Copy and paste the following script into the PowerShell window and press Enter.

```powershell
#Disable pin requirement
$path = "HKLM:\SOFTWARE\Policies\Microsoft"
$key = "PassportForWork"
$name = "Enabled"
$value = "0"
 
New-Item -Path $path -Name $key –Force
 
New-ItemProperty -Path $path\$key -Name $name -Value $value -PropertyType DWORD -Force
 
#Delete existing pins
$passportFolder = "C:\Windows\ServiceProfiles\LocalService\AppData\Local\Microsoft\Ngc"
 
if(Test-Path -Path $passportFolder)
{
Takeown /f $passportFolder /r /d "Y"
ICACLS $passportFolder /reset /T /C /L /Q
 
Remove-Item –path $passportFolder –recurse -force
}
```

### Explanation of the Script:

- **Registry Edit:** The script first checks if the registry path exists and sets a DWORD value which effectively disables the PIN requirement for Windows Hello.
- **Folder Removal:** It then checks if the folder containing the PIN data exists, takes ownership of it, resets its permissions, and finally deletes it to remove any existing PIN data.

### Conclusion:

After running this script, the PIN setup prompt should be disabled the next time you access or set up a user account on your Windows device. This action does not affect other Windows Hello authentication methods like facial recognition or fingerprint scanning, which can still be configured and used if supported by your hardware.

This approach is useful for administrators managing multiple machines or users preferring not to use PIN-based authentication due to policy or personal preference.

