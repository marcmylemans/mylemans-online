---
title: 'Beelink ME Pro Review: Back the Kickstarter or Buy?'
description: 'The Beelink ME Pro 2-bay NAS before its Kickstarter: N95 specs, a mirror pool in under 30 minutes, 20 W idle at the wall, and whether to back it or buy it.'
date: '2026-11-03 13:00:00 +0100'
categories: [Reviews, Hardware]
tags: [beelink, me pro, nas, fygo os, kickstarter, homelab, review, youtube]
image: {path: /assets/img/posts/NbOiIqiajv8.jpg, alt: Beelink ME Pro 2-bay NAS review}
series: Home server from scratch
series_order: 5
---

The Beelink ME Pro is a small two-bay NAS that's about to launch on Kickstarter, and it's already for sale in Beelink's own store. Beelink sent me one early, so I've run it for a couple of weeks with two drives from my lab, measured it at the wall and used it for a job I actually have: sending raw 4K footage to my video editor. By the end of this post you'll know what's inside, what it costs to run and whether to back it or just buy it.

> **The short version:** the ME Pro (Intel N95, 12 GB soldered RAM, 2.5 GbE plus 5 GbE) took me under 30 minutes from box to first files, draws about 20 W at idle with two hard drives spinning and only 30 W at its worst. For the N95 2-bay, the Kickstarter is the better deal on paper, mostly because of the bundled lifetime Fygo OS licence, as long as you're fine waiting for delivery. The one thing that can't wait: the $10 deposit that turns it into a 4-bay at the 2-bay price has to be in before launch. Want it next week? Buy it from the store.
{: .prompt-tip }

> **Disclosure:** Beelink sent me this unit for free, with no strings attached. I wasn't paid for the video or this post, and nobody from Beelink or Fygo saw either before they went live. The Fygo OS link further down is an affiliate link, so I may earn a commission if you buy through it.
{: .prompt-warning }

{% youtube "https://youtu.be/NbOiIqiajv8" %}

This is a first honest look after a couple of weeks, not a long-term test.

## What's inside the ME Pro

I read these off the BIOS and checked them against the spec sheet, because the BIOS can't do marketing.

| Part | Beelink ME Pro (tested unit) |
|---|---|
| CPU | Intel N95, four cores, built to sip power, Quick Sync for video |
| RAM | 12 GB LPDDR5, soldered |
| OS drive | Its own 128 GB SSD |
| Extra storage | 2x M.2 slots for fast storage |
| Drive bays | 2x 3.5 inch, no drives included (I used two 2 TB WD Reds) |
| Network | 1x 2.5 GbE (Intel) and 1x 5 GbE (Realtek) |
| OS | Fygo OS, pre-installed |

The RAM is the spec to think about. 12 GB is fine for a file server, but because it's soldered, it's also the ceiling once you start piling apps onto the box.

The two network ports are more than most home networks can feed right now. Nice to have, not a reason to buy.

## The drawer is the clever part

The whole board slides out of the case like a drawer. Today that means you can blow the dust out in a minute. Beelink's bigger promise is that you can slide in a faster board later and keep your drives and data in place. That depends on future boards, so I'd count it as a bonus rather than a reason to buy.

<!-- SCREENSHOT: motherboard drawer pulled out of the ME Pro chassis -->

## Setup: under 30 minutes from box to first files

Pre-installed saves you a USB stick and an installer, but you still fit the drives and build the storage yourself. It took me less than half an hour.

1. Plug the network cable into the 2.5 GbE port, power on, give it a minute and open its IP address in a browser.
2. **Create the admin account** with a proper password, not the one you use everywhere else. This account can see and delete everything on the box, so I keep it for managing the NAS only.
3. Run the wizard: device name, **time zone**, and **let it check for updates right away**. A box that ships pre-installed has probably sat in a warehouse for a while.
4. **Create a storage pool** with both drives as a mirror (more on that choice below). It warns that this erases both drives, and there's no undo, so copy off anything you want to keep first.
5. **Check the pool status** before you put anything on it (see the next section).
6. **Create a shared folder** and a **normal user account** with access to that folder only, so the laptop in the living room never logs in as admin.
7. On Windows, type `\\` followed by the NAS address and the folder name in File Explorer (for example `\\192.168.1.50\Photos`), log in with the normal account, and it shows up like any other drive.

If this is your first NAS, my [first home NAS post](/posts/first-home-nas-fygo-os/) goes deeper on pools, shares and permissions in Fygo OS, including the permission gotcha that makes a media folder look empty.

## Mirror or add-up, and the check most people skip

When you create the pool with two drives, you get two real choices:

- **Add them together:** 4 TB of space, but if one drive dies, everything on both is gone.
- **Mirror (RAID 1):** both drives hold the same copy of everything, so one can die and you lose nothing. You get the space of one drive, 2 TB here.

On a two-bay box I'd pick the mirror every time. The whole reason you buy a NAS is to not lose your files, and losing half the raw capacity is the price of that.

Now the step most people skip. Before you copy a single file onto it, open the pool status and check that it says **healthy** with **both drives** in it. If it shows only one drive, or says degraded, you've built a pool that can't survive a failure yet. Much better to find that out on day one, while it's empty, than on the day a drive actually dies.

<!-- SCREENSHOT: Fygo OS pool status: RAID 1, 2 drives, 2 TB usable, healthy -->

## Power draw, measured at the wall

I measured with a smart plug, so these numbers are the whole box: board, both spinning hard drives and the power supply's losses.

| Workload | Power at the wall | Cost per year at €0.30/kWh |
|---|---|---|
| Idle | ~20 W | ~€53 |
| Copying files on or off | ~24 W | |
| Transcoding a movie in real time | ~25 W | |
| Transcoding + AI photo indexing (the most I could get out of it) | ~30 W | ~€79 if it ran like that all year |

Transcoding is the heaviest job most people give a home NAS, and it cost only about 1 W more than copying files. That's Quick Sync: a small part of the N95 that only does video, so the four main cores barely notice.

The 30 W peak only happens while the photo app indexes a big batch of new photos. And if you've seen a 25 W figure on the spec sheet and wonder how I got to 30, that figure is the chip alone; the plug measures everything. A NAS runs all day, every day, so the idle number is the one that ends up on your bill.

## Sending 4K footage to my editor with Fygo Connect

A freelance editor cuts my videos, and the raw footage for one video is easily 10 GB or more. Today I send it with OneDrive, so I tried letting the NAS do that job.

That's what Fygo Connect is for, the OS's remote access service:

1. Sign in with a Fygo OS account and pick an ID. The box gets its own web address with a proper certificate, so you don't open any ports on your router.
2. It first tries a direct connection between your editor's device and the box. Only if that fails does traffic go through Fygo's own servers, called relay. Relay has a speed limit, because they pay for that traffic.
3. Create a share link for the folder, give it a **password** and let it **expire** after a few days, so there's no link to your raw footage floating around months later.

Then the check I'd do before sending it: open the link yourself in a private browser window. If it doesn't ask you for the password, it won't ask your editor either.

The real limit was my own upload speed at home, not the box.

<!-- SCREENSHOT: share-link dialog with password and expiry set -->

## Kickstarter or Beelink store: the numbers

<!-- VERIFY: prices against the live Kickstarter page and Beelink store; they move during a campaign. -->

| | Kickstarter | Beelink store |
|---|---|---|
| N95 2-bay | $419 (Super Early Bird) | $379 |
| Lifetime Fygo OS licence (sold separately for $199) | Included | Not included |
| 4-bay for the 2-bay price | With a $10 deposit before launch | No |
| Core i5 and Ryzen boards | Campaign only | No |
| Delivery | When the campaign ships | Now |

Ignore the "from $299" headline on the campaign page: that's the model with the J5005, a chip from 2017, not the N95 I tested.

The licence is what tips it. Without one you're on the free tier, which works but caps you at three users and four drives and leaves out some of the apps. The Kickstarter units include the lifetime licence, so part of that $419 is software you'd otherwise pay $199 for. On price alone, backing wins.

The 4-bay deposit is the other reason. With two bays mirrored you only ever get the space of one drive, so two extra bays are worth more than any discount.

Two things to know before you back it:

- **Backing is paying for something that isn't in a shop yet.** Delivery dates on crowdfunded hardware slip more often than they don't. Beelink is an established brand with products already on shelves, which helps a lot, but only back it with money you're fine waiting on.
- **"AI NAS" depends on the board.** Local AI models only run on the Ryzen board. On the N95, AI means photo search, and that works fine.

## Verdict

In a couple of weeks I put two drives in it, built a mirror from a browser, measured 20 W idle and 30 W peak with transcoding costing almost nothing on top, and sent my editor a video's worth of footage over Fygo Connect. For this two-bay, the campaign is the better deal on paper as long as you're happy to wait. If you'd rather have it next week, the store is there. And if you want the 4-bay upgrade, get the $10 deposit in before launch, because that part can't wait.

Already have hardware you'd rather reuse? That's exactly what I did in my [Fygo OS NAS build](/posts/first-home-nas-fygo-os/).

Links from the video:

- [Beelink ME Pro on Kickstarter](https://www.bee-link.com/pages/me-pro-nas)
- [Beelink official store](https://www.bee-link.com/)
- [Fygo OS pricing](https://fygonas.com/pricing?ref=MYLEMANSONLINE){:rel="sponsored noopener" target="_blank"} (affiliate link), discount code **571U6M** for an extra 10% off

## FAQ

### Should I back the Beelink ME Pro on Kickstarter or buy it?

Back it if you want the bundled lifetime Fygo OS licence, the 4-bay chassis for the 2-bay price (with a $10 deposit before launch) or the Core i5 and Ryzen boards, and you're fine waiting. Buy it from the store if you want it now and the free tier is enough.

### How much power does the Beelink ME Pro use?

Measured at the wall with two hard drives: about 20 W idle, 24 W while copying files, 25 W while transcoding and 30 W at peak with AI photo indexing. At €0.30 per kWh, idle comes to about €53 a year.

### Can you upgrade the RAM in the Beelink ME Pro?

No. The 12 GB of LPDDR5 is soldered to the board. That's fine for a file server, but it's the ceiling if you plan to run lots of apps.

### Does the Beelink ME Pro come with a Fygo OS licence?

My review unit came with a lifetime licence, and the Kickstarter units include one. The unit in Beelink's store doesn't, so you start on the free tier (three users, four drives, fewer apps) and can buy a licence separately.

### Can the Beelink ME Pro run local AI models?

Not the N95 version. Local AI models need the Ryzen board. On the N95, AI means photo search and face recognition, which works fine.

## Learn the storage side properly

> A NAS is only as safe as the backup plan around it. The Backup & DR path on [Mylemans Labs](https://labs.mylemans.online) walks through RAID, snapshots and the 3-2-1 rule in order, free.
{: .prompt-info }

Prefer to watch? The full look is in [the video](https://youtu.be/NbOiIqiajv8), and there's more homelab and IT content over on Mylemans Online on YouTube.
