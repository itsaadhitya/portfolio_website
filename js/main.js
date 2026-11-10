/**
 * main.js: small things shared by every page.
 *  - puts the current year in the footer
 *  - shows a dashed "photo here" box until images/photo.jpg exists
 */

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Photo placeholder
const photo = document.querySelector('.photo');
if (photo) {
  const frame = photo.closest('.photo-frame');

  const markLoaded = () => frame.classList.add('has-photo');

  if (photo.complete && photo.naturalWidth > 0) {
    markLoaded();                       // image was already loaded
  } else {
    photo.addEventListener('load', markLoaded);
    // on error, nothing happens: the placeholder simply stays visible
  }
}
