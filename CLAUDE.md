# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal blog using the Chirpy theme, hosted on GitHub Pages. The site focuses on software architecture, AI development, and technical content in both Korean and English.

## Architecture & Structure

### Content Organization
- **_posts/**: All blog posts organized by category
  - `blog/`: Technical articles and tutorials
  - `book-review/`: Book reviews and analysis
  - `portfolio/`: Project showcases and case studies
- **_tabs/**: Main navigation pages (about, archives, categories, tags, portfolio)
- **_data/**: Site configuration data (contact.yml, share.yml)
- **_includes/**: Reusable components (Google Analytics, sidebar profile)
- **_layouts/**: Page templates for different content types
- **assets/**: Static assets (images, CSS, JS)
- **workers/rag-proxy/**: Optional Cloudflare Worker — proxies Gemini API with rate limits and secrets (see `workers/rag-proxy/README.md`)

### RAG chatbot
- Build widget: `npm run build:rag` → `assets/js/rag/embed.js`, `rag-chat.css`
- Jekyll: `rag_chat.proxy_url` in `_config.yml` enables proxy mode (no browser API key). Empty string = direct Gemini + localStorage key.

### Jekyll Configuration
- Uses Chirpy theme (jekyll-theme-chirpy ~> 6.5.5)
- Korean timezone (Asia/Seoul) with English as primary language
- Google Analytics integration (G-XS538DD58D)
- PWA enabled with offline caching
- Collections: tabs and book-reviews

## Development Commands

### Local Development
```bash
# Install dependencies
bundle install

# Serve locally with live reload
bundle exec jekyll serve --livereload

# Alternative: Use the provided script
bash tools/run.sh

# Serve on custom host
bash tools/run.sh -H 0.0.0.0

# Production mode
bash tools/run.sh --production
```

### Testing & Building
```bash
# Build and test (includes html-proofer validation)
bash tools/test.sh

# Manual build
JEKYLL_ENV=production bundle exec jekyll build

# Test built site
bundle exec htmlproofer _site --disable-external --check-html --allow-hash-href=true
```

### Daily IT news (`_posts/news/`)
- Scheduled automation: `.github/workflows/daily_news.yml` runs `tools/daily_news.py`.
- Tags are **noun-like only**, **Korean-only or English-only per tag** (no mixed scripts in one tag), **1–2 words per language**; prefer **single word**, else **hyphen** for two words (e.g. `Claude-Code`), no spaces in a tag.
- **Re-apply tag policy to existing news posts** (only replaces the `tags:` block; title/date unchanged):

```bash
python3 -m venv .venv && .venv/bin/pip install -r tools/requirements.txt
export GEMINI_API_KEY=...   # recommended for ~20 content-based tags
.venv/bin/python tools/retag_news_posts.py
```

## Content Creation Guidelines

### Blog Post Format
Posts should follow the naming convention: `YYYY-MM-DD-title.md`

Front matter template:
```yaml
---
title: "Post Title"
date: YYYY-MM-DD HH:MM:SS +0900
categories: [Category, Subcategory]
tags: [tag1, tag2, tag3]
image:
  path: /assets/img/posts/image.jpg
  alt: Image description
---
```

### Content Categories
- **Blog**: Technical articles, AI development, software architecture
- **Book Review**: Technical book reviews and analysis
- **Portfolio**: Project showcases and case studies

## Deployment

The site uses GitHub Actions for automated deployment:
- Triggers on pushes to main/master branch
- Builds with Jekyll in production mode
- Runs html-proofer for link validation
- Deploys to GitHub Pages automatically

## Key Files for Editing
- `_config.yml`: Main site configuration
- `_tabs/`: Navigation pages content
- `_data/contact.yml`: Contact information
- `assets/img/profile.png`: Profile image
- `_includes/google-analytics.html`: Analytics configuration

## Notes
- The site supports both dark and light themes
- Google Analytics is configured for traffic monitoring
- HTML proofer validates all internal links during build
- The Chirpy theme provides built-in search, categories, tags, and TOC functionality