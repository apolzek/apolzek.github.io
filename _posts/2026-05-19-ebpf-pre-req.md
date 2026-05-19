---
layout: post
title: ebpf pre-req
description:
summary:
# tags: ebpf linux prerequisites
minute: 8
---

### 20 Prerequisites to Master eBPF (Security & Observability Focus)

Here is my view of the 20 main prerequisites to master eBPF with a focus on security and observability, organized from foundation to applied mastery. The mapping aligns with the actual content categories in the gojue/ebpf-slide repository (Security, Observability, Tracing/Profiling, eBPF Basic, eBPF Advanced, Networking, Android).

#### Technical Foundation (1-7)

**1. C language at intermediate/advanced level**
eBPF programs are written in restricted C. You need to be comfortable with pointers, structs, macros, bitwise operations, and the preprocessor. Without this, reading libbpf and kernel helpers becomes torture.

**2. Linux operating system and kernel architecture**
Understand user space vs. kernel space, syscalls, scheduler, memory management, namespaces, cgroups, and the process/thread model. Without this base, helpers like `bpf_get_current_task()` or concepts like pid namespaces in containers make no sense.

**3. x86_64 and ARM64 assembly (reading, not writing)**
You will not write assembly, but you need to read it. Disassembly of BPF programs, understanding calling conventions (System V AMD64 ABI), registers, and how arguments arrive at functions is essential for uprobes and binary analysis, especially when tracing Go, Rust, and inline functions.

**4. Linux syscalls and the kernel API**
Knowing the main syscalls (`execve`, `openat`, `connect`, `accept`, `read`, `write`, `ptrace`, `clone`) is bread and butter in security. Knowing where they enter the kernel (tracepoints `sys_enter_*`, LSM hooks, kprobes) defines where you will place your program.

**5. Linux networking stack**
TCP/IP, sockets, netfilter, traffic control (tc), XDP hooks, sk_buff, conntrack. Even when focusing on security, much detection depends on traffic inspection (DNS exfiltration, C2, lateral movement), and the networking slides in the repo are dense on this.

**6. Binary formats: ELF and DWARF/BTF**
eBPF programs are ELFs. CO-RE depends on BTF (BPF Type Format). uprobes depend on resolving symbols via DWARF/ELF. Without understanding sections, symbols, and relocations, you cannot debug real portability problems.

**7. Kernel build system and kernel headers**
Knowing how to compile a kernel, navigate `linux/include/uapi/`, read `include/linux/bpf.h`, and locate structs like `task_struct` and `sock`. In production, you will need to map fields across kernel versions.

#### eBPF Mechanics (8-13)

**8. The eBPF execution model**
Maps, programs, attach points, tail calls, BPF-to-BPF calls, BPF trampolines, fentry/fexit. Understanding what a BPF instruction is, what the JIT does, and why there is an instruction limit (and how to work around it with tail calls).

**9. The BPF verifier, intimately**
This is where 80% of beginners get stuck. You need to understand register state tracking, bounds checking, allowed pointer arithmetic, bounded loops (`bpf_loop`), and why your "obvious" program is rejected. The "Peeking into BPF verifier" slide in the repo is required reading.

**10. CO-RE (Compile Once, Run Everywhere) and BTF**
The difference between BCC (compiles on the target host, heavy) and libbpf+CO-RE (compile once, runs on many kernels) is what separates a POC from production. Master `BPF_CORE_READ`, relocations, and `vmlinux.h`.

**11. BPF maps, all relevant types**
Hash, array, per-CPU, LRU, ring buffer, perf event array, stack trace, LPM trie. Knowing when to use which one defines performance and correctness. Ring buffer (kernel 5.8+) replaced perf buffer in many observability cases.

**12. Probe types and their trade-offs**
kprobes/kretprobes, tracepoints, raw tracepoints, fentry/fexit, uprobes/uretprobes, USDT, LSM hooks, XDP, tc, cgroup, socket filters. Each has different cost, ABI stability, and capabilities. Tracepoints are stable; kprobes are fragile across versions. That matters in production.

**13. Ecosystem libraries and toolchains**
libbpf (C, de facto standard), cilium/ebpf (Go, great for single-binary tools), aya (Rust), BCC (legacy but useful), bpftrace (DSL for quick exploration), bpftool (essential utility). Choosing wrong costs months.

#### Applied Mastery (14-17)

**14. Observability: USE/RED, distributed tracing, and continuous profiling**
USE (Utilization/Saturation/Errors) and RED (Rate/Errors/Duration) methods, context propagation, flame graphs, on-CPU vs off-CPU analysis. Brendan Gregg is the reference. His slides in the repo (`bpf_internals_tracing_examples`, `USENIX_ATC2017_BPF_superpowers`) are canonical.

**15. Security: threat models and runtime detection**
MITRE ATT&CK, container escape TTPs, kernel exploits, LD_PRELOAD rootkits vs eBPF rootkits, anti-evasion (Phantom Attack / TOCTOU on syscall args, exactly what the "Phantom Attack" slide in the repo covers). Knowing what to detect is as important as knowing how.

**16. Containers, Kubernetes, and cloud-native**
Namespaces (pid, net, mnt, user), cgroups v1/v2, OCI runtime, CRI, CNI. Correlating kernel events with pods/containers requires understanding how Linux represents isolation. Falco, Tetragon, and Cilium live in this world.

**17. Reference tools, study the source code**
Cilium/Tetragon (Isovalent), Falco, Tracee (Aqua), Pixie, Parca, Inspektor Gadget, Katran, bpftrace tools. Not just using, but opening the code and understanding design choices. Reading Tetragon source teaches more about production security eBPF than any book.

#### Engineer Discipline (18-20)

**18. Performance engineering and low latency**
Cache lines, false sharing, per-CPU data structures, NUMA, probe overhead (uprobes are expensive, kernel tracepoints are not), batching, sampling vs full capture. A security agent that eats 30% of CPU will not go to production.

**19. eBPF debugging**
`bpf_printk` (and why to avoid it in production), `bpftool prog`, `bpftool map`, perf events, kernel logs, `dmesg` for verifier errors, gdb on the userspace loader, and analyzing a rejected program by reading the verifier log line by line. Without this you stay stuck.

**20. The eBPF security model itself**
eBPF is also an attack surface. Historical verifier CVEs, Spectre in BPF (Daniel Borkmann's slide in the repo: "BPF and Spectre"), capabilities (`CAP_BPF`, `CAP_PERFMON`, `CAP_SYS_ADMIN`), unprivileged BPF disabled, kernel hardening, and the "us-21-With-Friends-Like-EBPF-Who-Needs-Enemies" slide, which shows eBPF being used offensively. Anyone working in security needs to think about both sides.

#### Suggested Study Path

Practical study order using the repo itself: `eBPF_basic` (covers 1-13) then `tracing_profiling` (Brendan Gregg to anchor 14), then `observability_monitoring`, then `security` (16, 17, 20), then `eBPF_advanced` (verifier, CO-RE, JIT, Spectre).

A useful shortcut: after items 1-7, read Liz Rice's *Learning eBPF* in parallel with her slide in the repo (`LIz_Rice-Beginners_guide_to_eBPF`), then go straight to the Tetragon or Tracee source code. They materialize almost all 20 points in real production.
