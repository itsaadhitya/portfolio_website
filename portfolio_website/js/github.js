/**
 * github.js — Dynamic GitHub repository loader
 *
 * Fetches public repos from the GitHub API and renders them as
 * interactive project cards. Falls back to curated demo data if
 * the API is unavailable (rate-limited or user not found).
 *
 * ── HOW TO CONFIGURE ────────────────────────────────────────────────────────
 * 1. Change GITHUB_USERNAME to your actual GitHub username.
 * 2. Optionally add a fine-grained read-only token to GITHUB_TOKEN to
 *    raise the API rate limit from 60 → 5000 req/hr.
 *    Keep tokens in env vars / a build step; never commit to version control.
 * ─────────────────────────────────────────────────────────────────────────── */

const GITHUB_USERNAME = ''; // ← CHANGE THIS
const GITHUB_TOKEN = '';               // ← Optional: 'ghp_XXXX'
const MAX_REPOS = 12;               // How many repos to display

// Map GitHub language names to emoji icons for visual flair
const LANG_ICONS = {
  Python: '🐍',
  'Jupyter Notebook': '📓',
  JavaScript: '🟨',
  TypeScript: '🔷',
  R: '📈',
  HTML: '🌐',
  CSS: '🎨',
  SQL: '🗃️',
  Shell: '💻',
  Go: '🐹',
  Rust: '🦀',
};

// Fallback demo repos shown when GitHub API is unavailable
const DEMO_REPOS = [
  {
    name: 'sales-dashboard',
    description: 'Interactive Plotly Dash dashboard for retail sales analysis. Includes KPI cards, time-series charts, and geographic heatmaps.',
    language: 'Python',
    stargazers_count: 24,
    forks_count: 7,
    html_url: '#',
  },
  {
    name: 'nlp-sentiment-analyser',
    description: 'Fine-tuned BERT model for customer review sentiment classification achieving 94.2% accuracy on Amazon product data.',
    language: 'Python',
    stargazers_count: 18,
    forks_count: 4,
    html_url: '#',
  },
  {
    name: 'sql-query-toolkit',
    description: 'A collection of 50+ reusable SQL query templates for common analytics tasks: cohort analysis, funnel metrics, churn prediction.',
    language: 'SQL',
    stargazers_count: 31,
    forks_count: 12,
    html_url: '#',
  },
  {
    name: 'stock-price-eda',
    description: 'Exploratory data analysis of FTSE 100 stocks using pandas and seaborn. Includes correlation matrices, rolling averages, and anomaly detection.',
    language: 'Jupyter Notebook',
    stargazers_count: 9,
    forks_count: 2,
    html_url: '#',
  },
  {
    name: 'football-analytics',
    description: 'Analysing EPL player performance data using StatsBomb open data. Builds expected-goals (xG) models and pass-network visualisations.',
    language: 'Python',
    stargazers_count: 42,
    forks_count: 15,
    html_url: '#',
  },
  {
    name: 'portfolio-website',
    description: 'This very portfolio! Built with vanilla HTML, CSS, and JS. Features dark mode, GitHub API integration, and a JSON-driven blog system.',
    language: 'HTML',
    stargazers_count: 5,
    forks_count: 1,
    html_url: 'https://github.com/itsaadhitya/portfolio_website',
  },
];

/**
 * Fetch repos from GitHub API.
 * Sorts by stargazers count, filters out forks.
 */
async function fetchGitHubRepos() {
  const headers = {};
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;

  const url = `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`;
  const res = await fetch(url, { headers });

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

  const repos = await res.json();

  return repos
    .filter(r => !r.fork && !r.private)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS);
}

/**
 * Build a single project card element.
 * @param {Object} repo — GitHub repo object (or demo object with same shape)
 */
function buildProjectCard(repo) {
  const lang = repo.language || 'Other';
  const icon = LANG_ICONS[lang] || '📁';
  const stars = repo.stargazers_count ?? 0;
  const forks = repo.forks_count ?? 0;
  const url = repo.html_url || '#';
  const desc = repo.description || 'No description provided.';
  const repoName = repo.name.replace(/-/g, ' ').replace(/_/g, ' ');

  const card = document.createElement('div');
  card.className = 'project-card';
  card.dataset.lang = lang;

  card.innerHTML = `
    <div class="project-card-top">
      <span class="project-icon">${icon}</span>
      <div class="project-links">
        <a href="${url}" target="_blank" rel="noopener" class="project-link" title="View on GitHub">↗ GitHub</a>
      </div>
    </div>
    <h3 class="project-name">${repoName}</h3>
    <p class="project-desc">${desc}</p>
    <div class="project-meta">
      ${lang ? `<span class="project-lang">${lang}</span>` : ''}
      ${stars ? `<span class="project-stars">⭐ ${stars}</span>` : ''}
      ${forks ? `<span class="project-forks">🍴 ${forks}</span>` : ''}
    </div>
  `;

  return card;
}

/**
 * Render an array of repo objects into the projects grid.
 */
function renderProjects(repos) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Clear skeleton loaders
  grid.innerHTML = '';

  if (!repos || repos.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;">No public repositories found.</p>';
    return;
  }

  repos.forEach(repo => {
    const card = buildProjectCard(repo);
    // Animate cards in with a stagger
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    grid.appendChild(card);
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  });
}

/**
 * Show an error message and fall back to demo repos.
 */
function showError(msg) {
  console.warn('[github.js]', msg, '— showing demo repos.');
  const errEl = document.getElementById('projects-error');
  if (errEl) {
    errEl.textContent = '⚠ Could not load GitHub repos (API limit reached). Showing example projects.';
    errEl.classList.remove('hidden');
  }
  renderProjects(DEMO_REPOS);
}

/**
 * Main entry: fetch and render, or fall back to demos.
 */
async function initProjects() {
  try {
    const repos = await fetchGitHubRepos();
    renderProjects(repos);
  } catch (err) {
    showError(err.message);
  }
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', initProjects);
