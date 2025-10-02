---
layout: page
title: "tagss"
permalink: /tagss/
---

Listado de tagss:

{% comment %}
site.tagss es un hash: { "tags" => [posts...] }.
Sacamos solo los nombres (clave 'first'), los ordenamos, y luego usamos el hash
para obtener el tamaño.
{% endcomment %}

{% comment %} construir un array de nombres de tags y ordenarlo {% endcomment %}
{% assign tags_names = "" | split: "" %}
{% for pair in site.tags %}
  {% assign tags_names = tags_names | push: pair[0] %}
{% endfor %}
{% assign tags_names = tags_names | uniq | sort_natural %}

<ul class="tags-cloud">
  {% for t in tags_names %}
    <li>
      <a href="{{ '/tags/' | append: t | slugify | append: '/' | relative_url }}">
        {{ t }}
      </a>
      ({{ site.tagss[t].size }})
    </li>
  {% endfor %}
</ul>



