---
layout: default
title: "Inicio"
---

<section class="intro" markdown="1">
## WIP — Blog en construcción

Estoy preparando contenidos técnicos sobre ciberseguridad: laboratorios, herramientas y notas.  
Mientras tanto, este es un espacio personal donde iré publicando pruebas y resúmenes.

![Michi descansando](/assets/img/Michi1.jpg){: .center-img }
</section>

<section class="home-section" markdown="1">
## Últimas — Máquinas
{% assign maquinas_posts = site.posts | where_exp:"post","post.categories contains 'maquinas'" %}
{% if maquinas_posts.size > 0 %}
- {% for post in maquinas_posts limit:5 -%}
  [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_
  {%- endfor %}
  
[Ver todas las máquinas →](/maquinas/)
{% else %}
No hay entradas de máquinas aún.
{% endif %}
</section>

<section class="home-section" markdown="1">
## Últimos — Posts
{% assign general_posts = site.posts | where_exp:"post","post.categories contains 'posts'" %}
{% if general_posts.size > 0 %}
- {% for post in general_posts limit:5 -%}
  [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_
  {%- endfor %}
  
[Ver todas las entradas →](/posts/)
{% else %}
No hay entradas aún.
{% endif %}
</section>
