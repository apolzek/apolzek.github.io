---
layout: post
title: 🛠️ SRE Kit for the End of the World
description: Chaos is Inevitable
summary: Chaos is Inevitable
tags: tools sre toolbox linux
minute: 5
---

## 🛠️ SRE Kit for the End of the World

| **Tool**        | **Description**                                                                                                                                             |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ping**        | Sends ICMP echo requests to a network host to test connectivity and latency. Useful for checking if a host is reachable.                                    |
| **traceroute**  | Traces the path packets take to a destination, identifying network hops and where delays or packet losses occur.                                            |
| **netstat**     | Displays network connections, routing tables, and interface statistics. Helpful for diagnosing network issues and checking active connections.              |
| **ss**          | A modern alternative to `netstat`, used for displaying more detailed socket and network connection information.                                             |
| **tcpdump**     | Captures network traffic for analysis. Useful for diagnosing low-level network issues and packet inspection.                                                |
| **dig**         | Queries DNS servers for domain information, such as IP addresses. Helpful for diagnosing DNS resolution issues.                                             |
| **nslookup**    | Similar to `dig`, used for querying DNS information. Useful for simple DNS queries and debugging domain resolution issues.                                  |
| **top**         | Displays real-time information about system processes, CPU, and memory usage. Useful for identifying resource-hungry processes.                             |
| **htop**        | An improved version of `top` with an interactive, user-friendly interface. Useful for visualizing system resource usage.                                    |
| **iostat**      | Reports CPU and I/O statistics for devices. Useful for diagnosing disk I/O performance issues.                                                              |
| **vmstat**      | Reports virtual memory statistics, including processes, memory, paging, and CPU usage. Useful for spotting memory bottlenecks.                              |
| **df**          | Displays disk space usage for file systems. Useful for checking if any file system is running out of space.                                                 |
| **du**          | Summarizes disk usage of files and directories. Useful for identifying large files or directories consuming disk space.                                     |
| **free**        | Shows the amount of free and used memory in the system. Useful for diagnosing memory availability issues.                                                   |
| **lsof**        | Lists open files and network connections. Useful for identifying which processes have specific files or sockets open.                                       |
| **strace**      | Traces system calls made by a process. Useful for debugging issues where a program is failing due to system calls.                                          |
| **dstat**       | Combines system resource statistics in real-time (disk, network, CPU, memory). Useful for holistic system performance monitoring.                           |
| **systemctl**   | Manages system services on Linux. Useful for starting, stopping, or checking the status of services and troubleshooting service issues.                     |
| **journalctl**  | Queries and displays system logs from `systemd`. Useful for troubleshooting service issues, crashes, and other system events.                               |
| **ps**          | Lists running processes. Useful for investigating which processes are running, hung, or consuming too many resources.                                       |
| **grep**        | Searches for patterns within text. Useful for filtering logs or command output for specific keywords or patterns.                                           |
| **awk**         | A powerful text processing tool used for extracting and transforming data from files or input streams.                                                      |
| **sed**         | Stream editor for filtering and transforming text. Often used to edit configuration files or command outputs in scripts.                                    |
| **curl**        | Transfers data to or from a server using various protocols (HTTP, FTP). Useful for testing API endpoints or downloading files.                              |
| **wget**        | Retrieves files from web servers. Can be used for downloading files or mirroring websites.                                                                  |
| **ip**          | Configures network interfaces and displays network configuration. Replaces older `ifconfig` for advanced network diagnostics.                               |
| **hostnamectl** | Controls and configures system hostname and related settings. Useful for managing the system identity over the network.                                     |
| **uptime**      | Displays how long the system has been running along with the system load average. Useful for diagnosing system stability issues.                            |
| **nc (netcat)** | A versatile networking tool for reading, writing, and redirecting data over TCP/IP networks. Useful for debugging connectivity issues.                      |
| **arp**         | Displays or manipulates the ARP (Address Resolution Protocol) table. Useful for diagnosing issues with IP to MAC address resolution.                        |
| **iptraf-ng**   | A real-time network monitoring utility that provides detailed statistics about network traffic. Useful for diagnosing traffic issues.                       |
| **iftop**       | Displays bandwidth usage on an interface by host. Useful for identifying bandwidth-intensive connections.                                                   |
| **mtr**         | Combines the functionality of `ping` and `traceroute` in a single tool, continuously analyzing the network route. Useful for long-term network diagnostics. |
| **whois**       | Queries the WHOIS database for domain information such as ownership, expiration, and registrar data. Useful for domain-related troubleshooting.             |
| **sar**         | Collects, reports, and saves system activity information, including CPU, memory, I/O, and network statistics. Useful for long-term performance analysis.    |
| **perf**        | Performance analysis tool for Linux that measures CPU and system performance metrics. Useful for in-depth performance troubleshooting.                      |
| **nmap**        | A network scanning tool that discovers devices and services on a network. Useful for security audits and network diagnostics.                               |
| **ipmitool**    | Allows management and monitoring of hardware devices using IPMI. Useful for hardware troubleshooting and server health monitoring.                          |
| **sshd**        | Secure Shell (SSH) daemon for remote system management. Useful for securely accessing systems to troubleshoot remotely.                                     |
| **rkhunter**    | Scans for rootkits and security vulnerabilities. Useful for identifying security breaches or malware.                                                       |
| **rsync**       | Efficiently synchronizes files between systems over a network. Useful for backups, data migration, or troubleshooting file transfer issues.                 |
| **ethtool**     | Displays and modifies network interface card (NIC) settings. Useful for diagnosing or tuning network performance issues at the hardware level.              |

