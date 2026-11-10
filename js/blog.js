/**
 * blog.js: loads posts from blog.json and shows either the list
 * or a single post, depending on the URL hash.
 *
 *   blog.html            -> list of posts
 *   blog.html#some-id    -> the post whose "id" is some-id
 *
 * To add a post, only edit blog.json.
 * Note: fetch() needs a web server, so open the site with VS Code
 * Live Server (or GitHub Pages), not by double-clicking the file.
 */

const listView = document.getElementById('blog-list-view');
const postView = document.getElementById('blog-post-view');
const listEl = document.getElementById('blog-list');
const errorEl = document.getElementById('blog-error');

let posts = [];

// Small helper so text is always inserted safely
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderList() {
  listEl.innerHTML = '';

  posts.forEach(post => {
    const row = make('a', 'post-row');
    row.href = '#' + post.id;
    row.appendChild(make('span', 'post-date', formatDate(post.date)));
    row.appendChild(make('h2', '', post.title));
    row.appendChild(make('p', '', post.summary));
    listEl.appendChild(row);
  });
}

function renderPost(post) {
  postView.innerHTML = '';

  const back = make('a', 'back-link', '← All posts');
  back.href = 'blog.html';
  postView.appendChild(back);

  postView.appendChild(make('div', 'post-date', formatDate(post.date)));
  postView.appendChild(make('h1', '', post.title));

  if (post.image) {
    const img = make('img', 'post-image');
    img.src = post.image;
    img.alt = post.title;
    postView.appendChild(img);
  }

  post.content.forEach(paragraph => postView.appendChild(make('p', '', paragraph)));
}

// Decide what to show based on the hash
function route() {
  const id = decodeURIComponent(location.hash.slice(1));
  const post = posts.find(p => p.id === id);

  if (post) {
    renderPost(post);
    listView.hidden = true;
    postView.hidden = false;
    document.title = post.title + ' · Aadhitya Dangal';
    window.scrollTo(0, 0);
  } else {
    postView.hidden = true;
    listView.hidden = false;
    document.title = 'Blog · Aadhitya Dangal';
  }
}

async function init() {
  try {
    const res = await fetch('blog.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    // newest first
    posts = (data.entries || []).slice().sort((a, b) => b.date.localeCompare(a.date));

    renderList();
    route();
    window.addEventListener('hashchange', route);
  } catch (err) {
    console.error('[blog.js]', err);
    errorEl.textContent = 'Could not load the posts. If you opened this file directly, run it through a local server (VS Code Live Server) or publish it.';
    errorEl.hidden = false;
  }
}

init();
