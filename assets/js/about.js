/* ============================================================
   Stackly Music Academy — about.js
   GSAP + ScrollTrigger animations for the redesigned About page.
   Sections covered:
     A1. Hero  — title line reveal, eyebrow draw, CTA fade
     A2. Philosophy — item reveal: number count-up + body slide
     A3. Alumni marquee — GSAP-driven infinite scroll, slow on hover
     A4. Numbers — animated counter + track bar on scroll entry
     A5. Approach rows — image parallax + body stagger
     A6. Faculty rows — stagger slide + quote reveal on hover
     A7. Press — stagger entrance + quote mark scale
     A8. CTA — staff lines draw-in, heading split reveal
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // AOS for generic fade-up fallbacks
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: reduceMotion
    });
  }

  // Register ScrollTrigger once
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  initHero(reduceMotion);
  initPhilosophy(reduceMotion);
  initAlumniMarquee(reduceMotion);
  initNumbers(reduceMotion);
  initApproach(reduceMotion);
  initFaculty(reduceMotion);
  initPress(reduceMotion);
  initCTA(reduceMotion);
});

/* ============================================================
   A1. HERO
   - Each title line clips in from below (overflow:hidden mask)
   - Eyebrow line draws left-to-right
   - Lede + CTA fade up after title
   ============================================================ */
function initHero(reduceMotion) {
  if (typeof gsap === 'undefined' || reduceMotion) return;

  const lines    = document.querySelectorAll('.a-hero__line');
  const eyebrowL = document.querySelector('.a-hero__eyebrow-line');
  const eyebrow  = document.querySelector('.a-hero__eyebrow');
  const lede     = document.querySelector('.a-hero__lede');
  const cta      = document.querySelector('.a-hero__cta');
  const strip    = document.querySelector('.a-hero__img-strip');
  const note     = document.querySelector('.a-hero__note');

  // Wrap each line's text in an inner span for clip reveal
  lines.forEach(line => {
    const inner = document.createElement('span');
    inner.style.cssText = 'display:block; will-change:transform;';
    inner.textContent = line.textContent;
    line.textContent = '';
    line.style.overflow = 'hidden';
    line.style.display  = 'block';
    line.appendChild(inner);
  });

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Eyebrow: line draws then text fades
  if (eyebrowL) {
    gsap.set(eyebrowL, { scaleX: 0, transformOrigin: 'left center' });
    tl.to(eyebrowL, { scaleX: 1, duration: 0.55 }, 0.1);
  }
  if (eyebrow) {
    gsap.set(eyebrow, { opacity: 0 });
    tl.to(eyebrow, { opacity: 1, duration: 0.4 }, 0.25);
  }

  // Title lines clip reveal
  const inners = document.querySelectorAll('.a-hero__line span');
  if (inners.length) {
    gsap.set(inners, { y: '105%' });
    tl.to(inners, {
      y: '0%',
      duration: 0.85,
      stagger: 0.1,
      ease: 'power4.out'
    }, 0.3);
  }

  // Lede + CTA
  if (lede)  { gsap.set(lede,  { opacity: 0, y: 16 }); tl.to(lede,  { opacity: 1, y: 0, duration: 0.6 }, 0.85); }
  if (cta)   { gsap.set(cta,   { opacity: 0, y: 12 }); tl.to(cta,   { opacity: 1, y: 0, duration: 0.5 }, 1.0);  }

  // Image strip slide up
  if (strip) {
    gsap.from(strip, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.6 });
  }

  // Floating note drift in
  if (note) {
    gsap.from(note, { opacity: 0, scale: 0.6, duration: 1.2, ease: 'elastic.out(1, 0.5)', delay: 0.9 });
  }
}

/* ============================================================
   A2. PHILOSOPHY
   Each item: number ghost fades up, heading slides from left,
   paragraph fades up — triggered by ScrollTrigger per item.
   ============================================================ */
function initPhilosophy(reduceMotion) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) return;

  const items = document.querySelectorAll('.a-phil-item');
  if (!items.length) return;

  items.forEach((item, i) => {
    const num  = item.querySelector('.a-phil-item__num');
    const h3   = item.querySelector('h3');
    const p    = item.querySelector('p');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: item,
        start: 'top 78%',
        toggleActions: 'play none none none'
      },
      defaults: { ease: 'power3.out' }
    });

    if (num) {
      gsap.set(num, { opacity: 0, y: 20 });
      tl.to(num, { opacity: 0.07, y: 0, duration: 0.5 }, 0);
    }
    if (h3) {
      gsap.set(h3, { opacity: 0, x: -28 });
      tl.to(h3, { opacity: 1, x: 0, duration: 0.65 }, 0.1);
    }
    if (p) {
      gsap.set(p, { opacity: 0, y: 14 });
      tl.to(p, { opacity: 0.72, y: 0, duration: 0.55 }, 0.25);
    }
  });
}

/* ============================================================
   A3. ALUMNI MARQUEE
   Replaces CSS animation with GSAP for tighter control.
   Hover slows to 0.2× speed; reverse row runs opposite.
   ============================================================ */
function initAlumniMarquee(reduceMotion) {
  const row1 = document.getElementById('aAlumRow1');
  const row2 = document.getElementById('aAlumRow2');
  if (!row1 || !row2) return;

  if (reduceMotion) {
    [row1, row2].forEach(r => { r.style.animation = 'none'; });
    return;
  }

  if (typeof gsap === 'undefined') return;

  function buildMarquee(track, direction, duration) {
    const reels = track.querySelectorAll('.a-alumni__reel');
    if (reels.length < 2) return null;
    track.style.animation = 'none';
    track.style.display   = 'flex';
    track.style.width     = 'max-content';

    const reelW = reels[0].scrollWidth;
    gsap.set(track, { x: direction === 'fwd' ? 0 : -reelW });

    return gsap.to(track, {
      x: direction === 'fwd' ? -reelW : 0,
      duration,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % reelW)
      }
    });
  }

  const tween1 = buildMarquee(row1, 'fwd', 36);
  const tween2 = buildMarquee(row2, 'rev', 30);

  // Hover: slow down
  [{ el: row1, t: tween1 }, { el: row2, t: tween2 }].forEach(({ el, t }) => {
    if (!t) return;
    el.addEventListener('mouseenter', () => gsap.to(t, { timeScale: 0.2, duration: 0.5, ease: 'power2.out' }));
    el.addEventListener('mouseleave', () => gsap.to(t, { timeScale: 1,   duration: 0.5, ease: 'power2.out' }));
  });

  // Fade in on section entry
  const section = document.getElementById('alumni');
  if (!section || typeof IntersectionObserver === 'undefined') return;

  gsap.set([row1, row2], { opacity: 0 });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      gsap.to([row1, row2], { opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.15 });
      io.disconnect();
    });
  }, { threshold: 0.15 });
  io.observe(section);
}

/* ============================================================
   A4. BY THE NUMBERS
   - Each .a-num counts from 0 to data-count when it enters view
   - Bottom track bar animates width to 100% in sync
   - Uses IntersectionObserver (no ScrollTrigger dependency)
   ============================================================ */
function initNumbers(reduceMotion) {
  const nums = document.querySelectorAll('.a-num');
  if (!nums.length) return;

  function countUp(el, target, duration) {
    const valEl  = el.querySelector('.a-num__val');
    const track  = el.querySelector('.a-num__track');
    if (!valEl) return;

    el.classList.add('is-counted');

    if (reduceMotion) {
      valEl.textContent = target.toLocaleString();
      return;
    }

    if (typeof gsap !== 'undefined') {
      const obj = { n: 0 };
      gsap.to(obj, {
        n: target,
        duration,
        ease: 'power2.out',
        onUpdate() {
          valEl.textContent = Math.round(obj.n).toLocaleString();
        },
        onComplete() {
          valEl.textContent = target.toLocaleString();
        }
      });
    } else {
      // Pure JS fallback
      const start = performance.now();
      function step(now) {
        const pct = Math.min((now - start) / (duration * 1000), 1);
        valEl.textContent = Math.round(pct * target).toLocaleString();
        if (pct < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
  }

  if (typeof IntersectionObserver === 'undefined') {
    nums.forEach(n => countUp(n, parseInt(n.querySelector('[data-count]')?.dataset.count || 0, 10), 1.8));
    return;
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const valEl  = el.querySelector('[data-count]');
      const target = parseInt(valEl?.dataset.count || 0, 10);
      const dur    = target > 500 ? 2.2 : 1.6;
      countUp(el, target, dur);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(n => io.observe(n));
}

/* ============================================================
   A5. APPROACH ROWS
   - Images: subtle parallax (scroll down moves image up slightly)
   - Body text: heading + paragraph + tags stagger in
   ============================================================ */
function initApproach(reduceMotion) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) return;

  const rows = document.querySelectorAll('.a-appr-row');
  if (!rows.length) return;

  rows.forEach(row => {
    const img  = row.querySelector('.a-appr-row__img img');
    const h3   = row.querySelector('h3');
    const p    = row.querySelector('p');
    const tags = row.querySelector('.a-appr-row__tags');

    // Parallax on image
    if (img) {
      gsap.fromTo(img,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: row,
            start: 'top bottom',
            end:   'bottom top',
            scrub: true
          }
        }
      );
    }

    // Body stagger entrance
    const bodyItems = [h3, p, tags].filter(Boolean);
    if (bodyItems.length) {
      gsap.set(bodyItems, { opacity: 0, y: 24 });
      gsap.to(bodyItems, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: row,
          start: 'top 72%',
          toggleActions: 'play none none none'
        }
      });
    }
  });
}

/* ============================================================
   A6. FACULTY ROWS
   - Stagger slide-in from bottom on scroll entry
   - Hover: quote border-left scaleY grows (handled in CSS)
   - Row counter number fades in with slight delay
   ============================================================ */
function initFaculty(reduceMotion) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) return;

  const rows = document.querySelectorAll('.a-fac-row');
  if (!rows.length) return;

  gsap.set(rows, { opacity: 0, y: 28 });

  ScrollTrigger.batch(rows, {
    start: 'top 82%',
    onEnter(batch) {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power3.out'
      });
    },
    once: true
  });

  // Heading entrance
  const heading = document.querySelector('.a-faculty__heading');
  const eyebrow = document.querySelector('.a-faculty .eyebrow');
  if (heading) {
    gsap.from(heading, {
      opacity: 0, y: 24, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 80%', toggleActions: 'play none none none' }
    });
  }
  if (eyebrow) {
    gsap.from(eyebrow, {
      opacity: 0, x: -16, duration: 0.5, ease: 'power3.out',
      scrollTrigger: { trigger: eyebrow, start: 'top 82%', toggleActions: 'play none none none' }
    });
  }
}

/* ============================================================
   A7. PRESS QUOTES
   - Wide quote: large mark scales up on entry
   - All quotes: stagger fade up
   - Source lines slide up last
   ============================================================ */
function initPress(reduceMotion) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) return;

  const quotes = document.querySelectorAll('.a-press-quote');
  if (!quotes.length) return;

  quotes.forEach((quote, i) => {
    const mark   = quote.querySelector('.a-press-quote__mark');
    const text   = quote.querySelector('.a-press-quote__text');
    const source = quote.querySelector('.a-press-quote__source');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: quote,
        start: 'top 78%',
        toggleActions: 'play none none none'
      },
      defaults: { ease: 'power3.out' }
    });

    if (mark) {
      gsap.set(mark, { scale: 0.5, opacity: 0 });
      tl.to(mark, { scale: 1, opacity: 0.06, duration: 0.7 }, 0);
    }
    if (text) {
      gsap.set(text, { opacity: 0, y: 18 });
      tl.to(text, { opacity: 1, y: 0, duration: 0.65 }, 0.12);
    }
    if (source) {
      gsap.set(source, { opacity: 0, y: 10 });
      tl.to(source, { opacity: 1, y: 0, duration: 0.5 }, 0.3);
    }
  });
}

/* ============================================================
   A8. CTA
   - Staff lines draw in (strokeDashoffset)
   - Heading word-by-word reveal
   - Sub + actions stagger up
   ============================================================ */
function initCTA(reduceMotion) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduceMotion) return;

  const section = document.querySelector('.a-cta');
  if (!section) return;

  // Staff line draw
  const staffLines = section.querySelectorAll('.a-cta__staff line');
  staffLines.forEach(line => {
    const len = 1200; // viewBox width
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.to(staffLines, {
    strokeDashoffset: 0,
    duration: 1.8,
    ease: 'power2.out',
    stagger: 0.12,
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      toggleActions: 'play none none none'
    }
  });

  // Heading lines
  const heading = section.querySelector('.a-cta__heading');
  if (heading) {
    gsap.from(heading, {
      opacity: 0,
      y: 36,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });
  }

  // Sub + actions
  const sub     = section.querySelector('.a-cta__sub');
  const actions = section.querySelector('.a-cta__actions');
  const eyebrow = section.querySelector('.eyebrow');

  const staggerEls = [eyebrow, sub, actions].filter(Boolean);
  if (staggerEls.length) {
    gsap.set(staggerEls, { opacity: 0, y: 20 });
    gsap.to(staggerEls, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        toggleActions: 'play none none none'
      }
    });
  }
}
