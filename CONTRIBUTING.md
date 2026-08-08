# Contributing to Goodies 💎

Thank you for your interest in contributing to **Goodies**! This repository hosts a curated public vault of exceptional web design references, developer tools, UI component libraries, and research papers.

## How to Suggest or Add a Resource

### 1. Via bstack Skill (Automated)
If you are running an AI agent in the bstack ecosystem:
```bash
/goodies add <URL>
```
The `/goodies` skill will automatically research the primary source (`/checkit`), create/update the Knowledge Graph entity page, assign taxonomy, validate schema, and commit/push to this repository.

### 2. Manual PR Contribution
To manually submit a resource:

1. Fork and clone this repository.
2. Create a new JSON record in `data/items/<id-slug>.json` conforming to the schema specification:
   ```json
   {
     "id": "resource-slug",
     "url": "https://example.com",
     "title": "Resource Title",
     "category": "developer-tools",
     "subCategory": "sub-category-slug",
     "tagline": "Concise single-sentence tagline under 140 characters.",
     "summary": "Comprehensive 2-3 sentence overview of the resource.",
     "highlights": [
       "Key feature or unique value proposition 1",
       "Key feature 2"
     ],
     "tags": ["tag1", "tag2"],
     "favicon": "https://www.google.com/s2/favicons?domain=example.com",
     "qualityScore": 9.0,
     "addedAt": "2026-08-08T12:00:00Z"
   }
   ```
3. Test locally by running a local web server:
   ```bash
   python3 -m http.server 8000
   ```
   Open `http://localhost:8000` to verify fuzzy search, category filter pills, and modal rendering.
4. Submit a Pull Request.

## Quality Standards

- **Depth & Context**: Bare links without taglines, summaries, and highlights are rejected.
- **Verification**: Primary source must be active and accessible.
- **Categorization**: Match existing categories in `data/taxonomy.json` or propose a clean kebab-case subcategory.
