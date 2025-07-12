export function loadInclude(id, url, callback) {
  const container = document.getElementById(id);
  if (!container) return;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load ${url}`);
      return response.text();
    })
    .then(html => {
      container.innerHTML = html;
      if (callback) callback();
    })
    .catch(error => {
      console.error(`Include error (${url}):`, error);
    });
}

// Support for non-module environments:
window.loadInclude = loadInclude;
