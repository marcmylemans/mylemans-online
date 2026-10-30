---
title: How to set up Microsoft 365 archive policy
description: 'Keep Exchange Online mailboxes under quota: enable archive mailboxes, then create MRM retention tags in Purview or PowerShell to archive after 3 years.'
date: '2024-07-17 08:00:00'
categories: [Microsoft 365]
tags: []
image: {path: /assets/img/posts/covers/microsoft365mailboxarchivepolicy.jpg, alt: How to set up Microsoft 365 archive policy}
---

Have you ever struggled with overflowing email inboxes in your organization? With thousands of emails exchanged every day, even in a medium-sized organization, user mailboxes can quickly get full. In Exchange Online, you can tackle this issue by enabling archive mailboxes and advising users to move old items there. However, the human factor often becomes a weak link in this process. This is where Microsoft 365 archive policies come into play, offering a centralized and automated way to keep your users’ primary mailboxes below capacity. In a company with 500 employees, for instance, this automation can save significant time and hassle. Learn more about setting up archive policies in Microsoft 365 here.

## How to enable archive mailboxes in Exchange

Before implementing any archive policy, you need to enable archive mailboxes for your users. This step is crucial because, without archive mailboxes, the subsequent steps won't work. Archive mailboxes provide additional storage and help manage mailbox sizes more effectively.
If you haven’t enabled archive mailboxes yet, follow the instructions in [this CodeTwo Knowledge Base article](https://www.codetwo.com/kb/enable-archive-mailbox/#exchange-online) to turn them on. Ensuring this setup is complete is essential for the success of your archive policies.

Remember, without enabling archive mailboxes first, completing the steps below won’t make any sense. So, let’s get that done before moving forward.

## Create retention tags

Once you’ve set up the archive mailboxes, the next step is to configure retention tags to create an archive policy. A retention tag is a data archiving/retention rule that you can apply to specific scopes, such as entire mailboxes or mailbox folders.

A retention tag defines:

* The action (e.g., archive, delete, permanently delete) to perform on items such as emails in a mailbox or mailbox folder.
* The age of the items that, when reached, triggers the action.

Retention tags alone do not perform any actions. They serve as instructions that are executed when added to a retention (archive) policy for specific user mailboxes in Microsoft 365.

### Let’s Create Your First Retention Tag

> Tip: If you prefer using PowerShell, check out the relevant scripts in the ‘PowerShell corner’ subsection at the end of each section.
{: .prompt-tip }

1. [Sign in to the Microsoft Purview Compliance Portal](https://compliance.microsoft.com/)

* Use an account that belongs to an eligible role group (e.g., Global Administrator, Compliance Administrator, Organization Management).

2. Navigate to Retention Tags

* In the navigation menu, go to Data lifecycle management > Exchange (legacy).
* Select the MRM Retention tags tab.
* Click New tag to open the new retention tag wizard.

3. Name and Describe Your Tag

* First, name your tag (e.g., Auto-archiving (3 years)) and optionally provide its description.

4. Choose Application Method

* Decide the scope you want to apply the tag to (e.g., entire users’ mailboxes, specific default folders like Sent Items).
* Choose whether a retention action (e.g., archive, delete) should be applied automatically or manually.
* For automatic archiving, select Automatically to entire mailbox for items aged 3 years or more.

> Tip: Consider creating an additional retention tag for manual archiving by users, e.g., for items aged 1 year. This allows users to manually archive specific folders or items more quickly.
{: .prompt-tip }

5. Configure Retention Settings

* Specify what to do with emails that reach a specific age.
* Note that Exchange Online calculates item age based on the date of delivery.
* Enter the item age in days (e.g., 1095 days for 3 years) and choose Move item to archive.

6. Review and Submit

* Review your settings. If everything looks correct, click Submit > Done.
* Your retention tag is now created and should appear on the tag list.

Following these steps will help you effectively manage your organization’s email retention and archiving needs.

**PowerShell corner**

To create a tag named Auto-archiving (3 years) automatically archiving emails which are at least 3 years old.

```powershell
New-RetentionPolicyTag "Auto-archiving (3 years)" -Type All -RetentionEnabled $true -AgeLimitForRetention 1095 -RetentionAction MoveToArchive
```

To create a tag named Manual archiving (1-year) letting users manually archive items that are at least 1 year old.

```powershell
New-RetentionPolicyTag "Manual archiving (1-year)" -Type Personal -RetentionEnabled $true -AgeLimitForRetention 365 -RetentionAction MoveToArchive
```

[Text](url)
