---
layout: default
title: "Máquinas"
permalink: /machines/
---

# Máquinas

{% assign machines_posts = site.categories.machines | default: empty %}
{% if machines_posts and machines_posts.size > 0 %}
<ul>
  {% for post in machines_posts %}
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
<p>No hay entradas de máquinas aún.</p>
{% endif %}
