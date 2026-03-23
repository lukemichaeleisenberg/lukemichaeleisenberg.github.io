# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static personal portfolio site hosted on GitHub Pages at `lukemichaeleisenberg.github.io`. There is no build system, package manager, or test suite — all files are served directly by GitHub Pages.

## Deployment

Changes pushed to the `master` branch are automatically deployed via GitHub Pages. There is no build step.

To preview locally, use any static file server, e.g.:
```
python3 -m http.server 8000
```

## Architecture

The site is a flat collection of static HTML/CSS files with no JavaScript framework or bundler.

- `index.html` + `css/main.css` — the main portfolio page (two-column layout: fixed photo on the left, bio/links on the right)
- `icons/font-awesome-4.7.0/` — vendored Font Awesome icons (do not modify)
- `images/` — photo assets referenced by CSS backgrounds
- `LukeEisenbergResume.pdf` — resume linked from the main page
- `little_projects/` — small standalone side projects, each self-contained with their own `index.html` and `main.css`
  - `Quote-Generator/` — Bootstrap carousel + jQuery app that fetches quotes from the forismatic.com API and supports tweeting them
  - `NASA-tribute/` — tribute page
- `draft_projects/` — work-in-progress pages not yet linked from the main site
- `old_site/` — archived previous version of the site

## Conventions

- No external CSS or JS frameworks on the main site (plain HTML/CSS only); little_projects use Bootstrap 3 + jQuery via CDN
- Fonts loaded from Google Fonts CDN (`Oswald` for headings, `Crimson Text` for body)
- Responsive layout uses a single media query breakpoint at `768px`
