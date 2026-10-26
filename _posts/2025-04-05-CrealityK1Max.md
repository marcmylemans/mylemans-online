---
title: Setting Up the Creality K1 Max with OrcaSlicer
description: First setup of the Creality K1 Max and OrcaSlicer, with the printer profile, custom G-code and a test print before printing rackmounts for ProDesk Minis.
date: '2025-04-05'
categories: [Hardware, Homelab]
tags: [creality k1 max, orcaslicer, 3d printer setup, rackmount 3d print, hp prodesk 600 g4 mini, g code configuration, printables, thingiverse, 3d printing timelapse, deskpi rackmate, mylemans online]
image: {path: /assets/img/posts/e0bdc2df4167.jpg, alt: Setting Up the Creality K1 Max with OrcaSlicer}
---

Welcome to another Mylemans Online project! I recently added the **Creality K1 Max** to my maker toolbox to support my **Rackmate T0 homelab project**—and I’m loving the results.

{% youtube "https://youtu.be/NFXPe-nGYtA" %}

## 📦 Unboxing the Beast

The K1 Max is a solid, pre-assembled CoreXY printer with a massive build volume and lightning-fast speeds. Right out of the box, it felt premium and ready to work.

> ⚠️ The unboxing footage was shot at night because, yes, the printer arrived at **10 PM**, and I just couldn’t wait. I filmed it on my phone, so please excuse the lighting and wobbly shots. But hey, that’s the joy of a new gadget, right?

## 🔧 First-Time Setup

After unboxing, the K1 Max is almost plug-and-play. Here’s what I had to do:

- Remove all the protective stickers
- Connect the display to the ribbon cable (this took some effort one-handed while filming 😅)
- Remove three shipping screws under the print bed

Once powered on, the printer guides you through:

- Language selection
- WiFi connection
- Auto-calibration sequence

It also comes with a spool of **white filament**, which I used for testing.  
I ordered some **black filament** for the actual rackmounts—should arrive soon!

## 🛠️ Installing OrcaSlicer

To slice my prints, I’m using **OrcaSlicer**, a free and powerful slicer favored by the 3D printing community.

### Step-by-step:
1. **Download and run the installer** from the [official OrcaSlicer website](https://github.com/SoftFever/OrcaSlicer/releases/latest). It’s a quick and easy setup.
2. Upon first launch, a **setup wizard** appears to guide you through the basics.
3. Search and select **“K1 Max”** from the printer list.
4. OrcaSlicer will **automatically preload Creality filament profiles**, so common materials like PLA, PETG, and ABS are ready to go.
5. Follow [this excellent guide](https://guilouz.github.io/Creality-Helper-Script-Wiki/slicers/orcaslicer/) to:
   - Import the custom K1 Max build plate
   - Load optimized printer and filament config files
   - Copy/paste custom **start and end G-code** for best printing results

It’s a clean, fast setup that gets you printing with confidence.

## 🖼️ OrcaSlicer Setup – Step-by-Step Screenshots

To make things easier, I’ve documented every step of my OrcaSlicer setup with screenshots.

These visual guides are especially helpful if you’re just starting out.

You can follow along right here:

### ORCA Slicer - Setup Screens (Captured on 05-04-2025)

![Step 1](/assets/img/posts/steps-orca_slicer___05_04_2025/step-1.png)
![Step 3](/assets/img/posts/steps-orca_slicer___05_04_2025/step-18.webp)
![Step 4](/assets/img/posts/steps-orca_slicer___05_04_2025/step-19.webp)
![Step 5](/assets/img/posts/steps-orca_slicer___05_04_2025/step-35.webp)


## 🔍 Finding 3D Models

You can find STL files on platforms like:
- [Thingiverse](https://www.thingiverse.com/)
- [Printables](https://www.printables.com/)

For this video, I demo a [**Goku figurine**](https://www.printables.com/model/1233340-2025-hegehog-goku-style-fdm-supportless/files) and previewed a rackmount print for an [**HP ProDesk 600 G4 Mini**](https://www.printables.com/model/585091-10-inch-rackmount-for-mini-hp-prodesk-elitedesk-g1).

## 🖨️ Demo Print

As a warm-up, I printed a small Goku figure in about 30 minutes. The print quality was excellent, with smooth lines and great detail for such a fast job.

## 📌 What’s Next?

I’ll be printing more rack-mount accessories, tools, and enclosures to level up the homelab. If you're into 3D printing and IT tinkering, make sure to follow along!

Stay tuned,  
**Marc — Mylemans Online**
