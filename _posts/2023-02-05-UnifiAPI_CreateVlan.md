---
title: Create a vlan using the Unifi API!
description: Python script that creates multiple VLANs on a UniFi site through the controller API from a list of VLAN IDs and names.
date: '2023-02-05 08:00:00'
categories: [Scripts]
tags: [python, scripts, unifi]
image: {path: /assets/img/posts/covers/unifiapi-createvlan.jpg, alt: Create a vlan using the Unifi API!}
series: UniFi API scripts
series_order: 2
---

Here is an example of Python code that allows you to create multiple VLAN:

```python
import requests
import json

# Set the base URL and credentials for the UniFi API
base_url = "https://<unifi-controller-hostname>:8443"
username = "<api-username>"
password = "<api-password>"
site_name = "<site-name>"

# Define the VLAN details
vlan_list = [
    {"vlan_id": 10, "vlan_name": "VLAN 10"},
    {"vlan_id": 20, "vlan_name": "VLAN 20"},
    {"vlan_id": 30, "vlan_name": "VLAN 30"}
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

# Define the API endpoint for creating a VLAN
create_vlan_url = base_url + "/api/s/" + site_name + "/rest/vlan"

# Loop through each VLAN in the list and create it
for vlan in vlan_list:
  # Define the payload for creating the VLAN
  create_vlan_payload = {
    "name": vlan["vlan_name"],
    "vlan_id": vlan["vlan_id"]
  }

  # Make the API call to create the VLAN
  response = requests.post(create_vlan_url, headers=headers, data=json.dumps(create_vlan_payload))
  if response.status_code != 200:
    print("Create VLAN API call failed for VLAN ID", vlan["vlan_id"])
    continue

  # Extract the ID of the created VLAN
  created_vlan_id = response.json()["data"]["_id"]
  print("VLAN", vlan["vlan_id"], "created successfully with ID:", created_vlan_id)

# Log out from the UniFi API
logout_url = base_url + "/api/logout"
response = requests.post(logout_url, headers=headers)
if response.status_code != 200:
  print("Logout from UniFi API failed.")

```

You need to replace "unifi-controller-hostname", "api-username", "api-password", and "site-name" with the appropriate values for your UniFi controller. 
The site_name variable should be set to the name of the UniFi site where you want to create the VLANs. The vlan_list variable should be a list of dictionaries, where each dictionary contains the vlan_id and vlan_name