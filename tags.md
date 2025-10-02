---
layout: page
title: "Tags"
permalink: /tags/
---

Listado de tags:

{% comment %}
site.tags es un hash: { "tag" => [posts...] }.
Sacamos solo los nombres (clave 'first'), los ordenamos, y luego usamos el hash
para obtener el tamaño.
{% endcomment %}

{% comment %} construir un array de nombres de tag y ordenarlo {% endcomment %}
{% assign tag_names = "" | split: "" %}
{% for pair in site.tags %}
  {% assign tag_names = tag_names | push: pair[0] %}
{% endfor %}
{% assign tag_names = tag_names | uniq | sort_natural %}

<ul class="tag-cloud">
  {% for t in tag_names %}
    <li>
      <a href="{{ t | slugify | prepend: '/tags/' | append: '/' | relative_url }}">
        {{ t }}
      </a>
      ({{ site.tags[t].size }})
    </li>
  {% endfor %}
</ul>

