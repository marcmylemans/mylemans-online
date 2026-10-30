---
title: 'Finding Hidden Mailbox Archive Growth in Microsoft 365'
description: 'Microsoft 365 mailboxes hit the 50 GB limit without warning. How I found hidden archive growth and built a PowerShell report to catch it early.'
date: '2025-08-24'
categories: [Microsoft 365]
tags: [microsoft 365, exchange online, powershell, email management, business premium]
image: {path: /assets/img/posts/covers/mailbox-archive.jpg, alt: How I Discovered Hidden Mailbox Growth in Microsoft 365 Archives}
author: Marc Mylemans
---

# **How I Discovered Hidden Growth in Mailbox Archives**

Have you ever thought you had your email storage under control, only to find out the real problem was hiding in plain sight? That’s exactly what happened to me last week when a client asked a seemingly simple question:

> “Can you check how much space our mailboxes are using?”

Sounds easy, right? Just a quick look in the Microsoft 365 admin center… except there was a catch. The admin portal only shows you the **primary mailbox size**. It completely ignores the **archive mailbox**, and that’s where things can get tricky.

---

## **The Problem I Didn’t See Coming**

The client’s users all had archive mailboxes enabled for years. Nobody really checked them because everyone assumed, *“That’s just for old emails we don’t need anymore.”* But when your primary mailbox is capped at **50 GB** and the archive is **also capped at 50 GB**, you eventually hit a wall.

When I started pulling numbers, I noticed that:
- A few users had **archives bigger than their primary mailbox**.
- Some were just a few gigabytes away from the **maximum 50 GB limit on the archive**.
- And this was all happening silently in the background.

If we hadn’t caught this in time, users would soon be unable to archive more emails, and their primary mailboxes would fill up even faster.

---

## **The Solution: PowerShell to the Rescue**

The built-in reports in Microsoft 365 didn’t give me the full picture, so I turned to **Exchange Online PowerShell**. Here’s the command I used to get **both mailbox and archive usage for every user**:

```powershell
Connect-ExchangeOnline

$report = Get-Mailbox -ResultSize Unlimited | ForEach-Object {
    $mbxStats = Get-MailboxStatistics $_.UserPrincipalName
    $archiveStats = $null
    if ($_.ArchiveStatus -eq "Active") {
        $archiveStats = Get-MailboxStatistics $_.UserPrincipalName -Archive
    }

    [PSCustomObject]@{
        User              = $_.UserPrincipalName
        DisplayName       = $_.DisplayName
        MailboxSizeGB     = "{0:N2}" -f ($mbxStats.TotalItemSize.Value.ToBytes() / 1GB)
        ArchiveSizeGB     = if ($archiveStats) { "{0:N2}" -f ($archiveStats.TotalItemSize.Value.ToBytes() / 1GB) } else { "N/A" }
    }
}

$report | Export-Csv "Mailbox_And_Archive_Usage.csv" -NoTypeInformation -Encoding UTF8
```

This script gave me a complete overview, including:
- **Mailbox size in GB**
- **Archive size in GB**
- Exported as a **CSV report**

With this data, I could clearly see which users were approaching the limit and prepare a proposal to **upgrade them to Microsoft 365 Business Premium** for more flexibility and security.

---

## **What Happens After the Upgrade?**

Upgrading to Microsoft 365 Business Premium gives you more options, but the **archive does not grow automatically** beyond 50 GB. To unlock **unlimited archiving**, you need to enable **Auto-Expanding Archives** in Exchange Online.

Here are the steps:

1. **Connect to Exchange Online PowerShell**:
   ```powershell
   Connect-ExchangeOnline
   ```

2. **Enable Auto-Expand for your organization**:
   ```powershell
   Set-OrganizationConfig -AutoExpandingArchive
   ```

3. **Verify the setting**:
   ```powershell
   Get-OrganizationConfig | FL AutoExpandingArchiveEnabled
   ```

4. **Ensure users have archive enabled** (if not):
   ```powershell
   Enable-Mailbox user@domain.com -Archive
   ```

Once enabled, the archive mailbox will **automatically grow beyond 50 GB in 100 GB increments**, up to **unlimited capacity** (technically, Microsoft handles this by adding additional storage behind the scenes).

---

## **Why This Matters**

Email isn’t going anywhere, and neither is the growth of data. If your users rely heavily on Outlook, ignoring archive size can create **unexpected disruptions**. A blocked mailbox means missed emails, frustrated users, and urgent firefighting.

Proactively checking mailbox and archive usage is a small effort that prevents a big headache.

---

**Want the full script?** It’s right above—copy, paste, and run it.  
**Have you ever hit the mailbox limit unexpectedly?** Share your story in the comments!  

---

*Need more scripts like this? Follow me on [YouTube](https://www.youtube.com/@mylemansonline) for tips, tricks, and real-world IT stories.*
