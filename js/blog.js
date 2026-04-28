/**
 * blog.js — JSON-driven Blog & Experience section
 *
 * Loads entries from blog.json, renders alternating left/right layouts,
 * and opens a full-content modal on click.
 *
 * ── TO ADD A NEW ENTRY ───────────────────────────────────────────────────────
 * Edit blog.json — no HTML changes needed. See blog.json for the schema.
 * ─────────────────────────────────────────────────────────────────────────── */

const BLOG_JSON_PATH = 'blog.json';

/**
 * Fetch blog entries from the JSON file.
 * @returns {Promise<Array>}
 */
async function fetchBlogEntries() {
  const res = await fetch(BLOG_JSON_PATH);
  if (!res.ok) throw new Error(`Could not load blog.json (${res.status})`);
  const data = await res.json();
  return data.entries || [];
}

/**
 * Format an ISO date string to a readable label.
 * e.g. "2024-06-01" → "June 2024"
 * @param {string} iso
 */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/**
 * Build a single blog list item element.
 * @param {Object} entry — blog entry object from blog.json
 * @param {number} index — 0-based index (determines layout direction)
 */
function buildBlogItem(entry, index) {
  const isReverse = index % 2 === 1;  // Alternate: even = image left, odd = image right
  const dateStr   = formatDate(entry.date);

  const article = document.createElement('article');
  article.className = `blog-item${isReverse ? ' reverse' : ''}`;
  article.setAttribute('data-aos', 'fade-up');
  article.setAttribute('data-aos-delay', String(index * 80));
  article.setAttribute('role', 'button');
  article.setAttribute('tabindex', '0');
  article.setAttribute('aria-label', `Read more: ${entry.title}`);

  // Image column
  const imgDiv = document.createElement('div');
  imgDiv.className = 'blog-img';

  if (entry.image) {
    const img       = document.createElement('img');
    img.src         = entry.image;
    img.alt         = entry.title;
    img.loading     = 'lazy';
    img.onerror     = () => {
      // Fallback to placeholder emoji if image fails to load
      imgDiv.innerHTML = `<div class="blog-img-placeholder">${entry.emoji || '📝'}</div>`;
    };
    imgDiv.appendChild(img);
  } else {
    imgDiv.innerHTML = `<div class="blog-img-placeholder">${entry.emoji || '📝'}</div>`;
  }

  // Content column
  const contentDiv = document.createElement('div');
  contentDiv.className = 'blog-content';
  contentDiv.innerHTML = `
    <div class="blog-meta">
      <span class="blog-tag">${entry.tag || 'Article'}</span>
      ${dateStr ? `<span class="blog-date">${dateStr}</span>` : ''}
    </div>
    <h3 class="blog-title">${entry.title}</h3>
    <p class="blog-summary">${entry.summary}</p>
    <span class="blog-read-more">Read more →</span>
  `;

  article.appendChild(imgDiv);
  article.appendChild(contentDiv);

  // Click / keyboard handler → open modal
  const openModal = () => showBlogModal(entry);
  article.addEventListener('click', openModal);
  article.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openModal();
    }
  });

  return article;
}

/**
 * Open the blog modal and populate it with full entry content.
 * @param {Object} entry — blog entry object
 */
function showBlogModal(entry) {
  const overlay    = document.getElementById('blog-modal');
  const contentEl  = document.getElementById('modal-content');
  if (!overlay || !contentEl) return;

  const dateStr = formatDate(entry.date);

  // Build full content paragraphs
  const bodyHtml = (entry.content || [])
    .map(para => `<p>${para}</p>`)
    .join('');

  // Optional image
  const imgHtml = entry.image
    ? `<img src="${entry.image}" alt="${entry.title}" class="modal-img" loading="lazy">`
    : entry.emoji
    ? `<div class="blog-img-placeholder" style="min-height:180px;border-radius:10px;margin:1.5rem 0;font-size:5rem;background:var(--bg-3);display:flex;align-items:center;justify-content:center;">${entry.emoji}</div>`
    : '';

  contentEl.innerHTML = `
    <div class="modal-header">
      <span class="blog-tag">${entry.tag || 'Article'}</span>
      <h2 class="modal-title" id="modal-title">${entry.title}</h2>
      ${dateStr ? `<p class="modal-date">${dateStr}</p>` : ''}
    </div>
    ${imgHtml}
    <div class="modal-body">${bodyHtml || `<p>${entry.summary}</p>`}</div>
    ${entry.link ? `<a href="${entry.link}" target="_blank" rel="noopener" class="btn btn-outline" style="margin-top:1.5rem;">View Project / Post →</a>` : ''}
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus the modal for accessibility
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn) closeBtn.focus();
}

/**
 * Render all blog entries into the #blog-list container.
 * @param {Array} entries — array of blog entry objects
 */
function renderBlogEntries(entries) {
  const list = document.getElementById('blog-list');
  if (!list) return;

  list.innerHTML = '';

  if (!entries || entries.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-muted);">No entries found. Add some to blog.json!</p>';
    return;
  }

  entries.forEach((entry, i) => {
    const item = buildBlogItem(entry, i);
    list.appendChild(item);
  });

  // Re-run AOS to pick up dynamically added elements
  if (window.AOS) AOS.refresh();
}

/**
 * Show error state in blog section.
 */
function showBlogError(msg) {
  console.error('[blog.js]', msg);
  const errEl = document.getElementById('blog-error');
  if (errEl) {
    errEl.textContent = '⚠ Could not load blog entries. Make sure blog.json exists and is valid JSON.';
    errEl.classList.remove('hidden');
  }
}

/**
 * Main entry point.
 */
async function initBlog() {
  try {
    const entries = await fetchBlogEntries();
    renderBlogEntries(entries);
  } catch (err) {
    showBlogError(err.message);
  }
}

document.addEventListener('DOMContentLoaded', initBlog);
