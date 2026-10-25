---
title: Windows Hello for Business - Cloud Kerberos trust deployment
description: 'Deploy Windows Hello for Business cloud Kerberos trust: create the Azure AD Kerberos server object, enable WHfB in Intune and push the cloud trust OMA-URI.'
date: '2023-03-26 09:00:00'
categories: [Entra ID & Intune]
tags: [server 2022, azure, hybrid, windows hello for business, tutorial, youtube, cloud kerberos]
image: {path: /assets/img/posts/FW3TF0zFWd0.jpg, alt: Windows Hello for Business - Cloud Kerberos trust deployment}
---

In this video, we are going to deploy Cloud Kerberos Trust.
We can use Windows hello and Kerberos tokens to access our on-premise resources like file shares.

{% youtube "https://youtu.be/FW3TF0zFWd0" %}


[Source](https://learn.microsoft.com/en-us/azure/active-directory/authentication/howto-authentication-passwordless-security-key-on-premises?WT.mc_id=ES-MVP-5004117#install-the-azure-ad-kerberos-powershell-module)

```powershell
# First, ensure TLS 1.2 for PowerShell gallery access.
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

# Install the Azure AD Kerberos PowerShell Module.
Install-Module -Name AzureADHybridAuthenticationManagement -AllowClobber
```


```powershell
# Specify the on-premises Active Directory domain. A new Azure AD
# Kerberos Server object will be created in this Active Directory domain.
$domain = $env:USERDNSDOMAIN

# Enter a UPN of an Azure Active Directory global administrator
$userPrincipalName = "administrator@contoso.onmicrosoft.com"

# Enter a domain administrator username and password.
$domainCred = Get-Credential

# Create the new Azure AD Kerberos Server object in Active Directory
# and then publish it to Azure Active Directory.
# Open an interactive sign-in prompt with given username to access the Azure AD.
Set-AzureADKerberosServer -Domain $domain -UserPrincipalName $userPrincipalName -DomainCredential $domainCred
```

When Azure AD Kerberos is enabled in an Active Directory domain, an Azure AD Kerberos server object is created in the domain. This object:
<img src="https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/images/azuread-kerberos-object.png" alt="azuread-kerberos-object">


# Configure Windows Hello for Business policy 
[source](https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/hello-hybrid-cloud-kerberos-trust-provision?tabs=intune#configure-windows-hello-for-business-policy)

## Verify the tenant-wide policy
To check the Windows Hello for Business policy applied at enrollment time:

1) Sign in to the Microsoft Intune admin center.

2) Select Devices > Windows > Windows Enrollment.

3) Select Windows Hello for Business.

4) Verify the status of Configure Windows Hello for Business and any settings that may be configured.

<img src="https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/images/whfb-intune-disable.png" alt="whfb-intune-disable">


> If the tenant-wide policy is enabled and configured to your needs, you can skip to Configure cloud Kerberos trust policy. Otherwise, follow the instructions below to create a policy using an account protection policy.
{: .prompt-tip }

## Enable Windows Hello for Business
To configure Windows Hello for Business using an account protection policy:

1) Sign in to the Microsoft Intune admin center.

2) Select Endpoint security > Account protection.

3) Select + Create Policy.

4) For Platform, select Windows 10 and later and for Profile select Account protection.

5) Select Create.

6) Specify a Name and, optionally, a Description > Next.

7) Under Block Windows Hello for Business, select Disabled and multiple policies become available.

These policies are optional to configure, but it's recommended to configure Enable to use a Trusted Platform Module (TPM) to Yes.
For more information about these policies, see MDM policy settings for Windows Hello for Business.

8) Under Enable to certificate for on-premises resources, select Disabled and multiple policies become available.

9) Select Next.

10) Optionally, add scope tags and select Next.

11) Assign the policy to a security group that contains as members the devices or users that you want to configure > Next.
Review the policy configuration and select Create.
 Tip

If you want to enforce the use of digits for your Windows Hello for Business PIN, use the settings catalog and choose Digits or Digits (User) instead of using the Account protection template.

<img src="https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/images/whfb-intune-account-protection-enable.png" alt="whfb-intune-account-protection-enable">

Assign the policy to a security group that contains as members the devices or users that you want to configure.

## Configure the cloud Kerberos trust policy
The cloud Kerberos trust policy can be configured using a custom template, and it's configured separately from enabling Windows Hello for Business.

To configure the cloud Kerberos trust policy:

1) Sign in to the Microsoft Intune admin center.

2) Select Devices > Windows > Configuration Profiles > Create profile.

3) For Profile Type, select Templates and select the Custom Template.

4) Name the profile with a familiar name, for example, "Windows Hello for Business cloud Kerberos trust".

5) In Configuration Settings, add a new configuration with the following settings:

**Name:** Windows Hello for Business cloud Kerberos trust or another familiar name

**Description (optional):** Enable Windows Hello for Business cloud Kerberos trust for sign-in and on-premises SSO

**OMA-URI:** ./Device/Vendor/MSFT/PassportForWork/***tenant ID***/Policies/UseCloudTrustForOnPremAuth

**Data type:** Boolean

**Value:** True



>  Important:
> Tenant ID in the OMA-URI must be replaced with the tenant ID for your Azure AD tenant. See How to find your Azure AD tenant ID for instructions on looking up your tenant ID.
{: .prompt-warning }

<img src="https://learn.microsoft.com/en-us/windows/security/identity-protection/hello-for-business/images/hello-cloud-trust-intune-large.png" alt="hello-cloud-trust-intune-large">

6) Assign the policy to a security group that contains as members the devices or users that you want to configure.
