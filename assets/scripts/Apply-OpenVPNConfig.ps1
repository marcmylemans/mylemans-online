<#
.SYNOPSIS
    Pre-populates the OpenVPN Connect "Import from URL" field (e.g. a
    CloudConnexa Cloud ID) by generating and applying a global config (.ocfg).

.DESCRIPTION
    Builds an OpenVPN Connect global configuration from the supplied URL,
    accepts the GDPR consent so the CLI becomes usable, then applies the config
    in the current user's context. Intended to run AS THE LOGGED-IN USER, for
    example as an Intune Win32 app with install behaviour set to "User", after
    the OpenVPN Connect MSI has been installed machine-wide (SYSTEM).

.PARAMETER Url
    Server URL or Cloud ID to pre-fill. Accepts either "yourID.openvpn.com" or
    "https://yourID.openvpn.com" (the scheme is added if you leave it off).

.PARAMETER Settings
    Optional hashtable of extra OpenVPN Connect app settings to bake in, e.g.
    @{ "vpn-protocol" = "adaptive"; "launch-options" = "connect-latest" }.

.PARAMETER LaunchWaitSeconds
    Seconds to wait for the app to start and accept GDPR before importing.
    Default 8. Bump it on slow or VM-based fleets.

.PARAMETER CloseWhenDone
    Quit OpenVPN Connect after a successful import. The config is already
    persisted, so this closes the "successfully applied" dialog along with it.
    Use this for silent/Intune runs where no popup should be seen.

.EXAMPLE
    .\Apply-OpenVPNConfig.ps1 -Url https://yourID.openvpn.com

.EXAMPLE
    .\Apply-OpenVPNConfig.ps1 -Url https://yourID.openvpn.com -CloseWhenDone

.EXAMPLE
    .\Apply-OpenVPNConfig.ps1 -Url acme.openvpn.com -Settings @{ theme = "dark"; "vpn-protocol" = "udp" }
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [string]$Url,

    [hashtable]$Settings,

    [int]$LaunchWaitSeconds = 8,

    [switch]$CloseWhenDone
)

$ErrorActionPreference = 'Stop'

# --- Normalise the URL -------------------------------------------------------
$Url = $Url.Trim().TrimEnd('/')
if ($Url -notmatch '^[a-zA-Z][a-zA-Z0-9+.-]*://') { $Url = "https://$Url" }

# --- Locate the OpenVPN Connect binary --------------------------------------
$connect = @(
    "$env:ProgramFiles\OpenVPN Connect\OpenVPNConnect.exe",
    "${env:ProgramFiles(x86)}\OpenVPN Connect\OpenVPNConnect.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $connect) {
    throw "OpenVPN Connect not found. Install the MSI before running this script."
}

# --- Build the .ocfg (JSON generation handles escaping for us) --------------
$config = [ordered]@{ "import-url" = $Url }
if ($Settings) { $config["settings"] = $Settings }

$json     = $config | ConvertTo-Json -Depth 5
$ocfgPath = Join-Path $env:TEMP ("openvpn-connect-{0}.ocfg" -f ([guid]::NewGuid().ToString('N')))

# UTF-8 with NO BOM. A leading BOM trips the config parser.
[System.IO.File]::WriteAllText($ocfgPath, $json, (New-Object System.Text.UTF8Encoding $false))

try {
    # Accept GDPR + skip first-run dialogs, launch hidden so the CLI is accepted
    Start-Process -FilePath $connect `
        -ArgumentList '--accept-gdpr', '--skip-startup-dialogs', '--minimize' `
        -WindowStyle Hidden
    Start-Sleep -Seconds $LaunchWaitSeconds

    # Apply the config (this is what pre-fills the import URL)
    $output = & $connect "--import-config=$ocfgPath" 2>&1 | Out-String
    Write-Verbose $output

    if ($output -notmatch '"status"\s*:\s*"success"') {
        throw "Config import did not report success. Output: $output"
    }

    # The app shows an informational "successfully applied" dialog. The config
    # is already persisted by this point, so quitting closes the dialog with it.
    if ($CloseWhenDone) {
        Start-Sleep -Seconds 2
        & $connect '--quit' 2>&1 | Out-Null
    }
}
finally {
    Remove-Item $ocfgPath -ErrorAction SilentlyContinue
}

# --- Marker for Intune detection (stores the URL so you can re-detect) -------
$tagDir = Join-Path $env:LOCALAPPDATA "OpenVPN Connect"
New-Item -Path $tagDir -ItemType Directory -Force | Out-Null
Set-Content -Path (Join-Path $tagDir "ocfg-applied.tag") -Value $Url -Encoding UTF8

Write-Output "Applied import URL: $Url"
