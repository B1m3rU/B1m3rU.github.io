---
layout: page
title: "Master's Thesis"
permalink: /tfm/
description: "Master's thesis (UOC, 2026): black-box pentesting of a Dockerized CTF lab — four machines, methodology and combined findings."
---

{% assign tfm = site.categories.machines | where_exp: "p", "p.tags contains 'tfm'" | sort: "date" %}
{% assign total_flags = 0 %}{% assign total_findings = 0 %}
{% for p in tfm %}{% assign total_flags = total_flags | plus: p.machine.flags %}{% assign total_findings = total_findings | plus: p.machine.findings %}{% endfor %}

Final project of my **Master's in Cybersecurity and Privacy (UOC, 2026)**: a black-box penetration test of a lab of intentionally vulnerable machines, each one deployed as Docker containers with `docker-compose` and attacked from Kali Linux.

<div class="stat-row">
  <div class="stat"><span class="stat__value">{{ tfm.size }}</span><span class="stat__label">machines</span></div>
  <div class="stat"><span class="stat__value">{{ total_flags }}</span><span class="stat__label">flags captured</span></div>
  <div class="stat"><span class="stat__value">{{ total_findings }}</span><span class="stat__label">documented findings</span></div>
</div>

## The machines

<table>
  <thead>
    <tr><th>Machine</th><th>OS</th><th>Flags</th><th>Findings</th><th>Key techniques</th></tr>
  </thead>
  <tbody>
    {% for p in tfm %}
    <tr>
      <td><a href="{{ p.url | relative_url }}">{{ p.title | split: " " | first }}</a></td>
      <td>{{ p.machine.os }}</td>
      <td>{{ p.machine.flags }}</td>
      <td>{{ p.machine.findings }}</td>
      <td>{{ p.machine.techniques | join: ", " }}</td>
    </tr>
    {% endfor %}
  </tbody>
</table>

## Methodology

Every machine was approached the same way, and every writeup follows the same structure:

1. **Recon** — full TCP port scan with `nmap` and service/version detection.
2. **Enumeration** — directory and file fuzzing (`gobuster`), manual inspection of every exposed service.
3. **Exploitation** — initial foothold and first flag.
4. **Privilege escalation / pivoting** — where the machine has a second flag: root, or a second, internal container.
5. **Reporting** — a vulnerability summary with CWE and CVSS v3.1 where applicable, plus concrete mitigations.

Main tools: `nmap`, `gobuster`, `curl`, `steghide`, `knock`, `chisel`, SSH and FTP clients.

## Recurring weaknesses

Across the {{ total_findings }} findings, the same classes of mistakes kept appearing:

| Weakness | CWE | Seen in |
|---|---|---|
| Credentials stored or passed insecurely (Base64, plaintext, hardcoded, process arguments) | CWE-256, CWE-798, CWE-214 | Imagine, Jump_Force, Odyssey, OoOps |
| Sensitive or backup files left in the web root | CWE-538, CWE-530 | Imagine, Jump_Force, Odyssey |
| Information disclosure (`phpinfo()`, `mod_status`) | CWE-200 | Odyssey, OoOps |
| Excessive privileges and weak configuration (anonymous FTP write, root SSH, `privileged: true` container) | CWE-276, CWE-250 | OoOps, Odyssey, Jump_Force |
| Injection (OS command, SQL) | CWE-78, CWE-89 | Jump_Force |
| Vulnerable `sudo` version (UID -1 bypass) | CVE-2019-14287 | OoOps |

## Highlights

- **Jump_Force** — the most complex machine: the second container is only reachable from the first, so the final flag requires a reverse tunnel with `chisel`.
- **Imagine** — pure enumeration, including a deliberate decoy password designed to waste time.
- **Odyssey** — a chain of hidden files, steganography and port knocking before SSH as root.
- **OoOps_machine** — anonymous FTP straight into the web root, then CVE-2019-14287 for root.
