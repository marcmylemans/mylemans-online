---
title: Manage Local Admins with Group Policy on Workstations
description: Strip local admins with Group Policy and give admin rights only to the workstation's Managed By user, via item-level targeting and two LDAP queries.
date: '2023-01-02 10:00:00'
categories: [Windows Server]
tags: [server 2022, ad, gpo, local admins, group policy, admin, tutorial, youtube]
image: {path: /assets/img/posts/FrRasK5DQiY.jpg, alt: Manage Local Admins with Group Policy on Workstations}
---

{% include google-adsense.html %}

In this video we will be managing our Local Admins with Group Policy's.
In the first part i will show you how to delete all die local administrators and only leave the Domain Admins.
In the second part we will be using the Managed By field in Active directory to assign a 'Primary User' to the workstation. With this the 'Primary User' has local admin rights only on that assigned workstation.

{% youtube "https://youtu.be/FrRasK5DQiY" %}


Screenshots + Ldap Query's

![Assign users](/assets/primaryuserlocaladmin/primaryuserlocaladmin_assign.jpg)

![Item Level targeting](/assets/primaryuserlocaladmin/primaryuserlocaladmin_itemlvltargeting.jpg)

![LDAP Query](/assets/primaryuserlocaladmin/primaryuserlocaladmin_itemlvltargeting.jpg)

1st LDAP Query:

```
(&(objectCategory=computer)(objectClass=computer)(name=%COMPUTERNAME%))
```
```
managedby
```
```
PrimaryUser
```

2nd LDAP Query:

```
(&(|(objectClass=group)(objectClass=user))(distinguishedName=%PrimaryUser%))
```
```
sAMAccountName
```
```
PrimaryUser
```
