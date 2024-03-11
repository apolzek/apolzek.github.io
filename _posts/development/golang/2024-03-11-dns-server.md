---
layout: post
title: development/golang/dns-server
description: dns-server
summary: dns-server  
tags: go dns-server
---

## dns-server

```go
package main

import (
	"fmt"
	"net"

	"github.com/miekg/dns"
)

func resolver(domain string, qtype uint16) []dns.RR {
	switch qtype {
	case dns.TypeA:
		return []dns.RR{
			&dns.A{
				Hdr: dns.RR_Header{Name: domain, Rrtype: dns.TypeA, Class: dns.ClassINET, Ttl: 3600},
				A:   net.ParseIP("127.0.0.1"),
			},
		}
	case dns.TypeAAAA:
		return []dns.RR{
			&dns.AAAA{
				Hdr:  dns.RR_Header{Name: domain, Rrtype: dns.TypeAAAA, Class: dns.ClassINET, Ttl: 3600},
				AAAA: net.ParseIP("::1"),
			},
		}
	case dns.TypeCNAME:
		return []dns.RR{
			&dns.CNAME{
				Hdr:    dns.RR_Header{Name: domain, Rrtype: dns.TypeCNAME, Class: dns.ClassINET, Ttl: 3600},
				Target: "example.com.",
			},
		}
	case dns.TypeMX:
		return []dns.RR{
			&dns.MX{
				Hdr:        dns.RR_Header{Name: domain, Rrtype: dns.TypeMX, Class: dns.ClassINET, Ttl: 3600},
				Preference: 10,
				Mx:         "mail.example.com.",
			},
		}
	default:
		return nil
	}
}

type dnsHandler struct{}

func (h *dnsHandler) ServeDNS(w dns.ResponseWriter, r *dns.Msg) {
	msg := new(dns.Msg)
	msg.SetReply(r)
	msg.Authoritative = true

	for _, question := range r.Question {
		answers := resolver(question.Name, question.Qtype)
		if answers != nil {
			msg.Answer = append(msg.Answer, answers...)
		}
	}

	w.WriteMsg(msg)
}

func StartDNSServer() {
	handler := new(dnsHandler)
	server := &dns.Server{
		Addr:      ":53",
		Net:       "udp",
		Handler:   handler,
		UDPSize:   65535,
		ReusePort: true,
	}

	fmt.Println("Starting DNS server on port 53")

	err := server.ListenAndServe()
	if err != nil {
		fmt.Printf("Failed to start server: %s\n", err.Error())
	}
}

func main() {
	StartDNSServer()
}
```

```
sudo systemctl enable --now systemd-resolved
sudo systemctl start systemd-resolved
```

### References

https://blog.stackademic.com/build-dns-server-using-golang-8a97db12a660