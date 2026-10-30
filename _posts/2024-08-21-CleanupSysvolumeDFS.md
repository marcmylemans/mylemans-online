---
title: 'Reclaim Space on DFSR: Clean Up Conflict and Deleted Files'
description: 'Reclaim disk space on a DFSR file server: lower the Conflict and Deleted quota and empty the ConflictAndDeleted folder with WMIC cleanupconflictdirectory.'
date: '2024-08-21 08:00:00'
categories: [Windows Server]
tags: [dfs, dfsr, file server, storage management, windows server, disk cleanup, conflictanddeleted, system volume information, wmi, it troubleshooting, server optimization, data storage]
image: {path: /assets/img/posts/covers/cleanupsysvolumedfs.jpg, alt: Reclaiming Storage by Cleaning Up DFS Cache and Conflict/Deleted Files}
---

Recently, I encountered a disk space issue on a file server where the **System Volume Information** folder was occupying a significant amount of space due to DFS (Distributed File System) caching. During the initial migration to the new file server, a large cache size had been set for DFS. However, now that the files are more static, such a large cache is no longer necessary, but DFS continues to reserve this space.

To help others reclaim this lost storage, here's a streamlined guide on how to clean up DFS cache, specifically targeting the **ConflictAndDeleted** folder, which can accumulate excessive data. 

## Steps to Clean Up the ConflictAndDeleted Folder

In my case, I needed to lower the **Conflict and Deleted Quota** first. Here is a screenshot within the **DFS Management Interface**. Right-click the member, select properties, and go to the **Advanced Tab**:

![DFS Member - Advanced Properties Tab](/assets/img/posts/250a7165.png)

### Using WMI for a Quick Cleanup

Instead of going through the more disruptive process of lowering the quota and restarting the DFS services, you can clean up the **ConflictAndDeleted** folder quickly using **WMI**. Here’s how:

1. **Open Command Prompt as Administrator**  
   On your DFSR server, open a Command Prompt with administrator privileges.

2. **Obtain the Replicated Folder GUID**  
   Run the following command to get the GUID of the replicated folder:

```
WMIC.EXE /namespace:\\root\microsoftdfs path dfsrreplicatedfolderconfig get replicatedfolderguid,replicatedfoldername
```

![GUID of the replicated folder](/assets/img/posts/4dea6d33ea22.png)

  
Clean the ConflictAndDeleted Folder
Now, run the following command, replacing <RF GUID> with the actual GUID of your replicated folder:

```
WMIC.EXE /namespace:\\root\microsoftdfs path dfsrreplicatedfolderinfo where "replicatedfolderguid='<RF GUID>'" call cleanupconflictdirectory
```

This process will empty the **ConflictAndDeleted** folder, and the ConflictAndDeletedManifest.xml file will be removed, freeing up disk space.

Example:

![Clean the ConflictAndDeleted Folder](/assets/img/posts/d01419abf6f4.png)

```
WMIC.EXE /namespace:\\root\microsoftdfs path dfsrreplicatedfolderinfo where "replicatedfolderguid='08D61A29-D8C0-4559-BF43-FAC137DAD46C'" call cleanupconflictdirectory
```

By following these methods, you can effectively reclaim the storage being consumed by outdated DFS cache and deleted files. If your file server is static, this can be a significant space saver.

