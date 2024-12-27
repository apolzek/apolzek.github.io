---
layout: post
title: Let's talk about caching
description: Tools, Techniques, and Best Practices
summary: Tools, Techniques, and Best Practices
tags: aws redis elasticache caching
minute: 10
---

Caching is the process of storing frequently accessed data in a faster storage layer to improve performance and reduce the load on slower underlying systems. Its goal is simple: make things faster and more efficient. In theory, caching seems straightforward—just save the data and retrieve it when needed. In practice, however, it’s anything but simple. Issues like cache invalidation, data consistency, and scaling in distributed systems can quickly turn an elegant solution into a source of complex bugs and performance headaches.

| Term                   | Description                                                                                                                      |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **System of Record**   | The permanent storage where data is stored, typically a database. Also known as the source-of-truth system.                      |
| **Cache Hit**          | When the record exists in the cache and is returned as such.                                                                     |
| **Cache Miss**         | When the application queries the cache, but the particular record does not exist in the cache.                                   |
| **Cache Pollution**    | When the cache is filled with values that are not used or queried.                                                               |
| **Cache Eviction**     | The process of removing entries from the cache to free up memory.                                                                |
| **Cache Expiration**   | Time-based removal of cache records as part of the eviction process or cache invalidation, as discussed below.                   |
| **Data Freshness**     | How in-sync the records in the cache are with the underlying system of record.                                                   |
| **Cache Invalidation** | The process of invalidating cache entries that are no longer valid or need to be updated due to changes in the system of record. |

Local caching refers to storing cached data within a single instance or device, typically in the memory of a specific server or application. This approach offers significant speed advantages because data can be accessed directly from local memory, eliminating the need to fetch it from a remote server or database. The implementation of local caches is also relatively simple and doesn’t require complex infrastructure. In addition, local caching results in lower overhead because there is no need for communication between multiple systems to synchronize the cache. It also tends to be more resilient, as the cache is not affected by network issues or failures in other parts of the system. However, local caching also comes with limitations. It does not scale well for large, distributed systems where multiple instances of the application are running. Each instance of the application has its own isolated cache, meaning that data must be duplicated across instances. This leads to inefficiencies and can result in data inconsistencies when different instances hold outdated or conflicting information. Additionally, the capacity of a local cache is constrained by the memory available on the individual instance, which can limit its effectiveness in environments with large datasets.

In contrast, distributed caching involves sharing a single cache across multiple instances of an application, often spread out over a network. This approach is typically implemented using caching solutions such as Redis, Memcached, or Hazelcast, which allow data to be cached in a centralized or distributed manner. The main advantage of distributed caching is its scalability. As the application grows, more cache nodes can be added to the system, allowing it to handle larger volumes of data and provide consistent access across all instances. With a distributed cache, all application instances can access and modify the same cached data, ensuring better data consistency across the system. This centralized management of the cache makes it easier to implement policies for cache invalidation, expiration, and updates. Distributed caches are also more efficient in utilizing resources because the data is spread across multiple machines, improving fault tolerance. However, the downside of distributed caching is that it introduces network latency. Since cache data is stored across multiple servers, accessing the cache involves communication over the network, which can slow down performance compared to local caches. Additionally, distributed caches are more complex to implement and maintain. They require careful handling of network issues, synchronization, and data partitioning. Furthermore, because the system relies on multiple nodes, any failure in the network or cache nodes can impact the entire system’s performance.

## Cache-Aside

The application controls when to read from or write to the database and cache. The cache is only populated when data is read for the first time (lazy loading).

| **Advantages**                                            | **Disadvantages**                                         |
| --------------------------------------------------------- | --------------------------------------------------------- |
| Simple to implement                                       | Higher latency on cache misses due to database retrieval. |
| Full control remains with the application                 | Increased complexity in application logic.                |
| Efficient memory usage as data is cached only when needed | Performance can suffer with frequent cache misses.        |

## Write-Through

Writes are immediately propagated to both the cache and the database in the same transaction, ensuring data consistency.

| **Advantages**                                         | **Disadvantages**                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| Ensures consistency between cache and database         | Transactional complexity due to the need for 2-phase commit logic. |
| Ideal for critical data where consistency is mandatory | Slower writes as data is written to both cache and database.       |
| Reduces the risk of serving stale data                 | Operational complexity in handling failures during updates.        |


## Write-Around

Writes bypass the cache and update the database directly. Data is loaded into the cache only when read, reducing cache pollution.

| **Advantages**                                                | **Disadvantages**                                                                 |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Prevents cache pollution by avoiding frequent writes to cache | Poor performance for frequently accessed records due to initial database fetches. |
| Simple write mechanism                                        | Cache misses increase latency for records not proactively cached.                 |

## Write-Back / Write-Behind

### Description

Writes are made to the cache first and asynchronously propagated to the database, improving write performance.

| **Advantages**                                                         | **Disadvantages**                                                                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Faster writes as only the cache is updated initially                   | Potential for inconsistency between cache and database during the asynchronous update period.        |
| Simplifies application logic if the cache handles asynchronous updates | Risk of errors during the database update phase, requiring additional mechanisms for error handling. |
| Suitable for high write volumes                                        | Not ideal for scenarios requiring immediate data consistency.                                        |

## Read-Through

The caching system (not the application) manages reading data from the cache or fetching from the database when there is a cache miss.

| **Advantages**                                               | **Disadvantages**                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Simplifies application logic as cache handles retrieval      | Latency occurs during cache misses when data is fetched from the database. |
| Efficient for systems where cache logic should be abstracted | Requires complex invalidation mechanisms to handle data updates.           |


| Configuração                 | Modo        | Nodes | Shards | Réplicas por Shard | Total Réplicas |
| ---------------------------- | ----------- | ----- | ------ | ------------------ | -------------- |
| 1 Node, 1 Shard, Sem Réplica | Sem Cluster | 1     | 1      | 0                  | 0              |
| 2 Nodes, 1 Shard, 1 Réplica  | Sem Cluster | 2     | 1      | 1                  | 1              |
| 3 Nodes, 1 Shard, 2 Réplicas | Sem Cluster | 3     | 1      | 2                  | 2              |
| 4 Nodes, 1 Shard, 3 Réplicas | Sem Cluster | 4     | 1      | 3                  | 3              |
| 2 Nodes, 1 Shard, 1 Réplica  | Cluster     | 2     | 1      | 1                  | 1              |
| 4 Nodes, 2 Shards, 1 Réplica | Cluster     | 4     | 2      | 1                  | 2              |
| 6 Nodes, 3 Shards, 1 Réplica | Cluster     | 6     | 3      | 1                  | 3              |
| 8 Nodes, 4 Shards, 1 Réplica | Cluster     | 8     | 4      | 1                  | 4              |


<!-- https://levelup.gitconnected.com/mastering-caching-in-distributed-applications-e7449f4db399 -->