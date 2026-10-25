---
title: URL QR Code Generator
description: Python script that generates QR codes from a single URL or a CSV of URLs and saves them as timestamped images. Source and a compiled executable on GitHub.
date: '2023-12-04 08:00:00'
categories: [Scripts]
tags: [python, scripts]
image: {path: /assets/img/posts/covers/python-urlqrcodegenerator.jpg, alt: URL QR Code Generator}
---

# QR Code Generator Script

This script allows you to generate QR codes from either a single URL or a CSV file containing multiple URLs.

[Source:](https://github.com/marcmylemans/URL-QR-Code-Generator)

# Usage

Run the script and follow the prompts to provide input and output information:

```bash
python script_name.py
```

## Options

**Single URL:**

Provide a single URL to generate a QR code.

**CSV File:**

Provide the location of a CSV file containing URLs.

**Output Directory:**

Enter the output directory for QR code images. Defaults to qrcodes.

# Output

For a single URL, the generated QR code will be saved in the output directory with a filename containing the URL and a timestamp.

For a CSV file, each URL will have a corresponding QR code saved in the output directory with filenames based on the URL and timestamp.

# Example

```bash
python script_name.py
```
Follow the prompts to enter the input (URL or CSV file) and the output directory.

# Source Code
The source code for this script can be found in the file named url_to_qr.py. Feel free to explore and modify the script according to your needs.

# Compiled Executable
An executable version of the script is available in the 'dist' folder. You can run it directly without requiring a Python interpreter.

# License

This script is licensed under the MIT License - see the LICENSE.md file for details.