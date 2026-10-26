---
title: Massive CrowdStrike Falcon Sensor Update Crash Disrupts Windows PCs Worldwide
description: 'The July 2024 CrowdStrike Falcon Sensor update that blue-screened Windows PCs and servers worldwide, and the safe mode fix: delete C-00000291*.sys.'
date: '2024-07-19 08:00:00'
categories: [Windows Server, Security]
tags: [bsod, crowdstrike, csagent.sys, domain controller]
image: {path: /assets/img/posts/b29dce92-c896-496f-a0c1-cac1799c8848.webp, alt: Massive CrowdStrike Falcon Sensor Update Crash Disrupts Windows PCs Worldwide}
---

A recent update to the CrowdStrike Falcon Sensor has caused widespread issues, resulting in numerous Windows PCs crashing globally.

Currently, a significant Windows outage is affecting users worldwide. Many are encountering the dreaded blue screen of death or are stuck in a bootloop. Among the affected are major organizations like Ryanair, which has reported on its website that its IT problems are due to an external provider issue. In Belgium, NMBS and Brussels Airport are also experiencing disruptions, as reported by VRTNWS.

The culprit appears to be CrowdStrike. The security company has acknowledged on its website that something went wrong with its Falcon Sensor, a solution designed to secure connections between devices and the cloud. Following a recent update, numerous users are left with crashed Windows PCs. Both Windows 10 and Windows 11 systems, as well as servers, are affected. Reports are flooding in on a Reddit thread and the CrowdStrike customer forum.

CrowdStrike has stated that it has pulled the faulty update, but this comes too late for those who have already installed it. The security company is currently investigating ways to assist customers with crashed PCs. For many IT administrators, this means a troublesome Friday and potentially a ruined weekend.

## Workaround Steps

If you have been affected by this issue, here are the steps to resolve it:

1. Boot Windows into Safe Mode or the Windows Recovery Environment.
   
2. Navigate to the C:\Windows\System32\drivers\CrowdStrike directory.

3. Locate the file matching C-00000291*.sys, and delete it.

4. Boot the host normally.


[Source](https://itdaily.be/nieuws/security/crowdstrike-sloopt-windows/)
