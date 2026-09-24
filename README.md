# B1m3rU.github.io

Personal cybersecurity blog and portfolio built with Jekyll and hosted on GitHub Pages.

## Content

- **Machines** — CTF and lab writeups documenting enumeration, exploitation and post-exploitation techniques
- **Posts** — Technical notes on tools, concepts and security topics

## Stack

Jekyll · Minima (dark) · GitHub Pages · Rouge syntax highlighting

## Maintenance

- **CV:** replace `assets/cv_web.pdf` with the new file, keeping the exact name, then commit and push. The "Download CV" link on the About page never needs to change, and it busts the browser cache on every build.
- **Search:** the index (`/search.json`) is rebuilt automatically on every deploy. New posts are searchable with no extra steps. A page can be added to search with `search: true` (plus optional `search_keywords`) in its front matter.
- **Tags:** just add them to a post's front matter; `/tags/` generates the sections by itself.

## Live site

[b1m3ru.github.io](https://b1m3ru.github.io)
