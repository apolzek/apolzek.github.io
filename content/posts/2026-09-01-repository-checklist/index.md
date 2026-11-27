---
title: "The AI-Era Repository Checklist"
slug: "repository-checklist"
date: '2026-09-01T12:00:00-03:00'
draft: false
description: "What a well-kept repository should deliver now that AI writes a growing share of the code: a reflection on reliability, operations, business rules and usable UX, a proposal for internal documentation (architecture, ADRs, RFCs, design, operations), monorepo vs multi-repo and where the docs should live in each, followed by the full checklist of files, automation and conventions."
tags:
- engenharia-de-software
- inteligencia-artificial
- arquitetura
- git
- open-source
minute: 23
---

This started as a plain checklist of what a well-kept repository should
deliver in its documentation, its code and its automation. The checklist is
still here, at the end. But if AI can write a thousand lines in a minute, is
the code still the hard part of a repository?

## Index

- [Code is cheap now. What isn't?](#code-is-cheap-now-what-isnt)
  - [What is a repository for?](#what-is-a-repository-for)
  - [If AI writes the code, what is scarce now?](#if-ai-writes-the-code-what-is-scarce-now)
  - [How do you know the code is correct?](#how-do-you-know-the-code-is-correct)
  - [Does code that works keep working?](#does-code-that-works-keep-working)
  - [Usable by whom?](#usable-by-whom)
  - [Who reads the repository now?](#who-reads-the-repository-now)
  - [So what has to change?](#so-what-has-to-change)
- [Proposals](#proposals)
  - [1. Documentation](#1-documentation)
  - [2. Code](#2-code)
  - [3. Tests](#3-tests)
  - [4. API artifacts (conditional: HTTP/gRPC services)](#4-api-artifacts-conditional-httpgrpc-services)
  - [5. Build and runtime (conditional: containerized apps)](#5-build-and-runtime-conditional-containerized-apps)
  - [6. CI/CD](#6-cicd)
  - [7. Repository metadata](#7-repository-metadata)
  - [8. Business rules, reliability and UX](#8-business-rules-reliability-and-ux)
  - [Minimum viable set](#minimum-viable-set)
- [Internal documentation: an idea](#internal-documentation-an-idea)
- [Monorepo or multi-repo?](#monorepo-or-multi-repo)
- [Where the docs could live](#where-the-docs-could-live)
- [Checking the code beyond the agent's tests](#checking-the-code-beyond-the-agents-tests)

## Code is cheap now. What isn't?

### What is a repository for?

The first answer that comes to mind is: to store code. But I keep thinking
that, if that were all, a zip file on a shared drive would do the job. We
keep the history too. We want to know who changed what, and when, and most of
the time we want that because one day someone looks at a strange line and
asks *why is it like this?*

Maybe a repository was never only about code. Maybe it was always a little
about decisions, about the way a team works, about the reasons behind things.
Is the code the whole memory of a system, or just the part of it that a
machine can run?

### If AI writes the code, what is scarce now?

For a long time, writing code was the slow part. Today an agent can produce a
whole feature in a few minutes, and I find myself wondering whether code is
still the bottleneck.

If it isn't, what took its place? Knowing whether the code is right, perhaps.
Whether it does what the business needs, whether it survives production,
whether a person can actually use it. It feels like code got cheap while the
confidence in it didn't. And if writing is cheap and verifying is expensive,
where is the effort of a repository going today?

### How do you know the code is correct?

The usual answer is that the tests pass. But who wrote the tests? When the
same agent writes the code and the tests, from the same understanding of the
problem, I wonder what happens if that understanding is wrong. Would the
tests catch the mistake, or simply agree with it?

And correct compared to what? To the business rule, I suppose. A discount
that can't be applied twice. An invoice that can't be issued without a tax
ID. A metric that has to be counted per tenant, never globally.

In many teams I've seen, those rules don't live in the repository. They live
in someone's head, in an old Slack thread, in a ticket that was closed a year
ago. The new teammate has to ask, or guess. What does the agent do when it
can't find them?

There is also something in the names. `test_apply_2` and
`test_discount_cannot_be_applied_twice` may run exactly the same code, but
they don't tell the reader the same thing.

### Does code that works keep working?

It worked on my machine, it passed review, it went to production. For a long
time that felt like the end of the story.

But what happens when the database gets slow? When the queue grows faster
than the consumer? When a dependency starts returning errors at 3 a.m.? Who
gets paged, and what are they supposed to do?

I'm not sure the agent that wrote the code could answer any of that, unless
the answer was written somewhere it could read. And reliability rarely shows
up in a diff. It shows up in a system that has been running for months. Where
should that knowledge live, then? In a wiki someone forgets to update, or
next to the code that causes the incidents?

### Usable by whom?

Agents are good at producing interfaces that *look* right. The form is there,
the button is there, the layout is clean. Whether a real person can finish
the task is a different matter.

Does the error message explain what went wrong? Is the empty state a blank
page? Does it work with a keyboard, or with a screen reader? If none of this
is written down anywhere, I wonder what the agent is really optimizing for:
being usable, or looking plausible. And when something looks plausible, how
often does anyone look twice?

### Who reads the repository now?

For most of the history of software, the reader of a repository was a
person. Now it is also an agent. It reads the README, the `AGENTS.md`, the
`docs/` folder, the code around the change, and then it acts on what it
found. What it does with what it didn't find is another question.

Maybe documentation is no longer just a courtesy to the next developer.
Maybe it has become part of the context that generated code depends on. And
that raises a less comfortable thought: if the agent follows the docs
faithfully, what happens when the docs are wrong?

### So what has to change?

I don't have a final answer, only a few things I keep coming back to.

Maybe the effort is moving from writing code to verifying it. Maybe the
knowledge that lives only in people's heads needs to become written and
versioned, before the people move on. Maybe the reason behind a piece of code
is now worth more than the code itself, since the code can be regenerated and
the reason can't.

I also wonder whether a feature is done when it is merged, or only when
someone knows how to operate it, alert on it and roll it back. Whether a
prompt is enough to guide an agent, or whether the repository itself needs to
say what it may touch and who reviews the rest. And what "done" means for an
interface, beyond "looks good".

The rest of this post doesn't settle any of this. It is a list of what a
repository can have, so that each team can find its own answers.

## Proposals

What follows is the checklist itself: things a repository can have, grouped
by area. None of it is mandatory, and none of it answers the questions above
on its own. It is just what I'd look for.

**How to use it:** not every repo needs every item. Items marked `(A)` are
*advanced*: they matter for OSS projects, monorepos, or anything with outside
contributors. Everything unmarked is the baseline.

Sections marked *conditional* only apply when the repo is that kind of
project (an HTTP service, a containerized app, a Kubernetes workload).

### 1. Documentation

#### 1.1 README.md

- [ ] Project overview: what it does and, more importantly, *why* it exists
- [ ] Status badges: CI build, test coverage, latest release, stability level
- [ ] Stability / maturity level (`development` → `alpha` → `beta` → `stable` → `deprecated`)
- [ ] Support policy: who maintains it, where to ask, expected response time
- [ ] Installation instructions
- [ ] How to run the app locally
- [ ] How to configure the environment (`.env.example` committed, `.env` in `.gitignore`)
- [ ] Usage examples (copy-pasteable and actually tested)
- [ ] Architecture diagram or a short "how the pieces fit together" section
- [ ] Link to the contributing guide
- [ ] License information
- [ ] A README per module/subpackage, not just at the root (A)
- [ ] Auto-generated status sections, delimited by markers, so they never go stale (A)

#### 1.2 Governance and policy files

- [ ] `LICENSE` (+ `NOTICE` if you redistribute third-party code)
- [ ] `CONTRIBUTING.md`: local setup, how to run the tests, PR title and
      description rules, review expectations
- [ ] `CODEOWNERS`: ownership per directory, triggers automatic review requests
- [ ] `SECURITY.md`: how to report a vulnerability, privately
- [ ] `CODE_OF_CONDUCT.md`
- [ ] `AGENTS.md` / `CLAUDE.md`: policy for AI-assisted contributions (disclosure
      trailer, what agents may and may not do)
- [ ] `.github/pull_request_template.md`
- [ ] `.github/ISSUE_TEMPLATE/`: bug report, feature request, plus a `config.yml`
      pointing to the support channels
- [ ] Issue triage policy: labels, priorities, stale policy (A)
- [ ] Maintainer/approver roles and how to become one (A)

#### 1.3 Deeper docs (`docs/`)

- [ ] Release process, written down and repeatable
- [ ] Testing guide: how to run each test layer locally
- [ ] Onboarding guide for new modules/components (A)
- [ ] ADRs (Architecture Decision Records): the *why* behind the design
- [ ] Runbook / operational docs: alerts, dashboards, common failures
- [ ] Generated reference docs: every config option, default and emitted metric,
      produced from the source of truth instead of written by hand (A)
- [ ] `docs/architecture/`: overview, high-level design, low-level design, data flow
- [ ] `docs/rfc/`: proposals discussed before the decision, with a template (A)
- [ ] `docs/design/`: in-depth docs for cross-cutting concerns (multi-tenancy, pipelines) (A)
- [ ] `docs/operations/`: disaster recovery (RPO, RTO, last tested) and capacity planning

#### 1.4 Changelog and releases

- [ ] `CHANGELOG.md` following SemVer / Keep a Changelog
- [ ] Changelog fragments: one small file per PR, assembled at release time.
      Kills merge conflicts and forces the author to state the user-facing impact (A)
- [ ] Separate changelog for API/breaking changes vs. user-visible changes (A)
- [ ] Tagged releases with release notes generated from the changelog
- [ ] Documented versioning and deprecation policy

### 2. Code

#### 2.1 Layout and conventions

- [ ] Consistent, documented project layout
- [ ] License/SPDX header in every source file, enforced by the linter
- [ ] Package-level doc comment (`doc.go` or equivalent)
- [ ] Linter config committed, with an explicit set of linters and per-path
      exceptions that are justified, not the tool's defaults
- [ ] Formatter enforced in CI, not left to the reviewer
- [ ] Import restrictions enforced (no forbidden/internal imports leaking) (A)
- [ ] A task runner (Makefile / justfile / npm scripts) with standard targets:
      `test`, `lint`, `fmt`, `build`, `run`, `integration-test`, `tidy`
- [ ] The same commands work at the root and inside each module (A)

#### 2.2 Configuration

- [ ] Typed config struct with an explicit `Validate()` and clear error messages
- [ ] Fail fast on invalid config at startup, never in the middle of a request
- [ ] Example config committed and loaded by a real test
- [ ] Published config schema (JSON Schema / equivalent) for editor autocomplete
      and CI validation (A)
- [ ] `examples/` with complete, scenario-based configurations, not snippets
- [ ] Secrets never in config files or in the repo; injected at runtime
- [ ] Structured logging, metrics and tracing wired in and documented

#### 2.3 Single source of truth / generated code (A)

- [ ] Declarative metadata file per component (owners, stability, config,
      emitted telemetry)
- [ ] Code, docs and README sections generated from it
- [ ] CI checks that the generated output is up to date: drift becomes a broken
      build instead of stale documentation

### 3. Tests

#### 3.1 Unit tests

- [ ] Unit tests that actually assert behavior, not just execute lines
- [ ] Table-driven tests for logic with many branches
- [ ] Deterministic: no sleeps, no real clock, no network
- [ ] Versioned test fixtures (`testdata/`), with one command to regenerate them

#### 3.2 Integration and end-to-end

- [ ] Integration tests isolated behind a build tag / separate command so they
      don't slow down the unit run
- [ ] Real dependencies through ephemeral containers (Testcontainers or equivalent)
- [ ] End-to-end tests against a realistic deployment (A)
- [ ] Contract tests for consumed and provided APIs (A)

#### 3.3 Performance and robustness (A)

- [ ] Benchmarks for the hot paths, with a documented way to compare runs
- [ ] Load tests with a declared performance baseline
- [ ] Fuzz tests for anything that parses external input
- [ ] Leak detection: goroutines, connections, file descriptors
- [ ] Race detector enabled in CI

#### 3.4 Coverage

- [ ] Coverage report generated in CI and published
- [ ] Coverage threshold committed in the repo, split into *project* and
      *patch* targets (e.g. 85% overall, 95% on the diff)
- [ ] Coverage per module/component, so a big repo can't hide a bad corner
      behind a good average (A)

### 4. API artifacts *(conditional: HTTP/gRPC services)*

- [ ] OpenAPI / Swagger spec, versioned in the repo
- [ ] Spec generated from the code or validated against it, so it doesn't go stale
- [ ] Postman / Insomnia / Bruno collection
- [ ] `.http` request files (runnable from the editor)
- [ ] `curl.txt` with copy-pasteable examples
- [ ] Documented authentication flow
- [ ] Error catalog: codes, meanings and how to recover
- [ ] Documented versioning and deprecation path for endpoints

### 5. Build and runtime *(conditional: containerized apps)*

#### 5.1 Docker

- [ ] `Dockerfile` with a multi-stage build
- [ ] Minimal, pinned base image (distroless/slim), non-root user
- [ ] `.dockerignore`
- [ ] Healthcheck defined
- [ ] Reproducible builds: pinned dependencies, no `latest`
- [ ] Image vulnerability scan in CI (A)
- [ ] SBOM generated and published with the image (A)

#### 5.2 Docker Compose

- [ ] `docker-compose.yml` that brings up the whole stack with one command
- [ ] Per-environment overrides (`docker-compose.dev.yml`, `.prod.yml`)
- [ ] Dependencies (database, broker, cache) included, so a new dev needs nothing else

#### 5.3 Kubernetes *(conditional)*

- [ ] Manifests, or a Helm chart with a documented `values.yaml`
- [ ] Resource requests and limits defined
- [ ] Liveness / readiness / startup probes
- [ ] Secret management (External Secrets, SOPS, sealed-secrets, never plain text)
- [ ] Ingress configuration
- [ ] Per-environment overlays (Kustomize) or values files
- [ ] `NetworkPolicy`, `PodDisruptionBudget`, security context (A)
- [ ] Manifests linted and validated in CI (`kubeconform`, `helm lint`) (A)

### 6. CI/CD

#### 6.1 Basic checks

- [ ] Lint
- [ ] Format check
- [ ] Unit tests
- [ ] Coverage report + threshold enforcement
- [ ] Artifact build (binary and/or image)
- [ ] Integration tests, in a separate job
- [ ] Required status checks configured on the protected branch
- [ ] Build matrix across supported OSes/versions (A)
- [ ] Scope detection: run only what the diff actually affects (A)
- [ ] Job sharding to keep wall-clock time sane in big repos (A)

#### 6.2 Security

- [ ] Dependency vulnerability scan
- [ ] SAST (CodeQL or equivalent)
- [ ] Secret scanning enabled
- [ ] License compliance check on dependencies
- [ ] The workflow files themselves linted (`actionlint`, `zizmor`) (A)
- [ ] Shell scripts linted (`shellcheck`) (A)
- [ ] Minimal `permissions:` per workflow; third-party actions pinned by SHA
- [ ] OpenSSF Scorecard (A)

#### 6.3 Dependencies

- [ ] Automatic updates (Renovate / Dependabot) with a grouping strategy
- [ ] Lockfile committed
- [ ] Automatic tidy/prune check so the manifest doesn't go stale
- [ ] Public API compatibility check between versions (A)

#### 6.4 Repository automation (A)

- [ ] Automatic reviewer assignment from `CODEOWNERS`
- [ ] Automatic labels on PRs and issues by affected area
- [ ] Notify owners about new issues that touch their area
- [ ] Stale issue/PR handling
- [ ] Welcome message for first-time contributors
- [ ] Merge freeze during the release window
- [ ] Periodic repo health report (open issues, areas without an owner)
- [ ] Automated release preparation (version bump, changelog assembly, tag)

### 7. Repository metadata

- [ ] Topics/tags with the technologies used, so it can be found
- [ ] Clear, one-line repository description
- [ ] Protection rules on the default branch
- [ ] Signed commits or signed tags (A)
- [ ] Archive/deprecation notice when a repo is no longer maintained

### 8. Business rules, reliability and UX

The items AI doesn't solve on its own.

#### 8.1 Business rules

- [ ] Domain document: the rules the system must never break, in plain language
- [ ] Glossary: what each business term means *in this project*
- [ ] Tests named after the rule they protect, so the test list reads as a spec
- [ ] Rules that come from outside (law, contracts, regulators) linked to their source (A)

#### 8.2 Reliability and operations

- [ ] SLOs defined per service, with the error budget written down
- [ ] Alerts as code, versioned in the repo, each one linked to its runbook
- [ ] Dashboards as code (A)
- [ ] Rollback path documented and tested, not just "redeploy the old version"
- [ ] Disaster recovery tested, with the date of the last test recorded
- [ ] Post-mortems stored and linked to the fixes they produced (A)

#### 8.3 AI-assisted development

- [ ] `AGENTS.md` describing the architecture in brief, the commands to build and
      test, and the areas agents must not change without a human
- [ ] `CODEOWNERS` on sensitive areas (auth, billing, migrations, infra), so a
      person always reviews them
- [ ] Tests written or reviewed independently from the code they check, not both
      produced in the same pass from the same prompt
- [ ] At least one check that doesn't depend on the agent's own tests (mutation,
      property-based or contract tests; see
      [Checking the code beyond the agent's tests](#checking-the-code-beyond-the-agents-tests))
- [ ] Docs that agents rely on are generated or checked in CI, so they can't
      silently go stale (A)

#### 8.4 UI/UX *(conditional: projects with a user interface)*

- [ ] Acceptance criteria for usability, not just "renders correctly"
- [ ] Error, empty and loading states designed, not left to defaults
- [ ] Accessibility checks in CI (contrast, labels, keyboard navigation)
- [ ] Visual regression tests / screenshots in the PR (A)
- [ ] User-facing text reviewed as part of the change, not as an afterthought

### Minimum viable set

If you only do ten things, do these:

1. A README that gets someone running locally in under five minutes
2. `LICENSE`
3. `CONTRIBUTING.md`
4. `.env.example` committed, secrets out of the repo
5. Unit tests with a coverage threshold enforced in CI
6. Lint + formatting enforced in CI
7. A multi-stage `Dockerfile` and a one-command `docker-compose up`
8. `CHANGELOG.md` and tagged releases
9. Dependency and vulnerability scanning
10. Branch protection with required checks

And if AI writes a good part of your code, add three more: an `AGENTS.md`,
the business rules written somewhere the agent can read them, and a runbook
for every alert.

## Internal documentation: an idea

This is not a standard, just a structure I'd like to try in a project of
medium size or bigger:

```
docs/
├── architecture/
│   ├── overview.md
│   ├── high-level-design.md
│   ├── low-level-design.md
│   └── data-flow.md
├── adr/
│   ├── 0001-choose-kafka.md
│   ├── 0002-choose-victoriametrics.md
│   └── 0003-storage-strategy.md
├── rfc/
│   └── 0001-new-ingestion-pipeline.md
├── design/
│   ├── metrics-pipeline.md
│   └── multi-tenancy.md
└── operations/
    ├── runbooks.md
    ├── disaster-recovery.md
    └── capacity-planning.md
```

Each folder answers a different question.

**`architecture/`: how the system is built, right now.**

- `overview.md` is the entry point. One page: what the system does, who uses
  it, its main pieces and where to go next. If someone reads only one
  document, it should be this one.
- `high-level-design.md` covers the components and the boundaries between
  them: how they talk to each other, what they depend on, what is synchronous
  and what is not.
- `low-level-design.md` goes inside each component: data models, key
  algorithms, error handling, the important classes and modules. This is the
  document that ages fastest, so keep it short, or generate parts of it from
  the code.
- `data-flow.md` follows the data: where it enters, how it is transformed,
  where it is stored and where it leaves. Mark the paths that carry personal
  or sensitive data. That is the first thing a security review will ask for.

**`adr/`: why it was built this way.** An *Architecture Decision Record* is
one decision per file, numbered, with three parts: the context, the
decision, and the consequences (including the bad ones). ADRs are never
edited after they are accepted. When a decision changes, a new ADR
*supersedes* the old one, and the history stays readable. `0001-choose-kafka.md`
should still explain, five years from now, why Kafka made sense at the time,
even if you have moved off it since.

**`rfc/`: what we are thinking about changing.** A *Request for Comments* is
a proposal written *before* the decision, to collect objections while
changing course is still cheap. The difference from an ADR is simple: an RFC
asks, an ADR records. An accepted RFC usually produces one or more ADRs and,
eventually, changes in `architecture/`.

**`design/`: how a specific feature or cross-cutting concern works.** Things
like `metrics-pipeline.md` or `multi-tenancy.md` are too detailed for the
architecture overview and too lasting to be buried in an RFC. They describe
one concern in depth: how tenants are isolated, how a metric goes from the
SDK to the dashboard.

**`operations/`: how to keep it running.**

- `runbooks.md` maps each alert to what to check and what to do. Every alert
  should link to its runbook. An alert without a runbook only tells someone,
  at 3 a.m., that they are on their own.
- `disaster-recovery.md` covers what you can lose (RPO), how long you can be
  down (RTO), how to restore, and *when it was last tested*. A recovery plan
  that was never tested is a hope, not a plan.
- `capacity-planning.md` lists the current limits, how fast usage is growing,
  and the point at which you need to scale. That way scaling is a decision
  you make in advance, not a reaction to an incident.

A few rules that keep this alive:

- **Docs change in the same pull request as the code.** A PR that changes
  the data flow and leaves `data-flow.md` alone is not finished.
- **Templates for ADRs and RFCs**, so writing one takes ten minutes, not an
  afternoon.
- **`CODEOWNERS` on `docs/`**, so documentation has owners like code does.
- **CI checks the links** and, where possible, that generated docs are up to
  date.
- **The README links to `docs/architecture/overview.md`.** A document nobody
  can find may as well not exist.

## Monorepo or multi-repo?

Do these pieces change together? When you change the API, do you almost
always change the client in the same week? Are they released together? Are
they owned by the same team? Do they share the same build tools and the same
language?

If the answers are mostly *yes*, they probably belong together. If they are
mostly *no*, splitting them is less a technical choice than recognizing a
boundary that already exists in the organization. That is Conway's law
showing up: systems end up mirroring the communication structure of the
teams that build them. A repository layout that fights the organization
chart usually loses.

**Monorepo**

- In favor: a change that crosses services is one atomic pull request. One
  CI, one set of linters, one version of each dependency. Refactoring across
  boundaries is cheap.
- In the AI era there's an extra point in favor: **the agent sees the whole
  context**. The caller and the callee, the producer and the consumer, the
  schema and every place that uses it, all in one place. Many of the mistakes
  an agent makes come from not seeing the other side of an interface.
- Against: it needs tooling to stay fast (build scope detection with Bazel,
  Nx, Turborepo, Pants or similar). CI time grows with the repo.
  Permissions are coarse. `CODEOWNERS` stops being optional, because without
  it nobody knows who reviews what.

**Multi-repo**

- In favor: clear ownership and permissions. Each repo releases at its own
  pace. Failures stay contained, so a broken build in one repo doesn't block
  everybody else.
- Against: a change that crosses repos needs coordination, several pull
  requests and an order to merge them in. Versions drift apart. CI
  configuration gets duplicated. And the context is scattered: the agent
  working in one repo only sees that repo, and it will make assumptions about
  the others.

Neither is free. The honest answer is usually: follow the team boundaries,
and pay the cost of the option you chose on purpose. With a monorepo, invest
in build tooling. With multi-repo, invest in contracts and versioning.

## Where the docs could live

The rule of thumb I use: **documentation lives as close as possible to what
it describes, and as high up as its scope.** A runbook for one service lives
with that service. A decision that affects every service lives where every
service can see it.

**In a monorepo**, that becomes two levels:

```
repo/
├── README.md
├── AGENTS.md
├── docs/                      # cross-cutting, for the whole system
│   ├── architecture/          # overview, high-level design, data flow
│   ├── adr/                   # decisions that affect more than one service
│   ├── rfc/
│   ├── design/                # multi-tenancy, metrics pipeline...
│   └── operations/            # platform DR, global capacity
└── services/
    ├── ingestion/
    │   ├── README.md
    │   └── docs/              # this service only
    │       ├── low-level-design.md
    │       ├── adr/           # decisions local to this service
    │       └── runbooks.md
    └── query/
        ├── README.md
        └── docs/
```

**In a multi-repo setup**, each repository keeps its own `docs/` for
everything local: low-level design, local ADRs, runbooks for its alerts. The
cross-cutting part (the system overview, the ADRs that affect everyone, the
RFCs, disaster recovery for the platform) goes into **one dedicated
repository**, something like `architecture` or `engineering-docs`, linked
from the README of every service. Without it, cross-cutting decisions end up
copied into five repos and diverging in each one.

And where they should **not** live: as the source of truth, in a wiki or a
shared drive. A wiki is not reviewed with the code, is not versioned with the
code, and is invisible to the agent working in the repository. A wiki can
point to the docs. It shouldn't replace them.

## Checking the code beyond the agent's tests

If the agent writes the code and the tests, the tests tell you that the code
does what the agent understood. They don't tell you whether the agent
understood the right thing. Tests written in the same pass can be
incomplete (the edge case nobody thought of is missing from both) or
imprecise (an assertion so loose it would pass with almost any output). So
how else can you check? These are the ideas I find most useful.

**Write the tests that matter before the code, and keep them away from the
agent.** Acceptance tests for the business rules, written by a person from
the rule itself, not from the implementation. They can live in a directory
protected by `CODEOWNERS`, so an agent can't "fix" a failing test by
changing what it expects. If the agent has to change one of them, that should
be a conversation, not a commit.

**Check that each test can fail.** A test that never fails proves nothing.
Before trusting a new test, revert the change it is supposed to cover and see
it go red. Then put the change back and see it go green.

**Mutation testing.** A tool introduces small bugs into the code (flips a
`>` to `>=`, removes a call, returns a constant) and runs the tests. If the
tests still pass, they aren't checking that behavior. Coverage tells you
which lines ran. Mutation testing tells you whether anyone noticed when they
were wrong. Stryker (JavaScript, C#), PIT (Java), mutmut (Python) and
Gremlins or go-mutesting (Go) do this.

**Property-based tests.** Instead of a few examples chosen by whoever wrote
the code, you describe a property that must always hold ("applying the
discount twice gives the same total as applying it once", "decoding what was
encoded returns the original") and the tool generates hundreds of inputs,
including the strange ones. Hypothesis (Python), fast-check (JavaScript),
jqwik (Java) and rapid (Go) are good starting points.

**Fuzzing** for anything that parses input from outside: requests, files,
messages. It finds the inputs nobody imagined, which are exactly the ones the
agent didn't imagine either.

**Contract tests** between services (Pact, or schemas validated in CI), so
that a change on one side of an API is checked against what the other side
actually expects, not against what the agent assumed.

**Differential testing.** When the agent rewrites something that already
works, run the old and the new version with the same inputs and compare the
outputs. In production this can be done with shadow traffic: the new version
receives a copy of real requests, its answers are compared and discarded.

**Golden files and snapshots reviewed by a person.** The output of a report,
an API response or a rendered screen saved in the repository. Any change
shows up as a diff that someone has to read and approve.

**Stricter static checks.** Strict typing, linters with rules that matter,
SAST. They don't depend on anyone having thought of the right test case.

**Review the tests first.** In a pull request, read the tests before the
code. Do they describe the rule, or the implementation? Would they pass if
the code were wrong in a plausible way? A second agent with a clean context,
asked only to find what the tests miss, can help here too. But the decision
about what the rule *is* stays with a person.

**Let production be the last check, not the first.** Canary releases,
feature flags and progressive delivery guided by SLOs, so a mistake reaches a
few users, is seen by the observability, and is rolled back before it reaches
everyone.

**And for interfaces, a human using it.** No automated test tells you whether
a flow is confusing. Watching one real person try to finish the task, even
for ten minutes, still finds things no tool finds.

None of these replaces the others, and no project needs all of them. But
each one checks the code from a place the agent didn't write.
