---
title: Calculate a Network Subnet using Python!
description: Python script using the ipaddress module that reads subnets from a CSV and writes the first and last usable IP of each. Written for 100 subnets at once.
date: '2023-11-09 08:00:00'
categories: [Scripts]
tags: [script, python, automation]
image: {path: /assets/img/posts/covers/python-ipsubnettoiprange.jpg, alt: Calculate a Network Subnet using Python!}
---

# Calculate a Network Subnet using Python!

Subnetting is an essential skill for network administrators and engineers. It involves dividing a larger IP address space into smaller, more manageable subnetworks. Recently, I had to calculate 100 different subnets, and to make my life easier, I turned to Python for automation. In this blog post, I'll share the Python script I used to simplify this task.

## The Challenge

Calculating subnets manually can be time-consuming and error-prone, especially when dealing with a large number of subnets. To streamline the process, I wrote a Python script that would generate the subnet details for me.

## Python to the Rescue

I used Python due to its simplicity and the availability of libraries that can handle IP address manipulation. In this script, we'll make use of the `ipaddress` module, which is part of the Python standard library and provides robust support for working with IP addresses and networks.

Save the code for example as **subnetcalculate.py** to **c:\temp**

```python
import csv
import ipaddress

# Function to calculate start and end IPs for a subnet
def calculate_start_end_ips(ip_subnet):
    try:
        network = ipaddress.ip_network(ip_subnet, strict=False)
        start_ip = str(network.network_address + 1)
        end_ip = str(network.broadcast_address - 1)
        return start_ip, end_ip
    except ValueError:
        return "Invalid Subnet", "Invalid Subnet"

# Input and output file paths
input_file = "c:\\temp\\input.csv"
output_file = "c:\\temp\\output.csv"

# Read the input CSV file and write the results to the output CSV file
with open(input_file, 'r') as infile, open(output_file, 'w', newline='') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)

    for row in reader:
        if len(row) < 1:
            continue
        ip_subnet = row[0]
        start_ip, end_ip = calculate_start_end_ips(ip_subnet)
        writer.writerow([ip_subnet, start_ip, end_ip])

print("Conversion complete. Results saved to", output_file)

```

In this script, we first specify the base network and subnet mask. By default, it calculates subnets excluding the network and broadcast addresses. However, if you need to include the network and broadcast addresses in your calculations, you can modify the script as follows:

```
        start_ip = str(network.network_address + 1)
        end_ip = str(network.broadcast_address - 1)
```
to:

```
        start_ip = str(network.network_address)
        end_ip = str(network.broadcast_address)
```

The contents of the input.csv file were as follows:

```
10.33.62.129/255.255.255.192
10.33.3.1/255.255.255.0
10.33.62.65/255.255.255.224
```

The expected output was in the following format:

```
10.33.62.129/255.255.255.192,10.33.62.129,10.33.62.190
10.33.3.1/255.255.255.0,10.33.3.1,10.33.3.254
10.33.62.65/255.255.255.224,10.33.62.65,10.33.62.94
```

This is an example of how the data in the input.csv file was transformed into the desired output format.


## Running the Script

Downloading Python is a straightforward process. You can obtain the latest version from the official [Python Downloads](https://www.python.org/downloads/) page.

Once you've downloaded the Python installer, the installation process is made easy with a user-friendly wizard. If you prefer step-by-step guidance, you can refer to the official documentation on using Python on Windows: [Using Python on Windows](https://docs.python.org/3/using/windows.html).

> **Important:** Make sure to select "Add Python to PATH" during the installation. This option allows you to run Python from the command line without specifying the full path each time.

After you've saved your Python script, you can run it using the following command:

```
python c:\temp\subnetcalculate.py
```
