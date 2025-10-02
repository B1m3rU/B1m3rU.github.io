---
layout: default
title: "Posts"
permalink: /posts/
---

# Posts
{% for post in site.categories.posts %}
- [{{ post.title }}]({{ post.url | relative_url }}) — _{{ post.date | date: "%d %b %Y" }}_
{% endfor %}
