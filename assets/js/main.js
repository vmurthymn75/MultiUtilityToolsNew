// assets/js/main.js
// Live search for tool cards on the home page

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('tool-search');
  if (!searchInput) return;

  // --- CATEGORY TOOL COUNTS ---
  const allCategories = [
    'image-tools', 'seo-tools', 'text-tools', 'developer-tools',
    'math-tools', 'unit-converters', 'security-tools', 'social-tools', 'misc-tools'
  ];
  allCategories.forEach(cat => {
    const section = document.getElementById(cat);
    if (section) {
      const count = section.querySelectorAll('.card-tool').length;
      const countSpan = document.getElementById('count-' + cat);
      if (countSpan) countSpan.textContent = `(${count})`;
    }
  });

  // --- CATEGORY FILTERING ---
  const navLinks = document.querySelectorAll('#category-nav-list .nav-link');
  
  function showCategory(cat) {
    // Validate category exists
    if (!allCategories.includes(cat)) {
      console.warn(`Invalid category: ${cat}, defaulting to image-tools`);
      cat = 'image-tools';
    }
    
    allCategories.forEach(c => {
      const section = document.getElementById(c);
      if (section) {
        section.parentElement.classList.remove('fade-in', 'fade-out');
        if (c === cat) {
          section.parentElement.classList.add('fade-in');
          section.style.display = '';
        } else {
          section.parentElement.classList.remove('fade-in');
          section.parentElement.classList.add('fade-out');
          section.style.display = 'none';
        }
      }
    });
    
    // Update active nav link
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-category') === cat) {
        link.classList.add('active');
      }
    });
    
    // Save to sessionStorage
    sessionStorage.setItem('lastActiveCategory', cat);
  }
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('data-category');
      showCategory(targetId);
    });
  });
  
  // --- ENHANCED STATE RETENTION ---
  function determineInitialCategory() {
    const lastCategory = sessionStorage.getItem('lastActiveCategory');
    const referrer = document.referrer;
    
    // Check if user is returning from a tool page
    const isReturningFromTool = referrer && (
      referrer.includes('/tools/') || 
      referrer.includes('tools/') ||
      referrer.includes('.html')
    );
    
    // Check if user is returning from the same domain
    const isSameDomain = referrer && (
      referrer.includes(window.location.hostname) ||
      referrer.includes(window.location.origin)
    );
    
    console.log('State Retention Debug:', {
      lastCategory,
      referrer,
      isReturningFromTool,
      isSameDomain,
      currentUrl: window.location.href
    });
    
    // Priority order for category selection:
    // 1. If returning from a tool page and have a saved category, use it
    // 2. If returning from same domain and have a saved category, use it
    // 3. If have a saved category (from any previous visit), use it
    // 4. Default to image-tools
    
    if (isReturningFromTool && lastCategory) {
      console.log('Restoring category from tool page return:', lastCategory);
      return lastCategory;
    } else if (isSameDomain && lastCategory) {
      console.log('Restoring category from same domain return:', lastCategory);
      return lastCategory;
    } else if (lastCategory) {
      console.log('Restoring category from previous session:', lastCategory);
      return lastCategory;
    } else {
      console.log('No saved category found, defaulting to image-tools');
      return 'image-tools';
    }
  }
  
  // Initialize with the determined category
  const initialCategory = determineInitialCategory();
  showCategory(initialCategory);

  // --- THEME SWITCHER ---
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      const icon = this.querySelector('i');
      if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('bi-moon');
        icon.classList.add('bi-sun');
      } else {
        icon.classList.remove('bi-sun');
        icon.classList.add('bi-moon');
      }
    });
  }

  // --- SEARCH (remains as before, but only searches visible category) ---
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    // Only search visible cards
    const visibleSection = Array.from(allCategories).map(cat => document.getElementById(cat)).find(sec => sec && sec.style.display !== 'none');
    if (!visibleSection) return;
    const cards = visibleSection.querySelectorAll('.card-tool');
    cards.forEach(card => {
      const titleEl = card.querySelector('.card-title');
      const descEl = card.querySelector('.card-text');
      const title = titleEl.textContent.toLowerCase();
      const desc = descEl?.textContent.toLowerCase() || '';
      // Remove previous highlights
      titleEl.innerHTML = titleEl.textContent;
      if (descEl) descEl.innerHTML = descEl.textContent;
      if (title.includes(query) || desc.includes(query)) {
        card.closest('.col').style.display = '';
        // Highlight matches
        if (query) {
          const re = new RegExp(`(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
          titleEl.innerHTML = titleEl.textContent.replace(re, '<span class="highlight">$1</span>');
          if (descEl) descEl.innerHTML = descEl.textContent.replace(re, '<span class="highlight">$1</span>');
        }
      } else {
        card.closest('.col').style.display = 'none';
      }
    });
  });
}); 