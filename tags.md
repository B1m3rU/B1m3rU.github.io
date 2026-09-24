---
layout: page
title: "Tags"
permalink: /tags/
---

{% comment %}
Todo se genera desde site.tags: basta con añadir un tag al front matter de un post,
no hace falta crear ningún archivo. Cada tag tiene su ancla: /tags/#<slug>.

Arriba va el buscador (assets/js/search.js sobre /search.json). Mientras hay una búsqueda
activa se ocultan los tags (#tags-browse); al vaciar el campo vuelven a aparecer.
Una búsqueda se puede compartir: /tags/?q=chisel
{% endcomment %}
<form class="search-form" role="search" action="{{ '/tags/' | relative_url }}" method="get">
  <label class="search-form__label" for="search-input">Search writeups and posts, or browse by tag</label>
  <input id="search-input" class="search-form__input" type="search" name="q"
         placeholder="e.g. chisel, sqli, privilege escalation…" autocomplete="off" spellcheck="false"
         data-index="{{ '/search.json' | relative_url }}">
</form>

<p id="search-status" class="search-status" role="status" aria-live="polite"></p>
<ul id="search-results" class="search-results"></ul>

<noscript><p>Search needs JavaScript — you can still browse by tag below.</p></noscript>

{% assign tag_names = "" | split: "" %}
{% for pair in site.tags %}
  {% assign tag_names = tag_names | push: pair[0] %}
{% endfor %}
{% assign tag_names = tag_names | uniq | sort_natural %}

<div id="tags-browse">
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
</div>

<script defer src="{{ '/assets/js/search.js' | relative_url }}"></script>
