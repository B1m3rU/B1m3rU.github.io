---
layout: default
title: "Machines"
permalink: /machines/
---

# Machines

Machines tagged `tfm` belong to my Master's thesis lab — see the [overview]({{ '/tfm/' | relative_url }}) for the methodology and the combined findings.

{% assign machines_posts = site.categories.machines | default: empty %}
{% if machines_posts and machines_posts.size > 0 %}
<ul>
  {% for post in machines_posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <small> — {{ post.date | date: "%d %b %Y" }}</small>
    {% include tag-badges.html tags=post.tags %}
  </li>
  {% endfor %}
</ul>
{% else %}
<p>No machine writeups yet.</p>
{% endif %}
