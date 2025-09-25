---
layout: page
title: "Máquinas"
permalink: /maquinas/
---

Listado de todas las máquinas (HTB/THM, etc.).

{% assign maquinas_posts = site.posts | where_exp:"post","post.categories contains 'maquinas'" %}
{% if maquinas_posts.size > 0 %}
<ul>
  {% for post in maquinas_posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <small> — {{ post.date | date: "%d %b %Y" }}</small>
  </li>
  {% endfor %}
</ul>
{% else %}
<p>No hay entradas de máquinas aún.</p>
{% endif %}
