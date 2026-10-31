---
title: "Create a New UniFi Site with the UniFi API"
description: Python script that calls the UniFi controller API to create a new site with two SSIDs and a VLAN per SSID. Fill in your controller URL and credentials.
date: '2023-02-05 08:00:00'
categories: [Scripts]
tags: [python, scripts, unifi]
image: {path: /assets/img/posts/covers/unifiapi-createnewsite.jpg, alt: Create a new Unifi Site Unifi using the API!}
series: UniFi API scripts
series_order: 1
---

Here's a script that creates a new UniFi site in Belgium with two SSIDs and a VLAN for each SSID:

```python
import requests
import json

# Set the base URL and credentials for the UniFi API
base_url = "https://<unifi-controller-hostname>:8443"
username = "<api-username>"
password = "<api-password>"

# Define the new site details
new_site_name = "<new-site-name>"
new_site_details = {
  "desc": "",
  "name": new_site_name,
  "locale": "nl_BE",
  "country": "BE"
}

# Define the SSID details
ssid_list = [
    {"ssid_name": "VLAN 10 SSID", "vlan_id": 10},
    {"ssid_name": "VLAN 20 SSID", "vlan_id": 20}
]

# Log in to the UniFi API
login_url = base_url + "/api/login"
payload = {"username": username, "password": password}
headers = {
  "Content-Type": "application/json"
}

response = requests.post(login_url, headers=headers, data=json.dumps(payload))
if response.status_code != 200:
  print("Login to UniFi API failed.")
  exit()

# Extract the authentication token from the login response
auth_token = response.json()["data"]["token"]
headers["Authorization"] = "Bearer " + auth_token

# Define the API endpoint for creating a site
create_site_url = base_url + "/api/self/sites"

# Make the API call to create the site
response = requests.post(create_site_url, headers=headers, data=json.dumps(new_site_details))
if response.status_code != 200:
  print("Create site API call failed.")
  exit()

# Extract the ID of the created site
created_site_id = response.json()["data"]["_id"]
print("Site", new_site_name, "created successfully with ID:", created_site_id)

# Define the API endpoint for creating a SSID
create_ssid_url = base_url + "/api/s/" + new_site_name + "/rest/wlanconf"

# Loop through each SSID in the list and create it
for ssid in ssid_list:
  # Define the payload for creating the SSID
  create_ssid_payload = {
    "name": ssid["ssid_name"],
    "vlan_id": ssid["vlan_id"],
    "enabled": True,
    "is_guest": False
  }

  # Make the API call to create the SSID
  response = requests.post(create_ssid_url, headers=headers, data=json.dumps(create_ssid_payload))
  if response.status_code != 200:
    print("Create SSID API call failed for SSID", ssid["ssid_name"])
    continue

  # Extract the ID of the created SSID
  created_ssid_id = response.json()["data

```

You need to replace "unifi-controller-hostname", "api-username", "api-password", and "new-site-name" with the appropriate values for your UniFi controller. 
The new-site-name variable should be set to the name of the UniFi site where you want to create the VLANs. The vlan_list variable should be a list of dictionaries, where each dictionary contains the ssid_name and vlan_id.
