---
title: 'DigitalOcean $200 Free Credit and First VPS Setup Guide'
description: 'Claim the DigitalOcean $200 credit, create your first droplet, get off root, set up UFW and Fail2Ban in the right order, and make it ready for Docker.'
date: 2025-04-24 09:00:00 +0200
categories: [Cloud]
tags: [digitalocean, vps, ubuntu, selfhosting, tutorial]
image: {path: /assets/img/posts/7c4285c92df0.webp, alt: The DigitalOcean droplet creation screen}
---

Renting a server sounds like something you need a budget approval for. It isn't. The smallest DigitalOcean droplet costs about the price of a coffee per month, and with my referral link you get $200 of credit to spend over 60 days, so your first two months of experimenting cost you nothing.

By the end of this post you'll have an Ubuntu server running on a public IP, locked down properly, and ready for whatever you want to self-host on it. I'll walk through the account, the droplet, the hardening that people skip, and the one firewall command that locks you out of your own server if you run it in the wrong order.

> **The short version:** sign up with the referral link, create an Ubuntu droplet with an SSH key (not a password), connect, update, allow OpenSSH in UFW *before* enabling UFW, install Fail2Ban, then install Docker. Ten minutes of work, and the box is yours.
{: .prompt-tip }

## Claim the $200 credit first

Sign up through this link and the credit gets applied automatically:

👉 **[Sign up to DigitalOcean here](https://m.do.co/c/e03b740d65fb)**

[![DigitalOcean Referral Badge](https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%201.svg)](https://www.digitalocean.com/?refcode=e03b740d65fb&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)

You verify your email and add a payment method (card or PayPal) so they can filter out abuse. Nothing is charged upfront, and the $200 sits in the account as credit you burn through first. It expires after 60 days, so it pays to start the clock on a weekend when you actually have time to play.

That link is a referral link. If you use it, I get credit too. That's the only string attached, and the rest of this guide works the same without it.

## Create your first droplet

A droplet is DigitalOcean's name for a VPS. From the Droplets tab, click Create Droplet and work down the form:

1. **OS:** Ubuntu LTS. Everything below assumes Ubuntu, and so does most documentation you'll find later.
2. **Region:** pick the data center closest to you or your users. Amsterdam or Frankfurt if you're in Belgium.
3. **Size:** the cheapest shared-CPU plan is fine to start. You can resize the CPU and RAM later without rebuilding, so don't overthink it.
4. **Authentication:** choose **SSH key**, not password. Paste your public key, or generate one first with `ssh-keygen -t ed25519` on your own machine.
5. **Hostname:** something you'll recognise in three months.

Click create and the machine is up in under a minute.


> Choosing password authentication here is the single most common regret. A public IP gets hit with automated SSH login attempts within minutes of coming online, and a password is the only thing standing between those bots and your box. An SSH key removes that problem entirely instead of managing it.
{: .prompt-warning }

## Connect and update

```bash
ssh root@your_droplet_ip
```

Swap `your_droplet_ip` for the address shown in the control panel. First thing after connecting, take the pending updates:

```bash
apt update && apt upgrade -y
```

A freshly created image is almost never fully patched. This is thirty seconds of work that closes whatever was fixed between the image being built and you clicking create.

## Get off root

Root has no limits and no audit trail. Every command you fat-finger executes at full privilege, and every tutorial you paste from the internet does too. A normal account with sudo gives you the same power with a deliberate pause in front of it, and a log of when you used it.

Create the account and put it in the `sudo` group:

```bash
adduser marc
usermod -aG sudo marc
```

`adduser` prompts for a password. Set a real one and store it in your password manager. You won't type it to log in (that stays key-based), you'll type it for sudo, which is exactly the pause you want.

Now give the new account your SSH key. The tidiest way is to copy root's `.ssh` directory across with ownership fixed in one go:

```bash
rsync --archive --chown=marc:marc ~/.ssh /home/marc
```

That works because DigitalOcean already installed your public key into root's `authorized_keys` when the droplet was built.

### Test it before you change anything else

Leave your root session open. Open a **second** terminal and connect as the new user:

```bash
ssh marc@your_droplet_ip
sudo whoami
```

You want a login with no password prompt, and `sudo whoami` answering `root` after you enter the user password. If either fails, fix it now while you still have a working root session to fix it from.


### Close the door behind you

With the new account proven, stop accepting root logins and passwords over SSH. Edit `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Set these three:

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
```

Check the config parses before you restart anything:

```bash
sudo sshd -t
```

Silence means it's valid. Then apply it:

```bash
sudo systemctl restart ssh
```

On recent Ubuntu releases SSH is socket-activated, so restarting the service alone may not pick up a changed port or listen address; restart `ssh.socket` as well if you touched either `[VERIFY: socket activation behaviour on the current LTS]`.

> Here's the part that catches people. Cloud images ship drop-in files in `/etc/ssh/sshd_config.d/`, typically a `50-cloud-init.conf` that sets `PasswordAuthentication yes`. Those drop-ins are included at the *top* of the main config, and in sshd the first occurrence of a setting wins. So you edit `sshd_config`, restart, and password logins are still happily accepted. Check with `sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication'`, which prints the settings actually in effect, and if they disagree with your edits, fix the drop-in file instead.
{: .prompt-warning }


From here on, log in as your normal user and prefix admin commands with `sudo`. The rest of this guide assumes you are.

## Set up the firewall (in this exact order)

UFW is Ubuntu's friendly front end to iptables. The order matters more than the commands:

```bash
sudo ufw allow OpenSSH
sudo ufw enable
sudo ufw status
```

If you plan to serve websites, open HTTP and HTTPS as well:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```


### The mistake that locks you out

Run `ufw enable` before `ufw allow OpenSSH` and the default deny policy kills your own SSH session. You're not hacked and nothing is broken; you've just firewalled yourself off a machine you can only reach over the network.


It's recoverable, because DigitalOcean gives you a browser-based console that bypasses SSH entirely. Open the droplet, click Console, log in there, and run `sudo ufw allow OpenSSH`. Worth knowing that console exists before you need it, which is generally the moment you'd rather not be reading documentation.


## Add Fail2Ban

Fail2Ban watches the authentication log and temporarily bans IP addresses that keep failing to log in. With key-only SSH you're already in good shape, but it cuts the noise and it's five minutes of work.

```bash
apt install fail2ban -y
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
nano /etc/fail2ban/jail.local
```

Never edit `jail.conf` directly. Package updates overwrite it and quietly take your configuration with them; `jail.local` survives.

In `jail.local`, make sure the SSH jail is enabled:

```
[sshd]
enabled = true
port = ssh
maxretry = 5
```

Then start it:

```bash
systemctl enable --now fail2ban
```

### The step most guides skip

On recent Ubuntu releases there is no `/var/log/auth.log` by default, because logging moved to the systemd journal and rsyslog isn't installed. Copy an old guide that points the jail at a log file and Fail2Ban either refuses to start or sits there banning nobody, which is worse, because you think you're protected.

The fix is to tell it where the logs actually live:

```
[sshd]
enabled = true
port = ssh
backend = systemd
maxretry = 5
```


### The pro check

Don't assume. Verify all three:

```bash
ufw status verbose
fail2ban-client status sshd
ss -tulpn
```

The first confirms the firewall is active and only opens what you meant to open. The second should report the sshd jail as running with a filter and a count of failed attempts (which will already be climbing). The third shows every port currently listening, which is the honest answer to "what have I actually exposed?"

And before you close your terminal, open a second one and connect again. A working SSH session is not proof that a new session can still be established.

## Now put Docker on it

The old version of this post ended with a couple of `apt install` lines for Docker. That advice has aged badly: the distro packages give you a lagging Docker version and the deprecated standalone `docker-compose` v1, not the current compose plugin.

So I split it out and rewrote it properly, including installing from Docker's own repository and getting a real application running rather than just a daemon:

**[Self-Host Your First App in 15 Minutes with Docker Compose](https://blog.mylemans.online/posts/self-host-first-app-docker-compose/)**

Everything in that guide works exactly the same on this droplet as it does on hardware at home. The compose file doesn't change at all. What changes is the environment around it: you're now on a public IP, which is precisely why the hardening above comes first.

## What people actually run on these

A single small droplet comfortably handles a static site or blog, a personal VPN or WireGuard endpoint, a Git server, an uptime monitor, a small API, or a handful of self-hosted web apps behind one reverse proxy. Where it starts to hurt is anything memory-hungry: databases under real load, media transcoding, or a dozen containers that each want half a gig of RAM.

> Want the hardening and the Docker setup done for you rather than done by you? I take on this kind of work directly.
{: .prompt-info }

## FAQ

**Do I need a credit card to get the $200 credit?**
Yes, a card or PayPal, purely as an anti-abuse check. You aren't charged while credit remains, but do set a billing alert so the transition from free to paid isn't a surprise.

**What happens when the 60 days or the $200 runs out?**
Whichever comes first ends the free ride, and billing switches to your payment method at normal rates. Destroy any droplets you were only using to experiment; a powered-off droplet still bills you, because the disk is still reserved. Destroying it is the only thing that stops the meter.

**How big a droplet do I need for Docker?**
The smallest shared-CPU plan runs a few light containers fine. Add RAM before CPU, since memory is what you run out of first with containers. Resizing RAM and CPU is reversible; resizing the disk is not, so grow that one carefully.

**Should I keep using root, or make a normal user?**
Make a normal user with sudo and disable root SSH login. Root over SSH works and every quick tutorial uses it, but it means one compromised key equals total control, with no audit trail of who did what.

**Is a VPS better than self-hosting at home?**
Different trade-offs. A VPS gives you a static public IP, real uptime, and no traffic through your home connection. Home hardware gives you more resources for the money and keeps your data physically yours. Plenty of people run both and connect them with a tunnel.

## Recap

You now have a patched Ubuntu server on a public IP, a firewall that only opens what you chose, Fail2Ban actually running rather than merely installed, and a verified way back in if something goes wrong. That's a genuine foundation, and it took about ten minutes. Everything else you self-host from here sits on top of it.

Prefer to watch? The walkthrough of the Docker Compose side of this lives on **[Mylemans Online on YouTube](https://www.youtube.com/@MylemansOnline)**.

> Ready to build on it? The self-hosting path on **[Mylemans Labs](https://labs.mylemans.online/)** takes you from this droplet to a full stack, step by step, and it's free.
{: .prompt-info }
