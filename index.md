---
layout: default
title: "Inicio"
---

<section class="intro" markdown="1">
# WIP — Blog en construcción

Estoy preparando contenidos técnicos sobre ciberseguridad: laboratorios, herramientas y notas.  
Mientras tanto, este es un espacio personal donde iré publicando pruebas y resúmenes.

![Michi descansando](/assets/img/Michi1.jpg){: .center-img }
</section>

<hr />

## Últimas — Máquinas
{% assign machines_posts = site.categories.machines | default: empty %}
{% if machines_posts and machines_posts.size > 0 %}
{% for post in machines_posts limit:5 -%}
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_{% if post.tags and post.tags.size > 0 %}{% for t in post.tags %} <span class="tag-badge"><a href="{{ t | slugify | prepend: '/tags/' | append: '/' | relative_url }}">{{ t }}</a></span>{% endfor %}{% endif %}
{%- endfor %}
[Ver todas las máquinas →]({{ '/machines/' | relative_url }})
{% else %}
_No hay entradas de máquinas aún._
{% endif %}

<hr />

## Últimos — Posts
{% assign general_posts = site.categories.posts | default: empty %}
{% if general_posts and general_posts.size > 0 %}
{% for post in general_posts limit:5 -%}
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_{% if post.tags and post.tags.size > 0 %}{% for t in post.tags %} <span class="tag-badge"><a href="{{ t | slugify | prepend: '/tags/' | append: '/' | relative_url }}">{{ t }}</a></span>{% endfor %}{% endif %}
{%- endfor %}
[Ver todas las entradas →]({{ '/posts/' | relative_url }})
{% else %}
_No hay entradas aún._
{% endif %}

<hr />
