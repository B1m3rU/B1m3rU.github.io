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

<section class="home-section" markdown="1">
## Últimas — Máquinas
{% assign machines_posts = site.categories.machines | default: empty %}
{% if machines_posts and machines_posts.size > 0 %}
<ul class="post-list">
  {% for post in machines_posts limit:5 %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    — <em>{{ post.date | date: "%d %b %Y" }}</em>
    {% if post.tags and post.tags.size > 0 %}
    <span class="tag-list">
      {% for t in post.tags %}
      <span class="tag-badge">
        <a href="{{ t | slugify | prepend: '/tags/' | append: '/' | relative_url }}">{{ t }}</a>
      </span>
      {% endfor %}
    </span>
    {% endif %}
  </li>
  {% endfor %}
</ul>
<p><a href="{{ '/machines/' | relative_url }}">Ver todas las máquinas →</a></p>
{% else %}
<p>No hay entradas de máquinas aún.</p>
{% endif %}

## Últimos — Posts
{% assign general_posts = site.categories.posts | default: empty %}
{% if general_posts and general_posts.size > 0 %}
<ul class="post-list">
  {% for post in general_posts limit:5 %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    — <em>{{ post.date | date: "%d %b %Y" }}</em>
    {% if post.tags and post.tags.size > 0 %}
    <span class="tag-list">
      {% for t in post.tags %}
      <span class="tag-badge">
        <a href="{{ t | slugify | prepend: '/tags/' | append: '/' | relative_url }}">{{ t }}</a>
      </span>
      {% endfor %}
    </span>
    {% endif %}
  </li>
  {% endfor %}
</ul>
<p><a href="{{ '/posts/' | relative_url }}">Ver todas las entradas →</a></p>
{% else %}
<p>No hay entradas aún.</p>
{% endif %}

</section>
