---
layout: post
title: first taste of ebpf
description:
summary:
# tags: ebpf bpftrace linux
minute: 1
---

No theory, no setup marathon — just your first hands-on taste of eBPF. One line, and you can already watch the kernel tell you which files `curl` opens. That's the whole point here: poke at it, see something real happen, and let the curiosity take it from there.

```bash
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_openat /comm == "curl"/ {
    printf("%s -> %s\n", comm, str(args->filename));
}'
```
