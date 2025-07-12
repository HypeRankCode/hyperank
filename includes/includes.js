export function loadInclude(id, url, callback) {
  const container = document.getElementById(id);
  if (!container) return;

  fetch(url)
    .then(res => res.ok ? res.text() : Promise.reject(`Failed to load ${url}`))
    .then(html => {
      container.innerHTML = html;
      if (callback) callback();
    })
    .catch(err => console.error(`Include error (${url}):`, err));
}
window.loadInclude = loadInclude;
