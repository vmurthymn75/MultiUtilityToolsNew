// assets/js/header-footer.js
// Dynamically loads header.html and footer.html into the page

function loadComponent(id, url) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(error => {
      console.warn(`Failed to load ${url}:`, error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  // Handle both old and new header/footer IDs
  if (document.getElementById('site-header')) {
    loadComponent('site-header', '/header.html');
  } else if (document.getElementById('header')) {
    loadComponent('header', '../header.html');
  }
  
  if (document.getElementById('site-footer')) {
    loadComponent('site-footer', '/footer.html');
  } else if (document.getElementById('footer')) {
    loadComponent('footer', '../footer.html');
  }
}); 