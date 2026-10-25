---
title: Secure Self-Service AD Password Reset with Least-Privilege Delegation
description: 'Let helpdesk staff reset AD passwords without admin rights: a delegated svc_passwordreset account, a Password Resetters group, LDAPS and a small Flask app.'
date: '2025-07-09'
categories: [Windows Server]
tags: [active directory, security, python, flask, it operations]
image: {path: /assets/img/posts/covers/secureselfserviceadpasswordreset.jpg, alt: Secure Self-Service AD Password Reset with Least-Privilege Delegation}
---

Active Directory password resets are a frequent support request in organizations, but granting broad admin rights to handle them can create serious security risks. In this post, I'll walk you through building a **web-based password reset tool** that empowers team leads, helpdesk staff, or office managers to securely reset user passwords—**using only the minimum required Active Directory privileges**.

---

## Why Use a Service Account and Delegated Access?

**Never use full Domain Admin rights for everyday password resets!**  
With a properly scoped service account and delegated permissions, you can:
- Minimize risk of credential exposure
- Apply the principle of least privilege
- Reduce audit and compliance overhead

---

## Step 1: Create a Secure Service Account

1. **Open Active Directory Users & Computers (ADUC).**
2. **Create a new user** in a dedicated OU (e.g. `OU=Service Accounts,DC=yourdomain,DC=local`):
   - Name: `svc_passwordreset`
   - Use a **random, complex password** (generate one with your password manager).
   - **Uncheck** "User must change password at next logon."
   - **Check** "Password never expires" (recommended for service accounts).
   - Do **not** add this account to any admin groups.
3. (Optional) **Deny interactive logon** by using Group Policy:
   - Set `Deny log on locally` and `Deny log on through Remote Desktop Services` for this account.

---

## Step 2: Create a Security Group for Delegated Users

1. In ADUC, **create a new global security group** (e.g. `Password Resetters`).
2. Add all team leads, managers, or helpdesk staff who should have password reset privileges.

---

## Step 3: Delegate Password Reset Rights (Least Privilege)

**Delegate only to the OU containing users whose passwords can be reset.**

1. In ADUC, **right-click the user OU** (e.g. `OU=Users,DC=yourdomain,DC=local`) and select **"Delegate Control..."**
2. Click **Next**.
3. Click **Add** and select your `svc_passwordreset` service account, then **Next**.
4. **Check "Reset user passwords and force password change at next logon"** and click **Next**, then **Finish**.
5. (Optional) **Verify the delegated right:**
   - Right-click the OU > Properties > Security > Advanced.
   - Confirm the service account only has "Reset password"—not full control.

---

## Step 4: (Optional) Enable LDAPS for Secure Password Changes

- **LDAPS (LDAP over SSL, port 636) is required for password resets.**
- Ensure your Domain Controller has a valid SSL certificate (can be internal CA or self-signed).
- The server running your password reset tool must trust this certificate.

[See Microsoft's LDAPS setup guide.](https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/enable-ldap-over-ssl-third-party-certification-authority)

---

## Step 5: Set Up and Run the Web App

1. **Clone the repository** and install dependencies:
    ```sh
    git clone https://github.com/YourUsername/ad-password-reset.git
    cd ad-password-reset
    pip install flask ldap3
    ```

2. **Edit `config.ini`:**
    ```ini
    [ad]
    server = ldaps://yourdc.domain.local
    domain = YOURDOMAIN
    user_ou = OU=Users,DC=yourdomain,DC=local
    reset_group = Password Resetters
    new_password = YourStrongDefault!

    [service_account]
    username = svc_passwordreset
    password = YourSuperSecretPassword
    ```

3. **Run the app:**
    ```sh
    python app.py
    ```
4. **Log in using a member of the `Password Resetters` group** to manage password resets securely.

---

## Security Best Practices

- **Do not reuse the service account for other applications.**
- Regularly review group membership and OU permissions.
- Change the service account password periodically and update your config.
- Store audit logs securely and rotate as needed.
- Limit network access to the web app for extra security.

---

## Conclusion

By combining proper Active Directory delegation, a service account with only the permissions it needs, and a custom web app, you can give business teams and support staff a secure, auditable way to reset passwords—**without ever giving them admin rights or exposing unnecessary risk**.


---

Happy (and secure) password resetting!
