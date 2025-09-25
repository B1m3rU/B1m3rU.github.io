---
layout: home
title: "Inicio"
---

<!-- === Intro principal (WIP + foto) === -->
<section class="intro">
  
  ## WIP — Blog en construcción

  Estoy preparando contenidos técnicos sobre ciberseguridad: laboratorios, herramientas y notas.  
  Mientras tanto, este es un espacio personal donde iré publicando pruebas y resúmenes.

  ![Michi descansando](/assets/img/Michi1.jpg){: .center-img }

  <p>
    <a href="/sobre/" class="button">Sobre mí</a>
    <a href="/contacto/" class="button">Contactar</a>
  </p>
</section>

<!-- === Últimas máquinas (posts con categoría 'maquinas') === -->
<section class="home-section">
  <h2>Últimas — Máquinas</h2>

  {% assign maquinas_posts = site.posts | where_exp:"post","post.categories contains 'maquinas'" %}
  {% if maquinas_posts.size > 0 %}
    <ul class="post-list">
      {% for post in maquinas_posts limit:5 %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <small class="post-meta"> — {{ post.date | date: "%d %b %Y" }}</small>
          {% if post.excerpt %}
            <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 140 }}</p>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
    <p><a href="/proyectos/">Ver todas las entradas de Máquinas →</a></p>
  {% else %}
    <p>No hay entradas de máquinas aún.</p>
  {% endif %}
</section>

<!-- === Últimos posts generales (categoria 'posts') === -->
<section class="home-section">
  <h2>Últimos — Posts</h2>

  {% assign general_posts = site.posts | where_exp:"post","post.categories contains 'posts'" %}
  {% if general_posts.size > 0 %}
    <ul class="post-list">
      {% for post in general_posts limit:5 %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <small class="post-meta"> — {{ post.date | date: "%d %b %Y" }}</small>
        </li>
      {% endfor %}
    </ul>
    <p><a href="/post/">Ver todas las entradas →</a></p>
  {% else %}
    <p>No hay entradas generales aún.</p>
  {% endif %}
</section>
