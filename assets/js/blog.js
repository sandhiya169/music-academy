/* ==========================================================
   CADENCE CONSERVATORY — blog.js
   Page-specific behaviour for the Journal / Blog page.
   Uses GSAP for the hero's line-by-line title reveal and a
   FLIP-style fade/scale transition when filtering articles by
   category, plus a light client-side search. AOS handles the
   featured card, filter bar, grid entrance and pagination.
   Assumes script.js (shared header/footer/back-to-top logic)
   is loaded before this file.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initAOS(reduceMotion);
  initHeroTitleReveal(reduceMotion);
  initStaffDraw(reduceMotion);
  initCardEntrance(reduceMotion);
  initCategoryFilter(reduceMotion);
  initSearch();
  initSubscribeForm();
  initLoadMore(reduceMotion);

  // New sections
  initVaultMarquee(reduceMotion);
  initReadNext(reduceMotion);
  initFacultyVoices(reduceMotion);
  initTimeline(reduceMotion);
});

/* ---------- AOS init ---------- */
function initAOS(reduceMotion){
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    disable: reduceMotion
  });
}

/* ---------- Hero title: each line masks in from below, word by word ---------- */
function initHeroTitleReveal(reduceMotion){
  if (typeof gsap === 'undefined') return;
  const words = document.querySelectorAll('#bHeroTitle .b-word');
  if (!words.length) return;

  if (reduceMotion){
    gsap.set(words, { opacity: 1, y: 0 });
    return;
  }

  gsap.set(words, { yPercent: 120, opacity: 0 });
  gsap.to(words, {
    yPercent: 0,
    opacity: 1,
    duration: 0.9,
    ease: 'power4.out',
    stagger: 0.06,
    delay: 0.15
  });

  gsap.from('.b-hero__lede', { opacity: 0, y: 16, duration: 0.7, ease: 'power3.out', delay: 0.55 });
}

/* ---------- Background staff lines draw in ---------- */
function initStaffDraw(reduceMotion){
  if (typeof gsap === 'undefined' || reduceMotion) return;
  const lines = document.querySelectorAll('#bStaffLines line');
  if (!lines.length) return;

  lines.forEach(line => {
    const len = line.getTotalLength ? line.getTotalLength() : 1200;
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.to(lines, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out', stagger: 0.07 });
}

/* ---------- Initial grid card entrance (staggered rise) ---------- */
function initCardEntrance(reduceMotion){
  if (typeof gsap === 'undefined' || reduceMotion) return;
  const cards = document.querySelectorAll('.b-grid .b-card');
  if (!cards.length) return;

  gsap.set(cards, { opacity: 0, y: 24 });

  if ('IntersectionObserver' in window){
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting){
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: (i % 3) * 0.08 });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    cards.forEach(c => observer.observe(c));
  } else {
    gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 });
  }
}

/* ---------- Category filter: fade/scale cards out, swap visibility, fade back in ---------- */
function initCategoryFilter(reduceMotion){
  const filterBar = document.getElementById('bFilter');
  const grid = document.getElementById('bGrid');
  const empty = document.getElementById('bEmpty');
  if (!filterBar || !grid) return;

  const buttons = Array.from(filterBar.querySelectorAll('.b-filter__btn'));
  const hasGsap = typeof gsap !== 'undefined';

  let currentSearch = '';

  function applyFilter(category){
    const cards = Array.from(grid.querySelectorAll('.b-card'));
    const visibleCards = cards.filter(card => {
      const matchesCategory = category === 'all' || card.dataset.category === category;
      const matchesSearch = !currentSearch || card.textContent.toLowerCase().includes(currentSearch);
      return matchesCategory && matchesSearch;
    });
    const hiddenCards = cards.filter(c => !visibleCards.includes(c));

    const finish = () => {
      hiddenCards.forEach(c => { c.style.display = 'none'; });
      visibleCards.forEach(c => { c.style.display = ''; });
      empty.hidden = visibleCards.length > 0;

      if (hasGsap && !reduceMotion){
        gsap.fromTo(visibleCards,
          { opacity: 0, y: 18, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power3.out', stagger: 0.02 }
        );
      }
    };

    if (hasGsap && !reduceMotion && cards.some(c => c.style.display !== 'none')){
      gsap.to(cards.filter(c => c.style.display !== 'none'), {
        opacity: 0,
        y: 10,
        scale: 0.97,
        duration: 0.15,
        ease: 'power2.in',
        stagger: 0.01,
        onComplete: finish
      });
    } else {
      finish();
    }
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      applyFilter(btn.dataset.filter);
    });
  });

  filterBar._applyFilter = applyFilter;
  filterBar._getActiveCategory = () => (filterBar.querySelector('.b-filter__btn.is-active') || {}).dataset?.filter || 'all';
  filterBar._setSearch = (val) => { currentSearch = val; };
}

/* ---------- Search box: filters the same grid by title/excerpt text ---------- */
function initSearch(){
  const input = document.getElementById('bSearchInput');
  const filterBar = document.getElementById('bFilter');
  if (!input || !filterBar) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const term = input.value.trim().toLowerCase();
      if (filterBar._setSearch) filterBar._setSearch(term);
      if (filterBar._applyFilter && filterBar._getActiveCategory){
        filterBar._applyFilter(filterBar._getActiveCategory());
      }
    }, 220);
  });
}

/* ---------- Mid-page subscribe form (front-end only demo submission) ---------- */
function initSubscribeForm(){
  const form = document.getElementById('bSubscribeForm');
  const note = document.getElementById('bSubscribeNote');
  if (!form || !note) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.value){
      note.textContent = 'Please enter an email address.';
      return;
    }
    note.textContent = `Thanks — confirmation on its way to ${input.value}.`;
    if (typeof gsap !== 'undefined'){
      gsap.fromTo(note, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
    form.reset();
  });
}


/* ============================================================
   B5. FROM THE VAULT — marquee speed control + GSAP scrub
   ============================================================
   CSS handles the base animation. JS adds:
   - GSAP-driven speed boost on section entry (scrubs in)
   - Mouse-over slowdown using GSAP timeScale
   - Reduced-motion: strips animation entirely
   ============================================================ */
function initVaultMarquee(reduceMotion) {
  const row1 = document.getElementById('bVaultRow1');
  const row2 = document.getElementById('bVaultRow2');
  if (!row1 || !row2) return;

  if (reduceMotion) {
    // Kill CSS animations for users who prefer reduced motion
    [row1, row2].forEach(r => { r.style.animation = 'none'; });
    return;
  }

  if (typeof gsap === 'undefined') return;

  // Speed multiplier objects — GSAP tweens these, CSS animation-duration stays
  // as-is; we use GSAP to tween a CSS custom property on each track instead.
  // Approach: drive transform via GSAP xPercent loop on the first reel.
  // Detach from CSS animation and hand full control to GSAP.

  function buildGsapMarquee(track, direction, duration) {
    // Each track has two identical .b-vault__reel divs for seamless loop
    const reels = track.querySelectorAll('.b-vault__reel');
    if (reels.length < 2) return null;

    // Remove CSS animation — GSAP owns it now
    track.style.animation = 'none';
    track.style.display = 'flex';
    track.style.width = 'max-content';

    const reel = reels[0];
    const reelW = reel.scrollWidth;

    // Place both reels side by side starting at 0
    gsap.set(track, { x: direction === 'fwd' ? 0 : -reelW });

    const tween = gsap.to(track, {
      x: direction === 'fwd' ? -reelW : 0,
      duration,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % reelW)
      }
    });

    return tween;
  }

  const tween1 = buildGsapMarquee(row1, 'fwd', 38);
  const tween2 = buildGsapMarquee(row2, 'rev', 32);

  // Slow down on hover, speed up on leave
  [
    { el: row1, tween: tween1 },
    { el: row2, tween: tween2 }
  ].forEach(({ el, tween }) => {
    if (!tween) return;
    el.addEventListener('mouseenter', () => {
      gsap.to(tween, { timeScale: 0.25, duration: 0.6, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(tween, { timeScale: 1, duration: 0.6, ease: 'power2.out' });
    });
  });

  // Entrance: section scrolls into view → tracks fade + drift in from sides
  const section = document.getElementById('vault');
  if (!section || typeof IntersectionObserver === 'undefined') return;

  gsap.set([row1, row2], { opacity: 0 });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to([row1, row2], {
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          stagger: 0.15
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.15 });

  observer.observe(section);
}

/* ============================================================
   B6. READ NEXT — draggable horizontal scroll carousel
   ============================================================
   - Mouse drag-to-scroll on desktop
   - Prev/Next buttons with GSAP smooth scroll
   - Scroll-progress bar updates on scroll
   - Cards stagger in on section entry
   ============================================================ */
function initReadNext(reduceMotion) {
  const viewport = document.getElementById('bRnViewport');
  const track    = document.getElementById('bRnTrack');
  const btnPrev  = document.getElementById('bRnPrev');
  const btnNext  = document.getElementById('bRnNext');
  const bar      = document.getElementById('bRnBar');
  if (!viewport || !track) return;

  const cards = track.querySelectorAll('.b-rn-card');

  // ── Stagger entrance ──────────────────────────────────────
  if (typeof gsap !== 'undefined' && !reduceMotion) {
    gsap.set(cards, { opacity: 0, y: 28 });

    if (typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const visible = Array.from(cards);
          gsap.to(visible, {
            opacity: 1, y: 0,
            duration: 0.55, ease: 'power3.out',
            stagger: 0.08
          });
          io.disconnect();
        });
      }, { threshold: 0.15 });
      io.observe(viewport);
    }
  }

  // ── Progress bar ──────────────────────────────────────────
  function updateBar() {
    if (!bar) return;
    const max = viewport.scrollWidth - viewport.clientWidth;
    const pct = max > 0 ? (viewport.scrollLeft / max) * 100 : 0;
    bar.style.width = pct + '%';
  }
  viewport.addEventListener('scroll', updateBar, { passive: true });
  updateBar();

  // ── Prev / Next buttons ───────────────────────────────────
  function scrollByCard(dir) {
    const cardW  = cards[0] ? cards[0].offsetWidth + 24 : 300; // card + gap
    const target = viewport.scrollLeft + dir * cardW;

    if (typeof gsap !== 'undefined' && !reduceMotion) {
      gsap.to(viewport, {
        scrollLeft: target,
        duration: 0.55,
        ease: 'power2.inOut',
        onUpdate: updateBar
      });
    } else {
      viewport.scrollBy({ left: dir * cardW, behavior: 'smooth' });
    }
  }

  if (btnPrev) btnPrev.addEventListener('click', () => scrollByCard(-1));
  if (btnNext) btnNext.addEventListener('click', () => scrollByCard(1));

  // Update disabled state
  function updateButtons() {
    if (!btnPrev || !btnNext) return;
    btnPrev.disabled = viewport.scrollLeft <= 0;
    btnNext.disabled = viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 2;
  }
  viewport.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();

  // ── Drag to scroll (desktop) ──────────────────────────────
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;

  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX     = e.pageX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('is-dragging');
    // Kill any running GSAP tween so drag takes over immediately
    if (typeof gsap !== 'undefined') gsap.killTweensOf(viewport);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.pageX - startX;
    viewport.scrollLeft = startScroll - dx;
    updateBar();
    updateButtons();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    viewport.classList.remove('is-dragging');
  });

  // Prevent accidental link clicks after drag
  viewport.addEventListener('click', (e) => {
    const dx = Math.abs(viewport.scrollLeft - startScroll);
    if (dx > 6) e.preventDefault();
  }, true);
}

/* ============================================================
   B7. FACULTY VOICES — interview strip entrance animations
   ============================================================
   - Each row animates: number + quote slide in from left,
     bio block fades in from right, gold bar scaleY grows up
   - Triggered by IntersectionObserver per row
   ============================================================ */
function initFacultyVoices(reduceMotion) {
  const rows = document.querySelectorAll('.b-voice-row');
  if (!rows.length || typeof gsap === 'undefined' || reduceMotion) return;

  rows.forEach(row => {
    const left   = row.querySelector('.b-voice-row__left');
    const right  = row.querySelector('.b-voice-row__right');
    const rule   = row.querySelector('.b-voice-row__rule');

    gsap.set(left,  { opacity: 0, x: -28 });
    gsap.set(right, { opacity: 0, x:  20 });
    if (rule) gsap.set(rule, { scaleY: 0, transformOrigin: 'top center' });
  });

  if (typeof IntersectionObserver === 'undefined') return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const row   = entry.target;
      const left  = row.querySelector('.b-voice-row__left');
      const right = row.querySelector('.b-voice-row__right');
      const rule  = row.querySelector('.b-voice-row__rule');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(left,  { opacity: 1, x: 0, duration: 0.55 },              0)
        .to(right, { opacity: 1, x: 0, duration: 0.5  },              0.12)
        .to(rule,  { scaleY: 1,        duration: 0.6  },              0.05);

      io.unobserve(row);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  rows.forEach(r => io.observe(r));
}

/* ============================================================
   B8. THIS MONTH IN MUSIC — GSAP timeline entry animations
   ============================================================
   - Each entry animates in: date slides from left, dot scales
     in, body fades up — triggered by IntersectionObserver
   - Active entry dot pulses with a GSAP repeat tween
   ============================================================ */
function initTimeline(reduceMotion) {
  const entries = document.querySelectorAll('.b-tl-entry');
  const months  = document.querySelectorAll('.b-tl-month');
  if (!entries.length || typeof gsap === 'undefined') return;

  if (reduceMotion) return;

  // Set initial hidden states
  entries.forEach(entry => {
    const date = entry.querySelector('.b-tl-entry__date');
    const body = entry.querySelector('.b-tl-entry__body');
    const dot  = entry.querySelector('.b-tl-entry__line');
    if (date) gsap.set(date, { opacity: 0, x: -20 });
    if (body) gsap.set(body, { opacity: 0, y: 16 });
    if (dot)  gsap.set(dot,  { scaleY: 0, transformOrigin: 'top center' });
  });

  gsap.set(months, { opacity: 0, x: -16 });

  // Animate each entry as it scrolls into view
  if (typeof IntersectionObserver === 'undefined') return;

  const io = new IntersectionObserver((observations) => {
    observations.forEach(obs => {
      if (!obs.isIntersecting) return;

      const entry = obs.target;
      const date  = entry.querySelector('.b-tl-entry__date');
      const body  = entry.querySelector('.b-tl-entry__body');
      const dot   = entry.querySelector('.b-tl-entry__line');

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (dot)  tl.to(dot,  { scaleY: 1,  duration: 0.35 },          0);
      if (date) tl.to(date, { opacity: 1, x: 0, duration: 0.45 },     0.05);
      if (body) tl.to(body, { opacity: 1, y: 0, duration: 0.5 },      0.15);

      io.unobserve(entry);
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -30px 0px' });

  entries.forEach(e => io.observe(e));

  // Month markers slide in
  const monthIo = new IntersectionObserver((observations) => {
    observations.forEach(obs => {
      if (!obs.isIntersecting) return;
      gsap.to(obs.target, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' });
      monthIo.unobserve(obs.target);
    });
  }, { threshold: 0.5 });

  months.forEach(m => monthIo.observe(m));

  // Pulse the dot of the FIRST entry (today's most recent event)
  const firstDot = entries[0]?.querySelector('.b-tl-entry__line');
  if (firstDot) {
    // Wait for entrance animation to finish, then start pulse
    gsap.delayedCall(1.2, () => {
      gsap.to(firstDot, {
        '--dot-glow': 1,     // purely decorative — we tween the ::before via boxShadow
        duration: 0
      });
      // Pulse boxShadow on the ::before pseudo — GSAP can't target pseudo,
      // so we tween a class toggle instead
      const pulseTl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      pulseTl
        .to(firstDot, { opacity: 0.5, duration: 0.5, ease: 'sine.inOut' })
        .to(firstDot, { opacity: 1,   duration: 0.5, ease: 'sine.inOut' });
    });
  }
}

/* ============================================================
   LOAD MORE — simulated batch load with GSAP entrance
   ============================================================ */
function initLoadMore(reduceMotion) {
  const btn  = document.getElementById('bLoadMore');
  const note = btn ? btn.closest('.b-load-more')?.querySelector('.b-load-more__note') : null;
  const grid = document.getElementById('bGrid');
  if (!btn || !grid) return;

  // Extra articles to inject on each click
  const extraArticles = [
    {
      category: 'technique',
      img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=800&q=80',
      alt: 'Music studio',
      tag: 'Technique',
      readtime: '5 min read',
      title: 'Understanding Dynamics: More Than Just Loud and Soft',
      excerpt: 'A guide to shaping musical phrases with intention — how nuance in volume creates emotional architecture.',
      authorDot: 'AV',
      author: 'Dr. Alissa Vance',
      date: 'Jun 05'
    },
    {
      category: 'news',
      img: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80',
      alt: 'Piano recital hall',
      tag: 'Academy News',
      readtime: '2 min read',
      title: 'New Practice Rooms Open This Term',
      excerpt: 'Six acoustically treated individual practice studios are now available for student booking via the portal.',
      authorDot: 'AD',
      author: 'Administration',
      date: 'May 30'
    },
    {
      category: 'pedagogy',
      img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=800&q=80',
      alt: 'Sheet music',
      tag: 'Pedagogy',
      readtime: '9 min read',
      title: 'Teaching Music Theory to Young Learners',
      excerpt: 'Concrete strategies for making abstract concepts like intervals and harmony tangible for students under twelve.',
      authorDot: 'JR',
      author: 'Jonathan Reed',
      date: 'May 14'
    }
  ];

  let loaded = 0;
  const totalExtra = extraArticles.length;
  const totalArticles = 24; // displayed count

  btn.addEventListener('click', () => {
    if (loaded >= totalExtra) return;

    // Loading state
    btn.classList.add('is-loading');
    btn.disabled = true;

    setTimeout(() => {
      const batch = extraArticles.slice(loaded, loaded + 3);
      const fragment = document.createDocumentFragment();

      batch.forEach(art => {
        const el = document.createElement('article');
        el.className = 'b-card';
        el.dataset.category = art.category;
        el.innerHTML = `
          <a href="404.html" class="b-card__media" tabindex="-1" aria-hidden="true">
            <img src="${art.img}" alt="${art.alt}" loading="lazy">
            <div class="b-card__media-overlay">
              <span class="b-card__read-cta">Read Article <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
            </div>
          </a>
          <div class="b-card__body">
            <div class="b-card__top">
              <span class="b-tag">${art.tag}</span>
              <span class="b-card__readtime">${art.readtime}</span>
            </div>
            <h3><a href="404.html">${art.title}</a></h3>
            <p>${art.excerpt}</p>
            <div class="b-card__footer">
              <div class="b-card__meta">
                <span class="b-card__author-dot">${art.authorDot}</span>
                <span>${art.author}</span>
                <span class="b-card__meta-sep">&bull;</span>
                <span>${art.date}</span>
              </div>
              <a href="404.html" class="b-card__btn">
                Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          </div>`;
        fragment.appendChild(el);
      });

      grid.appendChild(fragment);
      loaded += batch.length;

      // Animate new cards in
      const newCards = Array.from(grid.querySelectorAll('.b-card')).slice(-batch.length);
      if (typeof gsap !== 'undefined' && !reduceMotion) {
        gsap.fromTo(newCards,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.1 }
        );
      }

      // Update note
      const shown = 6 + loaded;
      if (note) note.textContent = `Showing ${shown} of ${totalArticles} articles`;

      // Remove button when all loaded
      btn.classList.remove('is-loading');
      btn.disabled = false;

      if (loaded >= totalExtra) {
        // btn.textContent = 'All articles loaded';
        btn.disabled = true;
        btn.style.opacity = '0.45';
        btn.style.cursor = 'default';
      }
    }, 800); // simulate network delay
  });
}
