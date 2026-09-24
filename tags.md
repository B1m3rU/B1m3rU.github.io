---
layout: page
title: "Tags"
permalink: /tags/
---

{% comment %}
Todo se genera desde site.tags: basta con añadir un tag al front matter de un post,
no hace falta crear ningún archivo. Cada tag tiene su ancla: /tags/#<slug>.
{% endcomment %}
{% assign tag_names = "" | split: "" %}
{% for pair in site.tags %}
  {% assign tag_names = tag_names | push: pair[0] %}
{% endfor %}
{% assign tag_names = tag_names | uniq | sort_natural %}

<ul class="tag-cloud">
  {% for t in tag_names %}
    <li><a href="#{{ t | slugify }}">{{ t }}</a> ({{ site.tags[t].size }})</li>
  {% endfor %}
</ul>

{% for t in tag_names %}
<section class="tag-section" id="{{ t | slugify }}">
  <h2><span class="tag-section__hash">#</span>{{ t }}</h2>
  <ul>
    {% assign tagged = site.tags[t] | sort: "date" | reverse %}
    {% for post in tagged %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <small> — {{ post.date | date: "%d %b %Y" }}</small>
      {% include tag-badges.html tags=post.tags %}
    </li>
    {% endfor %}
  </ul>
</section>
{% endfor %}
