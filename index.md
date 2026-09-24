---
layout: default
title: "B1m3rU — Cybersecurity Portfolio"
description: "CTF writeups, pentesting notes and tools by Enrique Álvarez González."
---

<section class="intro" markdown="1">
# Cybersecurity portfolio

CTF writeups, pentesting notes and tools by Enrique Álvarez González — Junior Data Engineer transitioning into offensive security.
</section>

<section class="home-section" markdown="1">

## Latest — Machines
{% assign machines_posts = site.categories.machines | default: empty %}
{% if machines_posts and machines_posts.size > 0 %}
{% for post in machines_posts limit:5 %}
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_ {% include tag-badges.html tags=post.tags %}
{% endfor %}

[View all machines →]({{ '/machines/' | relative_url }})
{% else %}
_No machine writeups yet._
{% endif %}

</section>

{% comment %} La sección de posts solo aparece cuando hay alguno {% endcomment %}
{% assign general_posts = site.categories.posts | default: empty %}
{% if general_posts and general_posts.size > 0 %}
<section class="home-section" markdown="1">

## Latest — Posts
{% for post in general_posts limit:5 %}
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_ {% include tag-badges.html tags=post.tags %}
{% endfor %}

[View all posts →]({{ '/posts/' | relative_url }})

</section>
{% endif %}
