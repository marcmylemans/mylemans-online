---
title: 'RDS Email Discovery: Subscribe to Your RemoteApp Feed'
description: 'Let users subscribe to your RDS web feed with just their email address: add a public _msradc TXT record that points to the RDWeb webfeed.aspx URL.'
date: '2023-09-09 08:00:00'
categories: [Windows Server]
tags: [server 2022, rdp, remote desktop services, rds, webfeed, autodiscover]
image: {path: /assets/img/posts/covers/remotedesktopwebfeeddiscoveryrecord.jpg, alt: 'Remote Desktop Services, Set up email discovery to subscribe to your RDS feed'}
---

I am writing this small guide in extension of the Remote Desktop series.

You can use your e-mail to 'autodiscover' your remote desktop webfeed. (like your exchange autodiscover record).

i'm going to use contoso.com as our example here and your users get an e-mail in the form of firstname.lastname@contoso.com

For this to work you need to create a new TXT record on your public nameservers that points to your Remote desktop Webfeed.

The value for the new TXT record:

```
_msradc
```

Text value:

```
https://webserver.contoso.com/RDWeb/Feed/webfeed.aspx
```

Be sure to check out the previous video where we configured Remote Desktop Services:

[RDS on Server 2022 with FSLogix and SSO: Step-by-Step Guide (Part 1)]({% link _posts/2024-10-20-Remote-Desktop-Services-Part1.md %})

[Install and Configure Office on RDS / RemoteApp (Part 2)]({% link _posts/2024-10-24-Remote-Desktop-Services-Part2.md %})

[Server 2022 - Remote Desktop Services - Part 5]({% link _posts/2023-01-05-RemoteDesktopPart5.md %})

[Server 2022 - Remote Desktop Services - Part 6]({% link _posts/2023-01-23-Remote_DesktopPart6.md %})

[Server 2022 - Remote Desktop Services - Part 7]({% link _posts/2023-09-07-RemoteDesktopPart7.md %})

