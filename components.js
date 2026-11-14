/* ==========================================================================
   Janine Makorre — Portfolio Interactions
   Handles sticky navigation, mobile menu toggle, scroll-spy, and filter bar.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initWorkFilterScrollSpy();
  initSectionScrollSpy();
  initScrollAnimations();
});

/* --------------------------------------------------------------------------
   1. Sticky Header & Mobile Menu
   -------------------------------------------------------------------------- */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (!header) return;

  // Header scroll shadow
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navMenu) {
    const toggleMenu = (open) => {
      const isExpanded = open !== undefined ? open : !navMenu.classList.contains('mobile-open');
      navMenu.classList.toggle('mobile-open', isExpanded);
      menuToggle.setAttribute('aria-expanded', String(isExpanded));
    };

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('mobile-open') && !header.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('mobile-open')) {
        toggleMenu(false);
      }
    });

    // Close when clicking any nav link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });
  }
}

/* --------------------------------------------------------------------------
   2. Work Page Filter Bar Scroll-Spy & Smooth Navigation
   -------------------------------------------------------------------------- */
function initWorkFilterScrollSpy() {
  const filterButtons = document.querySelectorAll('.work-filter-bar .filter-btn');
  const categoryGroups = document.querySelectorAll('.work-category-group');

  if (!filterButtons.length || !categoryGroups.length) return;

  // Click handler for instant active state update
  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // IntersectionObserver to sync filter bar with scroll position
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          filterButtons.forEach(btn => {
            const href = btn.getAttribute('href');
            if (href === `#${id}`) {
              filterButtons.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    categoryGroups.forEach(group => observer.observe(group));
  }
}

/* --------------------------------------------------------------------------
   3. Homepage Navigation Scroll-Spy
   -------------------------------------------------------------------------- */
function initSectionScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-menu a[href*="#"]');
  if (!navLinks.length) return;

  const sections = [];
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const hash = href.includes('#') ? href.split('#')[1] : null;
    if (hash) {
      const target = document.getElementById(hash);
      if (target) sections.push({ id: hash, target, link });
    }
  });

  if (!sections.length) return;

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 120;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (scrollPos >= section.target.offsetTop) {
        navLinks.forEach(l => l.classList.remove('active'));
        section.link.classList.add('active');
        break;
      }
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   4. Gentle Entrance Animations (Respects prefers-reduced-motion)
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const animatables = document.querySelectorAll('.featured-card, .work-card-large, .comm-card, .opensource-card');
  if (!animatables.length || !('IntersectionObserver' in window)) return;

  animatables.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity 0.5s ease-out, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
  });

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animatables.forEach(el => observer.observe(el));
}
