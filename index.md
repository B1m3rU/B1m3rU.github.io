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
  {% for post in machines_posts limit:5 %}
  - [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_ {% if post.tags and post.tags.size > 0 %}<span class="tag-list">{% for t in post.tags %}<span class="tag-badge"><a href="/tag/{{ t | slugify }}/">{{ t }}</a></span>{% endfor %}</span>{% endif %}
  {% endfor %}
[Ver todas las máquinas →](/machines/)
{% else %}
No hay entradas de máquinas aún.
{% endif %}

## Últimos — Posts
{% assign general_posts = site.categories.posts | default: empty %}
{% if general_posts and general_posts.size > 0 %}
  {% for post in general_posts limit:5 %}
  - [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_ {% if post.tags and post.tags.size > 0 %}<span class="tag-list">{% for t in post.tags %}<span class="tag-badge"><a href="/tag/{{ t | slugify }}/">{{ t }}</a></span>{% endfor %}</span>{% endif %}
  {% endfor %}
[Ver todas las entradas →](/posts/)
{% else %}
No hay entradas aún.
{% endif %}
</section>
