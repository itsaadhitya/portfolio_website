# Portfolio Website — Alex Chen

## 📁 Project Structure

```
portfolio/
├── index.html          ← Main HTML file
├── css/
│   └── style.css       ← All styles (dark/light theme via CSS variables)
├── js/
│   ├── main.js         ← Core interactions (theme, nav, typing, chart, form)
│   ├── github.js       ← GitHub API project loader
│   └── blog.js         ← JSON-driven blog/experience loader
├── blog.json           ← Blog & experience data source
├── images/             ← Blog post images (jpg/png/webp)
│   └── (add images here, referenced in blog.json)
├── assets/
│   └── cv.pdf          ← Your CV/Resume PDF
└── README.md
```

## 🚀 Quick Start

1. Open `index.html` in a browser (use Live Server in VS Code for best results)
2. Edit `blog.json` to add your real experience/blog entries
3. Replace `GITHUB_USERNAME` in `js/github.js` with your GitHub username
4. Update `action="https://formspree.io/f/YOUR_FORM_ID"` in `index.html` with your Formspree endpoint
5. Replace `assets/cv.pdf` with your actual CV

## ✏️ Adding a Blog Entry

Edit `blog.json` — add an object to the `entries` array:

```json
{
  "title":   "My New Post",
  "tag":     "Blog Post",
  "date":    "2025-01-15",
  "emoji":   "🚀",
  "image":   "images/my-post.jpg",
  "summary": "One sentence preview shown on the list card.",
  "content": [
    "First paragraph of the full post.",
    "Second paragraph.",
    "Third paragraph."
  ],
  "link":    "https://optional-external-link.com"
}
```

The layout alternates automatically — no HTML changes needed.

## 🎨 Theming

All colours are CSS variables in `css/style.css`. Edit the `:root` (dark) and
`[data-theme="light"]` blocks to change the palette.

## 📦 Dependencies (CDN — no npm needed)

- [AOS](https://michalsnik.github.io/aos/) — scroll animations
- [Chart.js](https://www.chartjs.org/) — radar chart
- [Google Fonts](https://fonts.google.com/) — Syne, Space Mono, DM Sans
- [Formspree](https://formspree.io/) — contact form backend
