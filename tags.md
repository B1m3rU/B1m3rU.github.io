---
layout: page
title: "Tags"
permalink: /tags/
---

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
