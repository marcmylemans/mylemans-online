---
title: How to Migrate a Hyper-V VM to Proxmox (Step-by-Step Guide)
description: Step-by-step tutorial on migrating a Hyper-V virtual machine to Proxmox using qemu-img and VirtIO drivers.
date: '2025-10-11'
categories: [Homelab]
tags: [proxmox, hyper-v, migration, qemu img, virtio]
image: {path: /assets/img/posts/Migrate-HyperV-to-Proxmox.webp, alt: How to Migrate a Hyper-V VM to Proxmox (Step-by-Step Guide)}
---

If you’re moving your home lab or production workloads from **Hyper-V** to **Proxmox**, this guide walks you through the entire migration process, including installing drivers, exporting, converting, and importing your virtual machine.

{% youtube "https://youtu.be/nYLgYg2zPHc" %}

---

## 1. Prepare the VM

Inside your Hyper-V VM, install the latest stable [VirtIO drivers](https://fedorapeople.org/groups/virt/virtio-win/direct-downloads/stable-virtio/virtio-win.iso), mount the ISO, install all drivers and shut down the VM. 

Export the VM from Hyper-V, Open Hyper-V Manager. Right-click the VM and choose **Export**


---

## 2. Convert the Disk

Use [qemu-img](https://cloudbase.it/qemu-img-windows/) to convert your `.vhdx` disk to `.qcow2`.

Open an elevated admin prompt!

from Command Prompt:

```bash
qemu-img.exe convert -f vhdx -O qcow2 "C:\path\to\VM.vhdx" "C:\path\to\VM-converted.qcow2"
```
or Powershell:

```powershell
.\qemu-img.exe convert -f vhdx -O qcow2 "C:\path\to\VM.vhdx" "C:\path\to\VM-converted.qcow2"
```

> In powershell or Terminal you have to append .\ to any file you want to execute.
{: .prompt-info }

---

## 3. Share the Converted Disk

On the Hyper-V host, share the folder containing the converted file.

In Proxmox, go to Datacenter, Storage. Choose Add, SMB/CIFS and enter your Hyper-V server IP, credentials and share name.

Under Content, select Import, Proxmox will create a new folder Import on your network share after saving.

Move your converted .qcow2 files to the **Import** folderthat Proxmox has created on your shared folder.

> make sure you have no whitespaces in the filenames or they will not be visible inside Proxmox.
{: .prompt-info }

---

## 4. Create and Import the VM in Proxmox

Create a new VM, choose “Do not use any media”.

On the System tab choose, Machine: **q35**, BIOS: **OVMF (UEFI)** for Gen2 or **SeaBIOS** for Gen1 and deselect EFI disk and TPM.

Delete the default disk, click **Import Disk** and select your `.qcow2` image.

>Do not start your VM, depending on your networkspeed the import progress can take some time!
{: .prompt-info }

Once done, start your VM and enjoy your new Proxmox environment!

---
