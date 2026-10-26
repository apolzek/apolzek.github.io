---
title: "Review: storage fundamentals"
slug: "review-storage-fundamentals"
date: '2026-10-26T12:00:00-03:00'
draft: false
description: "A storage review from the disk up to the filesystem: HDD, SSD, NVMe, IOPS, RAID, LVM, ZFS and the filesystems of each operating system, all in informal language with analogies."
tags:
- linux
minute: 38
---

This is the text I wish I had read when I needed to review storage for real, without memorizing loose acronyms. The idea is to climb the whole stack: it starts at the hardware, goes through performance, RAID and LVM, and ends at the filesystems of each operating system. Grab a coffee, because it is a long walk, but I promise every stop makes sense.

## The problem storage solves

RAM is like the desk in your office: quick to reach, but small and, worse, everything on it vanishes when you turn off the lights. Persistent storage is the steel filing cabinet in the corner: slow to open, but it keeps everything even with the building closed. All the engineering in this field revolves around a single dilemma: the faster, the more expensive and smaller; the bigger and cheaper, the slower. There is no free lunch, there is a hierarchy. Registers, cache, RAM, SSD, HDD, tape. Each step trades speed for capacity.

## HDD: the record player

The hard disk is fine mechanics from the last century that insists on working. Picture a vinyl record player: platters spinning (5400, 7200, sometimes 15000 rotations per minute), an arm with a read head floating nanometers above the surface, and the information recorded in concentric magnetic tracks. To read data, the arm needs to move to the right track (seek) and wait for the platter to spin until the sector passes under the head (rotational latency). These two physical movements cost a few milliseconds each.

Milliseconds sound like nothing, but for a processor living in nanoseconds it is an eternity. It is like asking an intern for a document that lives in the basement archive: no matter how fast he reads, the trip dominates the total time.

The most important practical consequence: an HDD is reasonable at sequential reads (the head stays put and the platter parades the data) and terrible at random reads (the head keeps jumping from track to track). A good HDD delivers something like 100 to 200 random operations per second. Keep that number.

## SSD: memory pretending to be a disk

The SSD has no moving parts. It is a set of NAND flash memory chips with a controller in front, everything still, everything silent. If the HDD is the intern going to the basement, the SSD is a whole wall of drawers that open themselves at the same time. Random reads stop being a physical problem and become an electrical one, and electricity is fast.

But the SSD has its quirks, and three are worth knowing:

1. Flash does not overwrite in place. To rewrite a page, the SSD needs to erase a whole block first, and blocks are much bigger than pages. It is like a notebook where you can only erase the entire sheet, never a single line. The controller works around this by writing somewhere else and marking the old spot as garbage, in a process called garbage collection.
2. Flash wears out. Each cell survives a finite number of write cycles. The controller does wear leveling, spreading writes so no cell dies before the others, like a manager rotating employees so nobody burns out. The resulting durability shows up in the spec sheet as endurance, measured in TBW (total terabytes you can write over the drive's life) or DWPD (how many times per day you can fill the disk within warranty). For a desktop it is hard to exhaust; for a database writing nonstop, it is a number you read before buying.
3. The operating system needs to say what was deleted. That is the TRIM command: without it, the SSD thinks everything ever written still matters and garbage collection becomes chaos.

There are cell variations: SLC stores 1 bit per cell (fast, durable, expensive), MLC stores 2, TLC stores 3, QLC stores 4 (cheap, slower, less durable). It is literally putting more people in the same room: more fit, but living together gets worse.

## SSD x HDD: when each one wins

The honest comparison is not "SSD is better". It is "SSD is better per unit of speed, HDD is better per unit of capacity".

The SSD wins at everything involving latency and random access: operating system, databases, virtual machines, compilation, anything interactive. An NVMe SSD delivers hundreds of thousands of operations per second against the hundreds of the HDD. That is a difference of three orders of magnitude, like comparing an email with registered mail.

The HDD wins at cost per terabyte. Backup, archiving, cold media, that dataset you read once a month sequentially. Datacenters keep oceans of lukewarm data on HDD because the price per TB still pays off.

And about reliability: the SSD has no mechanics to fail, but when the controller dies, it tends to die at once and without warning. The HDD often warns first (bad sectors growing, strange noises, SMART complaining). Neither of the two excuses you from backup. Ever.

## Interfaces and buses: the width of the door

A fast wall of drawers is useless behind a narrow door. The interface sets the ceiling:

SATA was made for HDDs and caps everything around 550 MB/s. Putting a modern SSD on SATA is hiring an Olympic athlete to work in a corridor 60 centimeters wide.

NVMe is the protocol designed for flash, talking straight to the PCIe bus. Beyond raw bandwidth (several GB/s), the real gain is in the queues: SATA has one queue of 32 commands; NVMe supports up to 65 thousand queues with 65 thousand commands each. It is the difference between a bakery with a single cashier and a supermarket with a hundred lanes open.

SAS (Serial Attached SCSI) is SATA's corporate cousin: more robust, full duplex, used in servers and storage arrays, and the direct heir of the venerable SCSI, the command set from the 80s that echoes everywhere to this day (the sd in /dev/sda literally comes from SCSI disk).

And here it is worth undoing the classic confusion, separating three things that travel together but are different: the physical connector (the SATA cable, the M.2 slot, the U.2, the PCIe slot), the bus that transports (SATA, SAS, PCIe) and the protocol that talks (AHCI or NVMe). AHCI is the protocol of the SATA era, designed with spinning disks in mind, with its single queue of 32 commands. NVMe is the protocol of the flash era. And the trap lives in the form factor: there are M.2 SSDs that are SATA with AHCI inside and M.2 SSDs that are NVMe over PCIe. Same slot, performance from different worlds, so read the fine print before buying.

To close the map: blocks also travel over the network (Fibre Channel, iSCSI) and files do too (NFS, SMB), but that conversation about SAN, NAS and object storage gets its own section further down.

## Blocks, sectors and LBA

The disk does not know what a file is. It exposes a giant line of numbered sectors from 0 to the end, and the addressing is called LBA (Logical Block Addressing): asking for sector 4800233 is like asking for a mailbox by its number, without knowing or caring what is inside. Everything above (partition, volume, filesystem) is convention built on top of that numbering.

The historical sector size is 512 bytes. Modern disks use physical sectors of 4K (Advanced Format), but many still pretend to be 512 on the outside for compatibility, the so called 512e, for emulated. That double identity creates the alignment trap: if a partition starts in the middle of a physical sector, every 4K write from the filesystem lands straddling two sectors of the disk, which needs to read, modify and write both. Performance collapses and no error shows up anywhere. Modern partitioning tools align at 1 MiB by default exactly so this problem dies, as long as nobody creates a partition by hand with a creative offset.

Filesystems, in turn, work with blocks (typically 4K), which are groups of sectors. When some benchmark talks about block size, that is the read and write unit it is talking about.

## IOPS, throughput and latency: the three measures that matter

Everyone measures storage with three rulers, and confusing them is an endless source of wrong diagnosis:

Latency is how long ONE operation takes. It is the service time of one cashier.

IOPS (input and output operations per second) is how many operations fit in a second. It is how many customers the bank serves per hour.

Throughput (or bandwidth) is how many bytes pass per second. It is how much money circulates in the bank per hour.

And the catch: they relate, but do not substitute each other. A truck full of tapes crossing the country has absurd throughput and a latency of two days. An SSD can have very high IOPS with 4 KB blocks and modest throughput, or the opposite with 1 MB blocks. That is why a benchmark without context is a lie with numbers: always ask the block size, the queue depth and whether the pattern is random or sequential.

### Who devours IOPS

Some applications are hungry for small random operations, and they are the first to suffer when storage is weak:

1. OLTP databases (PostgreSQL, MySQL, Oracle): each transaction does several small reads and writes scattered across the disk, plus the transaction log commit, which demands synchronous writes. It is the customer arriving at the cashier every ten seconds asking for one coin.
2. Virtualization and containers: dozens of operating systems sharing the same disk turn any sequential pattern into pure random. The industry calls it the IO blender: orange and apple juice go in, an indistinguishable smoothie comes out.
3. Mail servers and message queues: thousands of small files created, read and deleted all the time.
4. Search indexes (Elasticsearch, Solr) and metadata in general.
5. VDI, that scenario of hundreds of virtual desktops booting at 9 in the morning at the same time, the famous boot storm.

And who needs throughput rather than IOPS: video streaming, backup, data warehouses reading whole tables, model training reading sequential datasets. For those, HDD in RAID still holds its ground.

## RAID: redundancy for the disk that will fail

First the usual warning: disks fail. It is not "if", it is "when". RAID (Redundant Array of Independent Disks) exists so that the failure of a disk does not become the failure of the service. And the second warning, equally classic: RAID is not backup. RAID protects against a dead disk; it does not protect against `rm` in the wrong directory, ransomware or that UPDATE without a WHERE, because it replicates the damage with the same efficiency it replicates the data.

The levels that matter:

RAID 0 (striping): data is sliced across the disks, like splitting a book between two typists. Doubles performance and capacity, and zeroes the tolerance: any disk that dies takes the whole set with it. Strictly speaking it should not even have RAID in the name. Legitimate use: disposable data that needs speed, like cache or rendering scratch.

RAID 1 (mirror): every write goes to two identical disks. It is the certified photocopy: lose one, the other carries on. Costs half the capacity, reads improve (you can read from both), writes stay equal to a single disk. It is the bread and butter of system disks.

RAID 5 (single parity): with N disks, the capacity of N minus 1 becomes data and the equivalent of one disk becomes distributed parity, a kind of mathematical account that allows rebuilding any lost disk. Sounds great, but there are two traps. The first is the write penalty: each small write requires reading the old data, reading the old parity, computing and writing both, that is, four operations per write. The second is crueler: with today's giant disks, the rebuild after a failure takes hours or days with the whole array working at its limit, which is exactly the most likely moment for a second disk (bought in the same batch, with the same age) to fail. If that happens on RAID 5, it is over.

RAID 6 (double parity): same scheme with two parities, surviving two simultaneous dead disks. It pays more capacity and more write penalty (six operations per small write) in exchange for sleeping well during the rebuild.

RAID 10 (mirror + stripe): mirrored pairs with striping on top. Excellent performance, fast rebuild (it only copies the pair, no parity math across the whole array), cost of 50% of the capacity. It is the de facto standard for databases that need IOPS.

The choice in practice: RAID 1 for boot, RAID 10 for databases and heavy random load, RAID 6 for large volumes of sequential reads, RAID 5 only with small disks and backups up to date, RAID 0 for what can evaporate.

### Software RAID x hardware RAID

Hardware RAID is a dedicated controller with its own processor and cache, often with a battery protecting the write cache. The operating system sees a single disk and lives happily in ignorance. Advantages: battery backed cache accelerates synchronous writes safely, and the server CPU spends no cycles on parity. Disadvantages: price, and a subtle lock in: if the controller dies, you frequently need an identical one (same model, sometimes same firmware) to read your own disks. Your redundancy gained a pet single point of failure.

Software RAID (mdadm on Linux, for example) runs in the kernel using the server CPU. Advantages: zero cost, total transparency, and the disks work in any machine with the same system. Disadvantages: it consumes CPU (irrelevant today, parity is cheap for modern processors) and there is no battery backed cache, so synchronous writes hurt more.

The modern reading: the hardware controller made a lot of sense when CPU was scarce and cache was a luxury. Today, with CPUs to spare and NVMe SSDs talking straight to PCIe, putting a controller in the middle usually hurts more than helps, and solutions like ZFS explicitly ask for raw access to the disks. Hardware RAID survives in corporate niches; the rest of the world moved to software.

## Partitions: MBR and GPT

Before volume and filesystem comes the oldest division of all: the partition table, the map recorded at the beginning of the disk saying where each slice starts and ends.

MBR (Master Boot Record) is the 1983 format: fits in 512 bytes, supports 4 primary partitions and addresses at most 2 TB. A retirable format that still shows up on flash drives and old machines.

GPT (GUID Partition Table) is the format that came along with UEFI: supports giant disks, 128 partitions without the extended partition hack, keeps a spare copy of the table at the end of the disk and protects itself with a checksum. Disk bigger than 2 TB or UEFI boot: GPT, no discussion.

And taking the chance: partition is not a synonym of volume. A partition is a fixed slice of ONE disk, recorded in the map with a start and an end. A volume is the logical abstraction where a filesystem lives, and it can be a partition, a whole disk, several disks together or a flexible slice of a pool. A partition is a room with brick walls; a volume is the concept of "livable space", wherever it comes from. The LVM right below exists exactly to manufacture volumes without the rigidity of partitions.

## LVM: the dispatcher between the disk and the filesystem

A classic partition is a concrete fence: changed your mind, call the jackhammer. LVM (Logical Volume Manager) tears down the fences and puts an abstraction layer between the disks and the filesystems, working like a bank:

1. PV (Physical Volume): each disk or partition you hand to LVM. These are the deposits made at the bank.
2. VG (Volume Group): the common vault where all deposits mix into a single balance of space.
3. LV (Logical Volume): the withdrawals: volumes of whatever size you want, created from the balance, where the filesystems actually live.

The money in the vault does not remember which deposit it came from, and that is the beauty of it: an LV can span several disks, grow online (`lvextend` followed by the filesystem resize, no reboot), and you can add a new disk to the VG on Tuesday and grow the database volume on Wednesday with the service running.

Two LVM features deserve special mention. Snapshots: an instant picture of the volume at a moment, done with copy on write (the snapshot only stores the blocks that changed after the picture). Perfect for freezing a volume before a consistent backup or before that suspicious upgrade. And thin provisioning: promising more space than exists, like an airline selling more seats than the plane has, betting nobody uses everything at the same time. Useful and dangerous in the exact same measure: monitor it, because when the real space ends, it ends for everybody at once.

The classic stack on Linux then becomes: disks, RAID on top (mdadm), LVM on top of that, and the filesystem on top. Each layer solves one problem: RAID solves the disk that dies, LVM solves the size that changes, the filesystem solves organization.

## Filesystems: the librarian

A raw disk is a warehouse with billions of numbered little boxes. The filesystem is the librarian that turns that into something usable: names, directories, permissions, dates, and the accounting of which boxes are free. In Unix like systems, the central piece is the inode: the catalog card of each file, holding metadata and the pointers to the data blocks. The file name, curiously, does not live in the inode: it lives in the directory, which is just a table linking names to inode numbers. That is why hard links exist: two names pointing to the same card.

Two concepts separate old filesystems from modern ones:

Journaling: before touching the structures, the filesystem writes the intention in a diary. If the power goes out mid operation, on the way back it reads the diary and finishes or undoes the job, instead of spending hours in an fsck scanning the entire disk. It is the surgeon writing the plan before cutting.

Copy on write (COW): never overwrite data in place; write the new version in free blocks and only then flip the pointer. The state on disk is always consistent, and snapshots become almost free: just do not release the old pointers. It is editing a contract always on a fresh copy, keeping the previous versions in the archive.

### Linux

ext4: the de facto default for over a decade. Journaling, mature, stable, solid performance in the general case. It is the Corolla of filesystems: nobody posts pictures of it, everybody trusts it.

XFS: born at Silicon Graphics in the 90s to handle heavy video, today it is the default of Red Hat Enterprise Linux. It shines with big files, high parallelism and giant filesystems. Historical detail: it grows online, but does not shrink.

Btrfs: Linux's attempt at a native modern filesystem with COW, snapshots, data checksums, compression and built in RAID. Default on openSUSE and Fedora (and in the guts of the Synology at your house). Its RAID 5 and 6 modes carry instability warnings to this day, so common practice is Btrfs on mirrors or single disks.

And an honorable mention outside the box: tmpfs (filesystem in RAM, dies on reboot) and the network filesystems like NFS.

### Unix and the BSDs

UFS (Unix File System), direct descendant of Berkeley's Fast File System from the 80s, is the grandfather of the family: practically every Unix like filesystem inherits something from it. It is still an option on FreeBSD, with soft updates instead of classic journaling.

On Solaris, ZFS was born (I will talk about it properly soon), and FreeBSD adopted it as a first class filesystem: today it is the natural choice for a FreeBSD server and the soul of storage appliances like TrueNAS.

AIX has JFS (which IBM later ported to Linux as JFS2), and HP UX had Veritas' VxFS, the commercial pioneer of journaling. They rarely show up outside legacy environments, but they explain where several ideas came from.

### macOS

For decades the Mac used HFS and then HFS+ (1998), a filesystem that aged badly: no checksums, fragile structures and a complicated relationship with upper and lower case (by default it preserves the case of names but treats "File" and "file" as the same file, a behavior that confuses developers to this day).

In 2017 Apple flipped the switch to APFS, genuinely modern: copy on write, snapshots (it is what modern Time Machine uses), instant file clones, native encryption and shared space between volumes of the same container, each volume taking what it needs from the common balance, very much in the spirit of LVM. The switch happened in an iPhone update, converting billions of devices on the fly, possibly the biggest filesystem migration in history, and almost nobody noticed. APFS was designed for SSDs; on an HDD it fragments metadata and suffers, one more reason for the divorce between Apple and spinning disks.

A border curiosity: the Mac reads NTFS but does not write to it by default, and the neutral ground between Windows and Mac on a flash drive is still exFAT.

### And Windows, real quick

Just to complete the map: NTFS since 1993, with journaling and ACLs, and ReFS trying to be the modern server filesystem. FAT32 and exFAT survive as the lingua franca of flash drives and SD cards.

## The path of a write, or: when is data really saved?

An apparently silly question that knocks down experienced people: when your program writes to a file, at what moment is the data really safe? The answer is a corridor full of doors, and it is worth knowing each one:

1. Application cache: the write of your language often does not even reach the kernel right away; libraries keep their own buffer (printf is buffered, for example).
2. Kernel page cache: when the write reaches the operating system, the data goes to RAM and the call returns success immediately. Success here means "the kernel took note", not "it is on disk". The kernel flushes those dirty pages later, when convenient.
3. Filesystem: at flush time, the filesystem decides order, allocates blocks, updates journal and metadata.
4. Device cache: the disk also has its own RAM and also answers "ok" before writing to the medium, unless it receives an explicit flush order.
5. The actual medium: only here does the data survive a power loss.

The explicit order to cross the whole corridor is called fsync (and relatives, like fdatasync, and O_DIRECT for those who want to skip the page cache). That is why databases call fsync on every commit, and that is why commits are expensive: it waits for the full journey, including the flush of the disk cache. And that is also why a RAID controller with a battery accelerates synchronous writes so much: it can answer "ok" with the data still in its cache, because the battery guarantees arrival at the disk even without power.

Moral of the story: a write that did not go through fsync is a promise, not a contract. A power loss between the write and the flush takes away whatever was hanging in the path, and it is the journaling or the copy on write of the filesystem that limit the damage to "I lost the last few seconds" instead of "I corrupted the whole structure".

## ZFS: the Swiss army knife that swallowed the whole stack

ZFS deserves its own section because it is not just a filesystem: it is filesystem, RAID and LVM in a single package. It was born at Sun Microsystems in 2005 with a radical proposal: the end of the partition and total war against silent data corruption.

The structure: disks are grouped into vdevs (single disk, mirror, or RAIDZ), and vdevs form a pool. Datasets (filesystems) and zvols (block volumes) are born from the pool and share the free space, with no fixed size, like APFS volumes or the LVs of a VG. Creating a new filesystem on ZFS is one command and a second and a half.

What makes ZFS be ZFS:

Checksums on everything: every block, of data or metadata, has a checksum stored in the parent block, forming a Merkle tree up to the root. Every read is verified. If the disk returns garbage that looks like data (bit flip, bad cable, lying firmware), ZFS notices, and if there is redundancy, it fixes it on the spot by itself (self healing). HDDs and traditional RAID blindly trust what the disk returns; ZFS checks the change of every purchase.

Copy on write end to end: the state on disk is always consistent, there is no fsck in ZFS. Snapshots are instantaneous, cheap, and shippable over the network with `zfs send` and `zfs receive`, which turns backup replication into one line of shell.

RAIDZ: ZFS's answer to RAID 5 and 6 (RAIDZ1, Z2 and even Z3, with three parities). Being integrated with the filesystem, with variable width stripes, it closes the famous write hole of RAID 5 (that window between writing the data and writing the parity in which a power loss leaves the array lying to you). And in the rebuild (resilver), it only reconstructs the blocks actually in use, not the whole disk.

ARC and caches: ZFS keeps an aggressive adaptive cache in RAM (ARC), accepts an SSD as a second level read cache (L2ARC) and a fast device to accelerate synchronous writes (SLOG). Hence the fame of memory glutton: it uses the RAM that exists, like every decent cache, but releases it when the system needs it.

Native compression (LZ4 and Zstd) that is almost always worth turning on, deduplication (which is almost never worth turning on, given its hunger for RAM), quotas, native encryption per dataset.

The price of all this: ZFS wants to see raw disks (no RAID controller in the middle), asks for RAM generously, and expanding a RAIDZ was historically inflexible (adding a disk to a RAIDZ vdev only truly arrived in recent OpenZFS versions). On Linux it lives outside the kernel tree due to license incompatibility (CDDL x GPL), so it arrives as a module (OpenZFS), with Ubuntu offering direct support and Proxmox and TrueNAS built on top of it.

If your question is "I want a reliable file or backup server at home or at the company, what do I use?", the answer of the decade is: ZFS with mirrors or RAIDZ2, automatic snapshots and `zfs send` to another machine. Hard to go wrong.

## Block, file and object: the three languages of storage

Every storage offering in the world, from the disk in your machine to the cloud, speaks one of three languages:

Block: the provider hands you raw sectors and you do the rest (partition, format, mount). It is the local disk, the LUN of a SAN via Fibre Channel or iSCSI, AWS EBS. Minimal latency, total flexibility, and all the responsibility on your side. Empty lot: build whatever you want.

File: the provider hands you a ready filesystem over the network, with directories, names, permissions and locks. It is the office NAS via NFS or SMB, the cloud's EFS. Several clients see the same files at the same time. Furnished apartment: arrive and use.

Object: the provider hands you a bucket of objects accessed by key via HTTP: PUT, GET, DELETE and that is it. No real hierarchy (the "directories" are prefixes in the name), no editing a piece of the middle (changed something, rewrite the whole object), rich metadata, practically infinite scale and very high durability through replication. It is S3 and all its imitators (MinIO, GCS, Azure Blob). The mall's luggage storage: you hand over the box, receive a ticket, and return the ticket to get the box back.

The choice is less about technology and more about access pattern: databases want block, user homes and file sharing want file, and backup, media, data lakes and everything that grows without end want object.

## Backup: the only layer that forgives human error

RAID protects against a dead disk, checksums protect against a lying disk, journaling protects against power loss. None of them protects against the wrong rm, the ransomware or the bug that successfully writes garbage to all replicas at the same time. What protects against those is backup, and backup has a golden rule with three numbers: at least 3 copies of the data, on 2 different media or systems, with 1 off site. In 2026, read "off site" also as "outside the account and out of reach of the same credentials", because modern ransomware finds and encrypts the reachable backup before announcing itself.

Snapshots help a lot with "I deleted it by accident ten minutes ago", but a snapshot in the same pool dies with the pool: it becomes a real backup when it is copied to another machine (the zfs send of life, or any replication). And the part everybody skips: a backup that was never restored in a test is a hope, not a backup. Schedule restore tests with the same seriousness you schedule the backup.

## Operations and diagnostics day to day

A survival kit for when storage decides to get interesting:

lsblk shows the tree of devices, partitions and mount points: the X ray of the whole stack. findmnt shows what is mounted where and with which options. df shows space per filesystem, and the detail that saves on call shifts: df with the i option shows inodes. Yes, a filesystem can have plenty of free space and still refuse new files because the inodes ran out, something that happens for real in directories with millions of tiny files (mail queues, neglected caches, PHP sessions forgotten since 2019).

iostat with the x option is the electrocardiogram: IOPS, MB/s, average latency (await) and utilization per device. This is where you discover that the "slow" disk delivering 20 MB/s is 100% busy, because the load is random with small blocks and its limit is IOPS, not bandwidth.

smartctl talks to the disk's SMART: reallocated sectors, read errors, hours of use, temperature. SMART complaining does not say when the disk dies, but a disk with a growing reallocated sector counter is a disk with a ticket already bought.

And TRIM in practice: fstrim (or the discard mount option) tells the SSD which blocks the filesystem freed. Modern distributions schedule a weekly fstrim via systemd; if an old SSD keeps degrading over time, that is the first thing to check.

## Tying it all together: a mental map

It is worth closing with the view from above, because storage is a stack and each layer answers a different question:

1. Media (HDD, SSD, NVMe): where the bit lives and how fast it wakes up. SSD for latency and IOPS, HDD for cheap capacity.
2. Interface (SATA, SAS, NVMe, network): the width of the door between the media and the rest.
3. Redundancy (software or hardware RAID, RAIDZ): what happens when (not if) a disk dies.
4. Volume management (LVM, ZFS pools, APFS containers): space as a flexible balance instead of a concrete fence.
5. Filesystem (ext4, XFS, Btrfs, ZFS, APFS, UFS, NTFS): the librarian that turns blocks into files, with journaling or COW ensuring a power cut does not become a tragedy.
6. And transversal to everything: backup, because none of the layers above protects you from yourself.

When sizing, the question is never "which disk is best", but "what is the access pattern": small random synchronous (OLTP database, virtualization) asks for NVMe SSD and RAID 10 or ZFS mirrors; big sequential (backup, media, warehouse) accepts HDD in RAID 6 or RAIDZ2 with a smile. Measuring latency, IOPS and throughput separately, always asking the block size, avoids 90% of the wrong performance discussions.

## Twenty questions to test yourself

Fundamentals only become knowledge when they answer real problems. So close the text by testing yourself on these twenty, which are the kind of thing that shows up on call, in migrations and in interviews:

1. **Why can a disk delivering few MB/s be saturated?** Because the bottleneck can be IOPS, not bandwidth. 20 MB/s in random 4K blocks is more than 5 thousand operations per second, far beyond what an HDD delivers. Look at utilization and await in iostat, not just the MB/s.

2. **Why does deleting a file not always free space?** Because the space only returns when the last reference dies: a process with the file open holds the blocks (the classic "I deleted the giant log and df did not move", visible with lsof), extra hard links keep the inode alive, and snapshots hold the old blocks by definition.

3. **When is a write really saved?** When fsync returned successfully and every layer of the path respected the flush. A write that returned is a promise; fsync is a contract. Revisit the write path section.

4. **Does RAID replace backup?** No. RAID replicates everything with the same efficiency, including your mistake and the ransomware.

5. **Why is RAID 5 with big disks scary?** Because the rebuild takes hours or days with the array at full stress, which is the most likely moment for a second failure, and the second failure on RAID 5 is fatal. Hence RAID 6 and RAIDZ2.

6. **Does high IOPS guarantee high throughput?** No: they are different rulers connected by the block size. Many tiny operations give high IOPS with low bandwidth; few giant operations give the opposite.

7. **Why does a very full SSD get slow?** Garbage collection loses room to maneuver, wear leveling has fewer free cells to rotate and the SLC cache shrinks. Leaving headroom (overprovisioning) and keeping TRIM up to date solves most of it.

8. **What is the RAID 5 write hole?** The window between writing the data and writing the parity: a power loss in that meantime leaves parity and data inconsistent with nobody warning you. RAIDZ closes that window because the copy on write transaction only counts when it is complete.

9. **df shows free space, but creating a file says "No space left on device". How?** Inodes exhausted. Check df in inode mode and look for the directory with millions of small files.

10. **Why do du and df disagree?** Deleted files still open by some process, the blocks reserved for root (about 5% on ext4) and sparse files make the two measure different things.

11. **What happens if the power goes out in the middle of a write?** What was only in cache is lost (hence fsync), but journaling or copy on write guarantee the filesystem structure comes back consistent: the diary finishes or undoes the operation, COW simply never invalidated the old state.

12. **Are partition and volume the same thing?** No. A partition is a fixed slice of one disk, recorded in the table. A volume is the abstraction where the filesystem lives, and can be a partition, several disks or a flexible slice of a pool.

13. **MBR or GPT?** GPT, except for archaeology: MBR stops at 2 TB and 4 primary partitions; GPT has a spare copy, checksum and is what UEFI boot expects.

14. **Why does partition alignment matter?** A misaligned partition makes every 4K write land straddling two physical sectors, turning one write into a read plus two writes. Everything gets slow and no error shows up.

15. **Is NVMe worth it over a SATA SSD?** For latency, IOPS and parallel loads, yes: a lean protocol and tens of thousands of queues against a single queue of 32. For storing movies and backup, it makes no difference.

16. **Why does ZFS want the raw disks, with no RAID controller in between?** Because the checksums and self healing need to see and control the real disks. A controller in the middle hides errors, lies about flushes and gets in the way of reconstruction.

17. **Is ZFS deduplication worth it?** Almost never: the dedup table devours RAM and the real gain is usually small. LZ4 compression, on the other hand, is almost always worth turning on.

18. **What is queue depth and why do benchmarks always mention it?** It is how many operations are in flight at the same time. SSDs only show their catalog IOPS with a deep queue; measuring at queue depth 1 reveals the pure latency of each operation. The two numbers tell different stories.

19. **Disk nearly idle, low IOPS, slow application. What to look at?** Probably serialized synchronous writes: one thread calling fsync and waiting for each confirmation. What rules there is the latency of each operation, not the disk's capacity. Look at await, hunt for fsync in the application trace and consider a SLOG or battery backed cache.

20. **Is a snapshot a backup?** Only after it becomes a copy on another system. In the same pool, the snapshot dies together with the pool, with the disk and with the ransomware that encrypts everything.

## Note

I wrote this review as a consolidation exercise: these are the fundamentals I use day to day in infrastructure, organized in the order I wish I had learned them. If something here ages (and in storage things age fast, see QLC, ZNS and the filesystems time took away), corrections are gladly accepted.
