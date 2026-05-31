---
layout: post
title: "[review] golang"
permalink: /review/golang/
description: A hands-on refresher on Go, from zero values up to goroutines, channels, select, context, the scheduler, and what changed in the last four releases.
summary: A hands-on refresher on Go, from zero values up to goroutines, channels, select, context, the scheduler, and what changed in the last four releases.
# tags: go golang concurrency goroutines channels runtime
minute: 41
---

This is the article I wish someone had handed me when I needed to *refresh* Go in a weekend.
Not a textbook, not a 600-page tome, but a guided climb that starts with the language's
philosophy and ends with you reasoning about goroutines, channels, the scheduler, and
cancellation the way the runtime actually does.

The order is deliberately bottom-up: we start with what makes Go *Go* (the design choices), get
the type system and zero values straight, walk through structs, interfaces, and the many shapes
a function can take, and only then climb into the parts that are genuinely unique to the
language: closures, `defer`, goroutines, channels, `select`, `WaitGroup`, the memory model, and
`context`. We finish with what actually changed in the last four releases and a tour of the
biggest things the world has built in Go.

I lean on one recurring trick: **suppose** something concrete, then trace it through the
runtime. Concurrency especially clicks the moment you stop reciting "goroutines are cheap" and
start following who is blocked, who is waiting, who owns the data, and who closes the channel.

> A note on altitude: this piece slides up and down constantly. One section is about a `for`
> loop, the next is about the G-M-P scheduler or the happens-before relationship. That is the
> point. Go is a small language with a deep runtime, and you only understand it by moving
> through both.

## Table of Contents

- [What makes Go unique](#what-makes-go-unique)
- [Types and zero values](#types-and-zero-values)
- [Variables, constants, and iota](#variables-constants-and-iota)
- [Control flow](#control-flow)
- [Composite types: arrays, slices, maps](#composite-types-arrays-slices-maps)
- [Structs and methods](#structs-and-methods)
- [Interfaces](#interfaces)
- [Pointers and memory](#pointers-and-memory)
- [Functions: every shape](#functions-every-shape)
- [Anonymous functions and closures](#anonymous-functions-and-closures)
- [Defer, panic, and recover](#defer-panic-and-recover)
- [Errors are values](#errors-are-values)
- [Goroutines](#goroutines)
- [Channels](#channels)
- [Select](#select)
- [WaitGroups, mutexes, and the memory model](#waitgroups-mutexes-and-the-memory-model)
- [Concurrency patterns](#concurrency-patterns)
- [Context](#context)
- [Generics](#generics)
- [Packages and modules](#packages-and-modules)
- [HTTP, middleware, and web frameworks](#http-middleware-and-web-frameworks)
- [Testing and benchmarks](#testing-and-benchmarks)
- [Benchmarking and profiling](#benchmarking-and-profiling)
- [The garbage collector and the runtime](#the-garbage-collector-and-the-runtime)
- [The toolchain](#the-toolchain)
- [What's new in recent Go (1.22 to 1.25)](#whats-new-in-recent-go-122-to-125)
- [The 20 largest open-source Go projects](#the-20-largest-open-source-go-projects)
- [Go proverbs](#go-proverbs)
- [Closing thought](#closing-thought)

## What makes Go unique

Before any syntax, it helps to know *why* Go looks the way it does, because almost every "why is
it like this?" has a design answer. Go was created at Google in 2007 (open-sourced in 2009) by
Rob Pike, Ken Thompson, and Robert Griesemer, who were tired of slow builds, tangled dependency
graphs, and C++ complexity. The whole language is a reaction to that pain: keep it small, make
it fast to compile, and bake concurrency in.

| Characteristic | What it means | Why it matters |
|----------------|---------------|----------------|
| Compiled to a static binary | One native executable, no external runtime | Deploy a single file, copy it anywhere, build a 6 MB scratch container |
| Statically typed | Types checked at compile time | Whole classes of bugs never reach production |
| Garbage collected | Concurrent, low-latency GC | No manual `malloc`/`free`, no use-after-free |
| Concurrency built in | Goroutines and channels are language features | The CSP model instead of bolted-on threads |
| Fast compilation | Large projects build in seconds | A tight edit-run feedback loop |
| Composition over inheritance | No classes, no inheritance | Behavior is explicit and predictable |
| `gofmt` | One official, non-negotiable format | The end of style arguments |
| Cross-compilation | `GOOS`/`GOARCH` target any platform | `GOOS=linux go build` from a Mac |
| ~25 keywords | Deliberately small surface | You can hold the whole language in your head |
| Implicit interfaces | Satisfied by having the methods, no `implements` | Loose coupling without ceremony |

The design has a clear ranking of priorities: **readability and maintainability at scale, then
tooling, then performance, then expressiveness.** That ordering is unusual. Most languages chase
expressiveness first; Go deliberately refuses features (ternary operators, implicit numeric
conversions, inheritance, exceptions, operator overloading) that make code shorter to write but
harder to read later. The bet is that code is read far more often than it is written, especially
on a team of hundreds, which is the environment Go was forged in.

> The recurring theme: **Go optimizes for the reader, not the writer.** "Clear is better than
> clever" is not a slogan, it is the reason the language is small and a little verbose on
> purpose. Once you accept that, the rest of Go's choices stop feeling like omissions and start
> feeling like discipline.

## Types and zero values

Every type in Go has a *zero value*. There is no "uninitialized" state, so a variable is always
usable the moment it is declared. This single rule eliminates an entire category of bugs and
shapes how idiomatic Go types are designed.

| Type | Description | Zero value |
|------|-------------|------------|
| `bool` | boolean | `false` |
| `int`, `int8`..`int64` | signed integer (`int` is platform-sized, 64-bit on modern hardware) | `0` |
| `uint`, `uintptr` | unsigned integer | `0` |
| `float32`, `float64` | IEEE-754 floating point | `0` |
| `complex64`, `complex128` | complex numbers | `0+0i` |
| `string` | immutable sequence of bytes, conventionally UTF-8 | `""` |
| `byte` | alias for `uint8` | `0` |
| `rune` | alias for `int32` (one Unicode code point) | `0` |
| pointer, slice, map, channel, func, interface | reference-like types | `nil` |

```go
var n int     // 0
var s string  // ""
var ok bool   // false
var p *int    // nil
fmt.Println(n, s == "", ok, p == nil) // 0 true false true
```

The deeper point is *designing for* the zero value. A `sync.Mutex` is ready to lock with no
constructor. A `bytes.Buffer` is ready to write to. A `nil` slice behaves like an empty slice
for `len`, `range`, and `append`. When you design a struct so its zero value is immediately
usable, callers never need a `NewThing()` constructor just to avoid a crash.

> Go proverb: **"Make the zero value useful."** Before you write a constructor, ask whether the
> zero value could just work. Half the time it can, and you delete code.

## Variables, constants, and iota

| Form | Syntax | When to use |
|------|--------|-------------|
| Explicit | `var x int = 10` | Package scope, or when the type matters |
| Inferred | `var x = 10` | Type deduced from the value |
| Short declaration | `x := 10` | Inside functions (the common form) |
| Multiple | `a, b := 1, 2` | Parallel assignment |
| Constant | `const Pi = 3.14` | Compile-time immutable value |
| `iota` | `const ( A = iota; B; C )` | Auto-incrementing enumerations (0, 1, 2) |

Go constants have a property most languages lack: **untyped constants** carry arbitrary
precision until they are assigned to a typed variable. `const Big = 1 << 62` is fine even though
the expression is huge, because it is only constrained to a concrete type at use. This is why
`const Pi = 3.14159...` can be used as both a `float32` and a `float64` without conversion.

`iota` is Go's small but elegant tool for enumerations. It resets to 0 in each `const` block and
increments by one per line, so you can build typed constant sets declaratively, including bit
flags and unit scales:

```go
type ByteSize float64

const (
    _  = iota             // skip 0
    KB = 1 << (10 * iota) // 1 << 10
    MB                    // 1 << 20
    GB                    // 1 << 30
)
fmt.Println(KB, MB, GB) // 1024 1048576 1073741824

// Bit flags
type Perm uint8
const (
    Read Perm = 1 << iota // 1
    Write                 // 2
    Exec                  // 4
)
```

## Control flow

Go has exactly one loop keyword: `for`. There is no `while`, no `do-while`. That is not a
limitation, it is the small-language philosophy showing.

| Construct | Example | Note |
|-----------|---------|------|
| `if` with init | `if v, err := f(); err != nil {}` | The variable is scoped to the `if` |
| classic `for` | `for i := 0; i < n; i++ {}` | C-style |
| `for` as while | `for cond {}` | No `while` keyword |
| infinite `for` | `for {}` | Loop forever, exit with `break` |
| `for range` | `for i, v := range s {}` | Iterates slices, maps, strings, channels, integers, functions |
| `switch` | `switch x { case 1: ... }` | No implicit fallthrough between cases |
| tagless `switch` | `switch { case x > 0: ... }` | A clean replacement for `if/else if` chains |
| type `switch` | `switch v := x.(type) {}` | Branches on an interface's dynamic type |
| labeled break | `break Outer` | Break or continue an outer loop by label |

```go
switch x := any("go").(type) {
case int:
    fmt.Println("int", x)
case string:
    fmt.Println("string", x) // string go
default:
    fmt.Println("something else")
}

// Labeled break: escape nested loops cleanly
Outer:
for _, row := range grid {
    for _, cell := range row {
        if cell == target {
            break Outer // break the outer loop, not just the inner one
        }
    }
}
```

> Three things that surprise newcomers. A `switch` case does **not** fall through to the next by
> default; you opt in with `fallthrough`. `if`/`switch`/`for` can all carry an initializer, which
> is how the idiomatic `if err := ...; err != nil` is written. And labels let `break`/`continue`
> target an outer loop, which is the clean alternative to a `goto` or a boolean flag.

## Composite types: arrays, slices, maps

This is where a lot of subtle Go bugs live, so it earns sub-sections.

| Type | Literal | Characteristic |
|------|---------|----------------|
| Array | `[3]int{1,2,3}` | Fixed size, size is part of the type, copied by value |
| Slice | `[]int{1,2,3}` | A header (pointer, len, cap) viewing a backing array |
| Map | `map[string]int{}` | Hash table, ~O(1) access, reference-like |
| `len()` / `cap()` | length and capacity | A slice has both; a map has only `len` |
| `append()` | grow a slice | May reallocate the backing array |
| `make()` | allocate slice/map/channel | `make([]int, 0, 10)` pre-sizes capacity |
| `copy()` | copy between slices | Returns the number of elements copied |

### Slices: the header, capacity, and the aliasing trap

A slice is not an array. It is a three-word header: a pointer to a backing array, a length, and
a capacity. Passing a slice to a function copies the *header*, not the data, so the callee sees
the same backing array, which is why appending inside a function may or may not be visible to
the caller depending on whether `append` reallocated.

```go
s := make([]int, 0, 5) // len=0, cap=5
s = append(s, 1, 2, 3)
fmt.Println(len(s), cap(s)) // 3 5 — room to grow without reallocating
```

> **Suppose** you slice a slice (`b := a[1:3]`) and then `append` to `b`. Because both share the
> same backing array, if `b` still has spare capacity the append overwrites the element at
> `a[3]`, which is still visible through `a`. This is the classic slice-aliasing bug. The fix is
> the three-index slice `a[1:3:3]`, which caps `b`'s capacity at its length and forces a fresh
> allocation on the next append, fully decoupling the two slices.

### Maps: presence, ordering, and concurrency

Three things to internalize about maps. First, indexing a missing key returns the zero value,
not an error, so the "comma ok" form is how you distinguish "present and zero" from "absent".
Second, **map iteration order is randomized on purpose** to stop people depending on it. Third,
the built-in map is **not safe for concurrent writes**; concurrent access without
synchronization is a fatal runtime error, not a silent race.

```go
m := map[string]int{"a": 1}
if v, ok := m["a"]; ok { // distinguish absent from zero
    fmt.Println(v)       // 1
}
delete(m, "a")
```

For concurrent use, guard a map with a `sync.RWMutex` or reach for `sync.Map` when the access
pattern is "write once, read many".

### Strings, bytes, and runes

A `string` is an immutable read-only slice of bytes. Indexing gives you a `byte` (`uint8`), but
ranging over a string decodes UTF-8 and yields `rune`s (code points) with their byte offsets.
This distinction matters the moment you handle non-ASCII text.

```go
s := "héllo"
fmt.Println(len(s))            // 6 — bytes, not characters (é is 2 bytes)
for i, r := range s {          // i is the byte index, r is a rune
    fmt.Printf("%d:%c ", i, r) // 0:h 1:é 3:l 4:l 5:o
}
```

## Structs and methods

Go has no classes. You get behavior by attaching **methods** to types via a *receiver*.

| Concept | Example | Note |
|---------|---------|------|
| Struct | `type P struct { Name string }` | Groups fields |
| Value receiver | `func (p P) Hello()` | Works on a copy |
| Pointer receiver | `func (p *P) SetName(n string)` | Mutates the original |
| Embedding | `type Admin struct { User }` | Composition; promotes fields and methods |
| Struct tags | `` `json:"name"` `` | Metadata read via reflection |
| Anonymous struct | `struct{ X int }{X: 1}` | No named type needed |

### Value vs pointer receivers

This is the decision newcomers get wrong most often. A **value receiver** operates on a copy, so
mutations do not stick. A **pointer receiver** operates on the original. Two practical rules:
use a pointer receiver if the method mutates the receiver or if the struct is large enough that
copying is wasteful; and **be consistent** — if any method needs a pointer receiver, give them
all pointer receivers, so the type's method set is uniform.

```go
type Person struct {
    Name string `json:"name"`
    Age  int    `json:"age"`
}

func (p Person) Greeting() string { return "Hi, " + p.Name } // reads, value is fine
func (p *Person) Birthday()       { p.Age++ }                // mutates, needs a pointer

p := Person{Name: "Ana", Age: 29}
p.Birthday() // Go auto-takes &p here
fmt.Println(p.Greeting(), p.Age) // Hi, Ana 30
```

> A subtlety with method sets: the methods with pointer receivers are only in the method set of
> the *pointer* type. So a value stored in an interface satisfies that interface only if the
> required methods have value receivers, or if you stored a pointer. This is the most common
> reason "my type does not implement the interface" surprises people.

### Embedding: composition over inheritance

Embedding is Go's answer to inheritance, except it is composition. By embedding `User` inside
`Admin`, an `Admin` automatically gets `User`'s exported fields and methods, promoted as if they
were its own, but `Admin` *has a* `User`, it is not a subclass. You can "override" a promoted
method by defining one with the same name on the outer type, and you can still reach the inner
one explicitly.

```go
type User struct{ Name string }
func (u User) Describe() string { return "user " + u.Name }

type Admin struct {
    User        // embedded: Admin gets Name and Describe for free
    Level int
}

a := Admin{User: User{Name: "root"}, Level: 9}
fmt.Println(a.Name)       // promoted field: root
fmt.Println(a.Describe()) // promoted method: user root
```

## Interfaces

This is the most distinctive part of Go's type system. Interfaces are **implicit**: a type
satisfies an interface just by having the right methods. There is no `implements` keyword and no
declared relationship. The concrete type often does not even know the interface exists, which is
what lets you define an interface in the *consumer* package and have types from other packages
satisfy it without changes.

| Concept | Example | Note |
|---------|---------|------|
| Definition | `type Reader interface { Read([]byte) (int, error) }` | A set of methods |
| Implicit implementation | just have the methods | Loose coupling |
| Empty interface | `interface{}` or `any` | Holds any value |
| Type assertion | `v, ok := x.(string)` | Recover the concrete type |
| Type switch | `switch v := x.(type) {}` | Branch on several types |
| Composed interface | `interface { Reader; Writer }` | Combine smaller interfaces |
| `nil` interface trap | type set, value nil ≠ nil interface | A real footgun |

```go
type Animal interface {
    Sound() string
}

type Dog struct{}
func (Dog) Sound() string { return "Woof" }

var a Animal = Dog{} // satisfied implicitly, no "implements"
fmt.Println(a.Sound()) // Woof
```

> Go proverb: **"The bigger the interface, the weaker the abstraction."** The most powerful
> interfaces in the standard library are tiny: `io.Reader` and `io.Writer` are one method each,
> and almost the entire I/O ecosystem composes from them. The corollary, "accept interfaces,
> return structs," means functions should depend on the smallest behavior they need, while still
> handing back concrete, fully-featured types.

### Type assertions and type switches

An interface value can be asked for its concrete type. The single-return form panics on a
mismatch; the comma-ok form does not. A type switch generalizes this to many types at once.

```go
func describe(x any) string {
    switch v := x.(type) {
    case nil:
        return "nil"
    case int:
        return fmt.Sprintf("int %d", v)
    case string:
        return fmt.Sprintf("string %q", v)
    case fmt.Stringer: // matches anything with a String() method
        return v.String()
    default:
        return fmt.Sprintf("unknown %T", v)
    }
}
```

### The nil interface trap

An interface value holds *two* words: a type and a value. It is `nil` only when **both** are
nil. If you store a typed nil pointer (say `(*MyError)(nil)`) into an `error` interface, the
interface now has a type, so `err != nil` is **true** even though the underlying pointer is nil.
This bites people who return a concrete error pointer that happens to be nil.

```go
type MyError struct{}
func (*MyError) Error() string { return "boom" }

func bad() error {
    var p *MyError = nil
    return p // returns a NON-nil error interface wrapping a nil pointer!
}

fmt.Println(bad() == nil) // false — the classic trap
```

The rule: return the literal `nil`, not a typed nil pointer, on the success path.

## Pointers and memory

Go has pointers, but deliberately **no pointer arithmetic** (that lives in the `unsafe`
package). You get the power to share and mutate without C's foot-guns.

| Operator | Meaning | Example |
|----------|---------|---------|
| `&` | address of | `p := &x` |
| `*` | dereference / pointer type | `*p = 10` |
| `new(T)` | allocate, return `*T` | `p := new(int)` |
| `nil` | a pointer with no target | `var p *int` |

```go
func double(n *int) { *n *= 2 }

x := 21
double(&x)
fmt.Println(x) // 42
```

> You never call `malloc` or decide stack-vs-heap yourself. Go's **escape analysis** runs at
> compile time: if a value does not "escape" the function (no reference outlives it), it goes on
> the stack and is freed for free when the function returns; if it does escape, it goes on the
> heap and the GC owns it. Crucially, **returning the address of a local variable is safe in Go**
> — the compiler simply heap-allocates it. Run `go build -gcflags='-m'` to see every decision.

## Functions: every shape

Functions are *first-class citizens*: you can pass them, return them, and store them. Go also
leans on multiple return values, which is the backbone of its error handling.

| Shape | Example | Use |
|-------|---------|-----|
| Plain | `func add(a, b int) int` | The common case |
| Multiple returns | `func div(a, b int) (int, error)` | Result plus error |
| Named returns | `func f() (x int, err error)` | Allows a "naked" `return`, useful with `defer` |
| Variadic | `func sum(nums ...int) int` | A variable number of args |
| As parameter | `func apply(f func(int) int)` | Higher-order functions |
| As return value | `func adder() func(int) int` | A function factory |
| Method value | `f := p.Greeting` | A method bound to its receiver |
| Method expression | `f := Person.Greeting` | Unbound; receiver becomes the first arg |

```go
// Variadic + named return
func sum(nums ...int) (total int) {
    for _, n := range nums {
        total += n
    }
    return // naked return uses the named value
}
fmt.Println(sum(1, 2, 3, 4)) // 10

// Higher-order: a function that takes a function
func apply(vals []int, f func(int) int) []int {
    out := make([]int, len(vals))
    for i, v := range vals {
        out[i] = f(v)
    }
    return out
}
fmt.Println(apply([]int{1, 2, 3}, func(n int) int { return n * n })) // [1 4 9]
```

> Named returns shine with `defer`: a deferred closure can read and even *modify* the named
> return values before the function actually returns, which is exactly how you wrap an error with
> context or recover from a panic and turn it into a returned error.

## Anonymous functions and closures

An **anonymous function** has no name and is defined inline. When it captures variables from the
surrounding scope, it becomes a **closure** that keeps them alive between calls.

| Concept | Description |
|---------|-------------|
| Anonymous function | A function literal with no name |
| Closure | Captures and remembers variables from the enclosing scope |
| IIFE | An anonymous function invoked immediately: `func(){}()` |
| Capture by reference | Closures capture the *variable*, not a snapshot of its value |

```go
// A counter that keeps state via a closure
func counter() func() int {
    c := 0
    return func() int { // c escapes to the heap; the closure keeps it alive
        c++
        return c
    }
}

next := counter()
fmt.Println(next(), next(), next()) // 1 2 3

// IIFE: define and call in one expression
result := func(a, b int) int { return a + b }(3, 4)
fmt.Println(result) // 7
```

> The classic loop-variable gotcha, **fixed in Go 1.22**: closures created inside a `for` loop
> used to capture the *same* loop variable, so launching goroutines in a loop printed the last
> value N times. Since Go 1.22 each iteration gets a fresh copy of the loop variable and the bug
> is simply gone. On older Go the fix was `i := i` to shadow it per iteration — you will still
> see that idiom in older code.

## Defer, panic, and recover

`defer` is one of Go's signature features. It schedules a function call to run when the
surrounding function returns, no matter how it returns. It is how Go does cleanup without
`try/finally`.

| Keyword | Description | Typical use |
|---------|-------------|-------------|
| `defer` | Schedule a call for function exit (LIFO order) | Close files, unlock mutexes, end spans |
| `panic` | Stop normal flow, unwind the stack running defers | Truly unrecoverable errors, programmer bugs |
| `recover` | Catch a `panic` (only inside a `defer`) | Stop a panic from crashing the process |

```go
func readFile(name string) error {
    f, err := os.Open(name)
    if err != nil {
        return err
    }
    defer f.Close() // runs on every return path, even a panic
    // ... use f
    return nil
}

// Multiple defers run in reverse (LIFO) order
func order() {
    defer fmt.Print("1 ")
    defer fmt.Print("2 ")
    defer fmt.Print("3 ")
} // prints: 3 2 1

// recover, combined with a named return, turns a panic into a handled error
func safe() (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)
        }
    }()
    panic("something broke")
}
```

> Two subtleties that trip people up. Deferred calls run in **LIFO** order. And `defer` evaluates
> its **arguments at the moment it is scheduled** but runs the call at function exit, so
> `defer fmt.Println(i)` captures `i`'s value now, while `defer func(){ fmt.Println(i) }()` reads
> `i` at exit. A `recover` only works when called *directly* inside a deferred function; calling
> it anywhere else returns nil and does nothing.

## Errors are values

Go has no exceptions for ordinary control flow. An error is just a value of the built-in
`error` interface, returned explicitly and checked explicitly. The verbosity is the point: every
failure path is visible in the code instead of leaping invisibly up the stack.

| Concept | Example | Note |
|---------|---------|------|
| The `error` interface | `type error interface { Error() string }` | The minimal contract |
| The check | `if err != nil { return err }` | The idiomatic pattern |
| `errors.New` | `errors.New("failed")` | A simple sentinel error |
| `fmt.Errorf` with `%w` | `fmt.Errorf("ctx: %w", err)` | Wrap to preserve the cause |
| `errors.Is` | `errors.Is(err, ErrNotFound)` | Compare against a sentinel anywhere in the chain |
| `errors.As` | `errors.As(err, &target)` | Extract a specific error type from the chain |
| `errors.Join` | `errors.Join(err1, err2)` | Combine multiple errors (Go 1.20+) |
| Custom error | a type with an `Error()` method | Rich, structured errors |

```go
var ErrNotFound = errors.New("not found")

func find(id int) (string, error) {
    if id == 0 {
        // %w wraps ErrNotFound so callers can still detect it
        return "", fmt.Errorf("find id %d: %w", id, ErrNotFound)
    }
    return "ok", nil
}

_, err := find(0)
if errors.Is(err, ErrNotFound) {
    fmt.Println("handled:", err) // handled: find id 0: not found
}
```

> Go proverb: **"Don't just check errors, handle them gracefully."** A wall of bare
> `if err != nil { return err }` is not error handling, it is error *forwarding*. The valuable
> work is adding context as the error climbs (`fmt.Errorf("loading config: %w", err)`) so the
> final message reads like a trace, and deciding at each layer whether to retry, wrap, log, or
> surface.

## Goroutines

Here is where Go earns its reputation. A **goroutine** is a function running concurrently,
launched with the `go` keyword. It is *not* an OS thread: it is a lightweight, runtime-managed
green thread that starts at about 2 KB of stack and grows on demand. You can run hundreds of
thousands of them.

| Concept | Description |
|---------|-------------|
| `go f()` | Launch `f` as a goroutine |
| Cost | ~2 KB initial stack; the stack grows/shrinks automatically |
| Scheduling | M:N model — many goroutines multiplexed onto few OS threads |
| `GOMAXPROCS` | How many OS threads run Go code in parallel |
| Main goroutine | When `main` returns, the program exits and kills the rest |

```go
func main() {
    go fmt.Println("concurrent") // may not run if main exits first
    fmt.Println("main")
    time.Sleep(10 * time.Millisecond) // NOT the right way to synchronize!
}
```

### The G-M-P scheduler

The magic behind "goroutines are cheap" is the runtime scheduler, modeled as **G-M-P**:

- **G** — a goroutine (the work, plus its stack and state).
- **M** — a machine, i.e. an OS thread that actually executes code.
- **P** — a processor, a logical context holding a run queue of goroutines. The number of P's is
  `GOMAXPROCS`, which by default equals the number of CPU cores.

A goroutine (G) is run by a thread (M) only while that M holds a processor (P). When a goroutine
**blocks on a channel, a mutex, or network I/O**, the runtime parks it and the M picks another
runnable G from the P's queue, so the thread never sits idle waiting. When a goroutine makes a
**blocking syscall**, the M detaches its P so another M can keep the P's queue running. Idle P's
also **steal** work from busy P's queues to keep cores balanced. This is why a Go server can
handle tens of thousands of concurrent connections on a handful of OS threads: blocking is cheap
because it parks a goroutine, not a thread.

> **Suppose** you launch a goroutine and the program prints nothing from it. The main goroutine
> finished first, and when `main` returns the whole process exits, no goodbyes. `time.Sleep` is a
> hack to paper over this; the real tools are channels and `WaitGroup`, which is exactly where we
> are headed. Also note: a goroutine that blocks forever and is never collected is a **goroutine
> leak**, the Go equivalent of a memory leak.

## Channels

Channels are typed pipes that let goroutines communicate. They embody Go's concurrency
philosophy, lifted from Hoare's CSP: **"Don't communicate by sharing memory; share memory by
communicating."** Instead of locking shared state, you pass ownership of data over a channel, so
only one goroutine touches it at a time by construction.

| Concept | Syntax | Note |
|---------|--------|------|
| Create | `ch := make(chan int)` | Unbuffered (synchronous) |
| Buffered | `ch := make(chan int, 5)` | Asynchronous up to capacity |
| Send | `ch <- 10` | Blocks if full / no receiver |
| Receive | `v := <-ch` | Blocks if empty |
| Close | `close(ch)` | Only the sender should close |
| Range | `for v := range ch {}` | Iterates until the channel is closed |
| Comma-ok | `v, ok := <-ch` | `ok` is false when closed and drained |
| Directional | `chan<- int` / `<-chan int` | Send-only / receive-only (compile-time safety) |

```go
func producer(ch chan<- int) { // send-only param documents intent
    for i := 0; i < 3; i++ {
        ch <- i
    }
    close(ch) // signal: no more values
}

func main() {
    ch := make(chan int)
    go producer(ch)
    for v := range ch { // reads until closed
        fmt.Println(v)  // 0 1 2
    }
}
```

### Buffered vs unbuffered

An **unbuffered** channel is a *handshake*: the send and the receive complete at the same
instant, so the two goroutines rendezvous and you get a synchronization point for free. A
**buffered** channel decouples sender and receiver up to its capacity, which is useful for
smoothing bursts or limiting concurrency (a buffered channel of size N is a counting semaphore).
Reach for unbuffered by default; add a buffer only when you can name why.

### Closing, draining, and nil channels

The rules that prevent the common panics and deadlocks:

- **Only the sender closes**, and only once. Closing a channel twice, or sending on a closed
  channel, panics.
- **Receiving from a closed channel never blocks**: it drains buffered values, then returns the
  zero value with `ok == false` forever. That is what ends a `for range` loop.
- **A `nil` channel blocks forever** on both send and receive. This looks like a bug but is a
  feature: setting a channel variable to `nil` inside a `select` *disables* that case, which is
  the idiomatic way to stop listening on one input.

> The deadlock you will hit on day one: an unbuffered send with no one receiving. `ch := make(chan
> int); ch <- 1` in a single goroutine deadlocks instantly, because the send blocks waiting for a
> receiver that will never exist. The runtime detects when *all* goroutines are blocked and panics
> with "all goroutines are asleep - deadlock!", which is a gift, not an insult.

## Select

`select` is to channels what `switch` is to values: it waits on multiple channel operations at
once and proceeds with whichever is ready first. It is the single most important construct in
real concurrent Go.

| Case | Behavior |
|------|----------|
| `case v := <-ch1` | Runs when that channel is ready |
| Several ready at once | Picks one at random (prevents starvation) |
| `default` | Runs if no channel is ready (makes the `select` non-blocking) |
| `case <-time.After(d)` | A clean timeout |
| `case <-ctx.Done()` | Cancellation, because `Done()` returns a channel |

```go
select {
case v := <-ch1:
    fmt.Println("ch1:", v)
case v := <-ch2:
    fmt.Println("ch2:", v)
case <-time.After(time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("nothing ready right now")
}
```

> Timeouts, cancellation, fan-in, rate limiting, and graceful shutdown are all just `select` with
> the right cases. A bare `select {}` with no cases blocks forever, which is occasionally exactly
> what you want to park a `main` goroutine while background workers run.

## WaitGroups, mutexes, and the memory model

Channels are the first reach, but sometimes you just need to coordinate goroutines or protect
shared state. The `sync` and `sync/atomic` packages provide the primitives.

| Primitive | Use | Methods |
|-----------|-----|---------|
| `sync.WaitGroup` | Wait for a set of goroutines to finish | `Add`, `Done`, `Wait` |
| `sync.Mutex` | Mutual exclusion over shared state | `Lock`, `Unlock` |
| `sync.RWMutex` | Many readers or one writer | `RLock`, `RUnlock` |
| `sync.Once` | Run something exactly once | `Do` |
| `sync/atomic` | Lock-free atomic operations | `atomic.Int64`, `Add`, `Load`, `CompareAndSwap` |
| `sync.Map` | A concurrent map for write-once-read-many | `Store`, `Load`, `Range` |

```go
func main() {
    var wg sync.WaitGroup
    var mu sync.Mutex
    total := 0

    for i := 1; i <= 5; i++ {
        wg.Add(1)            // increment BEFORE launching
        go func(n int) {
            defer wg.Done()  // decrement when the goroutine exits
            mu.Lock()
            total += n       // critical section
            mu.Unlock()
        }(i)
    }
    wg.Wait() // blocks until the counter hits zero
    fmt.Println(total) // 15
}
```

### The Go memory model and the race detector

The reason you need a mutex around `total += n` is not just correctness of arithmetic, it is the
**Go memory model**, which defines *happens-before*: when one goroutine's write is guaranteed to
be visible to another goroutine's read. Without a synchronizing operation (a channel
send/receive, a mutex, an atomic, or `WaitGroup`/`Once`), there is **no guarantee** another
goroutine ever sees your write, and the compiler and CPU are free to reorder. Two goroutines
touching the same variable with at least one writing, and no happens-before edge between them, is
a **data race** — undefined behavior, not just a wrong number.

```bash
go test -race ./...   # the race detector instruments memory access at runtime
go run -race main.go  # catches races you could never reproduce by hand
```

> Two habits worth burning in: call `wg.Add` **before** launching the goroutine (calling it
> inside lets `Wait` race past), and run everything under `-race` in CI. The race detector has
> almost no false positives; if it fires, you have a real bug, even if it "works on my machine."

## Concurrency patterns

Goroutines, channels, and `select` are the primitives. In practice you compose them into a
handful of recurring patterns.

| Pattern | Description |
|---------|-------------|
| Worker pool | A fixed set of goroutines draining a jobs channel |
| Fan-out / fan-in | Spread work across workers, then merge results into one channel |
| Pipeline | Stages connected by channels, each transforming the stream |
| Done / cancellation | Signal "stop" by `close(done)` or `ctx.Done()` |
| Rate limiting | A `time.Ticker` or buffered-channel semaphore paces the work |

```go
// Worker pool: 3 workers process 9 jobs
func worker(jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for j := range jobs {  // exits when jobs is closed and drained
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    var wg sync.WaitGroup

    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go worker(jobs, results, &wg)
    }
    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs) // tells every worker "no more work"

    wg.Wait()      // wait for all workers to finish
    close(results) // now safe to close: no one else will send

    for r := range results {
        fmt.Print(r, " ")
    }
}
```

> Notice the choreography of closes. `close(jobs)` ends each worker's `range` loop;
> `wg.Wait()` ensures every worker has finished sending; only then is `close(results)` safe.
> Closing `results` too early would panic a still-running worker. Getting this ordering right *is*
> the skill — most concurrency bugs are really "who closes, and when" bugs.

## Context

`context.Context` is how Go propagates cancellation, deadlines, and request-scoped values across
API boundaries and goroutines. By convention any function that does blocking or long-running work
takes a `ctx` as its first parameter.

| Function | Use |
|----------|-----|
| `context.Background()` | The root context (in `main`, `init`, tests) |
| `context.TODO()` | A placeholder when you do not have one yet |
| `context.WithCancel(ctx)` | Manual cancellation |
| `context.WithTimeout(ctx, d)` | Cancel after a duration |
| `context.WithDeadline(ctx, t)` | Cancel at a specific time |
| `context.WithValue(ctx, k, v)` | Carry a request-scoped value (use sparingly) |
| `ctx.Done()` | A channel closed when the context is cancelled |
| `ctx.Err()` | Why it ended (`Canceled` / `DeadlineExceeded`) |

```go
func task(ctx context.Context) {
    select {
    case <-time.After(2 * time.Second):
        fmt.Println("completed")
    case <-ctx.Done():
        fmt.Println("cancelled:", ctx.Err())
    }
}

func main() {
    ctx, cancel := context.WithTimeout(context.Background(), time.Second)
    defer cancel() // always call cancel, even on a timeout, to release the timer
    task(ctx)      // cancelled: context deadline exceeded
}
```

> The pattern that ties it all together: `ctx.Done()` is just a channel, so cancellation plugs
> straight into `select`. Context flows *down* the call tree and cancellation propagates to every
> child context automatically. Two rules of hygiene: always `defer cancel()` or you leak the
> timer/goroutine, and reserve `WithValue` for request-scoped data like trace IDs, never for
> passing optional function arguments.

## Generics

Generics arrived in Go 1.18 and let you write reusable code with *type parameters* while keeping
full static typing — no `interface{}`, no reflection, no boxing.

| Concept | Example | Note |
|---------|---------|------|
| Type parameter | `func F[T any](x T)` | `T` is the type parameter |
| Constraint | `[T comparable]` | Restricts which types are allowed |
| `any` | alias for `interface{}` | Any type |
| `comparable` | types supporting `==`/`!=` | Map keys, set membership |
| Custom constraint | `interface { ~int | ~float64 }` | A union of types (`~` = "any type whose underlying type is") |
| Generic type | `type Stack[T any] struct{}` | Parameterized data structures |

```go
type Number interface {
    ~int | ~int64 | ~float64 // ~ also admits named types like `type Celsius float64`
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

fmt.Println(Sum([]int{1, 2, 3}))      // 6
fmt.Println(Sum([]float64{1.5, 2.5})) // 4
```

The standard library now ships generic helpers worth knowing: the `slices` package
(`slices.Sort`, `slices.Contains`, `slices.Index`), the `maps` package (`maps.Keys`,
`maps.Clone`), and `cmp` (`cmp.Compare`, `cmp.Or`). Most day-to-day generics use is *consuming*
these rather than writing your own.

> Use generics where you were previously copy-pasting the same function for `int`, `float64`, and
> friends, or reaching for `interface{}` and losing type safety. Do *not* reach for them by
> reflex: a small interface is often clearer than a type parameter. "A little copying is better
> than a little dependency," and sometimes than a little abstraction too.

## Packages and modules

| Concept | Description |
|---------|-------------|
| `package` | The unit of code organization and compilation |
| `package main` | The entry point; produces an executable |
| Exported identifier | Capitalized name = public outside the package |
| unexported identifier | lowercase = private to the package |
| `import` | Pull in other packages |
| `go.mod` | Declares the module path, Go version, and dependencies |
| `go.sum` | Dependency checksums for integrity (supply-chain safety) |
| `func init()` | Runs at package initialization, before `main` |

```go
// go mod init github.com/user/project
// go get github.com/foo/bar@v1.2.3
// go mod tidy   -> add missing and remove unused dependencies

package main

import (
    "fmt"     // standard library
    "strings"
)

func main() {
    fmt.Println(strings.ToUpper("go")) // GO
}
```

> Visibility in Go is decided by *capitalization*, not keywords. `Println` is exported because it
> starts with a capital `P`; `println` would be private. Modules add reproducible builds: `go.mod`
> pins versions and `go.sum` records cryptographic checksums, so two machines building the same
> commit get byte-identical dependencies, and a tampered dependency fails the checksum.

## HTTP, middleware, and web frameworks

Go was built for servers, and `net/http` in the standard library is a complete, production-grade
HTTP stack on its own. Many large services ship on the stdlib alone. The core abstraction is the
`http.Handler` interface — one method, `ServeHTTP(w, r)` — and everything else composes from it.

```go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /users/{id}", func(w http.ResponseWriter, r *http.Request) {
        id := r.PathValue("id") // method + wildcard routing, since Go 1.22
        fmt.Fprintf(w, "user %s", id)
    })
    http.ListenAndServe(":8080", mux)
}
```

### Middleware: a handler that wraps a handler

A **middleware** is just a function that takes an `http.Handler` and returns a new one, adding
behavior before and/or after the inner handler runs. Because the type is uniform
(`func(http.Handler) http.Handler`), middlewares **compose** by nesting — logging, auth,
recovery, CORS, rate limiting are all the same shape. This is the cleanest expression of "wrap,
don't inherit" in the language.

```go
// A middleware: logs each request and its duration
func logging(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        next.ServeHTTP(w, r)              // call the wrapped handler
        log.Printf("%s %s %v", r.Method, r.URL.Path, time.Since(start))
    })
}

// A middleware that recovers from panics so one bad request can't kill the server
func recoverer(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                http.Error(w, "internal error", http.StatusInternalServerError)
            }
        }()
        next.ServeHTTP(w, r)
    })
}

// Compose them: recoverer(logging(mux)) — outermost runs first
handler := recoverer(logging(mux))
http.ListenAndServe(":8080", handler)
```

> The mental model is an onion. `recoverer(logging(mux))` means a request enters `recoverer`,
> then `logging`, then your `mux`, and the response unwinds back out the same layers. A "chain"
> helper (or a router's `Use`) just automates that nesting so you write `Use(recoverer, logging)`
> instead of hand-nesting calls.

### The main web frameworks

You rarely *need* a framework in Go — the stdlib router got method/wildcard routing in 1.22 —
but frameworks add ergonomics: parameter binding, validation, grouped middleware, and faster
routers. The four you will meet:

| Framework | Style | Built on | Why people pick it |
|-----------|-------|----------|--------------------|
| `net/http` (stdlib) | Minimal, explicit | — | Zero dependencies, stable forever, now has decent routing |
| **chi** | Idiomatic, `http.Handler`-compatible | `net/http` | Composable middleware, stdlib-native, no lock-in |
| **Gin** | Batteries-included, fast | custom `Context` | Huge ecosystem, JSON binding/validation, the most popular |
| **Echo** | Batteries-included | custom `Context` | Similar to Gin, clean API, built-in middleware |
| **Fiber** | Express-like | `fasthttp` (not `net/http`) | Familiar to Node devs, very high throughput |

```go
// chi: stays 100% compatible with net/http handlers and middleware
r := chi.NewRouter()
r.Use(middleware.Logger, middleware.Recoverer) // composable middleware
r.Get("/users/{id}", func(w http.ResponseWriter, r *http.Request) {
    w.Write([]byte("user " + chi.URLParam(r, "id")))
})

// Gin: its own Context, terse JSON helpers and binding
g := gin.Default() // includes logging + recovery middleware
g.GET("/users/:id", func(c *gin.Context) {
    c.JSON(200, gin.H{"id": c.Param("id")})
})
```

> One real trade-off worth knowing: **Fiber is built on `fasthttp`, not `net/http`.** That buys
> raw throughput but means it does *not* interoperate with the vast `net/http` middleware
> ecosystem or `context.Context` conventions. chi sits at the other end — it is "just"
> `net/http`, so every stdlib handler and middleware works unchanged. Gin and Echo are the
> popular middle ground. For a new service, starting on the stdlib or chi and only adding a
> framework when you feel the friction is the conservative, idiomatic path.

## Testing and benchmarks

Testing is built into the language and the toolchain — no third-party framework required. Put
`_test.go` files next to your code and run `go test`.

| Kind | Signature | Command |
|------|-----------|---------|
| Test | `func TestX(t *testing.T)` | `go test` |
| Benchmark | `func BenchmarkX(b *testing.B)` | `go test -bench=.` |
| Example | `func ExampleX()` | Verified against its `// Output:` comment |
| Table-driven | a slice of case structs | The idiomatic Go style |
| Fuzzing | `func FuzzX(f *testing.F)` | `go test -fuzz` (Go 1.18+) |
| Coverage | — | `go test -cover` / `-coverprofile` |

```go
func Sum(a, b int) int { return a + b }

func TestSum(t *testing.T) {
    cases := []struct {
        name string
        a, b int
        want int
    }{
        {"positives", 2, 3, 5},
        {"with zero", 0, 7, 7},
        {"negatives", -1, -1, -2},
    }
    for _, c := range cases {
        t.Run(c.name, func(t *testing.T) { // each case is a named subtest
            if got := Sum(c.a, c.b); got != c.want {
                t.Errorf("Sum(%d,%d) = %d; want %d", c.a, c.b, got, c.want)
            }
        })
    }
}
```

> The **table-driven test** is so common it is practically the house style: list cases as a slice
> of structs and loop with `t.Run`, which gives each case its own line in the output and lets you
> run a single one with `go test -run TestSum/negatives`. Fuzzing (`FuzzX`) goes further: the
> toolchain generates random inputs, finds the one that crashes or violates an invariant, and
> saves it as a permanent regression case.

## Benchmarking and profiling

Performance work in Go is unusually pleasant because measurement is built into the toolchain. The
rule is the same as everywhere: **measure first, optimize second.** Go gives you benchmarks for
"how fast/how many allocations" and profiles for "*where* the time and memory go."

### Benchmarks

A benchmark is a function named `BenchmarkXxx(b *testing.B)`. The framework runs your loop enough
times to get a stable measurement; you do not pick the iteration count. Since Go 1.24 the
preferred form is `for b.Loop()`, which the compiler will not optimize away and which runs setup
exactly once.

```go
func BenchmarkSum(b *testing.B) {
    nums := []int{1, 2, 3, 4, 5}
    b.ReportAllocs() // also report allocations per op
    for b.Loop() {   // Go 1.24+; older code uses: for i := 0; i < b.N; i++
        _ = Sum(nums)
    }
}
```

```bash
go test -bench=. -benchmem          # run benchmarks, include alloc stats
go test -bench=BenchmarkSum -count=10 > new.txt
benchstat old.txt new.txt           # statistically compare two runs (install golang.org/x/perf/cmd/benchstat)
```

| Output column | Meaning |
|---------------|---------|
| `N` | iterations the framework chose |
| `ns/op` | nanoseconds per operation (the headline number) |
| `B/op` | bytes allocated per operation |
| `allocs/op` | heap allocations per operation |

> `benchstat` is the part people skip and shouldn't. A single benchmark run is noisy; `benchstat`
> runs a t-test across `-count` repetitions and tells you whether a change is a real improvement
> or within the noise. "It got 3% faster" means nothing without it.

### Profiling with pprof

Profiles tell you where the cost actually is. You can capture them straight from `go test`, or
expose them from a running server with a single import.

```go
// In a long-running server, this registers /debug/pprof/* endpoints:
import _ "net/http/pprof" // blank import for the side effect
// then: go func() { log.Println(http.ListenAndServe("localhost:6060", nil)) }()
```

```bash
# Capture profiles from a benchmark
go test -bench=. -cpuprofile=cpu.prof -memprofile=mem.prof

# Explore interactively (top functions, list, web flamegraph)
go tool pprof cpu.prof          # then type: top, list Sum, web
go tool pprof -http=:8080 cpu.prof   # browser UI with a flame graph

# Live profile a running server
go tool pprof http://localhost:6060/debug/pprof/profile?seconds=30  # 30s CPU profile
go tool pprof http://localhost:6060/debug/pprof/heap                # heap snapshot
```

| Profile | Question it answers |
|---------|---------------------|
| CPU (`profile`) | Which functions burn the most CPU time? |
| Heap (`heap`) | What is allocating / holding memory? |
| Goroutine (`goroutine`) | How many goroutines, and where are they stuck? (leak hunting) |
| Block (`block`) | Where do goroutines block on sync primitives? |
| Mutex (`mutex`) | Where is lock contention? |

### The execution tracer

Where pprof samples *aggregate* cost, the tracer shows the *timeline*: scheduling, GC pauses,
goroutine blocking, syscalls. It is how you diagnose latency spikes and concurrency stalls rather
than raw throughput.

```bash
go test -trace=trace.out
go tool trace trace.out   # opens a timeline UI in the browser
```

> Go 1.25 added a **flight recorder** (`runtime/trace.FlightRecorder`): an always-on, low-overhead
> ring buffer of recent trace data. When a rare event fires (a slow request, a timeout) you snapshot
> the last few seconds — so you finally capture the trace of the moment *before* the problem, which
> is exactly the data you never had when you started recording after the fact.

> The discipline that ties this section together: write a benchmark, confirm it with `benchstat`,
> profile to find the real hotspot, fix that, and re-measure. Profiles routinely show the
> bottleneck is somewhere you never suspected — which is the whole reason you measure instead of
> guess.

## The garbage collector and the runtime

You rarely think about it, but a sophisticated runtime sits under every Go program. Knowing its
shape explains a lot of behavior.

| Concept | Description |
|---------|-------------|
| GC | Concurrent, tri-color mark-and-sweep, **non-generational, non-compacting**, tuned for low pause times (sub-millisecond) |
| `GOGC` | Tunes GC frequency (default 100 = collect when the heap doubles); higher = less GC, more memory |
| `GOMEMLIMIT` | A soft memory ceiling the GC respects (Go 1.19+), great for containers |
| Escape analysis | Decides stack vs heap at compile time |
| Scheduler | The G-M-P model (see the goroutines section) |
| Preemption | Goroutines are asynchronously preemptible (since Go 1.14), so a tight loop can't starve others |

```go
fmt.Println(runtime.NumGoroutine()) // live goroutines right now
fmt.Println(runtime.NumCPU())       // CPUs the OS reports
fmt.Println(runtime.GOMAXPROCS(0))  // P's configured (0 = just query)
```

> The Go GC trades a little throughput for very short pauses, which is the right call for servers
> where tail latency matters more than raw speed. The two knobs you will actually use are `GOGC`
> (frequency vs memory) and `GOMEMLIMIT` (a hard-ish cap so a container does not OOM). For
> performance work, `go tool pprof` and the execution tracer (`go tool trace`) show you exactly
> where allocations and stalls come from.

## What's new in recent Go (1.22 to 1.25)

Go's compatibility promise means upgrading rarely breaks you, so the "what changed" question is
about *what you can now reach for*. These are the highlights of the last four releases (each Go
release ships every six months, February and August).

### Go 1.22 (February 2024)

- **Per-iteration loop variables.** The single most impactful change in years: each iteration of
  a `for` loop now gets a fresh copy of the loop variable, killing the decades-old closure-capture
  bug for good.
- **Range over integers.** `for i := range 10 {}` iterates `0..9` — no more `for i := 0; i < 10;
  i++`.
- **Smarter `net/http` routing.** The standard `http.ServeMux` learned method and wildcard
  patterns: `mux.HandleFunc("GET /items/{id}", ...)`, reducing the need for a third-party router
  for simple services.
- **`math/rand/v2`.** A cleaner, faster random API, the first `v2` package in the standard
  library.

### Go 1.23 (August 2024)

- **Range-over-function iterators.** You can now `for x := range seq` where `seq` is a function of
  the form `func(yield func(V) bool)`. This makes custom, composable iterators first-class.
- **The `iter` package.** Defines the `iter.Seq` and `iter.Seq2` types those iterators implement.
- **Iterator-flavored `slices`/`maps`.** New helpers like `slices.Collect`, `slices.Sorted`,
  `maps.Keys`, and `maps.Values` return or consume iterators, so you can pipe sequences together.
- **The `unique` package.** Interns comparable values so identical ones share one allocation
  (canonicalization), handy for deduplicating lots of strings or small structs.
- **Opt-in telemetry.** The Go toolchain can optionally report anonymized usage to help the team
  prioritize; it is off until you run `go telemetry on`.

### Go 1.24 (February 2025)

- **Generic type aliases.** Type aliases can now have type parameters
  (`type Set[T comparable] = map[T]struct{}`), closing a gap left when generics landed.
- **Swiss Tables maps.** The built-in map was reimplemented on the Swiss Tables design — faster
  lookups and lower memory for large maps, transparently.
- **The `weak` package.** Weak pointers that do not keep their target alive, the building block
  for caches and canonicalization maps that must not leak.
- **`runtime.AddCleanup`.** A better, more flexible replacement for `runtime.SetFinalizer` for
  running cleanup when an object is collected.
- **`os.Root`.** Filesystem operations confined to a directory subtree, a clean defense against
  path-traversal (`../../etc/passwd`) bugs.
- **Tool dependencies in `go.mod`.** A `tool` directive (and `go tool`) tracks developer tools as
  real, version-pinned dependencies, retiring the old `tools.go` hack.
- **`testing.B.Loop`.** A more reliable benchmark loop (`for b.Loop() {}`) that the compiler will
  not optimize away.
- **FIPS 140-3 mode.** A built-in, validated cryptography mode for regulated environments.

### Go 1.25 (August 2025)

- **`testing/synctest`.** A package for testing concurrent code with a *virtualized clock*: time
  advances only when all goroutines are blocked, so timeout- and ticker-based logic can be tested
  deterministically and instantly.
- **Container-aware `GOMAXPROCS`.** The runtime now reads cgroup CPU limits, so a Go process in a
  container with a 2-CPU quota defaults `GOMAXPROCS` to 2 instead of the host's core count — fewer
  surprises and less throttling in Kubernetes.
- **The experimental "Green Tea" garbage collector.** An opt-in
  (`GOEXPERIMENT=greenteagc`) GC redesign with better locality when marking and scanning small
  objects — the Go team reports a **10–40% reduction in GC overhead** on GC-heavy workloads.
- **`sync.WaitGroup.Go()`.** A small convenience that wraps the `Add(1)` / `go` / `defer Done()`
  dance into one call: `wg.Go(func(){ ... })`. There is even a new `go vet waitgroup` analyzer to
  catch misuse.
- **Experimental `encoding/json/v2`.** Behind `GOEXPERIMENT=jsonv2`, a redesigned JSON package
  that is faster and fixes long-standing API warts.
- **Flight-recorder tracing.** `runtime/trace` gained a lightweight always-on ring-buffer mode so
  you can capture a trace of the moments *before* a problem, not just after you start recording.

> The throughline across these releases is "make the everyday correct by default": loop variables
> that do not bite, containers the runtime actually respects, iterators that compose, and tests
> that can fast-forward time. None of it changes the language's character — it sands down the
> sharpest edges.

## The 20 largest open-source Go projects

A good way to feel what Go is *for* is to look at what the world built with it. Go dominates cloud
infrastructure, DevOps, observability, and databases — anywhere you want one static binary,
serious concurrency, and fast builds. The list below is ordered roughly by GitHub popularity and
impact (star counts are approximate, rounded, and drift over time, so treat the ranking as a
ballpark rather than a leaderboard).

| # | Project | What it is | ★ (approx.) |
|---|---------|------------|-------------|
| 1 | **Kubernetes** | The de-facto container orchestration platform | ~110k |
| 2 | **Ollama** | Run large language models locally with one command | ~100k |
| 3 | **frp** | Fast reverse proxy for exposing services behind NAT | ~85k |
| 4 | **Gin** | The most popular Go HTTP web framework | ~78k |
| 5 | **Hugo** | Blazing-fast static site generator | ~75k |
| 6 | **fzf** | Command-line fuzzy finder | ~65k |
| 7 | **Syncthing** | Continuous peer-to-peer file synchronization | ~65k |
| 8 | **Caddy** | Web server with automatic HTTPS | ~60k |
| 9 | **Moby / Docker** | The container engine that started the wave | ~69k |
| 10 | **Prometheus** | Metrics-based monitoring and alerting | ~56k |
| 11 | **etcd** | Distributed, consistent key-value store (Kubernetes' brain) | ~48k |
| 12 | **MinIO** | High-performance S3-compatible object storage | ~48k |
| 13 | **rclone** | "rsync for cloud storage", 70+ backends | ~48k |
| 14 | **Traefik** | Cloud-native reverse proxy and load balancer | ~52k |
| 15 | **Terraform** | Infrastructure as code (HashiCorp) | ~44k |
| 16 | **Cobra** | The CLI framework behind kubectl, Hugo, and gh | ~39k |
| 17 | **TiDB** | Distributed, MySQL-compatible NewSQL database | ~38k |
| 18 | **Gitea** | Lightweight self-hosted Git service | ~46k |
| 19 | **CockroachDB** | Distributed SQL database built for survivability | ~30k |
| 20 | **containerd** | The industry-standard container runtime (under Docker & k8s) | ~18k |

A few patterns jump out. First, the **CNCF graveyard-to-glory pipeline runs on Go**: Kubernetes,
Prometheus, etcd, containerd, Helm, Istio, CoreDNS, Jaeger, and Linkerd are all Go. Second,
**HashiCorp's entire stack** (Terraform, Vault, Consul, Nomad, Packer) is Go. Third, the modern
**databases-in-Go** wave (CockroachDB, TiDB, InfluxDB, Dgraph) shows the language scaling to
performance-critical systems. And the recent surge of **Ollama** proves Go is now showing up in
the AI-tooling layer too, where a single cross-compiled binary that orchestrates GPUs is exactly
the sweet spot. Honorable mentions that would round out a top 30: **Grafana**, **Vault**,
**Consul**, **Helm**, **Istio**, **CompreFace**, **Mattermost**, **InfluxDB**, **Dgraph**, and
**NATS**.

## Go proverbs

Rob Pike distilled Go's design philosophy into a set of proverbs. They are worth knowing because
they explain *why* idiomatic Go looks the way it does.

| Proverb | What it means |
|---------|---------------|
| Don't communicate by sharing memory, share memory by communicating | Prefer channels to locks |
| Concurrency is not parallelism | Concurrency is structure; parallelism is execution |
| Channels orchestrate; mutexes serialize | Each tool for its job |
| The bigger the interface, the weaker the abstraction | Small interfaces are stronger |
| Make the zero value useful | Types should work without extra setup |
| `interface{}` says nothing | An empty interface gives up type information |
| Errors are values | Treat errors as data, not exceptions |
| Don't just check errors, handle them gracefully | A bare `if err != nil` is not a strategy |
| A little copying is better than a little dependency | Avoid needless coupling |
| Clear is better than clever | Readability wins |
| Don't panic | Use `error`; reserve `panic` for the unrecoverable |

## Closing thought

Go is a small language with a deep runtime. The syntax you can learn in an afternoon, which is
the whole point: the surface is intentionally boring so your attention goes to the parts that
matter. What rewards a second and third pass is everything below the surface — the G-M-P
scheduler, the low-pause GC, escape analysis, the memory model, and the CSP model that turns
concurrency from a minefield into a handful of composable pieces.

If you take one thing from this refresher, make it the concurrency model: goroutines for cheap
parallel work, channels to pass ownership instead of sharing it, `select` to wait on many things
at once, the memory model to know when a write is actually visible, and `context` to cancel it
all cleanly. Get those straight and the rest of Go is just careful, readable plumbing — which,
judging by the twenty projects above, turns out to be exactly what the infrastructure of the
internet is made of.
