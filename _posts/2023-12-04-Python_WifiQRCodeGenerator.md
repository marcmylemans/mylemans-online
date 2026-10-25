---
title: Wi-Fi QR Code Generator
description: Python script that turns a Wi-Fi SSID and password into a scannable QR code PNG with the qrcode library. Source and a compiled executable are on GitHub.
date: '2023-12-04 08:00:00'
categories: [Scripts]
tags: [python, scripts]
image: {path: /assets/img/posts/covers/python-wifiqrcodegenerator.jpg, alt: Wi-Fi QR Code Generator}
---

# Wi-Fi QR Code Generator

## Overview

This script generates a QR code for Wi-Fi credentials, including SSID and password, making it easy to share Wi-Fi access information. The generated QR code can be scanned by a mobile device to quickly connect to the Wi-Fi network.

[Source:](https://github.com/marcmylemans/Wifi-QR-Code-Generator/tree/main)

## Requirements

- Python
- qrcode library

## Usage

1. **Run the Script:**

   Execute the script by running the following command in the terminal:

   ```bash
   python generate_wifi_qrcode.py
   ```


2. **Follow the Prompts:**
The script will prompt you to enter the Wi-Fi SSID, password (optional), and the path to save the generated QR code. Press Enter if you want to skip providing a password.


3. **QR Code Generation:**

The script will generate a QR code based on the entered information and save it as a PNG file in the specified directory.


## Source Code
The source code for this script can be found in the file named generate_wifi_qrcode.py. Feel free to explore and modify the script according to your needs.

## Compiled Executable
An executable version of the script is available in the 'dist' folder. You can run it directly without requiring a Python interpreter.




Feel free to contribute, report issues, or suggest improvements!