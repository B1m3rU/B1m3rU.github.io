---
layout: page
title: "Inicio"
permalink: /
---

<section class="intro" markdown="1">
# WIP — Blog en construcción

Estoy preparando contenidos técnicos sobre ciberseguridad: laboratorios, herramientas y notas.  
Mientras tanto, este es un espacio personal donde iré publicando pruebas y resúmenes.

![Michi descansando](/assets/img/Michi1.jpg){: .center-img }
</section>


<!-- ===== Máquinas ===== -->
<h2>Máquinas</h2>
{%- assign machines_posts = site.posts
    | where_exp: "p", "p.categories contains 'machines'"
    | sort: "date"
    | reverse
-%}

{%- if machines_posts and machines_posts.size > 0 -%}
  <ul class="post-list">
    {%- for p in machines_posts -%}
      <li>
        <a href="{{ p.url | relative_url }}">{{ p.title }}</a>
        <small> — {{ p.date | date: "%d %b %Y" }}</small>
        {%- if p.tags and p.tags.size > 0 -%}
          <span class="tag-list">
            {%- for t in p.tags -%}
              <span class="tag-badge">
                <a href="{{ '/tags/' | append: t | slugify | append: '/' | relative_url }}">{{ t }}</a>
              </span>
            {%- endfor -%}
          </span>
        {%- endif -%}
      </li>
    {%- endfor -%}
  </ul>
{%- else -%}
  <p>Todavía no hay publicaciones en <em>Máquinas</em>.</p>
{%- endif -%}

<hr/>

<!-- ===== Posts ===== -->
<h2>Posts</h2>
{%- assign blog_posts = site.posts
    | where_exp: "p", "p.categories contains 'posts'"
    | sort: "date"
    | reverse
-%}

{%- if blog_posts and blog_posts.size > 0 -%}
  <ul class="post-list">
    {%- for p in blog_posts -%}
      <li>
        <a href="{{ p.url | relative_url }}">{{ p.title }}</a>
        <small> — {{ p.date | date: "%d %b %Y" }}</small>
        {%- if p.tags and p.tags.size > 0 -%}
          <span class="tag-list">
            {%- for t in p.tags -%}
              <span class="tag-badge">
                <a href="{{ '/tags/' | append: t | slugify | append: '/' | relative_url }}">{{ t }}</a>
              </span>
            {%- endfor -%}
          </span>
        {%- endif -%}
      </li>
    {%- endfor -%}
  </ul>
{%- else -%}
  <p>Todavía no hay publicaciones en <em>Posts</em>.</p>
{%- endif -%}
