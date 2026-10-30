<#
.SYNOPSIS
    Intune Win32 detection rule for the OpenVPN Connect import-URL config (App 2).

.DESCRIPTION
    Reads the marker tag written by Apply-OpenVPNConfig.ps1 and compares it to
    the URL you expect. Detection-script contract:
      - Match     -> write a line to STDOUT and exit 0  (detected)
      - No match  -> exit 1                              (re-push the config)
      - No tag    -> exit 1

    Because the comparison is on the applied URL, changing $expectedUrl here
    makes Intune see the old config as "not detected" and re-run App 2 with the
    new Cloud ID.

.NOTES
    Intune detection scripts can't take parameters, so set $expectedUrl below.
    KEEP IT IN SYNC with the -Url you pass on the App 2 install command line.
    App 2 runs in user context, so this detection runs as the user and
    %LOCALAPPDATA% resolves correctly. Leave "Run script as 32-bit process on
    64-bit clients" = No.
#>

# Must match the -Url passed to Apply-OpenVPNConfig.ps1 (normalisation is applied below).
$expectedUrl = 'https://yourID.openvpn.com'

# --- Normalise identically to the apply script ------------------------------
$expectedUrl = $expectedUrl.Trim().TrimEnd('/')
if ($expectedUrl -notmatch '^[a-zA-Z][a-zA-Z0-9+.-]*://') { $expectedUrl = "https://$expectedUrl" }

$tag = Join-Path $env:LOCALAPPDATA "OpenVPN Connect\ocfg-applied.tag"
if (-not (Test-Path $tag)) { exit 1 }

try {
    $actual = Get-Content -LiteralPath $tag -ErrorAction Stop | Select-Object -First 1
    if ($null -ne $actual) { $actual = $actual.Trim() }
}
catch {
    exit 1
}

# -eq is case-insensitive in PowerShell, which is what we want for hostnames.
if ($actual -eq $expectedUrl) {
    Write-Output "OpenVPN Connect import URL applied: $actual"
    exit 0
}

# Tag missing the expected value (or stale) -> re-push.
exit 1
