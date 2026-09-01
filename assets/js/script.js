/* ==========================================================
   CADENCE CONSERVATORY — script.js
   Vanilla JS only: no external dependencies, so the page stays
   fast-loading. Everything below is defensive (checks elements
   exist before wiring them up) so sections can be edited freely.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlideshow();
  initNavToggle();
  initNavActiveState();
  initHeaderShadow();
  initScrollReveal();
  initCounters();
  initCoursesRows();
  initTestimonialSlider();
  initContactForm();
  initNewsletterForm();
  initBackToTop();
  initSmoothAnchorClose();
  document.getElementById('year').textContent = new Date().getFullYear();
});

/* ---------- Mobile nav toggle ---------- */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  const backdrop = document.getElementById('navBackdrop');
  const closeBtn = document.getElementById('navClose');
  if (!toggle || !nav) return;

  function openNav() {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (backdrop) {
      backdrop.style.display = 'block';
      // Force reflow so the opacity transition plays
      backdrop.getBoundingClientRect();
      backdrop.classList.add('is-visible');
      backdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeNav() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (backdrop) {
      backdrop.classList.remove('is-visible');
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.addEventListener('transitionend', () => {
        if (!backdrop.classList.contains('is-visible')) {
          backdrop.style.display = 'none';
        }
      }, { once: true });
    }
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    nav.classList.contains('is-open') ? closeNav() : openNav();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeNav);
  if (backdrop) backdrop.addEventListener('click', closeNav);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) closeNav();
  });
}

/* ---------- Active nav link (matches current page) ---------- */
function initNavActiveState() {
  const navLinks = document.querySelectorAll('.main-nav__list a');
  if (!navLinks.length) return;

  // Get current page filename (e.g. "about.html") — fallback to "index.html"
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Strip any hash/query from href for comparison
    const linkPage = href ? href.split('#')[0].split('?')[0] : '';

    const isActive =
      linkPage === page ||
      // Treat both "" and "index.html" as home
      (page === '' || page === 'index.html') && (linkPage === 'index.html' || linkPage === '');

    if (isActive) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });
}


function initSmoothAnchorClose() {
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  const backdrop = document.getElementById('navBackdrop');
  if (!nav) return;
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (backdrop) {
        backdrop.classList.remove('is-visible');
        backdrop.setAttribute('aria-hidden', 'true');
        backdrop.addEventListener('transitionend', () => {
          if (!backdrop.classList.contains('is-visible')) {
            backdrop.style.display = 'none';
          }
        }, { once: true });
      }
    });
  });
}


/* ---------- Header: fixed sticky with scroll-aware styling ---------- */
function initHeaderShadow() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  // The announcement topbar (if present on this page) is NOT fixed — it
  // scrolls away naturally. The header is fixed, so on load it needs to
  // sit BELOW the topbar (top offset = topbar height) rather than at
  // top:0, or the two visually overlap. As the page scrolls, the topbar
  // moves out of view, so we shrink the header's top offset in lockstep
  // until it reaches 0 and the header sticks flush to the viewport top.
  const topbar = document.querySelector('.topbar');

  // Set CSS variable so body padding-top matches header height
  function setHeaderOffset() {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--header-offset', h + 'px');
  }
  setHeaderOffset();
  window.addEventListener('resize', setHeaderOffset, { passive: true });

  function positionHeader() {
    if (!topbar) return; // no topbar on this page — header stays at top:0
    const topbarHeight = topbar.offsetHeight;
    const remaining = Math.max(0, topbarHeight - window.scrollY);
    header.style.top = remaining + 'px';
  }

  function update() {
    const currentY = window.scrollY;

    // Scrolled state — solidify glass background
    header.classList.toggle('is-scrolled', currentY > 10);
    positionHeader();
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', positionHeader, { passive: true });
  update();
}

/* ---------- Scroll-triggered reveal for [data-reveal] elements ---------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = (i % 6) * 60; // slight stagger for grid siblings
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
}

/* ---------- Animated stat counters ---------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ---------- Testimonial slider (auto-rotating, dot navigation) ---------- */
function initTestimonialSlider() {
  const slider = document.getElementById('testimonialSlider');
  const dotsWrap = document.getElementById('testimonialDots');
  if (!slider || !dotsWrap) return;

  const slides = Array.from(slider.querySelectorAll('.testimonial'));
  if (!slides.length) return;

  let current = slides.findIndex(s => s.classList.contains('is-active'));
  if (current === -1) current = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    if (i === current) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(index, userTriggered) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
    if (userTriggered) restart();
  }

  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 6500);
  }

  restart();
}

/* ---------- Faculty rail: click-and-drag horizontal scroll on desktop ---------- */
/* Kept as no-op — old facultyRail element removed, guard prevents error */
function initFacultyRailDrag() {
  const rail = document.getElementById('facultyRail');
  if (!rail) return;
}

/* ---------- Contact form (front-end only demo submission) ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  if (!form || !note) return;

  // Clear errors on input
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('has-error');
      const errSpan = field.nextElementSibling;
      if (errSpan && errSpan.classList.contains('form-error')) {
        errSpan.textContent = '';
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Clear previous errors
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    note.textContent = '';

    form.querySelectorAll('input, select, textarea').forEach(field => {
      if (!field.checkValidity()) {
        isValid = false;
        field.classList.add('has-error');
        const errSpan = field.nextElementSibling;
        if (errSpan && errSpan.classList.contains('form-error')) {
          errSpan.textContent = field.validationMessage;
        }
      }
    });

    if (!isValid) return;

    const name = form.querySelector('#fname').value.trim();
    // note.textContent = `Thank you, ${name.split(' ')[0]}. Our admissions team will call you within one working day.`;
    form.reset();
    setTimeout(() => { window.location.href = '404.html'; }, 1500);
  });
}

/* ---------- Newsletter form (front-end only demo submission) ---------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.setAttribute('novalidate', 'novalidate');

  const input = form.querySelector('input');
  const button = form.querySelector('button');
  if (!input || !button) return;

  let row = form.querySelector('.newsletter-form__row');
  if (!row) {
    row = document.createElement('div');
    row.className = 'newsletter-form__row';
    form.insertBefore(row, input);
    row.appendChild(input);
    row.appendChild(button);
  }

  const showValidationMessage = (message, isError = false) => {
    const existing = form.querySelector('.newsletter-form__status');
    if (existing) existing.remove();

    const note = document.createElement('p');
    note.className = 'newsletter-form__status';
    note.classList.toggle('is-error', isError);
    note.classList.toggle('is-success', !isError);
    note.textContent = message;
    note.setAttribute('role', 'status');
    note.setAttribute('aria-live', 'polite');
    form.appendChild(note);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();

    if (!value) {
      showValidationMessage('Please enter your email address.', true);
      input.focus();
      return;
    }

    if (value.length < 2) {
      showValidationMessage('Please enter a valid text value.', true);
      input.focus();
      return;
    }

    showValidationMessage('Thanks for subscribing.');
    button.innerHTML = '✓';
    input.value = '';
    setTimeout(() => {
      window.location.href = '404.html';
    }, 1000);
  });
}

/* ---------- Back-to-top button ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 700);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Hero fullscreen slideshow ---------- */
function initHeroSlideshow() {
  const slides     = document.querySelectorAll('.hero__slide');
  const dots       = document.querySelectorAll('.hero__dot');
  const progressBar = document.getElementById('heroProgressBar');
  if (!slides.length) return;

  const INTERVAL  = 1000;   // ms between slides
  const TICK      = 30;     // progress bar update frequency ms

  let current     = 0;
  let autoTimer   = null;
  let progTimer   = null;
  let elapsed     = 0;
  let paused      = false;

  /* ── activate slide ── */
  function goTo(index) {
    // deactivate current
    slides[current].classList.remove('is-active');
    if (dots[current]) {
      dots[current].classList.remove('is-active');
      dots[current].setAttribute('aria-selected', 'false');
    }

    // activate next
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    if (dots[current]) {
      dots[current].classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');
    }

    // reset progress bar
    elapsed = 0;
    if (progressBar) progressBar.style.width = '0%';
  }

  /* ── progress bar tick ── */
  function startProgress() {
    clearInterval(progTimer);
    progTimer = setInterval(() => {
      if (paused) return;
      elapsed += TICK;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      if (progressBar) progressBar.style.width = pct + '%';
    }, TICK);
  }

  /* ── auto-advance ── */
  function startAuto() {
    clearInterval(autoTimer);
    elapsed = 0;
    autoTimer = setInterval(() => {
      if (!paused) goTo(current + 1);
    }, INTERVAL);
    startProgress();
  }

  /* ── dot clicks ── */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      startAuto();   // restart timer from 0
    });
  });

  /* ── pause on hover / touch ── */
  const section = document.getElementById('hero');
  if (section) {
    section.addEventListener('mouseenter', () => { paused = true; });
    section.addEventListener('mouseleave', () => { paused = false; });
    section.addEventListener('touchstart', () => { paused = true;  }, { passive: true });
    section.addEventListener('touchend',   () => {
      paused = false;
      // on mobile taps, treat as manual advance if finger barely moved
    }, { passive: true });
  }

  /* ── keyboard: left / right arrows when hero is focused ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
  });

  /* ── pause when tab is hidden (battery / bandwidth saving) ── */
  document.addEventListener('visibilitychange', () => {
    paused = document.hidden;
    if (!document.hidden) startAuto();
  });

  /* ── kick off ── */
  goTo(0);
  startAuto();
}

/* ---------- Courses rows — keyboard accessibility ---------- */
function initCoursesRows() {
  const rows = document.querySelectorAll('.courses__row');
  if (!rows.length) return;

  rows.forEach(row => {
    // Make rows keyboard-focusable for accessibility
    row.setAttribute('tabindex', '0');

    // Enter / Space acts like a click on the CTA link
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cta = row.querySelector('.courses__cta');
        if (cta) cta.click();
      }
    });
  });
}

/* ---------- Accordion panels (Why Stackly section) ---------- */
function initAccordionPanels() {
  const panels = document.querySelectorAll('.accord__panel');
  if (!panels.length) return;

  const AUTO_DELAY = 5000; // ms — matches CSS progress bar animation
  let current = 0;
  let timer = null;
  let paused = false;

  /* ── Activate a panel by index ── */
  function activate(index, restartTimer = true) {
    panels.forEach((p, i) => {
      const isActive = i === index;
      // Toggle class — also re-triggers the ::after progress animation
      if (isActive && !p.classList.contains('is-active')) {
        // Force animation restart by removing + re-adding class
        p.classList.remove('is-active');
        // eslint-disable-next-line no-void
        void p.offsetWidth; // reflow
        p.classList.add('is-active');
      } else if (!isActive) {
        p.classList.remove('is-active');
      }
    });
    current = index;
    if (restartTimer) startAuto();
  }

  /* ── Auto-advance ── */
  function startAuto() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!paused) activate((current + 1) % panels.length);
    }, AUTO_DELAY);
  }

  /* ── Click each panel ── */
  panels.forEach((panel, i) => {
    panel.addEventListener('click', () => {
      if (i !== current) activate(i);
    });

    /* Hover — activate through JS so only one opens at a time */
    panel.addEventListener('mouseenter', () => {
      if (i !== current) activate(i);
    });

    /* Keyboard: Enter / Space on focused panel */
    panel.setAttribute('tabindex', '0');
    panel.setAttribute('role', 'button');
    panel.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && i !== current) {
        e.preventDefault();
        activate(i);
      }
    });
  });

  /* ── Pause on hover ── */
  const section = document.getElementById('whyus');
  if (section) {
    section.addEventListener('mouseenter', () => { paused = true;  clearTimeout(timer); });
    section.addEventListener('mouseleave', () => { paused = false; startAuto(); });
    section.addEventListener('touchstart', () => { paused = true;  clearTimeout(timer); }, { passive: true });
    section.addEventListener('touchend',   () => { paused = false; startAuto(); }, { passive: true });
  }

  /* ── Pause when tab hidden ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { paused = true; clearTimeout(timer); }
    else { paused = false; activate(current, true); }
  });

  /* ── Kick off ── */
  activate(0);
}
