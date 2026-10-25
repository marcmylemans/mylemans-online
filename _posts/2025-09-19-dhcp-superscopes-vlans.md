---
title: 'When a /24 Is Too Small: DHCP Congestion, Quick Relief with Superscopes, and the Real Fix (VLANs)'
description: We hit DHCP congestion on a flat /24. Here’s how we stabilized the network with temporary superscopes and a cleanup script—then redesigned with VLANs for the long term.
date: '2025-09-19'
categories: [Networking]
tags: [dhcp, windows server, networking, vlan, troubleshooting, powershell]
image: {path: /assets/img/posts/covers/dhcp-superscopes-vlans.jpg, alt: 'When a /24 Is Too Small: DHCP Congestion, Quick Relief with Superscopes, and the Real Fix (VLANs)'}
---

## TL;DR

A flat **/24** network for *everything* (servers, printers, switches, APs, clients, phones, IoT, cameras, …) finally ran out of steam.

**Immediate relief:** we added **two temporary /24 scopes** in a **superscope** on Windows Server DHCP and put an **extra alias** on the firewall LAN plus rules for inter-LAN and internet.  

**Long-term fix:** split the network into **VLANs** (Infra, Office, BYOD, Guest Wi-Fi). To keep the temporary scopes from choking during shift changes, we added an **auto-clean** script that removes only **BAD_ADDRESS/Declined** leases when utilization exceeds a threshold.

---

## The problem

The client was suffering from **network congestion** and **DHCP scope exhaustion** on a classic **255.255.255.0 (/24)**. With the company’s growth, a single flat LAN for **servers/printers/switches/accesspoints/clients/smartphones/IoT/cameras** is no longer realistic. The result was full scopes, BAD_ADDRESS entries and random connectivity issues.

---

## Immediate stabilization (same day)

1. **Windows Server DHCP superscope**  
   We created **two additional /24 scopes** and grouped them in a **superscope** to temporarily expand available addresses, these two ranges can later be re-used for VLANs.

2. **Firewall alias + rules**  
   We added an **extra alias IP** on the **LAN interface** and updated rules to:
   - allow **internet access** from the new subnets,
   - permit **LAN-to-LAN** access from the new subnets back to the original /24 (where needed).

This bought us breathing room without touching the existing DHCP reservations on the original subnet.

---

## The real solution: segmenting the network with VLANs

- **Infra VLAN** — switches & access points (frees a big chunk of the /24).
- **Office VLAN** — servers, printers, wired clients.
- **Wi-Fi (3 SSIDs)**  
  - **Office** → Office VLAN  
  - **BYOD** → separate VLAN  
  - **Guest** → internet-only VLAN

Because there’s a mix of printers, cameras, IoT, etc., we’ll first **analyze the network**, then **upgrade/configure** gear to be VLAN-aware (switches, Accesspoints, ...).

---

## Keeping the temporary scopes healthy

The workshift changes + long lease times can still congest the **temporary** scopes. As a safety net, we deploy an **automatic cleanup** that removes only **BAD_ADDRESS/Declined** leases when a scope goes above **80%** utilization. It leaves the **original scope** untouched to avoid impacting reservations.

### PowerShell: auto-clean BAD_ADDRESS/Declined leases

Save as `Clean-BadDhcpLeases.ps1` and run via a Scheduled Task (e.g., every 10 minutes).  
Replace the example scope IDs with your two temporary /24s (e.g., `10.10.10.0` and `10.10.20.0`).

```powershell
<#
.SYNOPSIS
  Cleans BAD_ADDRESS/Declined leases from Windows DHCP scopes.
.DESCRIPTION
  - Monitors selected scopes and, if utilization >= Threshold%, deletes BAD_ADDRESS/Declined leases.
  - Can also purge BAD_ADDRESS/Declined leases across all scopes immediately (-CleanAll).
.NOTES
  Requires: DHCPServer PowerShell module (on a DHCP role server or RSAT).
#>

[CmdletBinding(SupportsShouldProcess)]
param(
  # DHCP server to manage
  [string]$DhcpServer = 'localhost',

  # The scopes to auto-clean when utilization crosses the threshold (enter the 2 subnets you want to clean)
  [IPAddress[]]$ScopeIdsToAutoClean = @('10.10.10.0','10.10.20.0'),

  # Utilization trigger (percentage 0-100)
  [int]$Threshold = 80,

  # If set, immediately clean all BAD_ADDRESS/Declined leases on all scopes and exit
  [switch]$CleanAll,

  # Optional: log file
  [string]$LogPath = "$PSScriptRoot\DhcpBadAddressCleanup.log"
)

function Write-Log {
  param([string]$Msg,[string]$Level='INFO')
  $line = "{0} [{1}] {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Msg
  $line | Tee-Object -FilePath $LogPath -Append
}

function Assert-Module {
  if (-not (Get-Module -ListAvailable -Name DHCPServer)) {
    throw "DHCPServer module not found. Run on a DHCP server or install RSAT: DHCP Tools."
  }
  Import-Module DHCPServer -ErrorAction Stop
}

function Get-BadOrDeclinedLeases {
  param([IPAddress]$ScopeId)
  # Be defensive: match AddressState plus common BAD_ADDRESS indicators
  Get-DhcpServerv4Lease -ComputerName $DhcpServer -ScopeId $ScopeId -AllLeases |
    Where-Object {
      ($_.AddressState -match 'Bad|Declined') -or
      ($_.ClientId -eq 'BAD_ADDRESS')        -or
      ($_.HostName  -eq 'BAD_ADDRESS')
    }
}

function Remove-LeaseSafe {
  param([IPAddress]$ScopeId, [IPAddress]$IpAddress)
  if ($PSCmdlet.ShouldProcess("$IpAddress in $ScopeId","Remove BAD/Declined lease")) {
    try {
      Remove-DhcpServerv4Lease -ComputerName $DhcpServer -ScopeId $ScopeId -IPAddress $IpAddress -Confirm:$false -ErrorAction Stop
      Write-Log "Removed lease $IpAddress in scope $ScopeId."
    }
    catch {
      Write-Log "Failed to remove $IpAddress in $ScopeId. $_" 'WARN'
    }
  }
}

function Clean-ScopeBadAddresses {
  param([IPAddress]$ScopeId)
  $bad = Get-BadOrDeclinedLeases -ScopeId $ScopeId
  if (-not $bad) {
    Write-Log "No BAD/Declined leases in scope $ScopeId."
    return
  }
  foreach ($lease in $bad) {
    Remove-LeaseSafe -ScopeId $ScopeId -IpAddress $lease.IPAddress
  }
}

function Get-ScopeUtilization {
  param([IPAddress]$ScopeId)
  try {
    (Get-DhcpServerv4ScopeStatistics -ComputerName $DhcpServer -ScopeId $ScopeId).PercentageInUse
  } catch {
    Write-Log "Could not read utilization for $ScopeId. $_" 'WARN'
    $null
  }
}

# ------------------ MAIN ------------------
try {
  Assert-Module
  Write-Log "Starting DHCP BAD_ADDRESS cleanup on $DhcpServer."

  if ($CleanAll) {
    $scopes = Get-DhcpServerv4Scope -ComputerName $DhcpServer
    foreach ($s in $scopes) { Clean-ScopeBadAddresses -ScopeId $s.ScopeId.IPAddressToString }
    Write-Log "Completed global cleanup."
    return
  }

  foreach ($sid in $ScopeIdsToAutoClean) {
    $util = Get-ScopeUtilization -ScopeId $sid
    if ($util -eq $null) { continue }

    Write-Log ("Scope {0} utilization = {1}%%" -f $sid, [int]$util)
    if ($util -ge $Threshold) {
      Write-Log "Utilization >= $Threshold%% on $sid. Cleaning BAD/Declined leases…"
      Clean-ScopeBadAddresses -ScopeId $sid
    } else {
      Write-Log "Below threshold on $sid. No action."
    }
  }

  Write-Log "Run completed."
}
catch {
  Write-Log "Fatal error: $_" 'ERROR'
  throw
}
```

**What the script does (short):**
- Watches the **two temporary scopes**.  
- When a scope is **≥ 80%** utilized, it **removes only BAD_ADDRESS/Declined** leases in that scope.  
- `-CleanAll` optionally purges BAD/Declined across **all scopes** once.  
- It never touches the **original scope** unless you include it in `ScopeIdsToAutoClean`.

**Suggested schedule:**
Run every 10 minutes as a Scheduled Task:
```text
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "C:\Tools\Clean-BadDhcpLeases.ps1" -DhcpServer "DHCP-SERVER" -ScopeIdsToAutoClean 10.10.10.0,10.10.20.0 -Threshold 80
```

---

## Next steps
1. **Inventory & readiness**: confirm all switches/APs/firewall support VLANs.  
2. **Plan addressing**: per-VLAN CIDR, DHCP scopes, reservations, and options.  
3. **Migrate in waves**: move Infra first (switches/APs), then Office devices, then Wi-Fi SSIDs (Office/BYOD/Guest).  
4. **Tighten rules**: firewall inter-VLAN permissions (Office ↔ Infra, Guest → internet-only, BYOD limited).  
5. **Short leases during cutover** to reduce churn; return to normal after stabilization.

If you’re hitting similar symptoms on a flat /24, temporary superscopes can keep users working—**but VLANs are the real fix.**
