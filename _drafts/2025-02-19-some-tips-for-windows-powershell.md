---
layout: post
title: some tips for windows powershell
description:  A growing collection of windows hacks
summary:
tags: windows powershell script ps1
minute: 8
---


### Transfer Installed Roles and Features from One Windows Server to Another Using PowerShell

```
(Get-WindowsFeature | Where-Object {$_.Installed -eq $true}).Name -join "," | Out-File C:\features-to-install.txt

```

```
Install-WindowsFeature -Name FileAndStorage-Services,File-Services,FS-FileServer,Storage-Services,Web-Server,Web-WebServer,Web-Common-Http,Web-Default-Doc,Web-Dir-Browsing,Web-Http-Errors,Web-Static-Content,Web-Health,Web-Http-Logging,Web-Performance,Web-Stat-Compression,Web-Security,Web-Filtering,Web-App-Dev,Web-Net-Ext45,Web-Asp-Net45,Web-ISAPI-Ext,Web-ISAPI-Filter,Web-Mgmt-Tools,Web-Mgmt-Console,Web-Mgmt-Service,NET-Framework-45-Features,NET-Framework-45-Core,NET-Framework-45-ASPNET,NET-WCF-Services45,NET-WCF-TCP-PortSharing45,Windows-Defender,System-DataArchiver,PowerShellRoot,PowerShell,WoW64-Support,XPS-Viewer
```

### 

```
Test-WSMan
Test-WSMan -ComputerName "RemoteComputerName"
winrm enumerate winrm/config/listener


winrm quickconfig


C:\Users\Public