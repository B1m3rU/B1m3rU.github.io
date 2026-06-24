---
layout: default
title: "Home"
image: /assets/img/og-default.png
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
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_{% if post.tags and post.tags.size > 0 %}{% for t in post.tags %} <span class="tag-badge"><a href="{{ t | slugify | prepend: '/tags/' | append: '/' | relative_url }}">{{ t }}</a></span>{% endfor %}{% endif %}
{% endfor %}

[View all machines →]({{ '/machines/' | relative_url }})
{% else %}
_No machine writeups yet._
{% endif %}

</section>

<section class="home-section" markdown="1">

## Latest — Posts
{% assign general_posts = site.categories.posts | default: empty %}
{% if general_posts and general_posts.size > 0 %}
{% for post in general_posts limit:5 %}
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_{% if post.tags and post.tags.size > 0 %}{% for t in post.tags %} <span class="tag-badge"><a href="{{ t | slugify | prepend: '/tags/' | append: '/' | relative_url }}">{{ t }}</a></span>{% endfor %}{% endif %}
{% endfor %}

[View all posts →]({{ '/posts/' | relative_url }})
{% else %}
_No posts yet._
{% endif %}

</section>
