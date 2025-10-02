---
layout: post
title: "Máquina de prueba (placeholder)"
description: "Entrada ficticia para probar la sección de Máquinas"
categories: [machines]
tags: [htb, thm]
---

## 1. Objetivo
Crear una entrada de prueba para comprobar el listado de **Máquinas** en la portada y en la página [Máquinas](/machines/).

## 2. Entorno
- Plataformas: HTB / TryHackMe (pruebas genéricas)
- SO de ataque: Kali Linux (placeholder)

## 3. Prerrequisitos
- Conectividad y ética: entorno de laboratorio, permisos `propios`.

## 4. Procedimiento paso a paso

### 4.1 Descubrimiento de hosts

```bash
nmap -sV -sC 192.168.1.1 -T4 -vvv
```
```python
# --- CONFIGURACIÓN DEL LOGGING ---
# Ahora usamos la ruta absoluta para el archivo de log.
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [SUPERVISOR] - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(ruta_log_supervisor, encoding='utf-8'), # <-- RUTA CORREGIDA
        logging.StreamHandler()
    ]
)
```
```sql
SELECT *
FROM PRUEBA_DB
WHERE ANY_ANYACA = '2012-13' AND TCO_CODALF = 'JUN';
```
