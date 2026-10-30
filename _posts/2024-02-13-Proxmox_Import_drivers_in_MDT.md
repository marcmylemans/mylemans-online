---
title: 'Fix MDT BSOD on Proxmox VMs: Import the VirtIO Drivers'
description: Windows VMs on Proxmox blue-screened during MDT deployment until I added a driver fallback step with the VirtIO drivers and a PowerShell check.
date: '2024-02-13 08:00:00'
categories: [Homelab, Hardware]
tags: [proxmox, homeserversetup, techguide, virtualization, mdt, bsod, driver compatibility, deployment server]
image: {path: /assets/img/posts/xhRHTdSN9kY.jpg, alt: My Home Lab Adventure - Solving the BSOD Mystery with Proxmox and MDT}
---

Hey friends!

I recently embarked on a thrilling journey to build my very own home lab, diving into the world of virtual machines with Proxmox. It's been quite the ride, full of learning and, well, a few unexpected bumps along the way. One of the challenges that had me scratching my head was a series of pesky Blue Screens of Death (BSODs) during installations. Talk about a tech enthusiast's nightmare, right? [Read about my journey here.](/posts/NewHomeLab/)

## Finding My Way Through the Tech Maze

The root of the problem? Driver compatibility issues. It turns out that the virtual machines I was setting up needed some specific drivers to play nice with Proxmox. This discovery led me down a path to find a solution that could seamlessly integrate these essential drivers into my current deployment server. And guess what? I found a way, and I'm super excited to share this game-changer with you all.

## Sharing the Solution: A New Video Tutorial

Inspired by a fantastic guide on Deployment Research, I created a video tutorial that walks you through the entire process. From setting up MDT Lite Touch to implement a driver fallback strategy, this video has got you covered. ([Here's the original article that sparked my solution](https://www.deploymentresearch.com/add-driver-fallback-to-mdt-lite-touch/)).

Before diving into the driver fallback strategy and tackling those BSODs, you might want to ensure your Microsoft Deployment Server is up and running smoothly. If you're just starting out or need a refresher on setting up and customizing your deployment server, I've got you covered. Follow these guides to get started:

- [Setting Up a Microsoft Deployment Server!](/posts/MDTPart1/)
- [Customizing the Microsoft Deployment Server!](/posts/MDTPart2/)
- [Adding Drivers to the Microsoft Deployment Server!](/posts/MDTPart3/)

These guides are designed to walk you through the entire process, from initial setup to driver management, ensuring you have a solid foundation for your deployment projects. Whether you're tackling a home lab setup like mine or managing deployments in a professional setting, these resources will help pave the way for a smoother deployment process.

In the video, I show you how to:

- Prepare your deployment server for those tricky driver situations.
- Import the right drivers into a fallback folder, ensuring you're covered for any hardware scenario.
- Use a simple PowerShell script to make sure your setup doesn't stumble when it can't find the right driver.

The script contents:

```
$TSenv = New-Object -ComObject Microsoft.SMS.TSEnvironment

# Check for existing drivers folder
$OSDTARGETDRIVECACHE = $TSEnv.Value("OSDTARGETDRIVECACHE")
If (!(Test-path "$OSDTARGETDRIVECACHE\Drivers")){
    $TSEnv.Value("DriverFallback") = "True"    
}
```

The Command line in the Tasksequence:

```
PowerShell.exe -ExecutionPolicy Bypass -File "%SCRIPTROOT%\DriverFallback.ps1"
```

And for those of you diving into Proxmox like me, I've also included a link to the specific drivers that saved my skin: [Proxmox Windows VirtIO Drivers](https://pve.proxmox.com/wiki/Windows_VirtIO_Drivers). These were the key to turning those BSODs into successful installations.

{% youtube "https://youtu.be/xhRHTdSN9kY" %}

## Why This Means So Much

Setting up this home lab has been more than just a tech project for me; it's been a journey of discovery, frustration, and ultimately, triumph. Sharing these solutions with you isn't just about tech tips; it's about the camaraderie of overcoming obstacles in our tech adventures. Whether you're setting up a home lab, managing deployments for work, or just love tinkering with technology, I hope this video helps you avoid some of the headaches I encountered.

## Let's Keep the Conversation Going

After watching the video, I'd love to hear about your own experiences, challenges, or any home lab adventures you've embarked on. And if you have any questions or need further insights, don't hesitate to ask in the comments below.

Remember to like, share, and subscribe for more content where we demystify tech together. Your support is what makes this community so fantastic, and I can't wait to share more adventures with you.

Here's to many more successful deployments and the end of BSODs in our labs!
