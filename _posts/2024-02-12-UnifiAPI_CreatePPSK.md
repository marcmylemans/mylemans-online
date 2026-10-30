---
title: Create PPSK in bulk with the Unifi API!
description: Python script that bulk-creates Private Pre-Shared Keys (PPSK) on a UniFi controller through its API, generating random keys from a CSV list.
date: '2024-02-12 08:00:00'
categories: [Scripts]
tags: [python, scripts, unifi]
image: {path: /assets/img/posts/covers/unifiapi-createppsk.jpg, alt: Create PPSK in bulk with the Unifi API!}
series: UniFi API scripts
series_order: 3
---

Here is an example of Python code that allows you to create multiple VLAN:

```python
import requests
import csv
import random
import string

# Function to generate a random PPSK key
def generate_ppsk_key(length=12):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# UniFi Controller settings
controller_url = 'https://your_unifi_controller_address'
username = 'your_username'
password = 'your_password'
site = 'default'

# Endpoint URLs
login_url = f'{controller_url}/api/auth/login'
ppsk_user_url = f'{controller_url}/api/s/{site}/rest/wlanconf'  # Adjust if necessary

# VLAN IDs to create PPSK keys for
vlan_ids = [101, 102, 103]

# CSV file to populate
csv_filename = '/mnt/data/ppsk_keys.csv'

# Start a session
session = requests.Session()

# Login to the UniFi Controller
login_response = session.post(login_url, json={'username': username, 'password': password})
login_response.raise_for_status()

# Open a CSV file to write the PPSK keys
with open(csv_filename, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(['VLAN ID', 'PPSK Key'])

    for vlan_id in vlan_ids:
        ppsk_key = generate_ppsk_key()

        # Assuming the API and data model allows setting VLAN ID directly or through user group, adjust accordingly
        ppsk_user_data = {
            # Add necessary data here, including the generated PPSK key and associated VLAN ID
            # This is a placeholder; the actual API payload will depend on UniFi's API structure
            "name": f"User_VLAN_{vlan_id}",
            "vlan": vlan_id,
            "ppsk_key": ppsk_key  # This field and method of assignment are hypothetical and need to be adjusted
        }

        # Create the PPSK user (this part of the script is hypothetical and needs to be adjusted according to the actual API)
        ppsk_user_response = session.post(ppsk_user_url, json=ppsk_user_data)
        ppsk_user_response.raise_for_status()

        # Write the VLAN ID and PPSK key to the CSV file
        writer.writerow([vlan_id, ppsk_key])

# Logout
logout_url = f'{controller_url}/api/auth/logout'
session.post(logout_url)

print(f"PPSK keys for VLANs 101, 102, and 103 have been generated and saved to {csv_filename}")

```

You need to replace "unifi-controller-hostname", "api-username", "api-password", and "site-name" with the appropriate values for your UniFi controller. 
The site_name variable should be set to the name of the UniFi site where you want to create the VLANs. The vlan_list variable should be a list of dictionaries, where each dictionary contains the vlan_id and vlan_name