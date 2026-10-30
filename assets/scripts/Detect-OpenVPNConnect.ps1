<#
.SYNOPSIS
    Intune Win32 detection rule for the OpenVPN Connect installation.

.DESCRIPTION
    Detects whether OpenVPN Connect is installed and, optionally, at or above a
    minimum version. Follows the Intune detection-script contract:
      - Detected     -> write a line to STDOUT and exit 0
      - Not detected -> exit 1 (no STDOUT)

    Use as a custom detection script on App 1 (the MSI). Leave
    "Run this script using the logged-on credentials" = No and
    "Run script as 32-bit process on 64-bit clients" = No, so the 64-bit
    Program Files path resolves without WOW64 redirection.

.NOTES
    Detection scripts can't take parameters in Intune, so the minimum version
    is a constant below. Edit it if you require a newer build.
#>

# CLI support landed in 3.3; raise this if you depend on a newer feature level.
$minVersion = [version]'3.3.0'

$paths = @(
    "$env:SystemDrive\Program Files\OpenVPN Connect\OpenVPNConnect.exe",
    "$env:SystemDrive\Program Files (x86)\OpenVPN Connect\OpenVPNConnect.exe"
)

$exe = $paths | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $exe) { exit 1 }

try {
    $raw = (Get-Item $exe).VersionInfo.ProductVersion
    # ProductVersion may carry extra build text; keep the leading x.y.z[.b]
    $verText = ([regex]::Match($raw, '\d+(\.\d+){1,3}')).Value
    $version = [version]$verText
}
catch {
    # Binary present but version unreadable: treat presence as detected.
    Write-Output "OpenVPN Connect detected at $exe (version unknown)"
    exit 0
}

if ($version -ge $minVersion) {
    Write-Output "OpenVPN Connect $version detected at $exe"
    exit 0
}

# Installed but below the required version -> let Intune (re)install.
exit 1
