---
title: 'Convert a Windows ISO to VHDX for Hyper-V (Automated)'
description: 'Turn a Windows Server ISO into a ready VHDX template with Convert-WindowsImage, inject unattend.xml and enable NetFx3, all from one PowerShell script.'
date: '2024-05-09 08:00:00'
categories: [Scripts]
tags: [automation, powershell, scripting, hyper-v, virtual machines, windows server, iso, vhdx, template, homelab, convert windowsimage]
image: {path: /assets/img/posts/covers/createvhdfromiso.jpg, alt: Automating Hyper-V VHD(X) Creation from a Windows ISO}
---

## Follow-Up: Enhancing the Hyper-V Automation Project with TemplateBuilder

As a follow-up to the initial Hyper-V Automation Project, I'm excited to introduce a new addition to the project: the **TemplateBuilder**. This new script, included under the `TemplateBuilder` folder, simplifies the process of creating Hyper-V templates even further. 

### What's New?

The TemplateBuilder script now includes:
- **Automated ISO to VHD(X) Conversion:** Using the powerful [Convert-WindowsImage](https://github.com/x0nn/Convert-WindowsImage) script, the TemplateBuilder automates the conversion of Windows ISO files to VHD(X).
- **Integrated Answer File Handling:** The script injects an `unattend.xml` file directly into the VHD(X), allowing for a fully automated Windows setup.
- ** Enables the NetFx3 feature by default.

### Simplified Setup

All necessary files, including `Convert-WindowsImage.ps1` and the `unattend.xml` file, are included within the project under the `TemplateBuilder` folder. This means you have everything you need to run the script out of the box, without having to download additional components.

### Key Benefits

- **Time Savings:** Automate the repetitive task of VHD(X) creation and configuration.
- **Consistency:** Ensure that all your VMs are set up in a consistent manner, reducing the risk of configuration errors.
- **Ease of Use:** The process is streamlined, requiring minimal input once the initial configuration is set.

### How to Get Started

To get started with the new TemplateBuilder script, follow these steps:
1. Clone the repository from GitHub: [Hyper-V Automation Project](https://github.com/marcmylemans/HomeLab).
2. Navigate to the `TemplateBuilder` folder.
3. Ensure your configuration variables are set correctly in the script.
4. Run the script in PowerShell.

By incorporating these new features, the Hyper-V Automation Project continues to evolve, making it easier and more efficient to manage your Hyper-V environment. I encourage you to try out the new TemplateBuilder, provide feedback, and contribute to the project.

### Variables

Adjust the following variables in the script as per your environment:
- `$isoPath`: Path to the Windows Server ISO file.
- `$vhdPath`: Path where the resulting VHD(X) will be saved.
- `$unattendPath`: Path to the `unattend.xml` file.
- `$Edition`: Edition of Windows Server to be installed (e.g., "Windows Server 2022 Standard (Desktop Experience)"). If omitted and more than one image is available, all images are listed.

# Conclusion

The addition of the TemplateBuilder to the Hyper-V Automation Project represents another step towards simplifying Hyper-V management. With these tools, you can automate more tasks, save time, and ensure consistent, reliable VM setups. Join us on GitHub, explore the project, and be part of our growing community of users and contributors!

Check out the updated project on [GitHub](https://github.com/marcmylemans/HomeLab) and join the discussion!

## References

- [Convert-WindowsImage](https://github.com/x0nn/Convert-WindowsImage)

