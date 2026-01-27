---
layout: page
title: "Posts"
permalink: /posts/
---

Entradas generales: herramientas, noticias, apuntes.

{% assign general_posts = site.posts | where_exp:"post","post.categories contains 'posts'" %}
{% if general_posts.size > 0 %}
<ul>
  {% for post in general_posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <small> — {{ post.date | date: "%d %b %Y" }}</small>
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
{% else %}
<p>No hay entradas aún.</p>
{% endif %}

