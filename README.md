# Goodies 💎

A curated, publicly hosted vault of high-value design inspiration, developer tools, UI component libraries, research papers, and software resources.

Hosted live on GitHub Pages. Fed automatically via the **`/goodies`** bstack skill & `/checkit` Knowledge Graph integration.

## Architecture

- **Public Site**: Lightweight static web application (`index.html`, `styles.css`, `app.js`) with client-side fuzzy search (Fuse.js), dark glassmorphism aesthetic, and dynamic taxonomy filtering.
- **Data Store**: Structured JSON database in `data/vault.json` and dynamic category taxonomy in `data/taxonomy.json`.
- **bstack Skill**: Powered by `skills/knowledge/goodies` in `broomva/skills`.

## How It Works

1. Share a resource with the agent: `/goodies add <URL>` or drop a link asking to bookmark it.
2. The skill executes `/checkit` to inspect, analyze, and index the resource into the local Knowledge Graph (`research/entities/`).
3. The skill dynamically resolves or expands the category taxonomy (`taxonomy.json`).
4. The skill commits and pushes the new record to this repository, triggering an automatic GitHub Pages deployment.

## License

MIT © Broomva
