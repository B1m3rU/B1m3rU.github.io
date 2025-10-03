---
layout: post
title: "Ciberseguridad para principiantes: escaneo básico de red con Nmap"
description: "Post de prueba con títulos, subtítulos, bloques de código y contenido introductorio de ciberseguridad."
categories: [posts]
tags: [nmap, redes, principiantes]
author: "Enrique Álvarez González"
---

## Contenido
{: .no_toc }   <!-- opcional: evita que este H2 aparezca en el TOC -->

- Navegación
{:toc}

## 1. Objetivo
Validar que el sistema de publicaciones renderiza correctamente **títulos**, **subtítulos**, **listas**, **tablas** y **bloques de código**; y, de paso, introducir un flujo básico de **reconocimiento de red** para principiantes.

> **Nota:** Este post es educativo y **solo** debe ejecutarse en **tu propia red/laboratorio** o con autorización explícita.

---

## 2. Entorno de ejemplo
- **SO anfitrión**: Windows 10/11 o GNU/Linux (Debian/Ubuntu).
- **Herramientas**: Nmap ≥ 7.94, PowerShell (en Windows), `ip`/`ifconfig` (en Linux), y Wireshark (opcional).
- **Topología**: Red local doméstica o de laboratorio (rango tipo `192.168.x.0/24`).

---

## 3. Conceptos clave (muy breves)
- **Descubrimiento de hosts**: detectar qué equipos están activos en una red.
- **Escaneo de puertos**: identificar servicios expuestos (HTTP, SSH, RDP, etc.).
- **Fingerprinting**: inferir sistema operativo/servicios (a alto nivel y con cautela).
- **Ética**: nunca escanear redes ajenas sin permiso. **Legal y moralmente incorrecto**.

---

## 4. Procedimiento paso a paso

### 4.1 Identificar tu subred
En **Linux**:
```bash
ip a | grep -E "inet .* eth|wlan"
# Ejemplo de salida: inet 192.168.1.34/24 ...
```
En **Windows (PowerShell)**:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -match "Ethernet|Wi-Fi"} | 
  Select-Object IPAddress, PrefixLength, InterfaceAlias
```

### 4.2 Descubrimiento de hosts (ping sweep)
- Escaneo rápido de equipos activos en tu subred `/24`:

```bash
# Linux / macOS
nmap -sn 192.168.1.0/24
```

```powershell
# Windows (PowerShell)
nmap -sn 192.168.1.0/24
```

> `-sn` desactiva el escaneo de puertos y realiza únicamente descubrimiento de hosts.

### 4.3 Escaneo de puertos comunes
```bash
# Escaneo de los 1000 puertos más comunes con detección básica de servicios
nmap -sS -sV -O --top-ports 1000 192.168.1.50
```
- `-sS`: SYN scan (rápido y común).
- `-sV`: detección de versión de servicios.
- `-O` : intento de detección de sistema operativo (requiere privilegios).
- `--top-ports 1000`: prioriza los puertos más frecuentes.

### 4.4 Guardar resultados para análisis
```bash
# Salida en tres formatos (normal, grepable, XML)
nmap -sS -sV 192.168.1.50 -oA resultados/host-192.168.1.50
```

### 4.5 Parsear resultados (XML) con Python (opcional)
```python
# quick_parse_nmap.py
import xml.etree.ElementTree as ET

tree = ET.parse('resultados/host-192.168.1.50.xml')
root = tree.getroot()

for host in root.findall('host'):
    addr = host.find("address[@addrtype='ipv4']").get('addr')
    print(f"Host: {addr}")
    for port in host.findall(".//port"):
        pnum = port.get('portid')
        proto = port.get('protocol')
        state = port.find('state').get('state')
        service = port.find('service').get('name') if port.find('service') is not None else 'unknown'
        print(f" - {proto}/{pnum} -> {state} ({service})")
```

Ejecución:
```bash
python3 quick_parse_nmap.py
```

---

## 5. Buenas prácticas mínimas
- Mantén **tu sistema y router actualizados** (firmware/OS).
- Desactiva servicios que **no uses** (UPnP, SMBv1, Telnet, etc.).
- Cambia **credenciales por defecto** y activa **MFA** donde sea posible.
- Segmenta tu red (por ejemplo, **IoT** en una **VLAN** o SSID separado).
- Activa el **cortafuegos** y registra eventos básicos (logs).

---

## 6. Tabla de referencia rápida (puertos comunes)

| Servicio | Puerto/TCP | Descripción breve |
|---|---:|---|
| HTTP    | 80   | Navegación web sin cifrar |
| HTTPS   | 443  | Navegación web cifrada (TLS) |
| SSH     | 22   | Acceso remoto seguro a shell |
| RDP     | 3389 | Escritorio remoto Windows |
| SMB     | 445  | Compartición de archivos Windows |
| DNS     | 53   | Resolución de nombres |

---

## 7. Problemas frecuentes y soluciones
- **Nmap lento** en Wi‑Fi: reduce puertos (`--top-ports 100`), o usa cable.
- **Permisos**: para `-O` o ciertos tipos de escaneo, ejecuta con privilegios.
- **Resultados vacíos**: el equipo objetivo puede tener cortafuegos estricto o no estar activo.
- **IPs equivocadas**: confirma la subred (`192.168.0.0/24` vs `192.168.1.0/24`, etc.).

---

## 8. Conclusiones
Has comprobado que el **render** de la web soporta bloques de código, listas, tablas y citas; además, conoces un flujo básico y responsable de **reconocimiento en red con Nmap**. En siguientes artículos, podemos profundizar en **Wireshark**, **hardening** de servicios y **automatización** con Python.

---

### Metadatos del proyecto (opcionales)
- **Tiempo invertido**: 00:45
- **Dificultad percibida**: baja
- **Lecciones aprendidas**:
  - Entender `-sn` vs escaneo de puertos.
  - Guardar y parsear resultados (`-oA` + XML + Python).
