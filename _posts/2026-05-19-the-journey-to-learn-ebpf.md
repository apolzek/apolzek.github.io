---
layout: post
title: the journey to learn ebpf
description:
summary:
# tags: ebpf linux prerequisites
minute: 8
---

## Índice

- [Questions about eBPF](#questions-about-ebpf)
- [General questions](#general-questions)
  - [What is eBPF?](#what-is-ebpf)
  - [What is the difference between eBPF and BPF?](#what-is-the-difference-between-ebpf-and-bpf)
  - [Why, by whom, and when was eBPF created?](#why-by-whom-and-when-was-ebpf-created)
  - [What are the main changes to eBPF throughout its history?](#what-are-the-main-changes-to-ebpf-throughout-its-history)
  - [What are the main tools built using eBPF?](#what-are-the-main-tools-built-using-ebpf)
  - [Who are the key technical references (leading experts) in eBPF?](#who-are-the-key-technical-references-leading-experts-in-ebpf)
- [Specific questions](#specific-questions)
  - [How does eBPF actually work under the hood?](#how-does-ebpf-actually-work-under-the-hood)
  - [What is the eBPF verifier and why does it matter?](#what-is-the-ebpf-verifier-and-why-does-it-matter)
  - [What are eBPF maps and how are they used?](#what-are-ebpf-maps-and-how-are-they-used)
  - [What are the different eBPF program types and hook points?](#what-are-the-different-ebpf-program-types-and-hook-points)
  - [How does the JIT compiler fit into eBPF?](#how-does-the-jit-compiler-fit-into-ebpf)
  - [What are the safety guarantees of eBPF and what are its limitations?](#what-are-the-safety-guarantees-of-ebpf-and-what-are-its-limitations)
  - [How does eBPF compare to kernel modules?](#how-does-ebpf-compare-to-kernel-modules)
  - [Why is eBPF often described as "superpowers for the kernel"?](#why-is-ebpf-often-described-as-superpowers-for-the-kernel)
  - [What problems did eBPF solve that weren't solvable before?](#what-problems-did-ebpf-solve-that-werent-solvable-before)
  - [What are the main use cases for eBPF (networking, observability, security, tracing)?](#what-are-the-main-use-cases-for-ebpf-networking-observability-security-tracing)
  - [How is eBPF used in production at large companies?](#how-is-ebpf-used-in-production-at-large-companies)
  - [What is XDP and how does it relate to eBPF?](#what-is-xdp-and-how-does-it-relate-to-ebpf)
  - [What is the difference between BCC, bpftrace, and libbpf?](#what-is-the-difference-between-bcc-bpftrace-and-libbpf)
  - [What is CO-RE (Compile Once, Run Everywhere) and why does it matter?](#what-is-co-re-compile-once-run-everywhere-and-why-does-it-matter)
  - [How does Cilium use eBPF?](#how-does-cilium-use-ebpf)
  - [What do I need to know to write my first eBPF program?](#what-do-i-need-to-know-to-write-my-first-ebpf-program)
  - [What languages can I use to write eBPF programs?](#what-languages-can-i-use-to-write-ebpf-programs)
  - [How do I debug an eBPF program?](#how-do-i-debug-an-ebpf-program)
  - [What are common pitfalls when getting started with eBPF?](#what-are-common-pitfalls-when-getting-started-with-ebpf)
  - [What can't eBPF do (yet)?](#what-cant-ebpf-do-yet)
  - [What is eBPF for Windows?](#what-is-ebpf-for-windows)
  - [Where is eBPF headed in the next few years?](#where-is-ebpf-headed-in-the-next-few-years)
- [The Journey to Learn eBPF (Security & Observability Focus)](#the-journey-to-learn-ebpf-security--observability-focus)
  - [Technical Foundation (1-7)](#technical-foundation-1-7)
    - [1. C language at intermediate/advanced level](#1-c-language-at-intermediateadvanced-level)
    - [2. Linux operating system and kernel architecture](#2-linux-operating-system-and-kernel-architecture)
    - [3. x86_64 and ARM64 assembly (reading, not writing)](#3-x86_64-and-arm64-assembly-reading-not-writing)
    - [4. Linux syscalls and the kernel API](#4-linux-syscalls-and-the-kernel-api)
    - [5. Linux networking stack](#5-linux-networking-stack)
    - [6. Binary formats: ELF and DWARF/BTF](#6-binary-formats-elf-and-dwarfbtf)
    - [7. Kernel build system and kernel headers](#7-kernel-build-system-and-kernel-headers)
  - [eBPF Mechanics (8-13)](#ebpf-mechanics-8-13)
    - [8. The eBPF execution model](#8-the-ebpf-execution-model)
    - [9. The BPF verifier, intimately](#9-the-bpf-verifier-intimately)
    - [10. CO-RE (Compile Once, Run Everywhere) and BTF](#10-co-re-compile-once-run-everywhere-and-btf)
    - [11. BPF maps, all relevant types](#11-bpf-maps-all-relevant-types)
    - [12. Probe types and their trade-offs](#12-probe-types-and-their-trade-offs)
    - [13. Ecosystem libraries and toolchains](#13-ecosystem-libraries-and-toolchains)
  - [Applied Mastery (14-17)](#applied-mastery-14-17)
    - [14. Observability: USE/RED, distributed tracing, and continuous profiling](#14-observability-use-red-distributed-tracing-and-continuous-profiling)
    - [15. Security: threat models and runtime detection](#15-security-threat-models-and-runtime-detection)
    - [16. Containers, Kubernetes, and cloud-native](#16-containers-kubernetes-and-cloud-native)
    - [17. Reference tools, study the source code](#17-reference-tools-study-the-source-code)
  - [Engineer Discipline (18-20)](#engineer-discipline-18-20)
    - [18. Performance engineering and low latency](#18-performance-engineering-and-low-latency)
    - [19. eBPF debugging](#19-ebpf-debugging)
    - [20. The eBPF security model itself](#20-the-ebpf-security-model-itself)
  - [Suggested Study Path](#suggested-study-path)
  - [A Closing Note](#a-closing-note)

### Questions about eBPF

I learned to study by asking questions, then refining them and building new ones as I go. That's the approach I'll take here.

## General questions

##### What is eBPF?

eBPF is a technology that lets you run small, sandboxed programs inside the Linux kernel without changing kernel source code or loading kernel modules. It is a sandboxed virtual machine that allows you to run custom code directly inside the Linux kernel. Programs are event-driven (triggered by hooks), verified for safety before running, and execute at near-native performance. It effectively turns the kernel into a programmable platform.

##### What is the difference between eBPF and BPF?

"BPF" originally meant Berkeley Packet Filter, a 1990s mechanism for filtering network packets. "eBPF" is the modern, extended redesign. eBPF first appeared in the 3.18 kernel, and since then the original BPF has been called the classic BPF (cBPF), which is now largely deprecated. The key technical differences: the extended version increased the virtual machine from 2 32-bit registers to 10 64-bit registers. Today the kernel only runs eBPF, and classic BPF bytecode is transparently translated into eBPF before execution. In practice, "BPF" and "eBPF" are now often used interchangeably to mean the modern technology.

##### Why, by whom, and when was eBPF created?

The original BPF was created in 1992 by Van Jacobson and colleagues because existing packet filters were too slow for kernel use. BPF had limitations that became apparent as networking evolved: it was not adapted to modern processors and multi-processor systems, it was stateless, and it took a lot of work for developers to extend. To fix this, in early 2014 Alexei Starovoitov implemented eBPF, which after redesign evolved into a general-purpose execution engine. Daniel Borkmann is the other principal original author. eBPF was added to the Linux kernel in December 2014 (v3.18).

##### What are the main changes to eBPF throughout its history?

The major milestones: 2014, eBPF born in Linux 3.18 with a redesigned instruction set and the bpf() syscall. Since kernel version 3.19, users can attach eBPF filters to sockets, and since kernel version 4.1, to traffic control classifiers for the ingress and egress networking data path. Around 2016 onward came the explosion into tracing, observability, and security use cases. A key inflection point was the advent of CO-RE (Compile Once, Run Everywhere) around 2020, which made eBPF programs portable across kernel versions. Other notable additions include BTF type information, BPF LSM hooks for security enforcement, and eBPF for Windows.

##### What are the main tools built using eBPF?

The widely used ones: BCC, bpftrace, Cilium, Pixie, Inspektor Gadget, Tracee, Parca, and kubectl-trace, all mature, production-tested solutions for performance analysis, troubleshooting, and security monitoring. Briefly: Cilium provides eBPF-based Kubernetes networking and security; Tetragon does runtime security enforcement; Pixie does auto-instrumentation for Kubernetes apps with no code changes; and Falco does runtime security observability, detecting anomalous behavior. bpftrace and BCC are the go-to tracing and diagnostics toolkits, and Hubble provides network observability on top of Cilium.

##### Who are the key technical references (leading experts) in eBPF?

Pioneers of the technology include Alexei Starovoitov, Thomas Graf, Daniel Borkmann, Brendan Gregg, David Miller, and Liz Rice, who have been instrumental in eBPF's growth. Starovoitov and Borkmann are the core kernel maintainers. Brendan Gregg is often called eBPF's "patron saint"; his site has the Linux performance tools map, flamegraph methodology, and years of BPF/bpftrace writeups, and he wrote the book "BPF Performance Tools." Andrii Nakryiko leads the libbpf and BPF CO-RE work, and Thomas Graf and Liz Rice are prominent in the Cilium and cloud-native side.

## Specific questions

##### How does eBPF actually work under the hood?

The lifecycle: you write a program (usually in restricted C), compile it to eBPF bytecode with Clang/LLVM, then load it into the kernel via the bpf() syscall. The kernel runs a verification process to confirm the program is safe; if deemed unsafe, the system call fails. If it passes, the kernel uses either an interpreter or a JIT compiler to convert the bytecode into machine code. eBPF is event-driven, so it runs in response to specific hook points: when an event occurs, the kernel runs the corresponding program, and developers interact with it from user space using eBPF maps.

##### What is the eBPF verifier and why does it matter?

The verifier is the security gate that makes eBPF safe to run in the kernel. It checks the bytecode before it is loaded to make sure the program contains no harmful operations such as infinite loops, illegal instructions, or out-of-bounds memory access, and it ensures that all data paths terminate successfully. It also validates that the loading process holds the required privileges and that the program always runs to completion. It matters because it is what allows custom code to run in kernel space without crashing or compromising the system.

##### What are eBPF maps and how are they used?

eBPF maps are key-value data structures with read/write access that provide shared storage and facilitate interaction between eBPF kernel programs and user space applications. Created and managed through system calls, they can also maintain state between different iterations of an eBPF program. Map types include hash tables or arrays, ring buffer, stack trace, least-recently-used, longest-prefix-match, and more. A typical use: a kernel program writes counters or events into a map, and a user-space agent reads them out.

##### What are the different eBPF program types and hook points?

Each eBPF program type represents a different interface or hook point in the kernel's workflow. By selecting a program type when loading, the user defines which kernel functions or events it can attach to, what data structures it can access, and which helper functions it can call. Pre-defined hooks include system calls, function entry/exit, kernel tracepoints, network events, and several others. Common hook points include XDP (network driver level), TC (traffic control), socket filters, kprobes (kernel functions), tracepoints (stable events), uprobes (user functions), and perf events (hardware), plus LSM hooks for security.

##### How does the JIT compiler fit into eBPF?

After the verifier approves a program, the JIT (Just-In-Time) compiler translates the eBPF bytecode into native machine code for the host CPU. Once verified, the bytecode is JIT-compiled to native machine instructions for near-native performance; on x86_64, eBPF instructions map almost 1:1 to native instructions. This is what gives eBPF its speed advantage; without JIT the kernel would fall back to a slower interpreter.

##### What are the safety guarantees of eBPF and what are its limitations?

The verifier enforces several guarantees: the program can only be loaded by a privileged process (unless otherwise specified), the program will not damage or crash the system, and the program will always run to completion rather than sit in an endless loop. The flip side is restrictions: bounded loops only, limited program size and complexity, no arbitrary memory access, and an eBPF program cannot arbitrarily call into a kernel function; it must use a fixed set of kernel-provided helper functions instead. This deliberately limits expressiveness in exchange for safety.

##### How does eBPF compare to kernel modules?

Kernel modules (LKMs) can do anything but are risky: a bug can crash or compromise the whole system, and they are hard to debug. eBPF programs are verified, sandboxed, can be loaded and unloaded dynamically at runtime, and are portable. Although eBPF is far from completely replacing LKMs, it sets itself apart by bringing great flexibility while mitigating risk through solid safety and controls. The trade-off: modules are unrestricted, eBPF is constrained by the verifier.

##### Why is eBPF often described as "superpowers for the kernel"?

Because it lets you safely add new capabilities to the kernel, such as networking, observability, and security, at runtime, without recompiling or rebooting. Historically, innovating at the operating system level was slow, and adding modules or modifying kernel source meant working through abstracted layers and complex infrastructure that are difficult to debug. A common analogy: eBPF is to the kernel what JavaScript is to the browser, a safe way to program something that was previously fixed.

##### What problems did eBPF solve that weren't solvable before?

Before eBPF, deep kernel-level visibility and custom logic required either kernel modules (dangerous) or user-space tools (slow, with constant kernel and user-space data copying). eBPF lets you run logic where the events actually happen. Traditional observability requires instrumenting your code; eBPF lets you observe your system without changing a single line of application code, directly from the kernel. It also enabled faster packet processing than older mechanisms like iptables.

##### What are the main use cases for eBPF (networking, observability, security, tracing)?

Networking: fast packet processing, load balancing, replacing iptables and kube-proxy (Cilium). Observability: metrics, tracing, profiling, and latency histograms without code instrumentation (Pixie, Parca, bpftrace). Security: runtime threat detection and enforcement at the kernel level (Falco, Tetragon, KubeArmor). Tracing and debugging: inspecting syscalls, function calls, and I/O live on production systems.

##### How is eBPF used in production at large companies?

Companies like Meta, Google, Netflix, and Cloudflare use it in production, and tools like Cilium, Falco, Pixie, and Parca are built on it. Cilium, Falco, and Cloudflare's network are all built on it, as is modern Kubernetes networking. In Kubernetes specifically, eBPF is usually deployed as a privileged DaemonSet that loads programs into each node's kernel for networking, observability, and security.

##### What is XDP and how does it relate to eBPF?

XDP (eXpress Data Path) is a specific eBPF hook point. XDP is the earliest point in the network stack, at the network driver level, ideal for DDoS mitigation and packet filtering. Because the eBPF program runs before the kernel builds heavier networking data structures, XDP enables extremely fast packet processing (drop, redirect, modify), making it popular for high-performance networking and DDoS defense.

##### What is the difference between BCC, bpftrace, and libbpf?

They sit at different abstraction levels. bpftrace is a high-level tracing language that makes eBPF accessible through concise one-liners, designed for quick investigations. BCC (BPF Compiler Collection) is a toolkit and framework, historically with Python bindings, offering many pre-built tracing tools. libbpf with CO-RE is the production path for writing custom eBPF C programs. Rough rule: bpftrace for ad-hoc one-liners, BCC for ready-made tools and scripting, libbpf for shipping production software.

##### What is CO-RE (Compile Once, Run Everywhere) and why does it matter?

CO-RE solves eBPF's portability problem across kernel versions. CO-RE uses BTF (BPF Type Format) metadata to relocate field offsets at load time, so your compiled binary works across different kernel versions. CO-RE programs compile against BTF type information and run on any kernel that exposes BTF, without recompilation. It matters because before CO-RE, programs often had to be recompiled per-kernel, needing kernel headers on every machine; CO-RE makes one binary portable.

##### How does Cilium use eBPF?

Cilium is an open source project that provides eBPF-powered networking, security, and observability, designed from the ground up to bring eBPF advantages to Kubernetes and address the scalability, security, and visibility requirements of container workloads. It replaces kube-proxy and enforces NetworkPolicy at wire speed. Its companion, Hubble, adds network observability on top.

##### What do I need to know to write my first eBPF program?

Practically: a fairly recent Linux kernel, the LLVM/Clang toolchain, and a loader library. A good starting path is to begin with bpftrace one-liners, then explore the BCC toolkit for pre-built observability tools, and read the libbpf documentation when you are ready to write custom programs. You will need to understand hook points, maps, helper functions, and the verifier's constraints (bounded loops, limited complexity).

##### What languages can I use to write eBPF programs?

The eBPF program itself (kernel side) is typically written in a restricted subset of C and compiled to bytecode; Rust is increasingly supported. The user-space loader and control side can be in many languages: the production path uses C with libbpf; for Python users, the BCC toolkit provides Python bindings; for Go users, Cilium's ebpf-go library is the standard choice. bpftrace also offers its own awk and C-inspired high-level language.

##### How do I debug an eBPF program?

Common approaches: read verifier rejection messages, which tell you why a program failed; use bpf_printk-style logging to a trace pipe; inspect map contents from user space; and use tooling like bpftool to introspect loaded programs and maps. Starting with bpftrace or BCC is easier since they surface errors more readably than raw libbpf.

##### What are common pitfalls when getting started with eBPF?

Frequent ones: fighting the verifier (unbounded loops, pointer arithmetic it cannot prove safe, programs too large or complex); kernel version differences breaking programs (the problem CO-RE addresses); forgetting that helper functions, not arbitrary kernel calls, are the only way to call into the kernel; underestimating overhead from high-frequency probes on hot paths; and needing elevated privileges to load programs.

##### What can't eBPF do (yet)?

eBPF is deliberately constrained: no unbounded loops, limited program complexity and size, no arbitrary kernel function calls (only helpers), and limited memory access. It is not a general-purpose replacement for kernel modules when you need unrestricted capability. Because eBPF-based approaches operate at the kernel level, they cannot provide application-level instrumentation; for some deep application-context tasks, in-process instrumentation still wins.

##### What is eBPF for Windows?

It is a Microsoft-led project bringing the eBPF programming model to Windows. eBPF runs on Linux and Windows; the Windows implementation is MIT-licensed and hosted at github.com/Microsoft/ebpf-for-windows. The goal is to let existing eBPF programs and toolchains work on Windows, so developers can write portable eBPF code across both operating systems.

##### Where is eBPF headed in the next few years?

The trajectory points to broader adoption beyond Linux (eBPF for Windows maturing), deeper integration into cloud-native infrastructure, and stronger language and tooling support. Go bindings such as the pure-Go cilium/ebpf library continue to be updated for new syscalls and map types, and there is emerging though still experimental interest in eBPF and WASM integration. The eBPF Foundation's existence signals continued investment in standardization and growth across networking, observability, and security.

### The Journey to Learn eBPF (Security & Observability Focus)

This is a learning path that **Claude Opus 4.7** defined: a route to master eBPF with focus on security and observability, built on solid fundamentals and organized from foundation to applied mastery. The mapping aligns with the actual content categories in the gojue/ebpf-slide repository (Security, Observability, Tracing/Profiling, eBPF Basic, eBPF Advanced, Networking, Android).

#### Technical Foundation (1-7)

##### 1. C language at intermediate/advanced level
eBPF programs are written in restricted C. You need to be comfortable with pointers, structs, macros, bitwise operations, and the preprocessor. Without this, reading libbpf and kernel helpers becomes torture.

##### 2. Linux operating system and kernel architecture
Understand user space vs. kernel space, syscalls, scheduler, memory management, namespaces, cgroups, and the process/thread model. Without this base, helpers like `bpf_get_current_task()` or concepts like pid namespaces in containers make no sense.

##### 3. x86_64 and ARM64 assembly (reading, not writing)
You will not write assembly, but you need to read it. Disassembly of BPF programs, understanding calling conventions (System V AMD64 ABI), registers, and how arguments arrive at functions is essential for uprobes and binary analysis, especially when tracing Go, Rust, and inline functions.

##### 4. Linux syscalls and the kernel API
Knowing the main syscalls (`execve`, `openat`, `connect`, `accept`, `read`, `write`, `ptrace`, `clone`) is bread and butter in security. Knowing where they enter the kernel (tracepoints `sys_enter_*`, LSM hooks, kprobes) defines where you will place your program.

##### 5. Linux networking stack
TCP/IP, sockets, netfilter, traffic control (tc), XDP hooks, sk_buff, conntrack. Even when focusing on security, much detection depends on traffic inspection (DNS exfiltration, C2, lateral movement), and the networking slides in the repo are dense on this.

##### 6. Binary formats: ELF and DWARF/BTF
eBPF programs are ELFs. CO-RE depends on BTF (BPF Type Format). uprobes depend on resolving symbols via DWARF/ELF. Without understanding sections, symbols, and relocations, you cannot debug real portability problems.

##### 7. Kernel build system and kernel headers
Knowing how to compile a kernel, navigate `linux/include/uapi/`, read `include/linux/bpf.h`, and locate structs like `task_struct` and `sock`. In production, you will need to map fields across kernel versions.

#### eBPF Mechanics (8-13)

##### 8. The eBPF execution model
Maps, programs, attach points, tail calls, BPF-to-BPF calls, BPF trampolines, fentry/fexit. Understanding what a BPF instruction is, what the JIT does, and why there is an instruction limit (and how to work around it with tail calls).

##### 9. The BPF verifier, intimately
This is where 80% of beginners get stuck. You need to understand register state tracking, bounds checking, allowed pointer arithmetic, bounded loops (`bpf_loop`), and why your "obvious" program is rejected. The "Peeking into BPF verifier" slide in the repo is required reading.

##### 10. CO-RE (Compile Once, Run Everywhere) and BTF
The difference between BCC (compiles on the target host, heavy) and libbpf+CO-RE (compile once, runs on many kernels) is what separates a POC from production. Master `BPF_CORE_READ`, relocations, and `vmlinux.h`.

##### 11. BPF maps, all relevant types
Hash, array, per-CPU, LRU, ring buffer, perf event array, stack trace, LPM trie. Knowing when to use which one defines performance and correctness. Ring buffer (kernel 5.8+) replaced perf buffer in many observability cases.

##### 12. Probe types and their trade-offs
kprobes/kretprobes, tracepoints, raw tracepoints, fentry/fexit, uprobes/uretprobes, USDT, LSM hooks, XDP, tc, cgroup, socket filters. Each has different cost, ABI stability, and capabilities. Tracepoints are stable; kprobes are fragile across versions. That matters in production.

##### 13. Ecosystem libraries and toolchains
libbpf (C, de facto standard), cilium/ebpf (Go, great for single-binary tools), aya (Rust), BCC (legacy but useful), bpftrace (DSL for quick exploration), bpftool (essential utility). Choosing wrong costs months.

#### Applied Mastery (14-17)

##### 14. Observability: USE/RED, distributed tracing, and continuous profiling
USE (Utilization/Saturation/Errors) and RED (Rate/Errors/Duration) methods, context propagation, flame graphs, on-CPU vs off-CPU analysis. Brendan Gregg is the reference. His slides in the repo (`bpf_internals_tracing_examples`, `USENIX_ATC2017_BPF_superpowers`) are canonical.

##### 15. Security: threat models and runtime detection
MITRE ATT&CK, container escape TTPs, kernel exploits, LD_PRELOAD rootkits vs eBPF rootkits, anti-evasion (Phantom Attack / TOCTOU on syscall args, exactly what the "Phantom Attack" slide in the repo covers). Knowing what to detect is as important as knowing how.

##### 16. Containers, Kubernetes, and cloud-native
Namespaces (pid, net, mnt, user), cgroups v1/v2, OCI runtime, CRI, CNI. Correlating kernel events with pods/containers requires understanding how Linux represents isolation. Falco, Tetragon, and Cilium live in this world.

##### 17. Reference tools, study the source code
Cilium/Tetragon (Isovalent), Falco, Tracee (Aqua), Pixie, Parca, Inspektor Gadget, Katran, bpftrace tools. Not just using, but opening the code and understanding design choices. Reading Tetragon source teaches more about production security eBPF than any book.

#### Engineer Discipline (18-20)

##### 18. Performance engineering and low latency
Cache lines, false sharing, per-CPU data structures, NUMA, probe overhead (uprobes are expensive, kernel tracepoints are not), batching, sampling vs full capture. A security agent that eats 30% of CPU will not go to production.

##### 19. eBPF debugging
`bpf_printk` (and why to avoid it in production), `bpftool prog`, `bpftool map`, perf events, kernel logs, `dmesg` for verifier errors, gdb on the userspace loader, and analyzing a rejected program by reading the verifier log line by line. Without this you stay stuck.

##### 20. The eBPF security model itself
eBPF is also an attack surface. Historical verifier CVEs, Spectre in BPF (Daniel Borkmann's slide in the repo: "BPF and Spectre"), capabilities (`CAP_BPF`, `CAP_PERFMON`, `CAP_SYS_ADMIN`), unprivileged BPF disabled, kernel hardening, and the "us-21-With-Friends-Like-EBPF-Who-Needs-Enemies" slide, which shows eBPF being used offensively. Anyone working in security needs to think about both sides.

#### Suggested Study Path

Practical study order using the repo itself: `eBPF_basic` (covers 1-13) then `tracing_profiling` (Brendan Gregg to anchor 14), then `observability_monitoring`, then `security` (16, 17, 20), then `eBPF_advanced` (verifier, CO-RE, JIT, Spectre).

A useful shortcut: after items 1-7, read Liz Rice's *Learning eBPF* in parallel with her slide in the repo (`LIz_Rice-Beginners_guide_to_eBPF`), then go straight to the Tetragon or Tracee source code. They materialize almost all 20 points in real production.

#### A Closing Note

Let's be honest: eBPF is a hard subject. It is not something you pick up in a weekend, and most of this list assumes prior experience — comfort with C, a real mental model of the Linux kernel, and time spent debugging things that fail in non-obvious ways. The verifier alone humbles most people. So if this feels overwhelming, that is normal, not a sign you are not cut out for it.

But hard is not the same as impossible. Every item here is learnable, one at a time, and you do not need all 20 before doing something useful. Start small, accept that you will be stuck often, and keep going. The barrier is real, and it can be crossed.
