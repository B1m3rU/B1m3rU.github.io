---
layout: page
title: "Search"
permalink: /search/
sitemap: false
---

<form class="search-form" role="search" action="{{ '/search/' | relative_url }}" method="get">
  <label class="search-form__label" for="search-input">Search writeups, posts and pages</label>
  <input id="search-input" class="search-form__input" type="search" name="q"
         placeholder="e.g. chisel, sqli, privilege escalation…" autocomplete="off" spellcheck="false"
         data-index="{{ '/search.json' | relative_url }}" autofocus>
</form>

<p id="search-status" class="search-status" role="status" aria-live="polite"></p>
<ul id="search-results" class="search-results"></ul>

<noscript><p>Search needs JavaScript. You can browse by <a href="{{ '/tags/' | relative_url }}">tags</a> instead.</p></noscript>

<script defer src="{{ '/assets/js/search.js' | relative_url }}"></script>
