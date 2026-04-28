/**
 * main.js — Core portfolio interactions
 * Handles: theme toggle, sticky nav, mobile menu, typing effect,
 *          skill bar animation, counter animation, Chart.js radar,
 *          project filtering, contact form, AOS init.
 */

/* ─── Init AOS (Animate On Scroll) ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
  });
});

/* ─── Theme Toggle ───────────────────────────────────────────────────────── */
const themeToggle  = document.getElementById('theme-toggle');
const htmlEl       = document.documentElement;
const THEME_KEY    = 'portfolio-theme';

// Apply saved theme or system preference
(function initTheme() {
  const saved  = localStorage.getItem(THEME_KEY);
  const prefers = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', saved || prefers);
})();

themeToggle.addEventListener('click', () => {
  const current = htmlEl.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  htmlEl.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);

  // Update Chart.js if it exists
  if (window.skillRadarChart) updateChartColors(window.skillRadarChart);
});

/* ─── Sticky Navbar ──────────────────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ─── Active nav link on scroll ──────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ─── Mobile Menu ────────────────────────────────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('#mobile-menu .nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

/* ─── Typing effect ──────────────────────────────────────────────────────── */
const typedWords  = ['insights.', 'stories.', 'dashboards.', 'decisions.', 'clarity.'];
const typedEl     = document.getElementById('typed-text');
let wordIndex     = 0;
let charIndex     = 0;
let isDeleting    = false;

function type() {
  const word    = typedWords[wordIndex];
  const display = isDeleting ? word.slice(0, charIndex--) : word.slice(0, charIndex++);
  typedEl.textContent = display;

  let delay = isDeleting ? 60 : 110;

  if (!isDeleting && charIndex > word.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex < 0) {
    isDeleting = false;
    charIndex  = 0;
    wordIndex  = (wordIndex + 1) % typedWords.length;
    delay      = 300;
  }

  setTimeout(type, delay);
}

type();

/* ─── Animated stat counters ─────────────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1500;
  const step     = Math.ceil(duration / target);
  let current    = 0;

  const tick = setInterval(() => {
    current = Math.min(current + 1, target);
    el.textContent = current;
    if (current === target) clearInterval(tick);
  }, step);
}

// Use IntersectionObserver so counters fire when visible
const statEls = document.querySelectorAll('.stat-num');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      entry.target.dataset.counted = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

statEls.forEach(el => counterObs.observe(el));

/* ─── Skill bar animation ────────────────────────────────────────────────── */
const skillBars = document.querySelectorAll('.skill-bar-fill');
const barObs    = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      // Small delay for visual delight
      setTimeout(() => {
        entry.target.style.width = entry.target.dataset.width + '%';
      }, 200);
    }
  });
}, { threshold: 0.4 });

skillBars.forEach(bar => barObs.observe(bar));

/* ─── Chart.js Skill Radar ───────────────────────────────────────────────── */
function getChartColors() {
  const isDark = htmlEl.getAttribute('data-theme') !== 'light';
  return {
    grid:    isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    tick:    isDark ? '#4d5c6e'                : '#9ca3af',
    label:   isDark ? '#8b98a8'                : '#4b5563',
    fill:    isDark ? 'rgba(59,130,246,0.18)'  : 'rgba(37,99,235,0.12)',
    border:  isDark ? 'rgba(59,130,246,0.85)'  : 'rgba(37,99,235,0.85)',
    point:   isDark ? '#3b82f6'                : '#2563eb',
  };
}

function updateChartColors(chart) {
  const c = getChartColors();
  chart.data.datasets[0].backgroundColor  = c.fill;
  chart.data.datasets[0].borderColor      = c.border;
  chart.data.datasets[0].pointBackgroundColor = c.point;
  chart.options.scales.r.grid.color       = c.grid;
  chart.options.scales.r.ticks.color      = c.tick;
  chart.options.scales.r.pointLabels.color = c.label;
  chart.update();
}

const radarCtx = document.getElementById('skillChart');
if (radarCtx) {
  const c = getChartColors();
  window.skillRadarChart = new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: ['Python', 'SQL', 'Data Viz', 'Machine Learning', 'Cloud/ETL', 'Web/APIs'],
      datasets: [{
        label: 'Skill Level',
        data: [88, 82, 75, 65, 45, 70],
        backgroundColor:      c.fill,
        borderColor:          c.border,
        borderWidth:          2,
        pointBackgroundColor: c.point,
        pointBorderColor:     'transparent',
        pointRadius:          5,
        pointHoverRadius:     7,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            color: c.tick,
            backdropColor: 'transparent',
            font: { family: "'Space Mono', monospace", size: 10 },
          },
          grid:        { color: c.grid },
          angleLines:  { color: c.grid },
          pointLabels: {
            color: c.label,
            font: { family: "'DM Sans', sans-serif", size: 12, weight: '500' },
          },
        },
      },
    },
  });
}

/* ─── Project filter buttons ─────────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const lang = card.dataset.lang || '';
      const show = filter === 'all' || lang === filter;
      card.style.display = show ? 'flex' : 'none';
    });
  });
});

/* ─── Contact form ───────────────────────────────────────────────────────── */
const contactForm   = document.getElementById('contact-form');
const submitBtn     = document.getElementById('submit-btn');
const submitText    = document.getElementById('submit-text');
const submitLoading = document.getElementById('submit-loading');
const formFeedback  = document.getElementById('form-feedback');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading state
    submitText.classList.add('hidden');
    submitLoading.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' },
      });

      formFeedback.classList.remove('hidden', 'success', 'error');

      if (response.ok) {
        formFeedback.textContent = '✓ Message sent! I\'ll get back to you within 48 hours.';
        formFeedback.classList.add('success');
        contactForm.reset();
      } else {
        throw new Error('Server error');
      }
    } catch {
      formFeedback.classList.add('error');
      formFeedback.textContent = '✗ Oops, something went wrong. Please email me directly.';
    } finally {
      submitText.classList.remove('hidden');
      submitLoading.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });
}

/* ─── Modal close helpers ────────────────────────────────────────────────── */
const blogModal = document.getElementById('blog-modal');
const modalCloseBtn = document.getElementById('modal-close');

function closeModal() {
  blogModal.classList.remove('open');
  document.body.style.overflow = '';
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

blogModal.addEventListener('click', (e) => {
  if (e.target === blogModal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
