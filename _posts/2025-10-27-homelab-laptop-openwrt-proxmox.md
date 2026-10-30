---
title: 'Turn a Laptop into a Home Lab with Proxmox and OpenWRT'
description: 'Turn any laptop into a portable home lab with Proxmox VE and OpenWRT: multi-WAN failover, a desktop environment, and VMs behind your own router.'
date: '2025-10-27'
categories: [Proxmox, Homelab]
tags: [proxmox, openwrt, homelab, networking, laptop]
image: {path: /assets/img/posts/covers/homelab-laptop-openwrt-proxmox.jpg, alt: Building a Complete Home Lab Using Just a Laptop (Proxmox + OpenWRT Setup)}
---

You don’t need a server rack or expensive hardware to start a homelab.  
With a single laptop, you can build a **complete, portable lab** running **Proxmox** and **OpenWRT**, with Wi-Fi passthrough and Multi-WAN failover.

---

## Why Use a Laptop?
- Portable, silent, and power-efficient  
- Built-in UPS (battery)  
- Perfect for learning, testing, and travel  
- Combines Wi-Fi + Ethernet for redundancy

---

## Step 1 – Install Proxmox VE and a Desktop Environment

1. Create a Proxmox USB installer and boot your laptop.  
2. Install Proxmox VE 9 and set a static IP.  
3. Enable IOMMU for passthrough in `/etc/default/grub`: 
   
   ```bash
   GRUB_CMDLINE_LINUX_DEFAULT="quiet intel_iommu=on iommu=pt"
   ```
   > (for AMD use amd_iommu=on)
   {: .prompt-info }

   
   ```bash
   update-grub
   ```
 4.  Edit /etc/modules and ensure these lines exist:
   
   ```bash
    vfio
    vfio_iommu_type1
    vfio_pci
    vfio_virqfd
   ```
    
5.  Install a simple desktop for local control:

    ``` bash
    apt install mate chromium lightdm -y
    adduser yourusername
    systemctl start lightdm
    ```
    
6.  Log in and open in Chromium `https://127.0.0.1:8006`, your laptop now acts as both **host** and **management station**.

------------------------------------------------------------------------

## Step 2 - Create the OpenWRT VM

Now that Proxmox is ready, let's build our virtual router.

1.  **Create a new VM**
    -   Give it 1--2 vCPUs and at least 512 MB RAM.\
    -   Add **two network adapters**:
        -   `net0` → WAN (bridged to your external network,
            e.g. `vmbr0`)\
        -   `net1` → LAN (bridged to your internal network,
            e.g. `vmbr1`)
2.  **Attach the OpenWRT ISO** and start the installation.
    -   You can download the x86-64 combined-ext4 image from
        [openwrt.org](https://openwrt.org/).\
    -   Once booted, assign `net0` as WAN and `net1` as LAN.
3.  **Passthrough the laptop's Wi-Fi adapter** so OpenWRT can use it as
    an additional WAN link.
4.  Install required packages in the OpenWRT VM:
    ``` bash
    opkg update
    opkg install kmod-iwlwifi iwlwifi-firmware-iwl7265d wireless-tools wpad-basic
    ```
    > You can find out your Wi-Fi module and drivers in the Troubleshooting Wi-Fi Passthrough steps.
    {: .prompt-tip }
    

------------------------------------------------------------------------

### Troubleshooting Wi-Fi Passthrough

If the Wi-Fi card doesn't appear in OpenWRT after PCI or USB
passthrough,\
it usually means the Proxmox host is still "owning" the device through
its driver.\
You'll need to **unbind or blacklist that driver** so the VM can claim
it.

#### Step 1: Identify the device

Run on the Proxmox host:

``` bash
lspci -nn | grep -i wireless
```

**Example output**

    03:00.0 Network controller [0280]: Intel Corporation Wi-Fi 6 AX200 [8086:2723]

→ The **PCI ID** is `8086:2723`
→ The **device path** is `0000:03:00.0`

#### Step 2: Check which driver is loaded

``` bash
lspci -k -s 03:00.0
```

**Example**

    Kernel driver in use: iwlwifi

#### Step 3: Blacklist the driver on the host

``` bash
echo "blacklist iwlwifi" > /etc/modprobe.d/blacklist-wifi.conf
update-initramfs -u -k all
reboot
```

After reboot, the Wi-Fi adapter will no longer load on the host
and can be safely **assigned to your OpenWRT VM** as a **PCI device**.

Once booted again, OpenWRT should detect the interface (e.g. `wlan0`).
You can then connect it to your local or public Wi-Fi network as the WAN
interface

------------------------------------------------------------------------

## Step 3 - Build the Internal Network

1.  Use only vmbr0 as your main bridge, it handles both WAN and LAN (via VLAN tags).
2.  Create a VLAN 999 sub-interface on the host:
    ``` bash
    auto enp0s31f6.999
    iface enp0s31f6.999 inet static
        address 192.168.99.10/24
        vlan-raw-device enp0s31f6
    ```
    This gives your Proxmox host direct access to the OpenWRT LAN.

3.  In the OpenWRT VM:
    -  WAN NIC → attached to vmbr0 (untagged, DHCP from your upstream)
    -  LAN NIC → attached to vmbr0 with VLAN tag 999
4   Any additional VMs can join the LAN by attaching to vmbr0 and setting VLAN tag 999 in their network settings.

------------------------------------------------------------------------

## Step 4 — Add Multi-WAN Failover (Optimized)

Inside OpenWRT, configure:

1.  WAN → the wired NIC (attached to vmbr0, untagged, DHCP from upstream).
2.  WWAN → the Wi-Fi interface (station mode, connects to another network).
3.  Install the failover manager:
    ``` bash
    opkg update && opkg install mwan3 luci-app-mwan3
    ```

4.  Edit /etc/config/mwan3 (or use LuCI → Network → Load Balancing) to prioritize Ethernet and use Wi-Fi as backup:
    ``` bash
    config member 'wan_main'
        option interface 'wan'
        option metric '1'
    
    config member 'wwan_backup'
        option interface 'wwan'
        option metric '2'
    
    config policy 'failover'
        list use_member 'wan_main'
        list use_member 'wwan_backup'
    
    config rule 'default_rule'
        option dest_ip '0.0.0.0/0'
        option use_policy 'failover'
    ``` 

5.  Enable and start the service:
    ``` bash
    /etc/init.d/mwan3 enable
    /etc/init.d/mwan3 restart
    ``` 

6.  Test failover:
Unplug the Ethernet cable and the traffic should automatically switch to Wi-Fi. Plug it back in and the routes revert to wired WAN (higher priority).
