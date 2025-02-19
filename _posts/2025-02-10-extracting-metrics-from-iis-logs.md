---
layout: post
title: Extracting metrics from IIS logs(iis_log_exporter)
description:
summary:
tags: windows metrics exporter observability prometheus
minute: 6
---

**saving your time**: *How I built an IIS metrics exporter for a RED metrics dashboard*

If you're from the new generation and have never worked with IIS, let me introduce you to this **legendary web server**. It’s a secure, easy-to-manage, modular, and extensible platform for hosting websites, services, and applications (by Microsoft). That said… IIS isn’t exactly the hottest thing around these days and there are reasons for that 💥. But, as the old saying goes: **you don’t have to like it, but you should at least learn to live with it**!! 😆

![indicators](/assets/gif/indicators.webp) 

My journey began when I was tasked with understanding the behavior of an IIS server, making it observable, and setting up alarms for potential issues. The first step was to install [windows_exporter](https://github.com/prometheus-community/windows_exporter), which includes the [IIS collector](https://github.com/prometheus-community/windows_exporter/blob/master/docs/collector.iis.md). While it provided many valuable metrics about IIS, it wasn’t exactly what I needed. What I was really looking for were RED metrics, more focused on HTTP responses from IIS. I researched some repositories but couldn’t find anything satisfactory. So, I decided to build my own exporter to gather these metrics.

I spent some time exploring IIS and realized that the only data source that truly met my needs was the **logs**. Although it wasn’t the most elegant solution, using them as a data source solved my problem and, of course, created other challenges. With that in mind, I developed a Python exporter that reads IIS log files from the corresponding folder, always pointing to and processing the logs of the day. The result is still in validation, but I’d like to share what I have so far.

![iis](/assets/img/iis-dashboard-v2.png)

**repository**: [https://github.com/apolzek/iis_log_exporter](https://github.com/apolzek/iis_log_exporter)

The log files contained the request path, the method used, the status code, and the response time. These were exactly the pieces of information I needed. Using this data, I identified key metrics.

```
iis_requests_duration_seconds = Histogram(
    "iis_requests_duration_seconds", "Duration of HTTP requests in IIS",
    ["method", "path"]
)

iis_exceptions_total = Counter(
    "iis_exceptions_total", "Total number of HTTP requests with 5xx status codes",
    ["method", "path", "status_code"]
)

iis_requests_total = Counter(
    "iis_requests_total", "Total number of HTTP requests from IIS",
    ["method", "path", "status_code"]
)
```

💬 From the beginning, my goal was never to **replace** the IIS module of **windows_exporter**, but rather to complement it with more detailed HTTP metrics for hosted applications. With this in mind, the final outcome I aim for is a 📊 dashboard that integrates the metrics from windows_exporter with those from iis_log_exporter. The main challenges I faced while building this exporter were, first, that I couldn’t keep re-reading the log file, as it could grow indefinitely and cause metric inconsistencies. Second, I always needed to read only the log files for the current day. To solve the first issue, I implemented an **offset** system where I store the last scraped line in a file. For the second, I used the file’s creation date from the OS while relying on its filename within the folder.

I know these approaches have potential failure points someone could manually add logs to the file, IIS configurations might generate logs missing key data that break the regex logic, and so on. That said, I recognize that this solution is still very tailored to my specific use case, but I hope it can evolve to support other legacy IIS systems out there.

I hope that by using it together with the IIS collector, you’ll achieve great results and gain good observability for your IIS. **Good luck to us **! Below is the conventional solution I was already using 👇

![iis_collector](/assets/img/iis_collector.png) 
[collector.iis](https://github.com/prometheus-community/windows_exporter/blob/master/docs/collector.iis.md)

Pull requests are welcome in the exporter's repository !!! bye-bye

<!-- 
https://www.sysgauge.com/ 
-->