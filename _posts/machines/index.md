---
layout: default
title: "Máquinas"
permalink: /machines/
---

# Máquinas
{% for post in site.categories.machines %}
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_
{% endfor %}
