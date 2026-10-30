---
title: How to Export and Import Conditional Access Policy's
description: 'Back up and restore Entra Conditional Access policies with PowerShell: export to JSON and import again through the Microsoft.Graph and Graph.Beta modules.'
date: '2024-05-17 08:00:00'
categories: [Entra ID & Intune]
tags: [azure, conditional access, powershell, export, import, tutorial, youtube]
image: {path: /assets/img/posts/covers/export-import-conditionalaccesspolicy.jpg, alt: How to Export and Import Conditional Access Policy's}
---

# Export and Import Azure Conditional Access Policies

This guide provides PowerShell scripts to export and import Azure conditional access policies using Microsoft Graph. The scripts require the `Microsoft.Graph` and `Microsoft.Graph.Beta` modules.

## Explanation

1. **Install Modules Script**: Installs the `Microsoft.Graph` and `Microsoft.Graph.Beta` modules necessary for interacting with Microsoft Graph API.

## Install Modules

First, you'll need to install the necessary PowerShell modules:

```powershell
# Install the Microsoft.Graph module
Install-Module -Name Microsoft.Graph -Scope CurrentUser -Force -AllowClobber

# Install the Microsoft.Graph.Beta module
Install-Module -Name Microsoft.Graph.Beta -Scope CurrentUser -Force -AllowClobber
```

2. **Export Conditional Access Policies Script**:
   - Connects to Microsoft Graph with the necessary scope.
   - Retrieves all conditional access policies.
   - Exports the policies to a JSON file.
     
## Export Conditional Access Policies

Use the following script to export your conditional access policies to a JSON file:

```powershell
<#
    .SYNOPSIS
    Export-CAPolicies.ps1

    .DESCRIPTION
    Export Conditional Access policies to JSON files for backup purposes.

    .LINK
    www.alitajran.com/export-conditional-access-policies/

    .NOTES
    Written by: ALI TAJRAN
    Website:    www.alitajran.com
    LinkedIn:   linkedin.com/in/alitajran

    .CHANGELOG
    V1.00, 11/16/2023 - Initial version
#>

# Connect to Microsoft Graph API
Connect-MgGraph -Scopes 'Policy.Read.All'

# Export path for CA policies
$ExportPath = "C:\temp\"

try {
    # Retrieve all conditional access policies from Microsoft Graph API
    $AllPolicies = Get-MgIdentityConditionalAccessPolicy -All

    if ($AllPolicies.Count -eq 0) {
        Write-Host "There are no CA policies found to export." -ForegroundColor Yellow
    }
    else {
        # Iterate through each policy
        foreach ($Policy in $AllPolicies) {
            try {
                # Get the display name of the policy
                $PolicyName = $Policy.DisplayName
            
                # Convert the policy object to JSON with a depth of 6
                $PolicyJSON = $Policy | ConvertTo-Json -Depth 6
            
                # Write the JSON to a file in the export path
                $PolicyJSON | Out-File "$ExportPath\$PolicyName.json" -Force
            
                # Print a success message for the policy backup
                Write-Host "Successfully backed up CA policy: $($PolicyName)" -ForegroundColor Green
            }
            catch {
                # Print an error message for the policy backup
                Write-Host "Error occurred while backing up CA policy: $($Policy.DisplayName). $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}
catch {
    # Print a generic error message
    Write-Host "Error occurred: $($_.Exception.Message)" -ForegroundColor Red
}
```

3. **Import Conditional Access Policies Script**:
   - Connects to Microsoft Graph with the necessary scope.
   - Reads the JSON file containing the policies.
   - Imports each policy into the Azure environment.
  
## Import Conditional Access Policies

Use the following script to import conditional access policies from a JSON file:

```powershell
<#
    .SYNOPSIS
    Import-CAPolicies.ps1

    .DESCRIPTION
    Import Conditional Access policies from JSON files for restore purposes.

    .LINK
    www.alitajran.com/import-conditional-access-policies/

    .NOTES
    Written by: ALI TAJRAN
    Website:    www.alitajran.com
    LinkedIn:   linkedin.com/in/alitajran

    .CHANGELOG
    V1.00, 11/19/2023 - Initial version
#>

# Connect to Microsoft Graph
Connect-MgGraph -Scopes "Policy.Read.All", "Policy.ReadWrite.ConditionalAccess", "Application.Read.All"

# Define the path to the directory containing your JSON files
$jsonFilesDirectory = "C:\temp\"

# Get all JSON files in the directory
$jsonFiles = Get-ChildItem -Path $jsonFilesDirectory -Filter *.json

# Check if there are no JSON files
if ($jsonFiles.Count -eq 0) {
    Write-Host "No JSON files found in the directory to import." -ForegroundColor Yellow
}
else {
    # Loop through each JSON file
    foreach ($jsonFile in $jsonFiles) {
        try {
            # Read the content of the JSON file and convert it to a PowerShell object
            $policyJson = Get-Content -Path $jsonFile.FullName | ConvertFrom-Json

            # Create a custom object
            $policyObject = [PSCustomObject]@{
                displayName     = $policyJson.displayName
                conditions      = $policyJson.conditions
                grantControls   = $policyJson.grantControls
                sessionControls = $policyJson.sessionControls
                state           = $policyJson.state
            }

            # Convert the custom object to JSON with a depth of 10
            $policyJsonString = $policyObject | ConvertTo-Json -Depth 10

            # Create the Conditional Access policy using the Microsoft Graph API
            $null = New-MgIdentityConditionalAccessPolicy -Body $policyJsonString
        
            # Print a success message
            Write-Host "Policy created successfully: $($policyJson.displayName) " -ForegroundColor Green
        }
        catch {
            # Print an error message if an exception occurs
            Write-Host "An error occurred while creating the policy: $_" -ForegroundColor Red
        }
    }
}
```

By following these steps, you can easily export and import Azure conditional access policies.

## Acknowledgements

This guide is based on the excellent articles by [Ali Tajran](https://www.alitajran.com/about/). For more detailed information, please refer to the original articles:

- [Export Conditional Access Policies](https://www.alitajran.com/export-conditional-access-policies/)
- [Import Conditional Access Policies](https://www.alitajran.com/import-conditional-access-policies/)

