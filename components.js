/* 
   Janine Makorre Portfolio JS Components
   Handles navigation, dark/light theme toggle, and progressive disclosure project filtering.
*/

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initTheme();
  initProjectFilters();
});

// Navigation logic & Mobile Menu
function initNavigation() {
  const header = document.querySelector('header.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (!header) return;

  // Add shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Toggle mobile menu
  if (menuToggle && navLinks) {
    const setMenuOpen = (open, restoreFocus = false) => {
      navLinks.classList.toggle('mobile-open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      if (restoreFocus) menuToggle.focus();
    };
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuOpen(!navLinks.classList.contains('mobile-open'));
    });

    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('mobile-open') && !navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        setMenuOpen(false);
      }
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuOpen(false));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
        setMenuOpen(false, true);
      }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', (event) => {
      if (event.matches) setMenuOpen(false);
    });
  }

  // Active state highlighting
  const currentPath = window.location.pathname;
  const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  const navAnchors = document.querySelectorAll('.nav-links a');
  
  navAnchors.forEach(anchor => {
    const href = anchor.getAttribute('href');
    if (href === currentFile || (currentFile === '' && href === 'index.html')) {
      anchor.classList.add('active');
      anchor.setAttribute('aria-current', 'page');
    } else {
      anchor.classList.remove('active');
      anchor.removeAttribute('aria-current');
    }
  });
}

// Dark Mode / Light Mode toggle with Dark Mode default
function initTheme() {
  const themeBtn = document.querySelector('.theme-btn');
  if (!themeBtn) return;

  let savedTheme;
  try { savedTheme = localStorage.getItem('janine-theme'); } catch {}
  const initialTheme = savedTheme === 'light' ? 'light' : 'dark';
  
  applyTheme(initialTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('janine-theme', theme); } catch {}
    themeBtn.setAttribute('aria-pressed', String(theme === 'light'));
    themeBtn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    
    // Update theme toggle icon
    const iconContainer = themeBtn.querySelector('svg');
    if (iconContainer) {
      if (theme === 'dark') {
        // Sun icon for switching to light mode
        iconContainer.innerHTML = `
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"></path>
        `;
      } else {
        // Moon icon for switching to dark mode
        iconContainer.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      }
    }
  }
}

// Progressive Disclosure Project Filter logic
function initProjectFilters() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const projectItems = document.querySelectorAll('[data-category]');

  if (filterPills.length === 0 || projectItems.length === 0) return;

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      // Set active pill
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filterValue = pill.getAttribute('data-filter');

      projectItems.forEach(item => {
        const itemCategories = item.getAttribute('data-category').split(' ');
        
        if (filterValue === 'all' || itemCategories.includes(filterValue)) {
          if (item.tagName === 'TR') {
            item.style.display = 'table-row';
          } else {
            item.style.display = 'flex';
          }
          item.style.opacity = '0';
          setTimeout(() => {
            item.style.transition = 'opacity 0.3s ease';
            item.style.opacity = '1';
          }, 30);
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}
