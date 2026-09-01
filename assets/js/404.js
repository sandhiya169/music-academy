/* ==========================================================
   CADENCE CONSERVATORY — 404.js
   Page-specific behaviour for the Not Found page.
   Uses GSAP for the "note that fell off the staff" illustration
   (draws the staff, then tumbles a musical note off it and
   into a lazy floating loop) and AOS for the quick-link cards.
   Assumes script.js (shared header/footer/back-to-top logic)
   is loaded before this file.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initAOS(reduceMotion);
  initHeroStaffDraw(reduceMotion);
  initTumblingNote(reduceMotion);
  initTitleReveal(reduceMotion);
});

/* ---------- AOS init ---------- */
function initAOS(reduceMotion){
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50,
    disable: reduceMotion
  });
}

/* ---------- Background staff lines draw in on load ---------- */
function initHeroStaffDraw(reduceMotion){
  if (typeof gsap === 'undefined') return;

  const lines = document.querySelectorAll('#nfStaffLines line');
  if (!lines.length) return;

  if (reduceMotion){
    lines.forEach(l => l.style.strokeDasharray = 'none');
    return;
  }

  lines.forEach(line => {
    const len = line.getTotalLength ? line.getTotalLength() : 1200;
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.to(lines, {
    strokeDashoffset: 0,
    duration: 1.3,
    ease: 'power2.out',
    stagger: 0.07
  });
}

/* ---------- Title / lede entrance ---------- */
function initTitleReveal(reduceMotion){
  if (typeof gsap === 'undefined' || reduceMotion) return;
  gsap.from('#nfTitle', {
    opacity: 0,
    y: 24,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.15
  });
}

/* ---------- The note: tumbles off the mini-staff, then floats and rotates lazily ---------- */
function initTumblingNote(reduceMotion){
  const note = document.getElementById('nfNote');
  const svg = document.getElementById('nfFigureSvg');
  if (!note || !svg) return;

  // Position the note above the staff figure to start (roughly centred, above top line)
  const startX = 260, startY = 30;
  const restX = 300, restY = 205; // resting position below the staff, tipped over

  if (typeof gsap === 'undefined'){
    note.setAttribute('transform', `translate(${restX}, ${restY}) rotate(70)`);
    return;
  }

  gsap.set(note, { x: startX, y: startY, rotation: 0, transformOrigin: '50% 50%' });

  if (reduceMotion){
    gsap.set(note, { x: restX, y: restY, rotation: 70 });
    return;
  }

  const tl = gsap.timeline({ delay: 0.4 });

  tl.to(note, {
      y: startY + 40,
      duration: 0.5,
      ease: 'power1.in'
    })
    .to(note, {
      x: restX,
      y: restY,
      rotation: 70,
      duration: 0.9,
      ease: 'bounce.out'
    }, '<0.05')
    .to(note, {
      y: '+=10',
      rotation: '+=6',
      duration: 1.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
}