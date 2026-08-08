# Goodies 💎

[![GitHub Pages Deployment](https://github.com/broomva/goodies/actions/workflows/deploy.yml/badge.svg)](https://github.com/broomva/goodies/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A curated, publicly hosted vault of high-value design inspiration, developer tools, UI component libraries, research papers, and software resources.

🌐 **Live Site**: [https://broomva.github.io/goodies/](https://broomva.github.io/goodies/)

---

## ⚡ Overview

**Goodies** is a static web application built with vanilla CSS glassmorphism aesthetics and Fuse.js client-side search. It acts as the public distribution channel for web resources curated and indexed by **bstack** AI agents.

### Key Features

- **Instant Search**: Sub-millisecond client-side fuzzy search across titles, taglines, summaries, and tags powered by Fuse.js.
- **Dynamic Taxonomy**: Real-time filtering across dynamic category pills (*Developer Tools*, *Design Inspiration*, *UI Components*, *AI & Autonomous Agents*, *AI Infrastructure*, *Papers & Research*).
- **Rich Context Modals**: Every item includes verified summaries, primary highlights, tag taxonomy, and direct primary-source links.
- **Zero-Build Deployment**: Pure HTML5/CSS3/ES6 Javascript served directly via GitHub Pages with automated CI/CD deployment.

---

## 🏗️ Architecture

```
[Resource URL] ──> [/goodies Skill] ──> [/checkit Verification] ──> [bstack KG Entity]
                                                                         │
                                                                         ▼
[GitHub Pages] <── [Git Push] <── [data/vault.json + data/taxonomy.json] ┘
```

1. **`data/items/*.json`**: Individual record files per curated resource.
2. **`data/vault.json`**: Consolidated aggregate database.
3. **`data/taxonomy.json`**: Dynamic category hierarchy and item count tracker.
4. **`data/search-index.json`**: Optimized Fuse.js search index.

---

## 🛠️ Local Development

Serve the repository locally using any static web server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node / npx
npx serve .
```

Open `http://localhost:8000` in your browser.

---

## 🤝 Contributing

We welcome contributions! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for submission guidelines and schema specifications.

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
