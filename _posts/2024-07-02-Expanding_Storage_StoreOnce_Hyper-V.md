---
title: 'Expand Storage with a StoreOnce VSA on Hyper-V'
description: I had to add 29 fixed 1 TB VHDX volumes to an HPE StoreOnce VSA on Hyper-V, so here is the PowerShell script that creates and attaches them via SCSI.
date: '2024-07-02'
categories: [Hyper-V, Backup]
tags: []
image: {path: /assets/img/posts/covers/expanding-storage-storeonce-hyper-v.jpg, alt: Expanding Storage with StoreOnce Virtual Appliance in Hyper-V}
---

## What is HPE StoreOnce?

HPE StoreOnce is a disk-based backup solution that provides efficient, scalable, and reliable storage for backup data. It leverages deduplication technology to reduce the storage footprint and improve backup performance. StoreOnce helps businesses protect their data more efficiently and cost-effectively.

## Background Story

One of the projects I am currently working on involves the use of an HPE StoreOnce Virtual Storage Appliance (VSA) deployed in a Hyper-V environment. 
Recently, I encountered a scenario where the existing storage capacity was insufficient to meet the growing data backup requirements. To address this issue, I needed to add extra storage volumes to the StoreOnce VSA. Specifically, I had to create an additional 29 volumes, each with a capacity of 1 TB, and attach them to the virtual appliance in Hyper-V.

## Creating and Attaching Volumes

Adding new storage volumes to a virtual appliance in Hyper-V involves several steps. 

1. We need to create the VHDX files for the new volumes. 
2. These VHDX files need to be attached to the StoreOnce VSA.

To streamline this process, I wrote a PowerShell script that automates the creation and attachment of these volumes.

The script ensures that each new volume is created as a fixed-size VHDX file and is attached to the SCSI controller of the StoreOnce VSA. Below, I've included a space where you can insert the script.

```powershell
# Define variables
$vmName = "YourVMName"          # Replace with your VM's name
$basePath = "D:\HyperV\YourVMName\"  # Base path where you want to create the VHDX files
$vhdxSize = 1TB                 # Size of each VHDX file
$controllerNumber = 0           # SCSI Controller number (0 is usually the first SCSI controller)

# Number of VHDX files to create
# Generate array of strings '2' to '30'
# Start from Disk2 since Disk1 already exists
$array = 2..30

# Loop to create and attach VHDX files
foreach ($n in $array) {
    # Define the VHDX file path
    $vhdxPath = "${basePath}Disk${n}.vhdx" 

    # Create the VHDX file
    New-VHD -Path $vhdxPath -SizeBytes $vhdxSize -Fixed

    # Attach the VHDX file to the VM
    Add-VMHardDiskDrive -VMName $vmName -ControllerType SCSI -ControllerNumber $controllerNumber -Path $vhdxPath -ControllerLocation $n
}

Write-Output "VHDX files created and attached successfully."
```
