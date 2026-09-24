---
layout: page
title: "Posts"
permalink: /posts/
---

Tools, notes and general security topics.

{% assign general_posts = site.posts | where_exp:"post","post.categories contains 'posts'" %}
{% if general_posts.size > 0 %}
<ul>
  {% for post in general_posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <small> — {{ post.date | date: "%d %b %Y" }}</small>
    {% include tag-badges.html tags=post.tags %}
  </li>
  {% endfor %}
</ul>
{% else %}
<p>No posts yet.</p>
{% endif %}
