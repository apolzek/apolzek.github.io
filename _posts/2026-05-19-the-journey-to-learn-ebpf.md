---
layout: post
title: the journey to learn ebpf
description: A map of questions and a 20-point study path for anyone starting out with eBPF, focused on security and observability.
summary: A map of questions and a 20-point study path for anyone starting out with eBPF, focused on security and observability.
# tags: ebpf linux prerequisites
minute: 15
---

This article has two parts. The first is a map of questions about eBPF, moving from
general to specific, with answers that are deliberately concise. The second is a
20-point study path for anyone who wants to learn eBPF with a focus on security and
observability. The questions are written as a FAQ: each one stands on its own and can
be read out of order.

A note on method: a good way to study a new subject is to ask questions, refine them,
and build new ones along the way. That is the approach this article takes.

> The questions were made using the Opus 4.7 model from claude.ai.

## Table of Contents

- [General questions](#general-questions)
  - [What is eBPF ?](#what-is-ebpf)
  - [What is the difference between eBPF and BPF ?](#what-is-the-difference-between-ebpf-and-bpf)
  - [Why, by whom, and when was eBPF created ?](#why-by-whom-and-when-was-ebpf-created)
  - [What are the main changes to eBPF throughout its history ?](#what-are-the-main-changes-to-ebpf-throughout-its-history)
  - [What are the main tools built using eBPF ?](#what-are-the-main-tools-built-using-ebpf)
  - [Who are the key technical references in eBPF ?](#who-are-the-key-technical-references-in-ebpf)
- [Specific questions](#specific-questions)
  - [How does eBPF actually work under the hood ?](#how-does-ebpf-actually-work-under-the-hood)
  - [What is the eBPF verifier and why does it matter ?](#what-is-the-ebpf-verifier-and-why-does-it-matter)
  - [What are eBPF maps and how are they used ?](#what-are-ebpf-maps-and-how-are-they-used)
  - [What are the different eBPF program types and hook points ?](#what-are-the-different-ebpf-program-types-and-hook-points)
  - [How does the JIT compiler fit into eBPF ?](#how-does-the-jit-compiler-fit-into-ebpf)
  - [What are the safety guarantees of eBPF and what are its limitations ?](#what-are-the-safety-guarantees-of-ebpf-and-what-are-its-limitations)
  - [How does eBPF compare to kernel modules ?](#how-does-ebpf-compare-to-kernel-modules)
  - [Why is eBPF often described as "superpowers for the kernel" ?](#why-is-ebpf-often-described-as-superpowers-for-the-kernel)
  - [What problems did eBPF solve that weren't solvable before ?](#what-problems-did-ebpf-solve-that-werent-solvable-before)
  - [What are the main use cases for eBPF ?](#what-are-the-main-use-cases-for-ebpf)
  - [How is eBPF used in production at large companies ?](#how-is-ebpf-used-in-production-at-large-companies)
  - [What is XDP and how does it relate to eBPF ?](#what-is-xdp-and-how-does-it-relate-to-ebpf)
  - [What is the difference between BCC, bpftrace, and libbpf ?](#what-is-the-difference-between-bcc-bpftrace-and-libbpf)
  - [What is CO-RE and why does it matter ?](#what-is-co-re-and-why-does-it-matter)
  - [How does Cilium use eBPF ?](#how-does-cilium-use-ebpf)
  - [What kernel version do I need for eBPF ?](#what-kernel-version-do-i-need-for-ebpf)
  - [What do I need to know to write my first eBPF program ?](#what-do-i-need-to-know-to-write-my-first-ebpf-program)
  - [What languages can I use to write eBPF programs ?](#what-languages-can-i-use-to-write-ebpf-programs)
  - [How do I debug an eBPF program ?](#how-do-i-debug-an-ebpf-program)
  - [What are common pitfalls when getting started with eBPF ?](#what-are-common-pitfalls-when-getting-started-with-ebpf)
  - [What can't eBPF do (yet) ?](#what-cant-ebpf-do-yet)
  - [What is eBPF for Windows ?](#what-is-ebpf-for-windows)
  - [Where is eBPF headed in the next few years ?](#where-is-ebpf-headed-in-the-next-few-years)
- [The Journey to Learn eBPF (Security & Observability Focus)](#the-journey-to-learn-ebpf-security--observability-focus)
  - [Technical Foundation (1-7)](#technical-foundation-1-7)
  - [eBPF Mechanics (8-13)](#ebpf-mechanics-8-13)
  - [Applied Mastery (14-17)](#applied-mastery-14-17)
  - [Engineer Discipline (18-20)](#engineer-discipline-18-20)
  - [Suggested Study Path](#suggested-study-path)
- [A Closing Note](#a-closing-note)

## General questions

##### What is eBPF ?

eBPF is a technology that lets you run small, sandboxed programs inside the Linux
kernel without changing kernel source code or loading kernel modules. It can be thought
of as a sandboxed virtual machine running custom code directly inside the kernel.
Programs are event-driven (triggered by hooks), verified for safety before they run,
and execute at near-native performance. In effect, eBPF turns the kernel into a
programmable platform.

##### What is the difference between eBPF and BPF ?

"BPF" originally meant Berkeley Packet Filter, a 1990s mechanism for filtering network
packets. "eBPF" is the modern, extended redesign. The extended instruction set first
appeared in Linux 3.15, and the `bpf()` syscall and maps landed in Linux 3.18. Since
then, the original BPF has been called classic BPF (cBPF), which is now largely
deprecated.

The key technical differences: the extended design replaced cBPF's two 32-bit
registers (an accumulator and an index register, plus a hidden frame pointer) with ten
64-bit general-purpose registers and a read-only frame pointer. It also added the
ability to call kernel helper functions and to share data through maps. Today the
kernel only runs eBPF; classic BPF bytecode is transparently translated into eBPF
before execution. In practice, "BPF" and "eBPF" are now often used interchangeably to
mean the modern technology.

##### Why, by whom, and when was eBPF created ?

The original BPF was created in 1992 by Van Jacobson and colleagues because existing
packet filters were too slow for kernel use. As networking evolved, BPF's limitations
became apparent: it was not adapted to modern multi-processor systems, it was
stateless, and it was hard for developers to extend. To address this, in early 2014
Alexei Starovoitov implemented eBPF, which after redesign evolved into a
general-purpose execution engine. Daniel Borkmann is the other principal original
author. The `bpf()` syscall was added to the Linux kernel in December 2014, in
version 3.18.

##### What are the main changes to eBPF throughout its history ?

The major milestones:

- **2014** — eBPF arrives in Linux 3.18 with a redesigned instruction set, the `bpf()`
  syscall, and maps.
- **2015** — Since kernel 3.19, eBPF programs can be attached to sockets; since 4.1,
  to kprobes and to traffic control classifiers for the ingress and egress data path.
- **2016 onward** — The explosion into tracing, observability, and security use cases.
- **~2019–2020** — CO-RE (Compile Once, Run Everywhere) and BTF make eBPF programs
  portable across kernel versions, a key inflection point.
- **Later additions** — BPF LSM hooks for security enforcement, the ring buffer
  (kernel 5.8), and eBPF for Windows.

##### What are the main tools built using eBPF ?

The widely used ones include BCC, bpftrace, Cilium, Tetragon, Falco, Pixie, Inspektor
Gadget, Tracee, Parca, and kubectl-trace — mature, production-tested solutions for
performance analysis, troubleshooting, and security monitoring.

Briefly: Cilium provides eBPF-based Kubernetes networking and security; Tetragon does
runtime security enforcement; Pixie does auto-instrumentation for Kubernetes apps with
no code changes; and Falco does runtime security observability, detecting anomalous
behavior. bpftrace and BCC are the go-to tracing and diagnostics toolkits, and Hubble
provides network observability on top of Cilium.

##### Who are the key technical references in eBPF ?

Pioneers of the technology include Alexei Starovoitov, Daniel Borkmann, Thomas Graf,
Brendan Gregg, David Miller, and Liz Rice, all of whom have been instrumental in
eBPF's growth. Starovoitov and Borkmann are the core kernel maintainers. Brendan Gregg
is often called eBPF's "patron saint"; his site has the Linux performance tools map,
the flame graph methodology, and years of BPF/bpftrace writeups, and he wrote the book
*BPF Performance Tools*. Andrii Nakryiko leads the libbpf and BPF CO-RE work, and
Thomas Graf and Liz Rice are prominent on the Cilium and cloud-native side.

## Specific questions

##### How does eBPF actually work under the hood ?

The lifecycle: a developer writes a program (usually in restricted C), compiles it to
eBPF bytecode with Clang/LLVM, then loads it into the kernel via the `bpf()` syscall.
The kernel runs a verification process to confirm the program is safe; if it is deemed
unsafe, the system call fails. If it passes, the kernel uses either an interpreter or a
JIT compiler to convert the bytecode into machine code. eBPF is event-driven, so it
runs in response to specific hook points: when an event occurs, the kernel runs the
corresponding program, and developers interact with it from user space using eBPF
maps.

##### What is the eBPF verifier and why does it matter ?

The verifier is the security gate that makes eBPF safe to run in the kernel. It checks
the bytecode before the program is loaded to make sure it contains no harmful
operations — infinite loops, illegal instructions, out-of-bounds memory access — and it
ensures that all data paths terminate successfully. It also validates that the loading
process holds the required privileges and that the program always runs to completion.
It matters because it is what allows custom code to run in kernel space without
crashing or compromising the system.

##### What are eBPF maps and how are they used ?

eBPF maps are key-value data structures with read/write access. They provide shared
storage and let eBPF kernel programs interact with user-space applications. Created and
managed through system calls, they can also maintain state between different runs of an
eBPF program. Map types include hash tables, arrays, ring buffers, stack traces,
least-recently-used (LRU) variants, longest-prefix-match (LPM) tries, and more. A
typical pattern: a kernel program writes counters or events into a map, and a
user-space agent reads them out.

##### What are the different eBPF program types and hook points ?

Each eBPF program type represents a different interface or hook point in the kernel's
workflow. By selecting a program type at load time, the developer defines which kernel
functions or events the program can attach to, which data structures it can access,
and which helper functions it can call.

Common hook points include XDP (network driver level), TC (traffic control), socket
filters, kprobes (kernel functions), tracepoints (stable kernel events), uprobes (user
functions), and perf events (hardware), plus LSM hooks for security enforcement.

##### How does the JIT compiler fit into eBPF ?

After the verifier approves a program, the JIT (Just-In-Time) compiler translates the
eBPF bytecode into native machine code for the host CPU, giving near-native
performance. On x86_64, eBPF instructions map almost 1:1 to native instructions. This
is what gives eBPF its speed advantage; without JIT, the kernel falls back to a slower
interpreter.

##### What are the safety guarantees of eBPF and what are its limitations ?

The verifier enforces several guarantees: the program can only be loaded by a
privileged process (unless configured otherwise), it will not damage or crash the
system, and it will always run to completion rather than sit in an endless loop.

The flip side is a set of restrictions: bounded loops only, limited program size and
complexity, no arbitrary memory access, and no arbitrary calls into kernel functions —
a program must use a fixed set of kernel-provided helper functions instead. This
deliberately limits expressiveness in exchange for safety.

##### How does eBPF compare to kernel modules ?

Kernel modules (LKMs) can do anything but are risky: a bug can crash or compromise the
whole system, and they are hard to debug. eBPF programs are verified, sandboxed, can be
loaded and unloaded dynamically at runtime, and are portable. eBPF is far from
completely replacing LKMs, but it sets itself apart by bringing great flexibility while
mitigating risk through solid safety controls. The trade-off: modules are unrestricted,
eBPF is constrained by the verifier.

##### Why is eBPF often described as "superpowers for the kernel" ?

Because it lets you safely add new capabilities to the kernel — networking,
observability, security — at runtime, without recompiling or rebooting. Historically,
innovating at the operating system level was slow: adding modules or modifying kernel
source meant working through abstracted layers and complex infrastructure that are
difficult to debug. A common analogy: eBPF is to the kernel what JavaScript is to the
browser — a safe way to program something that was previously fixed.

##### What problems did eBPF solve that weren't solvable before ?

Before eBPF, deep kernel-level visibility and custom logic required either kernel
modules (dangerous) or user-space tools (slow, with constant copying of data between
kernel and user space). eBPF lets you run logic where the events actually happen.
Traditional observability requires instrumenting your code; eBPF lets you observe a
system without changing a single line of application code, directly from the kernel.
It also enabled faster packet processing than older mechanisms such as iptables.

##### What are the main use cases for eBPF ?

The four big categories:

- **Networking** — fast packet processing, load balancing, replacing iptables and
  kube-proxy (Cilium).
- **Observability** — metrics, tracing, profiling, and latency histograms without code
  instrumentation (Pixie, Parca, bpftrace).
- **Security** — runtime threat detection and enforcement at the kernel level (Falco,
  Tetragon, KubeArmor).
- **Tracing and debugging** — inspecting syscalls, function calls, and I/O live on
  production systems.

##### How is eBPF used in production at large companies ?

Companies such as Meta, Google, Netflix, and Cloudflare run eBPF in production. Modern
Kubernetes networking is built on it, as are tools like Cilium, Falco, Pixie, and
Parca. In Kubernetes specifically, eBPF is usually deployed as a privileged DaemonSet
that loads programs into each node's kernel for networking, observability, and
security.

##### What is XDP and how does it relate to eBPF ?

XDP (eXpress Data Path) is a specific eBPF hook point at the earliest stage of the
network stack — the network driver level — ideal for DDoS mitigation and packet
filtering. Because the eBPF program runs before the kernel builds heavier networking
data structures, XDP enables extremely fast packet processing (drop, redirect,
modify), which makes it popular for high-performance networking and DDoS defense.

##### What is the difference between BCC, bpftrace, and libbpf ?

They sit at different abstraction levels. bpftrace is a high-level tracing language
that makes eBPF accessible through concise one-liners, designed for quick
investigations. BCC (BPF Compiler Collection) is a toolkit and framework, historically
with Python bindings, offering many pre-built tracing tools. libbpf with CO-RE is the
production path for writing custom eBPF C programs. A rough rule: bpftrace for ad-hoc
one-liners, BCC for ready-made tools and scripting, libbpf for shipping production
software.

##### What is CO-RE and why does it matter ?

CO-RE (Compile Once, Run Everywhere) solves eBPF's portability problem across kernel
versions. It uses BTF (BPF Type Format) metadata to relocate struct field offsets at
load time, so a compiled binary works across different kernel versions. CO-RE programs
compile against BTF type information and run on any kernel that exposes BTF, without
recompilation. It matters because before CO-RE, programs often had to be recompiled
per-kernel and needed kernel headers on every target machine; CO-RE makes one binary
portable.

##### How does Cilium use eBPF ?

Cilium is an open source project that provides eBPF-powered networking, security, and
observability, designed from the ground up to bring eBPF's advantages to Kubernetes and
to meet the scalability, security, and visibility requirements of container workloads.
It replaces kube-proxy and enforces NetworkPolicy at wire speed. Its companion, Hubble,
adds network observability on top.

##### What kernel version do I need for eBPF ?

It depends on which features you need, but here are the practical milestones:

- **BTF** (required for CO-RE) — kernel 5.2+.
- **Bounded loop support** — kernel 5.3+.
- **Ring buffer** (replaces the perf buffer in many cases) — kernel 5.8+.
- **`CAP_BPF` / `CAP_PERFMON`** (more granular than `CAP_SYS_ADMIN`) — kernel 5.8+.

For production use, kernel 5.15 LTS or newer is a sensible practical minimum, and most
recent distributions ship with BTF enabled out of the box. You can check for BTF by
verifying that `/sys/kernel/btf/vmlinux` exists.

##### What do I need to know to write my first eBPF program ?

Practically: a reasonably recent Linux kernel with BTF enabled, the LLVM/Clang
toolchain, and a loader library. A good starting path is to begin with bpftrace
one-liners, then explore the BCC toolkit for pre-built observability tools, and read
the libbpf documentation when you are ready to write custom programs. You will need to
understand hook points, maps, helper functions, and the verifier's constraints
(bounded loops, limited complexity).

A concrete first taste — this one-liner prints the name of every process that calls
`execve`:

```bash
sudo bpftrace -e 'tracepoint:syscalls:sys_enter_execve { printf("%s\n", comm); }'
```

No compilation, no setup beyond installing bpftrace — it is the fastest way to see
eBPF do something useful.

##### What languages can I use to write eBPF programs ?

The eBPF program itself (the kernel side) is typically written in a restricted subset
of C and compiled to bytecode; Rust is increasingly supported. The user-space loader
and control side can be written in many languages: the production path uses C with
libbpf; for Python users, BCC provides Python bindings; for Go users, Cilium's
ebpf-go library is the standard choice. bpftrace also offers its own high-level
language, inspired by awk and DTrace's D language.

##### How do I debug an eBPF program ?

Common approaches: read verifier rejection messages, which explain why a program
failed; use `bpf_printk`-style logging to a trace pipe; inspect map contents from user
space; and use tooling like `bpftool` to introspect loaded programs and maps. Starting
with bpftrace or BCC is easier, since they surface errors more readably than raw
libbpf.

##### What are common pitfalls when getting started with eBPF ?

Frequent ones:

- Fighting the verifier — unbounded loops, pointer arithmetic it cannot prove safe,
  programs that are too large or complex.
- Kernel version differences breaking programs (the problem CO-RE addresses).
- Forgetting that helper functions, not arbitrary kernel calls, are the only way to
  call into the kernel.
- Underestimating the overhead of high-frequency probes on hot paths.
- Forgetting that loading programs requires elevated privileges.

##### What can't eBPF do (yet) ?

eBPF is deliberately constrained: no unbounded loops, limited program complexity and
size, no arbitrary kernel function calls (only helpers), and limited memory access. It
is not a general-purpose replacement for kernel modules when you need unrestricted
capability. And because eBPF-based approaches operate at the kernel level, they cannot
provide application-level instrumentation; for some deep application-context tasks,
in-process instrumentation still wins.

##### What is eBPF for Windows ?

It is a Microsoft-led project that brings the eBPF programming model to Windows. The
Windows implementation is MIT-licensed and hosted at
`github.com/microsoft/ebpf-for-windows`. The goal is to let existing eBPF programs and
toolchains work on Windows, so developers can write portable eBPF code across both
operating systems.

##### Where is eBPF headed in the next few years ?

The trajectory points to broader adoption beyond Linux (eBPF for Windows maturing),
deeper integration into cloud-native infrastructure, and stronger language and tooling
support. Go bindings such as the pure-Go `cilium/ebpf` library continue to be updated
for new syscalls and map types, and there is emerging — though still experimental —
interest in combining eBPF with WebAssembly. The existence of the eBPF Foundation
signals continued investment in standardization and growth across networking,
observability, and security.

## The Journey to Learn eBPF (Security & Observability Focus)

This is a learning path defined by **Claude Opus 4.7**: a route to master eBPF with a
focus on security and observability, built on solid fundamentals and organized from
foundation to applied mastery. The mapping aligns with the content categories in the
`gojue/ebpf-slide` repository (Security, Observability, Tracing/Profiling, eBPF Basic,
eBPF Advanced, Networking, Android).

The 20 points are grouped into four stages. Not all of them are equally urgent at the
start: items 1, 2, 8, and 9 are non-negotiable before writing anything serious, while
items like 3 and 18 can wait until later.

### Technical Foundation (1-7)

**1. C language at intermediate/advanced level.**
eBPF programs are written in restricted C. You need to be comfortable with pointers,
structs, macros, bitwise operations, and the preprocessor. Without this, reading libbpf
and kernel helpers becomes torture.

**2. Linux operating system and kernel architecture.**
Understand user space vs. kernel space, syscalls, the scheduler, memory management,
namespaces, cgroups, and the process/thread model. Without this base, helpers like
`bpf_get_current_task()` or concepts like PID namespaces in containers make no sense.

**3. x86_64 and ARM64 assembly (reading, not writing).**
You will not write assembly, but you need to read it. Disassembling BPF programs,
understanding calling conventions (the System V AMD64 ABI), registers, and how
arguments arrive at functions is essential for uprobes and binary analysis, especially
when tracing Go, Rust, and inlined functions.

**4. Linux syscalls and the kernel API.**
Knowing the main syscalls (`execve`, `openat`, `connect`, `accept`, `read`, `write`,
`ptrace`, `clone`) is bread and butter in security. Knowing where they enter the kernel
(`sys_enter_*` tracepoints, LSM hooks, kprobes) defines where you place your program.

**5. Linux networking stack.**
TCP/IP, sockets, netfilter, traffic control (tc), XDP hooks, `sk_buff`, conntrack. Even
with a security focus, much detection depends on traffic inspection (DNS exfiltration,
C2, lateral movement), and the networking slides in the repo are dense on this.

**6. Binary formats: ELF and DWARF/BTF.**
eBPF programs are ELF files. CO-RE depends on BTF (BPF Type Format). uprobes depend on
resolving symbols via DWARF/ELF. Without understanding sections, symbols, and
relocations, you cannot debug real portability problems.

**7. Kernel build system and kernel headers.**
Knowing how to compile a kernel, navigate `linux/include/uapi/`, read
`include/linux/bpf.h`, and locate structs like `task_struct` and `sock`. In production,
you will need to map fields across kernel versions.

### eBPF Mechanics (8-13)

**8. The eBPF execution model.**
Maps, programs, attach points, tail calls, BPF-to-BPF calls, BPF trampolines,
fentry/fexit. Understand what a BPF instruction is, what the JIT does, and why there is
an instruction limit (and how to work around it with tail calls).

**9. The BPF verifier, intimately.**
This is where most beginners get stuck. You need to understand register state
tracking, bounds checking, allowed pointer arithmetic, bounded loops (`bpf_loop`), and
why your "obvious" program is rejected. The "Peeking into BPF verifier" slide in the
repo is required reading.

**10. CO-RE and BTF.**
The difference between BCC (compiles on the target host, heavy) and libbpf + CO-RE
(compile once, run on many kernels) is what separates a proof of concept from
production. Master `BPF_CORE_READ`, relocations, and `vmlinux.h`.

**11. BPF maps, all relevant types.**
Hash, array, per-CPU, LRU, ring buffer, perf event array, stack trace, LPM trie.
Knowing when to use which one defines performance and correctness. The ring buffer
(kernel 5.8+) replaced the perf buffer in many observability cases.

**12. Probe types and their trade-offs.**
kprobes/kretprobes, tracepoints, raw tracepoints, fentry/fexit, uprobes/uretprobes,
USDT, LSM hooks, XDP, tc, cgroup, socket filters. Each has different cost, ABI
stability, and capabilities. Tracepoints are stable; kprobes are fragile across
versions. That matters in production.

**13. Ecosystem libraries and toolchains.**
libbpf (C, de facto standard), `cilium/ebpf` (Go, great for single-binary tools), aya
(Rust), BCC (legacy but useful), bpftrace (DSL for quick exploration), bpftool
(essential utility). Choosing wrong costs months.

### Applied Mastery (14-17)

**14. Observability: USE/RED, distributed tracing, and continuous profiling.**
The USE (Utilization/Saturation/Errors) and RED (Rate/Errors/Duration) methods, context
propagation, flame graphs, on-CPU vs. off-CPU analysis. Brendan Gregg is the reference;
his slides in the repo (`bpf_internals_tracing_examples`,
`USENIX_ATC2017_BPF_superpowers`) are canonical.

**15. Security: threat models and runtime detection.**
MITRE ATT&CK, container escape TTPs, kernel exploits, LD_PRELOAD rootkits vs. eBPF
rootkits, anti-evasion (the Phantom Attack / TOCTOU on syscall arguments, exactly what
the "Phantom Attack" slide in the repo covers). Knowing what to detect is as important
as knowing how.

**16. Containers, Kubernetes, and cloud-native.**
Namespaces (pid, net, mnt, user), cgroups v1/v2, the OCI runtime, CRI, CNI. Correlating
kernel events with pods and containers requires understanding how Linux represents
isolation. Falco, Tetragon, and Cilium live in this world.

**17. Reference tools — study the source code.**
Cilium/Tetragon (Isovalent), Falco, Tracee (Aqua), Pixie, Parca, Inspektor Gadget,
Katran, bpftrace tools. Not just using them, but opening the code and understanding the
design choices. Reading the Tetragon source teaches more about production security
eBPF than any book.

### Engineer Discipline (18-20)

**18. Performance engineering and low latency.**
Cache lines, false sharing, per-CPU data structures, NUMA, probe overhead (uprobes are
expensive, kernel tracepoints are not), batching, sampling vs. full capture. A security
agent that eats 30% of CPU will not go to production.

**19. eBPF debugging.**
`bpf_printk` (and why to avoid it in production), `bpftool prog`, `bpftool map`, perf
events, kernel logs, `dmesg` for verifier errors, gdb on the user-space loader, and
analyzing a rejected program by reading the verifier log line by line. Without this you
stay stuck.

**20. The eBPF security model itself.**
eBPF is also an attack surface. Historical verifier CVEs, Spectre in BPF (Daniel
Borkmann's "BPF and Spectre" slide in the repo), capabilities (`CAP_BPF`,
`CAP_PERFMON`, `CAP_SYS_ADMIN`), unprivileged BPF being disabled by default, kernel
hardening, and the "With Friends Like eBPF, Who Needs Enemies ?" slide, which shows eBPF
being used offensively. Anyone working in security needs to think about both sides.

### Suggested Study Path

A practical study order using the repo itself: `eBPF_basic` (covers 1-13), then
`tracing_profiling` (Brendan Gregg, to anchor 14), then `observability_monitoring`,
then `security` (16, 17, 20), then `eBPF_advanced` (verifier, CO-RE, JIT, Spectre).

A useful shortcut: after items 1-7, read Liz Rice's *Learning eBPF* in parallel with
her slide in the repo (`LIz_Rice-Beginners_guide_to_eBPF`), then go straight to the
Tetragon or Tracee source code. They materialize almost all 20 points in real
production.

## A Closing Note

Let's be honest: I'm just starting my journey into eBPF, and it is a genuinely hard subject. It is not something you pick up in a weekend, and doing well in it presupposes a vast base of prior knowledge, including comfort with C, a real mental model of how the Linux kernel works, and time spent debugging things that fail in non-obvious ways. The verifier alone is enough to humble most people. The answers to the questions in this article are superficial, but they give us a good idea of what we're getting into, serving as a starting point for understanding the terrain before going deeper. **Ref**: https://github.com/gojue/ebpf-slide
