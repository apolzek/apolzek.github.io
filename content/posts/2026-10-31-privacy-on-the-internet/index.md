---
title: "Privacy on the internet: a practical guide"
slug: "privacy-on-the-internet"
date: '2026-10-31T14:00:00-03:00'
draft: false
description: "A technical quick guide to staying private and secure online: privacy vs anonymity, threat modeling, recommended apps (Signal, SimpleX, Briar, Session, KeePassXC, uBlock Origin), proxy vs VPN vs Tor, DNS over HTTPS vs DNS over TLS with real configs, hardened operating systems (Tails, Qubes, GrapheneOS), file sharing with OnionShare, and a curated list of the repositories and sites worth bookmarking."
tags:
- seguranca
- tecnologia
minute: 16
---

This is a hands-on guide, not an essay. The goal is to filter what matters out of the huge amount of privacy material online (lists with hundreds of tools, guides with hundreds of pages) and keep only the core: the concepts you need to make good decisions, the tools that are actually worth installing, and the configurations that make a difference.

Everything here comes from a small set of references I trust, listed at the end. When in doubt, go to the source: [Privacy Guides](https://www.privacyguides.org/en/) for vetted recommendations and [The Hitchhiker's Guide to Online Anonymity](https://anonymousplanet.net/guide/) for depth.

## Privacy vs anonymity vs security

These three words are used interchangeably, and that confusion leads to bad choices. They are different properties:

| Property | Question it answers | Example |
|---|---|---|
| **Privacy** | Can others see *what* I am doing? | An end-to-end encrypted message: everyone knows you sent it, nobody can read it. |
| **Anonymity** | Can others know *who* is doing it? | A post on a forum over Tor: everyone can read it, nobody knows who wrote it. |
| **Security** | Can others *tamper with or take* what is mine? | A password manager plus hardware key: your accounts cannot be taken over. |

Some practical consequences:

- **You can have privacy without anonymity.** Your bank account is private, but the bank knows exactly who you are. Signal hides message content, but your contacts know it is you.
- **You can have anonymity without privacy.** A public post made through Tor is readable by everyone; only the author is hidden.
- **Anonymity is fragile and all-or-nothing.** One login to a personal account, one reused username, one photo with EXIF data, one payment with your card, and the anonymous identity is linked to the real one forever. Privacy degrades gracefully; anonymity breaks.
- **Pseudonymity** is the middle ground most people actually use: a stable identity (a username, a Session ID) that is not linked to your legal name.

For most people, the realistic goal is **strong privacy plus good security**, with anonymity reserved for specific activities that need it.

## Start with a threat model

Before installing anything, answer four questions:

1. **What am I protecting?** Browsing history, location, messages, identity, files, sources.
2. **From whom?** Ad networks and data brokers, your ISP, an employer, an abusive partner, a criminal, a state.
3. **How bad is failure?** Targeted ads, or physical danger.
4. **How much effort will I really sustain?** A setup you abandon in two weeks protects nothing.

The answers change everything. Someone avoiding ad tracking needs a good browser and a content blocker. A journalist protecting sources needs Tails and SecureDrop-style workflows. Someone escaping domestic abuse should first worry about stalkerware and shared accounts, not browser fingerprinting. The EFF's [Surveillance Self-Defense](https://ssd.eff.org/) has threat modeling guides written for exactly this.

## The quick checklist

If you only do one section of this post, do this one. Ordered by return on effort:

1. **Password manager** with unique random passwords: [KeePassXC](https://github.com/keepassxreboot/keepassxc) (local, offline) or Bitwarden (synced).
2. **MFA everywhere**, preferring passkeys or a FIDO2 hardware key; authenticator app (TOTP) as fallback; SMS only as a last resort.
3. **Hardened browser** plus **[uBlock Origin](https://github.com/gorhill/uBlock)**, and nothing else.
4. **Encrypted DNS** (DoH or DoT) on every device.
5. **[Signal](https://signal.org/)** for everyday messaging, with disappearing messages on.
6. **OS and app updates** turned on automatically.
7. **Full-disk encryption** (BitLocker, FileVault, LUKS; on by default on modern phones).
8. **Email aliases** for sign-ups, and remote images blocked in your mail client.
9. **Phone permissions** audited: location "while in use" or never, no contacts/microphone for apps that do not need them.
10. **Check your exposure** on [Have I Been Pwned](https://haveibeenpwned.com/) and delete accounts you no longer use.

## Recommended apps

The lists [pluja/awesome-privacy](https://github.com/pluja/awesome-privacy) and [lissy93/awesome-privacy](https://github.com/lissy93/awesome-privacy) catalog hundreds of options. Here is the short version, focused on open source tools with a solid track record.

### Messaging

Not all "secure messengers" protect the same things. The main differences are what identifier you need, who sees metadata, and whether it works without central servers.

| App | Identifier | Network | Strength | Trade-off |
|---|---|---|---|---|
| **Signal** | Phone number (hidden behind usernames) | Central servers | Best-in-class crypto, minimal metadata, easy for non-technical contacts | Needs a phone number to register |
| **[SimpleX](https://github.com/simplex-chat/simplex-chat)** | None at all | Relay servers, self-hostable | No user IDs of any kind, not even random ones; double ratchet with post-quantum key exchange | Smaller user base, contact exchange via links/QR |
| **[Session](https://github.com/session-foundation/session-android)** | Random Session ID | Decentralized nodes with onion routing | No phone number, IP hidden by onion routing | Its protocol historically gave up forward secrecy; check the current status before relying on it |
| **[Briar](https://github.com/briar/briar)** | None (add contacts in person or via link) | Peer-to-peer over Tor, Bluetooth or Wi-Fi | Works without internet (protests, blackouts), no servers at all | Both sides must be online; mainly Android |

The cryptography behind Signal lives in [signalapp/libsignal](https://github.com/signalapp/libsignal): the Double Ratchet, X3DH and its post-quantum successor PQXDH, sealed sender, and more. It is the de facto standard; WhatsApp and others use the Signal protocol for content too, but collect far more metadata around it.

**Rule of thumb:** Signal for daily life, SimpleX when you want no identifier at all, Briar when the internet itself is unreliable or censored.

### Browser

| Option | When to use |
|---|---|
| **[Mullvad Browser](https://mullvad.net/en/browser)** | Tor Browser's anti-fingerprinting without the Tor network. Pair with a VPN. |
| **Firefox + [arkenfox/user.js](https://github.com/arkenfox/user.js)** | Maximum control. arkenfox is a well-documented `user.js` template that hardens Firefox's privacy and security settings. |
| **Brave** | Good defaults with zero configuration, randomizes fingerprinting values. |
| **[Tor Browser](https://www.torproject.org/)** | When you need anonymity, not just privacy. |

Fingerprinting rule: you do not want to look *unique*, you want to look *like everyone else*. Every extra extension makes you more identifiable. Install uBlock Origin, maybe a container extension, and stop. Test yourself on EFF's [Cover Your Tracks](https://coveryourtracks.eff.org/).

### Other essentials

- **Passwords:** [KeePassXC](https://github.com/keepassxreboot/keepassxc) (desktop, local database), KeePassDX on Android, Bitwarden if you need sync.
- **Email:** Proton Mail or Tuta for encryption at rest; SimpleLogin or addy.io for aliases.
- **Files in the cloud:** encrypt before uploading with Cryptomator.
- **File sharing:** [OnionShare](https://onionshare.org/) (more below).
- **Network-wide blocking:** [AdGuard Home](https://github.com/AdguardTeam/AdGuardHome) or Pi-hole as a local DNS resolver that blocks ad and tracker domains for every device at home.
- **Phone forensics:** [MVT (Mobile Verification Toolkit)](https://github.com/mvt-project/mvt), from Amnesty International's Security Lab, checks iOS backups and Android devices for indicators of known spyware such as Pegasus.

## Proxy vs VPN vs Tor: one hop, one tunnel, three hops

All three put something between you and the destination. They differ in **scope**, **encryption** and **who you have to trust**.

A common source of confusion: Tor *does* use a proxy. The Tor client running on your machine exposes a local **SOCKS5 proxy** (`127.0.0.1:9050` for the `tor` daemon, `127.0.0.1:9150` for Tor Browser), and applications talk to Tor through it, exactly as they would with any proxy:

```bash
curl --socks5-hostname 127.0.0.1:9050 https://check.torproject.org/api/ip
```

But that proxy lives on your own computer and is only the entry point. What happens after it is the difference: instead of one intermediary that sees everything, your traffic crosses three independent relays with layered encryption. So the real comparison is not about protocols, it is about how many parties sit in the middle and what each of them can learn.

| | Proxy (HTTP/SOCKS5) | VPN | Tor |
|---|---|---|---|
| Scope | One app configured to use it | Whole device (all traffic) | Apps configured to use it (Tor Browser) |
| Encrypts traffic to the hop | Usually not (SOCKS5 has no encryption) | Yes (WireGuard, OpenVPN, IPsec) | Yes, in three layers |
| Hides your IP from the site | Yes | Yes | Yes |
| Who sees everything | The proxy operator | The VPN provider | No single relay sees both who you are and where you go |
| Anonymity | No | No | Yes, if used correctly |
| Speed | Fast | Fast | Slow |
| Typical use | Scraping, bypassing a simple geo-block, routing one app | Untrusted Wi-Fi, hiding traffic from your ISP | Anonymity, censorship circumvention, onion services |

Key points:

- **A VPN moves trust, it does not remove it.** Everything your ISP used to see, the VPN provider now sees. Choose a provider with an independently audited no-logs policy and, ideally, anonymous payment (Mullvad and IVPN accept cash and Monero; Proton VPN has a free tier with a good track record). Avoid free VPNs with unknown business models.
- **A VPN does nothing against cookies, fingerprinting or logging into your Google account.** It changes your IP, not your identity.
- **Prefer WireGuard** as the protocol: small codebase, modern cryptography, fast reconnection on mobile.
- **Turn on the kill switch** so traffic is blocked if the tunnel drops, and check for DNS leaks after connecting.
- **Plain proxies are not privacy tools.** An unencrypted HTTP or SOCKS5 proxy exposes your traffic to the network between you and it. Encrypted proxy protocols like Shadowsocks exist mainly for censorship circumvention.
- **Tor's three hops:** the guard knows your IP but not the destination; the exit knows the destination but not your IP; the middle knows neither. Traffic from the exit to a non-HTTPS site is readable by the exit operator, so HTTPS still matters. `.onion` sites never leave the Tor network, so there is no exit at all.
- **Tor over VPN** (VPN first, then Tor) hides from your ISP that you use Tor. It does not make Tor "more anonymous" and adds a party that knows your IP. Use bridges (obfs4, Snowflake) instead if Tor is blocked where you are.

Download Tor only from the official site, [download.torproject.org](https://download.torproject.org/), and verify the signature.

## DNS: why it leaks and how to fix it

Before every connection your device asks a DNS resolver "what is the IP of `example.com`?". By default that query travels **in plain text over UDP port 53** to your ISP's resolver. Even with HTTPS everywhere, anyone on the path sees every domain you visit, and many ISPs log, sell or tamper with those queries.

Encrypted DNS fixes the transport. The main options:

| Protocol | Port | Transport | RFC | Notes |
|---|---|---|---|---|
| **DNS over TLS (DoT)** | 853/TCP | DNS inside TLS | 7858 | Easy to identify and block (dedicated port). Native in Android ("Private DNS") and systemd-resolved. |
| **DNS over HTTPS (DoH)** | 443/TCP | DNS inside HTTPS | 8484 | Blends in with web traffic, hard to block. Native in browsers, Windows 11, iOS/macOS profiles. |
| **DNS over QUIC (DoQ)** | 853/UDP | DNS over QUIC | 9250 | Lower latency, less widely supported. |
| **DNSCrypt** | 443 | Own protocol | none | Older, not an IETF standard, still well supported by [dnscrypt-proxy](https://github.com/DNSCrypt/dnscrypt-proxy). |

**DoT vs DoH in practice:** they encrypt the same thing equally well. DoT is cleaner for OS-wide configuration and lets network admins see that DNS is happening; DoH is better when you want to avoid DNS being blocked or singled out. On a network that blocks port 853, DoH still works.

What encrypted DNS **does not** do:

- It does not hide the destination IP address you connect to afterwards.
- It does not hide the domain from the TLS handshake, where it appears in the SNI field, unless the site and browser support **Encrypted Client Hello (ECH)**.
- It moves trust to the resolver. Pick one with a clear no-logs policy: Quad9 (non-profit, blocks malware domains), Mullvad DNS (no logs, optional ad blocking), Cloudflare 1.1.1.1 (fast, audited), or your own resolver.

### Configuration examples

**Linux with systemd-resolved (DoT)**, in `/etc/systemd/resolved.conf`:

```ini
[Resolve]
DNS=9.9.9.9#dns.quad9.net 149.112.112.112#dns.quad9.net
DNSOverTLS=yes
DNSSEC=yes
Domains=~.
```

```bash
sudo systemctl restart systemd-resolved
resolvectl status
```

**Android (DoT):** Settings → Network & internet → Private DNS → enter `dns.quad9.net` or `dns.mullvad.net`.

**Firefox (DoH):** Settings → Privacy & Security → DNS over HTTPS → Max Protection, with a custom provider such as `https://dns.quad9.net/dns-query`. The equivalent in `about:config`:

```text
network.trr.mode = 3
network.trr.uri = https://dns.quad9.net/dns-query
```

Mode `3` means DoH only, with no fallback to plain DNS.

**Whole network:** run [AdGuard Home](https://github.com/AdguardTeam/AdGuardHome) or [dnscrypt-proxy](https://github.com/DNSCrypt/dnscrypt-proxy) on a small box, point your router's DHCP DNS at it, and let it forward queries upstream over DoH/DoT while blocking trackers for every device, including the smart TV.

**Test it:**

```bash
dig +https @dns.quad9.net example.com
kdig +tls @9.9.9.9 example.com
```

Then visit [dnsleaktest.com](https://www.dnsleaktest.com/) or [browserleaks.com](https://browserleaks.com/) and check that only your chosen resolver shows up.

## Operating systems for when it really matters

For most people, an up-to-date mainstream OS with full-disk encryption is enough. When the threat model is serious, these three are the reference:

- **[Tails](https://tails.net/)**: a live system booted from a USB stick. It routes everything through Tor, blocks anything that tries to bypass it, and is **amnesic**: when you shut down, nothing remains on the computer. Ideal for a sensitive session on a machine you do not trust, or that someone else might inspect later. An encrypted Persistent Storage keeps only what you choose.
- **[Qubes OS](https://www.qubes-os.org/)**: "security by compartmentalization". Each activity runs in its own Xen virtual machine (qube): one for banking, one for work, a disposable one to open that suspicious PDF. A compromise in one qube does not reach the others. It integrates Whonix for Tor-routed qubes. Steep learning curve and specific hardware requirements, but it is the strongest desktop setup available.
- **[GrapheneOS](https://grapheneos.org/)**: a hardened Android for Google Pixel phones, with no Google services by default (optionally installed sandboxed, as regular apps), per-app network and sensor permissions, storage scopes, and strong exploit mitigations.

**Tails vs Qubes:** Tails is for leaving no trace and anonymity in a session; Qubes is for daily use with strong isolation. Different jobs.

## Sharing files anonymously

[OnionShare](https://onionshare.org/) turns your computer into a temporary Tor onion service. You can:

- **Share** files: the recipient opens a `.onion` address in Tor Browser and downloads directly from your machine, with no cloud in the middle.
- **Receive** files: a drop box where sources can send you documents anonymously.
- **Host** a static website.
- **Chat** in a temporary, anonymous room.

When you close OnionShare, the address disappears. Nothing is stored on third-party servers.

Before sharing any file, strip metadata: `exiftool -all= photo.jpg` for images, and `mat2` (included in Tails) for documents, which often carry the author's name, the software used and editing history.

## Anonymity: operational security

Tools are the easy part. Anonymity usually fails because of behavior, not crypto. The [Hitchhiker's Guide](https://anonymousplanet.net/guide/) covers this in depth; the essentials:

- **Strict separation of identities.** Never log into a personal account in the same session, browser or device as an anonymous identity.
- **No reuse.** Usernames, emails, writing style, avatars, recovery phone numbers. All of them link identities.
- **Watch the payment trail.** A subscription paid with your card links the service to your name. Some providers accept cash or privacy-focused cryptocurrencies. If you go that route, [Helmi/awesome-crypto](https://github.com/Helmi/awesome-crypto) is a starting point for wallets and concepts, but remember Bitcoin is **pseudonymous, not anonymous**: every transaction is public forever and exchanges know who you are.
- **Metadata leaks.** EXIF in photos, document properties, timezone, browser language, typing schedule.
- **Phones are tracking devices.** Your phone constantly talks to cell towers. Leaving it at home is sometimes the only real option.
- **Keep it boring.** The more effort a setup needs, the more likely you are to make a mistake under pressure. Simple and consistent beats sophisticated and occasional.

## Common mistakes

- Thinking incognito mode hides you. It only skips local history.
- Thinking a VPN makes you anonymous while you are logged into your accounts.
- Installing ten privacy extensions and becoming more unique.
- Running Tor through a normal browser instead of Tor Browser.
- Using an "end-to-end encrypted" app whose backups go to the cloud unencrypted.
- Downloading privacy tools from mirrors or app stores you do not trust, without checking signatures.
- Forgetting that the other end of the conversation is part of your threat model: a screenshot defeats any cryptography.

## References

### Links that shaped this guide

- [Privacy Guides](https://www.privacyguides.org/en/): community-vetted tool recommendations and explanations; the best single starting point.
- [The Hitchhiker's Guide to Online Anonymity (Anonymous Planet)](https://anonymousplanet.net/guide/): the most complete guide to anonymity and OPSEC; long, but worth it.
- [pluja/awesome-privacy](https://github.com/pluja/awesome-privacy): curated list of privacy-respecting services and alternatives.
- [lissy93/awesome-privacy](https://github.com/lissy93/awesome-privacy): another curated list of privacy and security tools, with annotations.
- [Helmi/awesome-crypto](https://github.com/Helmi/awesome-crypto): list about cryptocurrencies, wallets and tooling.
- [signalapp/libsignal](https://github.com/signalapp/libsignal): the Signal Protocol and cryptographic primitives.
- [simplex-chat/simplex-chat](https://github.com/simplex-chat/simplex-chat): messenger with no user identifiers.
- [session-foundation/session-android](https://github.com/session-foundation/session-android): decentralized, onion-routed messenger.
- [briar/briar](https://github.com/briar/briar): peer-to-peer messenger over Tor, Bluetooth and Wi-Fi.
- [OnionShare](https://onionshare.org/): anonymous file sharing, receiving, websites and chat over Tor.
- [Tor Project downloads](https://download.torproject.org/): official Tor Browser builds.
- [Tails](https://tails.net/): amnesic live OS that routes everything through Tor.
- [Qubes OS](https://www.qubes-os.org/): desktop OS built on compartmentalization.

### Additional references

- [EFF Surveillance Self-Defense](https://ssd.eff.org/): threat modeling and step-by-step guides for different risk profiles.
- [EFF Cover Your Tracks](https://coveryourtracks.eff.org/): test how trackable and fingerprintable your browser is.
- [GrapheneOS](https://grapheneos.org/): privacy and security hardened Android for Pixel phones.
- [arkenfox/user.js](https://github.com/arkenfox/user.js): Firefox hardening template.
- [gorhill/uBlock](https://github.com/gorhill/uBlock): uBlock Origin, the content blocker.
- [keepassxreboot/keepassxc](https://github.com/keepassxreboot/keepassxc): offline, cross-platform password manager.
- [DNSCrypt/dnscrypt-proxy](https://github.com/DNSCrypt/dnscrypt-proxy): local DNS proxy supporting DoH, DNSCrypt and Anonymized DNS.
- [AdguardTeam/AdGuardHome](https://github.com/AdguardTeam/AdGuardHome): network-wide ad and tracker blocking DNS server with DoH/DoT/DoQ.
- [mvt-project/mvt](https://github.com/mvt-project/mvt): Mobile Verification Toolkit for detecting spyware on phones.
- [Mullvad Browser](https://mullvad.net/en/browser): Tor Browser's anti-fingerprinting without the Tor network.
