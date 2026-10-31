---
title: Server 2022 - Hyper-V - Virtual Machine Templates
description: 'Build a sysprepped VM template in Hyper-V on Server 2022 and deploy VMs from it with the included PowerShell script: CPU, RAM, VLAN and disks.'
date: '2022-12-18 08:00:00'
categories: [Windows Server]
tags: [server 2022, hyper-v, virtualization, vm templates, windows server, tutorial]
image: {path: /assets/img/posts/14-tJsdW7LU.jpg, alt: Server 2022 - Hyper-V - Virtual Machine Templates}
---

Welcome to a crucial part of managing and optimizing your virtual environment using Hyper-V on Windows Server 2022. In this video, we are going to delve into the process of creating a virtual machine template. This is a key step in maximizing efficiency and scalability in your virtualization strategy.

A virtual machine template is essentially a master copy of a virtual machine that can be used repeatedly to create new instances. This ensures that each VM is configured consistently, with the same set of files, settings, and software. This process not only saves time but also greatly reduces the possibility of human error during the VM creation process.

{% youtube "https://youtu.be/14-tJsdW7LU" %}

### Why Use VM Templates?

1. **Speed and Efficiency**: Deploy new virtual machines within minutes, not hours, keeping your environment agile and responsive.
2. **Consistency and Standardization**: Ensure that each VM is set up with the exact same configuration, which is crucial for testing environments and load balancing.
3. **Ease of Management**: With templates, you can manage your base image in one place, ensuring that updates or changes are uniformly implemented.

In the video, I will walk you through the step-by-step process of creating a VM template in Windows Server 2022's Hyper-V. We'll cover everything from selecting the right base image to configuring the VM settings for optimal use.

### The Script for Automation

To further streamline this process, I've included a PowerShell script that automates the creation and configuration of VMs from the template. This script allows for the specification of various parameters like the number of CPUs, amount of RAM, and network settings, making it highly customizable to your needs.

### Disclaimer for Script Usage

**Please read the following disclaimer carefully before proceeding with the script implementation:**

Please note that the script provided in this blog post is intended for educational and professional use only. Before implementing the script, consider the following:

Compatibility and Environment: Ensure that the script is compatible with your system's configuration and Windows Server version. The script is designed for Windows Server 2022 and Hyper-V environments.

Modification and Testing: You may need to modify the script to suit your specific environment or requirements. It is strongly recommended to test the script in a non-production environment before deploying it in a live setting.

Data and System Integrity: While every effort has been made to ensure the reliability of the script, I am not responsible for any data loss or system disruptions that may occur from its use. Always back up your data and configuration settings before running any new scripts.

Expertise Required: The implementation of this script should be conducted by individuals with an understanding of Windows Server administration, Hyper-V, and PowerShell scripting.

Support and Updates: This script is provided 'as is', without warranty of any kind. As such, there is no ongoing support or guarantee of future updates.

By using this script, you acknowledge and accept the risks associated with its deployment and agree to do so at your own discretion and liability.

Here's the script:

```powershell
######################################################
###              Template Definition               ###
######################################################

# Sysprep VHD path (The VHD will be copied to the VM folder)
$SysVHDPath = "C:\Path\To\Your\Template\vTemplateServer2022.vhdx"

$_Customer = Read-host('Wich Customer?')
$_VM_Role = Read-host('Give the VM a Role. Ex. DC = Domain Controller, TS = Terminal Server, DB/SQL = Database/SQL Server')
$_TotalVMS = Read-Host('Total number of this vm Ex. 1, 2, srv-dc-01 - srv-dc-02')
$_CPU_Cores = Read-Host('How many Cores to assign? Ex. 2, 4, 6,...')
[int64]$_RAM = 1GB*(Read-Host "How many RAM to assign? Ex. 4, 6, 8,...")
$_VlanID =  Read-Host('Wich Vlan to Assign? Ex. 002')

$VMName          = "v" + $_VlanID +"-" + $_Customer +"-" + $_VM_Role + $_

ECHO Creating New VM:

1..$_TotalVMS | % {

# VM Name
$VMName          = "v" + $_VlanID +"-" + $_Customer +"-" + $_VM_Role + $_
# Automatic Start Action (Nothing = 0, Start =1, StartifRunning = 2)
$AutoStartAction = 2
# In second
$AutoStartDelay  = 30
# Automatic Start Action (TurnOff = 0, Save =1, Shutdown = 2)
$AutoStopAction  = 2

###### Hardware Configuration ######
# VM Path
$VMPath         = "C:\Path\To\Your\Virtual Machines"
$VHDPath     = "C:\Path\To\Your\Virtual Hard Disks"

# VM Generation (1 or 2)
$Gen            = 2

# Processor Number
$ProcessorCount = $_CPU_Cores

## Memory (Static = 0 or Dynamic = 1)
$Memory         = 1
# StaticMemory
$StaticMemory   = $_RAM

# DynamicMemory
$StartupMemory  = $_RAM
$MinMemory      = $_RAM
$MaxMemory      = $_RAM

# Rename the VHD copied in VM folder to:
$OsDiskName     = $VMName + "-C"

### Additional virtual drives
#$ExtraDrive  = @()
# Drive 1
#$Drive       = New-Object System.Object
#$Drive       | Add-Member -MemberType NoteProperty -Name Name -Value Data
#$Drive       | Add-Member -MemberType NoteProperty -Name Path -Value $($VHDPath + "\" + $VMName)
#$Drive       | Add-Member -MemberType NoteProperty -Name Size -Value 10GB
#$Drive       | Add-Member -MemberType NoteProperty -Name Type -Value Dynamic
#$ExtraDrive += $Drive

# Drive 2
#$Drive       = New-Object System.Object
#$Drive       | Add-Member -MemberType NoteProperty -Name Name -Value Bin
#$Drive       | Add-Member -MemberType NoteProperty -Name Path -Value $($VHDPath + "\" + $VMName)
#$Drive       | Add-Member -MemberType NoteProperty -Name Size -Value 20GB
#$Drive       | Add-Member -MemberType NoteProperty -Name Type -Value Fixed
#$ExtraDrive += $Drive
# You can copy/delete this below block as you wish to create (or not) and attach several VHDX

### Network Adapters
# Primary Network interface: VMSwitch 
$VMSwitchName = "vSwitch_LAN"
$VlanId       = $_VlanID
$VMQ          = $False
$IPSecOffload = $False
$SRIOV        = $False
$MacSpoofing  = $False
$DHCPGuard    = $False
$RouterGuard  = $False
$NicTeaming   = $False

## Additional NICs
$NICs  = @()

# NIC 1
#$NIC   = New-Object System.Object
#$NIC   | Add-Member -MemberType NoteProperty -Name VMSwitch -Value "vSwitch"
#$NIC   | Add-Member -MemberType NoteProperty -Name VLAN -Value 20
#$NIC   | Add-Member -MemberType NoteProperty -Name VMQ -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name IPsecOffload -Value $True
#$NIC   | Add-Member -MemberType NoteProperty -Name SRIOV -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name MacSpoofing -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name DHCPGuard -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name RouterGuard -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name NICTeaming -Value $False
#$NICs += $NIC

#NIC 2
#$NIC   = New-Object System.Object
#$NIC   | Add-Member -MemberType NoteProperty -Name VMSwitch -Value "LS_VMWorkload"
#$NIC   | Add-Member -MemberType NoteProperty -Name VLAN -Value 20
#$NIC   | Add-Member -MemberType NoteProperty -Name VMQ -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name IPsecOffload -Value $True
#$NIC   | Add-Member -MemberType NoteProperty -Name SRIOV -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name MacSpoofing -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name DHCPGuard -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name RouterGuard -Value $False
#$NIC   | Add-Member -MemberType NoteProperty -Name NICTeaming -Value $False
#$NICs += $NIC
# You can copy/delete the above block and set it for additional NIC

######################################################
###           VM Creation and Configuration        ###
######################################################

## Creation of the VM
# Creation without VHD and with a default memory value (will be changed after)
New-VM -Name $VMName `
       -Path $VMPath `
       -NoVHD `
       -Generation $Gen `
       -Version 9.0 `
       -MemoryStartupBytes 1GB `
       -SwitchName $VMSwitchName

if ($AutoStartAction -eq 0){$StartAction = "Nothing"}
Elseif ($AutoStartAction -eq 1){$StartAction = "Start"}
Else{$StartAction = "StartIfRunning"}

if ($AutoStopAction -eq 0){$StopAction = "TurnOff"}
Elseif ($AutoStopAction -eq 1){$StopAction = "Save"}
Else{$StopAction = "Shutdown"}

## Changing the number of processor and the memory
# If Static Memory
if (!$Memory){
    
    Set-VM -Name $VMName `
           -ProcessorCount $ProcessorCount `
           -StaticMemory `
           -MemoryStartupBytes $StaticMemory `
           -AutomaticStartAction $StartAction `
           -AutomaticStartDelay $AutoStartDelay `
           -AutomaticStopAction $StopAction

}
# If Dynamic Memory
Else{
    Set-VM -Name $VMName `
           -ProcessorCount $ProcessorCount `
           -DynamicMemory `
           -MemoryMinimumBytes $MinMemory `
           -MemoryStartupBytes $StartupMemory `
           -MemoryMaximumBytes $MaxMemory `
           -AutomaticStartAction $StartAction `
           -AutomaticStartDelay $AutoStartDelay `
           -AutomaticStopAction $StopAction

}

## Set the primary network adapters
$PrimaryNetAdapter = Get-VM $VMName | Get-VMNetworkAdapter
if ($VlanId -gt 0){$PrimaryNetAdapter | Set-VMNetworkAdapterVLAN -Access -VlanId $VlanId}
else{$PrimaryNetAdapter | Set-VMNetworkAdapterVLAN -untagged}

if ($VMQ){$PrimaryNetAdapter | Set-VMNetworkAdapter -VmqWeight 100}
Else {$PrimaryNetAdapter | Set-VMNetworkAdapter -VmqWeight 0}

if ($IPSecOffload){$PrimaryNetAdapter | Set-VMNetworkAdapter -IPsecOffloadMaximumSecurityAssociation 512}
Else {$PrimaryNetAdapter | Set-VMNetworkAdapter -IPsecOffloadMaximumSecurityAssociation 0}

if ($SRIOV){$PrimaryNetAdapter | Set-VMNetworkAdapter -IovQueuePairsRequested 1 -IovInterruptModeration Default -IovWeight 100}
Else{$PrimaryNetAdapter | Set-VMNetworkAdapter -IovWeight 0}

if ($MacSpoofing){$PrimaryNetAdapter | Set-VMNetworkAdapter -MacAddressSpoofing on}
Else {$PrimaryNetAdapter | Set-VMNetworkAdapter -MacAddressSpoofing off}

if ($DHCPGuard){$PrimaryNetAdapter | Set-VMNetworkAdapter -DHCPGuard on}
Else {$PrimaryNetAdapter | Set-VMNetworkAdapter -DHCPGuard off}

if ($RouterGuard){$PrimaryNetAdapter | Set-VMNetworkAdapter -RouterGuard on}
Else {$PrimaryNetAdapter | Set-VMNetworkAdapter -RouterGuard off}

if ($NicTeaming){$PrimaryNetAdapter | Set-VMNetworkAdapter -AllowTeaming on}
Else {$PrimaryNetAdapter | Set-VMNetworkAdapter -AllowTeaming off}

## VHD(X) OS disk copy
$OsDiskInfo = Get-Item $SysVHDPath
Copy-Item -Path $SysVHDPath -Destination $($VHDPath)
Rename-Item -Path $($VHDPath + "\" + $OsDiskInfo.Name) -NewName $($OsDiskName + $OsDiskInfo.Extension)

# Attach the VHD(x) to the VM
Add-VMHardDiskDrive -VMName $VMName -Path $($VHDPath + "\" + $OsDiskName + $OsDiskInfo.Extension)

$OsVirtualDrive = Get-VMHardDiskDrive -VMName $VMName -ControllerNumber 0
     
# Change the boot order to the VHDX first
Set-VMFirmware -VMName $VMName -FirstBootDevice $OsVirtualDrive

# For additional each Disk in the collection
Foreach ($Disk in $ExtraDrive){
    # if it is dynamic
    if ($Disk.Type -like "Dynamic"){
        New-VHD -Path $($Disk.Path + "\" + $Disk.Name + ".vhdx") `
                -SizeBytes $Disk.Size `
                -Dynamic
    }
    # if it is fixed
    Elseif ($Disk.Type -like "Fixed"){
        New-VHD -Path $($Disk.Path + "\" + $Disk.Name + ".vhdx") `
                -SizeBytes $Disk.Size `
                -Fixed
    }

    # Attach the VHD(x) to the Vm
    Add-VMHardDiskDrive -VMName $VMName `
                        -Path $($Disk.Path + "\" + $Disk.Name + ".vhdx")
}

$i = 2
# foreach additional network adapters
Foreach ($NetAdapter in $NICs){
    # add the NIC
    Add-VMNetworkAdapter -VMName $VMName -SwitchName $NetAdapter.VMSwitch -Name "Network Adapter $i"
    
    $ExtraNic = Get-VM -Name $VMName | Get-VMNetworkAdapter -Name "Network Adapter $i" 
    # Configure the NIC regarding the option
    if ($NetAdapter.VLAN -gt 0){$ExtraNic | Set-VMNetworkAdapterVLAN -Access -VlanId $NetAdapter.VLAN}
    else{$ExtraNic | Set-VMNetworkAdapterVLAN -untagged}

    if ($NetAdapter.VMQ){$ExtraNic | Set-VMNetworkAdapter -VmqWeight 100}
    Else {$ExtraNic | Set-VMNetworkAdapter -VmqWeight 0}

    if ($NetAdapter.IPSecOffload){$ExtraNic | Set-VMNetworkAdapter -IPsecOffloadMaximumSecurityAssociation 512}
    Else {$ExtraNic | Set-VMNetworkAdapter -IPsecOffloadMaximumSecurityAssociation 0}

    if ($NetAdapter.SRIOV){$ExtraNic | Set-VMNetworkAdapter -IovQueuePairsRequested 1 -IovInterruptModeration Default -IovWeight 100}
    Else{$ExtraNic | Set-VMNetworkAdapter -IovWeight 0}

    if ($NetAdapter.MacSpoofing){$ExtraNic | Set-VMNetworkAdapter -MacAddressSpoofing on}
    Else {$ExtraNic | Set-VMNetworkAdapter -MacAddressSpoofing off}

    if ($NetAdapter.DHCPGuard){$ExtraNic | Set-VMNetworkAdapter -DHCPGuard on}
    Else {$ExtraNic | Set-VMNetworkAdapter -DHCPGuard off}

    if ($NetAdapter.RouterGuard){$ExtraNic | Set-VMNetworkAdapter -RouterGuard on}
    Else {$ExtraNic | Set-VMNetworkAdapter -RouterGuard off}

    if ($NetAdapter.NicTeaming){$ExtraNic | Set-VMNetworkAdapter -AllowTeaming on}
    Else {$ExtraNic | Set-VMNetworkAdapter -AllowTeaming off}

    $i++

    
}
#Remove # If cluster
#Add-ClusterVirtualMachineRole -VirtualMachine $VMName
Set-VMProcessor $VMName -CompatibilityForMigrationEnabled $true
Set-VMProcessor $vmname -MaximumCountPerNumaNode 28
}

```

Remember to adjust the script's paths and filenames according to your 
environment's setup, such as:

```
$SysVHDPath = "C:\Path\To\Your\Template\vTemplateServer2022.vhdx"
```
```
$VMPath         = "C:\Path\To\Your\Virtual Machines"
```
```
$VHDPath     = "C:\Path\To\Your\Virtual Hard Disks"
```

Be sure to also watch the ['Enable Deduplication'](https://mylemans.online/posts/Server2022-HyperV-EnableDeduplication/) video, which complements this guide. Deduplication is a powerful tool that can significantly reduce the disk space used by our templates. This is especially beneficial in environments where storage costs are a concern or where storage capacity is limited. 

Together, these resources will equip you with the knowledge and skills to effectively manage and scale your virtualized environment, making your IT infrastructure more robust, flexible, and cost-effective.

Happy Virtualizing!
