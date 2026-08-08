document.addEventListener('DOMContentLoaded', () => {
  let vaultItems = [];
  let taxonomy = { categories: {} };
  let currentCategory = 'all';
  let searchQuery = '';
  let fuseInstance = null;

  // DOM Elements
  const vaultGrid = document.getElementById('vault-grid');
  const emptyState = document.getElementById('empty-state');
  const taxonomyBar = document.getElementById('taxonomy-bar');
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');
  const statCount = document.getElementById('stat-count');
  const statCategories = document.getElementById('stat-categories');
  const btnReset = document.getElementById('btn-reset-filters');
  const detailModal = document.getElementById('detail-modal');
  const modalContent = document.getElementById('modal-content');
  const modalClose = document.getElementById('modal-close');
  const themeToggle = document.getElementById('theme-toggle');

  // Theme Toggle Management
  function initTheme() {
    const savedTheme = localStorage.getItem('goodies-theme');
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
  }

  function setTheme(theme) {
    const sunIcon = themeToggle ? themeToggle.querySelector('.sun-icon') : null;
    const moonIcon = themeToggle ? themeToggle.querySelector('.moon-icon') : null;
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      if (sunIcon) sunIcon.hidden = true;
      if (moonIcon) moonIcon.hidden = false;
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (sunIcon) sunIcon.hidden = false;
      if (moonIcon) moonIcon.hidden = true;
    }
    localStorage.setItem('goodies-theme', theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      setTheme(currentTheme === 'light' ? 'dark' : 'light');
    });
  }

  // Fetch Vault Data
  async function loadVaultData() {
    try {
      const [itemsRes, taxRes] = await Promise.all([
        fetch('data/vault.json?t=' + Date.now()).catch(() => null),
        fetch('data/taxonomy.json?t=' + Date.now()).catch(() => null)
      ]);

      if (itemsRes && itemsRes.ok) {
        vaultItems = await itemsRes.json();
      } else {
        vaultItems = getDemoItems();
      }

      if (taxRes && taxRes.ok) {
        taxonomy = await taxRes.json();
      } else {
        taxonomy = buildDynamicTaxonomy(vaultItems);
      }

      initFuse();
      renderTaxonomyBar();
      renderGrid();
      updateStats();
    } catch (err) {
      console.warn('Fallback to demo data due to fetch error:', err);
      vaultItems = getDemoItems();
      taxonomy = buildDynamicTaxonomy(vaultItems);
      initFuse();
      renderTaxonomyBar();
      renderGrid();
      updateStats();
    }
  }

  function initFuse() {
    if (typeof Fuse !== 'undefined') {
      fuseInstance = new Fuse(vaultItems, {
        keys: ['title', 'tagline', 'summary', 'category', 'tags', 'stack', 'highlights'],
        threshold: 0.35,
        ignoreLocation: true
      });
    }
  }

  function buildDynamicTaxonomy(items) {
    const categoriesMap = {};
    items.forEach(item => {
      const cat = item.category || 'uncategorized';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = {
          name: formatCatName(cat),
          count: 0,
          description: `Curated ${formatCatName(cat)} resources`
        };
      }
      categoriesMap[cat].count++;
    });
    return { categories: categoriesMap };
  }

  function formatCatName(slug) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function updateStats() {
    statCount.textContent = `${vaultItems.length} Items`;
    const catCount = Object.keys(taxonomy.categories || {}).length;
    statCategories.textContent = `${catCount} Categories`;
  }

  function renderTaxonomyBar() {
    const categories = taxonomy.categories || {};
    let html = `
      <button class="cat-pill ${currentCategory === 'all' ? 'active' : ''}" data-category="all">
        <span class="cat-name">All Items</span>
        <span class="cat-count">${vaultItems.length}</span>
      </button>
    `;

    Object.entries(categories).forEach(([key, info]) => {
      const count = vaultItems.filter(i => i.category === key).length;
      html += `
        <button class="cat-pill ${currentCategory === key ? 'active' : ''}" data-category="${key}">
          <span class="cat-name">${info.name || formatCatName(key)}</span>
          <span class="cat-count">${count}</span>
        </button>
      `;
    });

    taxonomyBar.innerHTML = html;

    taxonomyBar.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.category;
        renderTaxonomyBar();
        renderGrid();
      });
    });
  }

  function filterItems() {
    let result = vaultItems;

    if (currentCategory !== 'all') {
      result = result.filter(item => item.category === currentCategory);
    }

    if (searchQuery.trim() !== '') {
      if (fuseInstance) {
        const searchResults = fuseInstance.search(searchQuery.trim());
        const matchingIds = new Set(searchResults.map(r => r.item.id));
        result = result.filter(item => matchingIds.has(item.id));
      } else {
        const q = searchQuery.toLowerCase();
        result = result.filter(item => 
          item.title.toLowerCase().includes(q) ||
          (item.tagline && item.tagline.toLowerCase().includes(q)) ||
          (item.summary && item.summary.toLowerCase().includes(q)) ||
          (item.tags && item.tags.some(t => t.toLowerCase().includes(q)))
        );
      }
    }

    return result;
  }

  function renderGrid() {
    const items = filterItems();

    if (items.length === 0) {
      vaultGrid.style.display = 'none';
      emptyState.hidden = false;
      return;
    }

    vaultGrid.style.display = 'grid';
    emptyState.hidden = true;

    vaultGrid.innerHTML = items.map(item => `
      <article class="goodie-card" data-id="${item.id}">
        <div>
          <div class="card-header">
            <div class="card-title-group">
              <img class="card-favicon" src="${item.favicon || 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(item.url)}" alt="" onerror="this.src='https://raw.githubusercontent.com/feathericons/feather/master/icons/globe.svg'" />
              <h2 class="card-title">${escapeHtml(item.title)}</h2>
            </div>
            <span class="card-badge">${escapeHtml(item.category || 'General')}</span>
          </div>

          <p class="card-tagline">${escapeHtml(item.tagline || item.summary || '')}</p>

          ${item.highlights && item.highlights.length > 0 ? `
            <ul class="card-highlights">
              ${item.highlights.slice(0, 3).map(h => `<li class="card-highlight-item">${escapeHtml(h)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>

        <div class="card-footer">
          <div class="card-tags">
            ${(item.tags || []).slice(0, 3).map(t => `<span class="card-tag">#${escapeHtml(t)}</span>`).join('')}
          </div>
          <span class="card-link-icon" title="View details">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </span>
        </div>
      </article>
    `).join('');

    vaultGrid.querySelectorAll('.goodie-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const item = vaultItems.find(i => i.id === id);
        if (item) openModal(item);
      });
    });
  }

  function openModal(item) {
    modalContent.innerHTML = `
      <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem;">
        <img src="${item.favicon || 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(item.url)}" style="width:36px; height:36px; border-radius:8px;" />
        <div>
          <h2 style="font-family:var(--font-heading); font-size:1.5rem; font-weight:800;">${escapeHtml(item.title)}</h2>
          <span class="card-badge">${escapeHtml(item.category)}</span>
        </div>
      </div>

      <p style="color:var(--text-muted); font-size:1.05rem; margin-bottom:1.5rem; font-weight:500;">
        ${escapeHtml(item.tagline || '')}
      </p>

      ${item.summary ? `
        <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1.5rem;">
          <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--accent-cyan); letter-spacing:0.05em; margin-bottom:0.5rem;">Why it's good</h4>
          <p style="color:var(--text-main); font-size:0.95rem; line-height:1.6;">${escapeHtml(item.summary)}</p>
        </div>
      ` : ''}

      ${item.highlights && item.highlights.length > 0 ? `
        <div style="margin-bottom:1.5rem;">
          <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.05em; margin-bottom:0.75rem;">Key Highlights</h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem;">
            ${item.highlights.map(h => `
              <li style="display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; color:var(--text-main);">
                <span style="color:var(--accent-emerald)">✓</span> ${escapeHtml(h)}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:2rem;">
        ${(item.tags || []).map(t => `<span class="card-tag" style="font-size:0.8rem; padding:0.25rem 0.65rem;">#${escapeHtml(t)}</span>`).join('')}
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; pt-1rem; border-top:1px solid var(--border-subtle);">
        ${item.kgEntity ? `<span style="font-size:0.8rem; color:var(--text-dim); font-family:var(--font-mono);">KG Entity: ${escapeHtml(item.kgEntity)}</span>` : '<span></span>'}
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" 
           style="background:linear-gradient(135deg, var(--accent-primary), var(--accent-cyan)); color:#fff; padding:0.65rem 1.5rem; border-radius:var(--radius-sm); font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem;">
          Visit Resource ↗
        </a>
      </div>
    `;
    detailModal.hidden = false;
  }

  function closeModal() {
    detailModal.hidden = true;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Event Listeners
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    searchClear.hidden = searchQuery === '';
    renderGrid();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.hidden = true;
    renderGrid();
  });

  btnReset.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.hidden = true;
    currentCategory = 'all';
    renderTaxonomyBar();
    renderGrid();
  });

  modalClose.addEventListener('click', closeModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.key === 'Escape') {
      if (!detailModal.hidden) closeModal();
      else if (document.activeElement === searchInput) searchInput.blur();
    }
  });

  // Demo Fallback Data
  function getDemoItems() {
    return [
      {
        id: "stitch-design",
        title: "Stitch Design System",
        url: "https://stitch.design",
        category: "design-inspiration",
        tagline: "AI-driven high-fidelity screen design and component generation framework.",
        summary: "A powerful platform that bridges prompt-driven UI generation and production-ready clean design systems with automated AST code output.",
        highlights: ["Prompt enhancement engine", "AST component generation", "Vite + React integration"],
        tags: ["ui-design", "ai-tools", "design-system"],
        kgEntity: "research/entities/tool/stitch.md"
      },
      {
        id: "linear-app",
        title: "Linear",
        url: "https://linear.app",
        category: "developer-tools",
        tagline: "The purposeful tool for modern software development.",
        summary: "Fast, keyboard-driven issue tracking with real-time sync, sleek dark mode aesthetics, and deep git integrations.",
        highlights: ["Sub-100ms response time", "Full keyboard shortcut mapping", "Automated git workflows"],
        tags: ["issue-tracking", "developer-tools", "productivity"],
        kgEntity: "research/entities/tool/linear.md"
      },
      {
        id: "ai-elements",
        title: "AI Elements",
        url: "https://ai-elements.dev",
        category: "ui-components",
        tagline: "Pre-built, accessible React components for AI chat interfaces.",
        summary: "Comprehensive collection of modular React primitives designed specifically for LLM responses, tool calls, streaming text, and prompt inputs.",
        highlights: ["Streaming message displays", "Tool execution UI", "Customizable theme tokens"],
        tags: ["react", "ui-kit", "ai-interface"],
        kgEntity: "research/entities/tool/ai-elements.md"
      }
    ];
  }

  initTheme();
  loadVaultData();
});
