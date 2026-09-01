/* ==========================================================
   Stackly Music Academy — services.js  (redesigned)
   Interactions for all redesigned sections + new testimonials.
   Defensive: every init checks its elements exist first.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* AOS scroll-reveal */
  if (window.AOS) {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });
  }

  /* GSAP animations */
  if (window.gsap) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    initHeroTitleReveal();
    initDiscSpin();
    initFloatingNotes();
    initProcessTimeline();
    initPricingEntrance();
  }

  initCurriculumTabs();
  initBillingToggle();
  initFaqAccordion();
  initFaqFilters();
  initTestimonialCarousel();
});

/* ============================================================
   HERO — word-by-word title reveal
   ============================================================ */
function initHeroTitleReveal() {
  const title = document.getElementById('svcHeroTitle');
  if (!title) return;

  const original = title.innerHTML;
  const wrapped = original
    .split(/(<br>|<em>|<\/em>)/g)
    .map(chunk => {
      if (['<br>', '<em>', '</em>'].includes(chunk)) return chunk;
      return chunk
        .split(' ')
        .filter(Boolean)
        .map(w => `<span class="svc-word" style="display:inline-block">${w}</span>`)
        .join(' ');
    })
    .join('');
  title.innerHTML = wrapped;

  gsap.from(title.querySelectorAll('.svc-word'), {
    opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.045,
  });
  gsap.from('.svc-hero__lede, .svc-hero__actions, .svc-hero__facts li', {
    opacity: 0, y: 16, duration: 0.7, ease: 'power2.out', stagger: 0.08, delay: 0.35,
  });
  gsap.from('.svc-breadcrumb', { opacity: 0, y: -8, duration: 0.5, ease: 'power2.out' });
}

/* ============================================================
   HERO — vinyl disc spin
   ============================================================ */
function initDiscSpin() {
  const disc = document.getElementById('svcDisc');
  if (!disc) return;

  gsap.set(disc, { transformOrigin: '50% 50%' });
  const spin = gsap.to(disc, { rotate: 360, duration: 18, ease: 'none', repeat: -1 });
  gsap.from(disc, { opacity: 0, scale: 0.85, duration: 0.9, ease: 'power3.out', delay: 0.2 });

  disc.addEventListener('mouseenter', () => spin.timeScale(0.15));
  disc.addEventListener('mouseleave', () => spin.timeScale(1));
}

/* ============================================================
   HERO — floating music notes
   ============================================================ */
function initFloatingNotes() {
  const notes = document.querySelectorAll('.svc-note');
  if (!notes.length) return;

  notes.forEach((note, i) => {
    gsap.to(note, {
      y: i % 2 === 0 ? -16 : 14,
      x: i % 2 === 0 ? 6 : -6,
      rotate: i % 2 === 0 ? 8 : -8,
      duration: 2.6 + i * 0.4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: i * 0.2,
    });
  });
  gsap.from(notes, { opacity: 0, scale: 0.5, duration: 0.6, stagger: 0.1, delay: 0.6, ease: 'back.out(2)' });
}

/* ============================================================
   SECTION 03 — Curriculum tab stage
   ============================================================ */
function initCurriculumTabs() {
  const tabs     = document.querySelectorAll('.svc-cur-tab');
  const panels   = document.querySelectorAll('.svc-cur-panel');
  const progress = document.getElementById('curProgressFill');
  if (!tabs.length || !panels.length) return;

  const total = tabs.length;

  function activate(index) {
    tabs.forEach((t, i) => {
      const active = i === index;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });

    panels.forEach((p, i) => {
      const active = i === index;
      p.classList.toggle('is-active', active);
      if (active) {
        p.removeAttribute('hidden');
      } else {
        p.setAttribute('hidden', '');
        p.classList.remove('is-active');
      }
    });

    if (progress) {
      progress.style.width = `${((index + 1) / total) * 100}%`;
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(i));

    /* Keyboard: arrow left/right to navigate tabs */
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { activate(Math.min(i + 1, total - 1)); tabs[Math.min(i + 1, total - 1)].focus(); }
      if (e.key === 'ArrowLeft')  { activate(Math.max(i - 1, 0));         tabs[Math.max(i - 1, 0)].focus(); }
    });
  });
}

/* ============================================================
   SECTION 04 — Billing toggle (monthly / annual)
   ============================================================ */
function initBillingToggle() {
  const btn = document.getElementById('billingSwitch');
  if (!btn) return;

  const amounts = document.querySelectorAll('.svc-plan__amount');
  const notes   = document.querySelectorAll('.svc-plan__annual-note');

  function update(isAnnual) {
    btn.setAttribute('aria-pressed', String(isAnnual));

    amounts.forEach((el, i) => {
      const monthly = parseInt(el.dataset.monthly, 10);
      const annual  = parseInt(el.dataset.annual,  10);
      const target  = isAnnual ? annual : monthly;

      if (window.gsap) {
        const obj = { val: parseInt(el.textContent, 10) };
        gsap.to(obj, {
          val: target,
          duration: 0.55,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val); },
        });
      } else {
        el.textContent = target;
      }

      /* Update the matching annual note (same index) */
      if (notes[i]) {
        if (isAnnual) {
          const saved = (monthly - annual) * 12;
          notes[i].textContent = `Save $${saved} per year`;
        } else {
          notes[i].textContent = '';
        }
      }
    });
  }

  btn.addEventListener('click', () => {
    const isAnnual = btn.getAttribute('aria-pressed') !== 'true';
    update(isAnnual);
  });
}

/* ============================================================
   SECTION 05 — Process vertical timeline fill
   ============================================================ */
function initProcessTimeline() {
  const fill = document.querySelector('.svc-process__track-fill');
  const rail  = document.getElementById('svcProcessRail');
  if (!fill || !rail || !window.ScrollTrigger) return;

  ScrollTrigger.create({
    trigger: rail,
    start: 'top 80%',
    end:   'bottom 30%',
    scrub: 0.8,
    onUpdate: (self) => {
      fill.style.height = `${self.progress * 100}%`;
    },
  });

  /* Node number pop-in */
  gsap.utils.toArray('.svc-process__num').forEach((num, i) => {
    gsap.from(num, {
      scale: 0.4,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(2.5)',
      scrollTrigger: { trigger: num, start: 'top 88%' },
      delay: i * 0.04,
    });
  });

  /* Card slide-in alternating sides */
  gsap.utils.toArray('.svc-process__card').forEach((card, i) => {
    const fromLeft = i % 2 === 0;
    gsap.from(card, {
      x: fromLeft ? -40 : 40,
      opacity: 0,
      duration: 0.65,
      ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 85%' },
    });
  });
}

/* ============================================================
   SECTION 04 — Pricing cards entrance + popular tilt
   ============================================================ */
function initPricingEntrance() {
  const featured = document.getElementById('svcPopularPlan');
  if (!featured || !window.ScrollTrigger) return;

  /* Subtle glow pulse on the featured badge */
  const badge = featured.querySelector('.svc-plan__badge');
  if (badge) {
    ScrollTrigger.create({
      trigger: badge,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.fromTo(badge,
          { scale: 0.6, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(3)' }
        );
      },
    });
  }

  /* Pointer tilt on the featured card (desktop only) */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const xTo = gsap.quickTo(featured, 'rotationY', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(featured, 'rotationX', { duration: 0.5, ease: 'power3.out' });
  gsap.set(featured, { transformPerspective: 800, transformOrigin: '50% 50%' });

  featured.addEventListener('mousemove', (e) => {
    const r  = featured.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width  - 0.5;
    const py = (e.clientY - r.top)  / r.height - 0.5;
    xTo(px * 7); yTo(py * -7);
  });
  featured.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
}

/* ============================================================
   SECTION 06 — FAQ accordion
   ============================================================ */
function initFaqAccordion() {
  const items = document.querySelectorAll('.svc-faq__item');
  if (!items.length) return;

  items.forEach(item => {
    const btn   = item.querySelector('.svc-faq__q');
    const panel = item.querySelector('.svc-faq__a');
    if (!btn || !panel) return;

    panel.style.height = '0px';

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all others */
      items.forEach(other => {
        if (other === item) return;
        const ob = other.querySelector('.svc-faq__q');
        const op = other.querySelector('.svc-faq__a');
        if (ob && ob.getAttribute('aria-expanded') === 'true') {
          ob.setAttribute('aria-expanded', 'false');
          closePanel(op);
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      isOpen ? closePanel(panel) : openPanel(panel);
    });
  });

  function openPanel(panel) {
    const h = panel.scrollHeight;
    if (window.gsap) {
      gsap.to(panel, { height: h, duration: 0.42, ease: 'power2.out',
        onComplete: () => { panel.style.height = 'auto'; }
      });
    } else {
      panel.style.height = h + 'px';
    }
  }

  function closePanel(panel) {
    panel.style.height = panel.scrollHeight + 'px';
    panel.offsetHeight; /* force reflow */
    if (window.gsap) {
      gsap.to(panel, { height: 0, duration: 0.32, ease: 'power2.in' });
    } else {
      panel.style.height = '0px';
    }
  }
}

/* ============================================================
   SECTION 06 — FAQ category filters
   ============================================================ */
function initFaqFilters() {
  const filters = document.querySelectorAll('.svc-faq-filter');
  const items   = document.querySelectorAll('.svc-faq__item');
  if (!filters.length || !items.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('is-active'));
      btn.classList.add('is-active');

      const cat = btn.dataset.filter;

      items.forEach(item => {
        /* Close any open panel before hiding */
        const faqBtn   = item.querySelector('.svc-faq__q');
        const faqPanel = item.querySelector('.svc-faq__a');
        if (faqBtn && faqBtn.getAttribute('aria-expanded') === 'true') {
          faqBtn.setAttribute('aria-expanded', 'false');
          if (faqPanel) faqPanel.style.height = '0px';
        }

        if (cat === 'all' || item.dataset.category === cat) {
          item.classList.remove('is-hidden');
          /* Animate back in */
          if (window.gsap) {
            gsap.fromTo(item, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
          }
        } else {
          item.classList.add('is-hidden');
        }
      });
    });
  });
}

/* ============================================================
   SECTION 07 — Testimonial carousel
   ============================================================ */
function initTestimonialCarousel() {
  const track    = document.getElementById('storiesTrack');
  const prevBtn  = document.getElementById('storiesPrev');
  const nextBtn  = document.getElementById('storiesNext');
  const dotsWrap = document.getElementById('storiesDots');
  if (!track || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll('.svc-story');
  const total  = slides.length;
  if (!total) return;

  let current    = 0;
  let autoTimer  = null;
  const AUTO_MS  = 5500;

  function goTo(index, animate = true) {
    /* Clamp & wrap */
    index = ((index % total) + total) % total;
    current = index;

    /* Translate by full carousel width per slide */
    const carouselWidth = track.parentElement.offsetWidth;
    const xPx = -(index * carouselWidth);

    if (animate && window.gsap) {
      gsap.to(track, {
        x: xPx,
        duration: 0.6,
        ease: 'power3.inOut',
      });
    } else {
      track.style.transform = `translateX(${xPx}px)`;
    }

    /* Dots */
    const dots = dotsWrap ? dotsWrap.querySelectorAll('.svc-stories__dot') : [];
    dots.forEach((d, i) => {
      const active = i === index;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', String(active));
    });
  }

  /* Arrow buttons */
  prevBtn.addEventListener('click', () => { resetAuto(); goTo(current - 1); });
  nextBtn.addEventListener('click', () => { resetAuto(); goTo(current + 1); });

  /* Dot navigation */
  if (dotsWrap) {
    dotsWrap.querySelectorAll('.svc-stories__dot').forEach((dot, i) => {
      dot.addEventListener('click', () => { resetAuto(); goTo(i); });
    });
  }

  /* Touch/swipe support */
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) > 50) { resetAuto(); goTo(current + (delta < 0 ? 1 : -1)); }
  }, { passive: true });

  /* Keyboard arrow support on the carousel container */
  const carousel = document.getElementById('storiesCarousel');
  if (carousel) {
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { resetAuto(); goTo(current - 1); }
      if (e.key === 'ArrowRight') { resetAuto(); goTo(current + 1); }
    });
  }

  /* Auto-advance */
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), AUTO_MS);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  /* Pause auto on hover */
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', () => startAuto());
  }

  /* Init */
  goTo(0, false);
  startAuto();

  /* Recalculate position on resize */
  window.addEventListener('resize', () => {
    goTo(current, false);
  });
}
