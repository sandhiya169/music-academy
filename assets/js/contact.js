/* ==========================================================
   CADENCE CONSERVATORY — contact.js
   Page-specific behaviour for the Contact & Enrollment page.
   Uses GSAP for hero/map/button motion and AOS for on-scroll
   reveals of cards, department tiles and the FAQ list.
   Assumes script.js (shared header/footer/back-to-top logic)
   is loaded before this file.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initHeroMotion();
  initOpenStatus();
  initMapPin();
  initCustomSelect();
  initFaqAccordion();
  initContactFormGsap();
});

/* ---------- AOS init ---------- */
function initAOS(){
  if (typeof AOS === 'undefined') return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    disable: reduceMotion
  });
}

/* ---------- Hero: staff lines draw in + title/lede/links stagger ---------- */
function initHeroMotion(){
  if (typeof gsap === 'undefined') return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const lines = document.querySelectorAll('#cStaffLines line');
  if (lines.length){
    lines.forEach(line => {
      const len = line.getTotalLength ? line.getTotalLength() : 1200;
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.to(lines, {
      strokeDashoffset: 0,
      duration: 1.4,
      ease: 'power2.out',
      stagger: 0.08,
      delay: 0.1
    });
  }

  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.c-hero__eyebrow', { opacity: 0, y: 14, duration: 0.6 }, 0.15)
    .from('#cHeroTitle', { opacity: 0, y: 26, duration: 0.8 }, 0.28)
    .from('.c-hero__lede', { opacity: 0, y: 18, duration: 0.7 }, 0.5)
    .from('.c-quicklink', { opacity: 0, y: 14, duration: 0.5, stagger: 0.1 }, 0.68);
}

/* ---------- Studio open/closed status badge ---------- */
function initOpenStatus(){
  const el = document.getElementById('cOpenStatus');
  if (!el) return;

  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday
  const hour = now.getHours() + now.getMinutes() / 60;
  const isMonday = day === 1;
  const withinHours = hour >= 9 && hour < 20;
  const isOpenNow = !isMonday && withinHours;

  el.textContent = isOpenNow ? 'Open now' : 'Currently closed';
  el.classList.add(isOpenNow ? 'is-open' : 'is-closed');
}

/* ---------- Map pin: gentle bounce + hover pulse via GSAP ---------- */
function initMapPin(){
  const pin = document.getElementById('cMapPin');
  if (!pin) return;

  if (typeof gsap === 'undefined') return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  gsap.to(pin, {
    y: -8,
    duration: 1.1,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });
}

/* ---------- Floating labels: keep <select> label state in sync ---------- */
function initFloatingLabels(){
  const select = document.getElementById('cProgram');
  if (!select) return;
  const sync = () => {
    select.classList.toggle('has-value', !!select.value);
  };
  select.addEventListener('change', sync);
  sync();
}

/* ---------- Custom Program Select ---------- */
function initCustomSelect() {
  const wrap = document.getElementById('cProgramSelect');
  if (!wrap) return;

  const hiddenInput = wrap.querySelector('#cProgram');
  const valueEl     = wrap.querySelector('.c-custom-select__value');
  const options     = wrap.querySelectorAll('.c-custom-select__option');

  function openSelect() {
    wrap.classList.add('is-open');
    wrap.setAttribute('aria-expanded', 'true');
  }

  function closeSelect() {
    wrap.classList.remove('is-open');
    wrap.setAttribute('aria-expanded', 'false');
  }

  function selectOption(opt) {
    const value = opt.dataset.value;
    const label = opt.querySelector('strong').textContent;

    // Update hidden input & value display
    hiddenInput.value = value;
    valueEl.textContent = label;
    wrap.classList.add('has-value');

    // Update aria + selected state
    options.forEach(o => {
      o.classList.remove('is-selected');
      o.setAttribute('aria-selected', 'false');
    });
    opt.classList.add('is-selected');
    opt.setAttribute('aria-selected', 'true');

    closeSelect();

    // Animate the trigger with GSAP if available
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(wrap.querySelector('.c-custom-select__trigger'),
        { y: 3, opacity: 0.6 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }

  // Toggle on trigger click
  wrap.querySelector('.c-custom-select__trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    wrap.classList.contains('is-open') ? closeSelect() : openSelect();
  });

  // Option click
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectOption(opt);
    });
    opt.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(opt.querySelector('.c-custom-select__opt-icon'), {
          scale: 1.08, duration: 0.2, ease: 'power2.out'
        });
      }
    });
    opt.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(opt.querySelector('.c-custom-select__opt-icon'), {
          scale: 1, duration: 0.2, ease: 'power2.out'
        });
      }
    });
  });

  // Keyboard navigation
  wrap.addEventListener('keydown', (e) => {
    const isOpen = wrap.classList.contains('is-open');
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      isOpen ? closeSelect() : openSelect();
    }
    if (e.key === 'Escape') closeSelect();
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && isOpen) {
      e.preventDefault();
      const selected = wrap.querySelector('.c-custom-select__option.is-selected') || options[0];
      const arr = Array.from(options);
      const idx = arr.indexOf(selected);
      const next = e.key === 'ArrowDown'
        ? arr[Math.min(idx + 1, arr.length - 1)]
        : arr[Math.max(idx - 1, 0)];
      selectOption(next);
      openSelect(); // keep open while navigating
    }
  });

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) closeSelect();
  });
}

/* ---------- FAQ accordion with GSAP height animation ---------- */
function initFaqAccordion(){
  const items = document.querySelectorAll('.c-faq-item');
  if (!items.length) return;

  /*
   * Wrap each answer's content in a .c-faq-inner div (if not already).
   * We animate the outer .c-faq-item__a height.
   * We measure from the inner wrapper — it has no height/overflow constraints.
   */
  items.forEach(item => {
    const answer = item.querySelector('.c-faq-item__a');
    if (!answer.querySelector('.c-faq-inner')) {
      const inner = document.createElement('div');
      inner.className = 'c-faq-inner';
      while (answer.firstChild) inner.appendChild(answer.firstChild);
      answer.appendChild(inner);
    }

    const btn    = item.querySelector('.c-faq-item__q');
    const inner  = answer.querySelector('.c-faq-inner');
    const isOpen = item.classList.contains('is-open');

    // Inner div is always unconstrained — its offsetHeight is the real content height
    const fullH = inner.offsetHeight;
    answer._fullH = fullH;

    answer.style.height   = isOpen ? fullH + 'px' : '0px';
    answer.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  function getFullH(answer){
    const inner = answer.querySelector('.c-faq-inner');
    // Temporarily unlatch the outer wrapper so inner renders at full height
    answer.style.height = 'auto';
    answer.style.overflow = 'visible';
    const h = inner.offsetHeight;
    // Re-latch before GSAP takes over
    answer.style.height   = '0px';
    answer.style.overflow = 'hidden';
    return h;
  }

  function openItem(item){
    const answer = item.querySelector('.c-faq-item__a');
    const btn    = item.querySelector('.c-faq-item__q');

    gsap.killTweensOf(answer);

    const fullH = getFullH(answer);
    answer._fullH = fullH;

    item.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    answer.style.overflow = 'hidden';

    gsap.fromTo(answer,
      { height: 0 },
      { height: fullH, duration: 0.44, ease: 'power2.out',
        onComplete(){ answer.style.height = 'auto'; }
      }
    );
  }

  function closeItem(item){
    const answer = item.querySelector('.c-faq-item__a');
    const btn    = item.querySelector('.c-faq-item__q');

    gsap.killTweensOf(answer);

    const fromH = parseFloat(answer.style.height) || answer._fullH || 0;
    answer.style.overflow = 'hidden';

    item.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');

    gsap.fromTo(answer,
      { height: fromH },
      { height: 0, duration: 0.32, ease: 'power2.in' }
    );
  }

  items.forEach(item => {
    item.querySelector('.c-faq-item__q').addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      items.forEach(other => {
        if (other !== item && other.classList.contains('is-open')) closeItem(other);
      });
      isOpen ? closeItem(item) : openItem(item);
    });
  });
}

/* ---------- Contact form: per-field validation + redirect to 404 on success ---------- */
function initContactFormGsap(){
  const form = document.getElementById('cContactForm');
  const note = document.getElementById('cFormNote');
  const btn  = document.getElementById('cSubmitBtn');
  if (!form || !note || !btn) return;

  const hasGsap = typeof gsap !== 'undefined';

  /* ── helpers ── */
  function getError(field) {
    return field.closest('.c-form-group, .c-custom-select')
      ?.querySelector('.c-field-error');
  }

  function showError(field, msg) {
    const wrap = field.closest('.c-form-group, .c-custom-select');
    if (!wrap) return;
    wrap.classList.add('has-error');
    let errEl = wrap.querySelector('.c-field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'c-field-error';
      errEl.setAttribute('role', 'alert');
      wrap.appendChild(errEl);
    }
    errEl.textContent = msg;
    if (hasGsap) {
      gsap.fromTo(errEl, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
    }
  }

  function clearError(field) {
    const wrap = field.closest('.c-form-group, .c-custom-select');
    if (!wrap) return;
    wrap.classList.remove('has-error');
    const errEl = wrap.querySelector('.c-field-error');
    if (errEl) errEl.textContent = '';
  }

  /* ── live clear on interaction ── */
  ['#cName', '#fmsg'].forEach(sel => {
    const el = form.querySelector(sel);
    if (el) el.addEventListener('input', () => clearError(el));
  });

  /* ── phone: numbers only, max 10 digits ── */
  const phoneInput = form.querySelector('#fphone');
  if (phoneInput) {
    phoneInput.addEventListener('keydown', (e) => {
      const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
      if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  /* ── email: strip spaces live + validate format on blur ── */
  const emailInput = form.querySelector('#femail');
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.value = emailInput.value.replace(/\s/g, '');
      clearError(emailInput);
    });
    emailInput.addEventListener('blur', () => {
      if (!emailInput.value) return;
      const valid = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(emailInput.value.trim());
      if (!valid) {
        showError(emailInput, 'Enter a valid email address (e.g. name@example.com).');
      } else {
        clearError(emailInput);
      }
    });
  }

  // Clear program error when an option is chosen
  const programWrap = document.getElementById('cProgramSelect');
  if (programWrap) {
    programWrap.querySelectorAll('.c-custom-select__option').forEach(opt => {
      opt.addEventListener('click', () => {
        programWrap.classList.remove('has-error');
        programWrap.querySelectorAll('.c-field-error').forEach(el => el.remove());
      });
    });
  }

  /* ── validation rules ── */
  function validateAll() {
    let valid = true;

    // Full Name
    const nameEl = form.querySelector('#cName');
    if (!nameEl.value.trim()) {
      showError(nameEl, 'Full name is required.');
      valid = false;
    } else if (nameEl.value.trim().length < 2) {
      showError(nameEl, 'Please enter your full name.');
      valid = false;
    } else {
      clearError(nameEl);
    }

    // Phone
    const phoneEl = form.querySelector('#fphone');
    const phoneVal = phoneEl.value.trim().replace(/\D/g, '');
    if (!phoneEl.value.trim()) {
      showError(phoneEl, 'Phone number is required.');
      valid = false;
    } else if (!/^\d{10}$/.test(phoneVal)) {
      showError(phoneEl, 'Enter a valid 10-digit phone number.');
      valid = false;
    } else {
      clearError(phoneEl);
    }

    // Email
    const emailEl = form.querySelector('#femail');
    const emailVal = emailEl.value.trim();
    if (!emailVal) {
      showError(emailEl, 'Email address is required.');
      valid = false;
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(emailVal)) {
      showError(emailEl, 'Enter a valid email address.');
      valid = false;
    } else {
      clearError(emailEl);
    }

    // Program (custom select)
    const programInput = form.querySelector('#cProgram');
    const selectWrap   = document.getElementById('cProgramSelect');
    if (selectWrap) {
      // Remove any stale duplicate error elements first
      selectWrap.querySelectorAll('.c-field-error').forEach(el => el.remove());

      if (!programInput.value) {
        selectWrap.classList.add('has-error');
        const errEl = document.createElement('span');
        errEl.className = 'c-field-error';
        errEl.setAttribute('role', 'alert');
        errEl.textContent = 'Please select a program of interest.';
        selectWrap.appendChild(errEl);
        if (hasGsap) gsap.fromTo(errEl, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' });
        valid = false;
      } else {
        selectWrap.classList.remove('has-error');
      }
    }

    return valid;
  }

  /* ── submit handler ── */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    note.textContent = '';

    const isValid = validateAll();

    if (!isValid) {
      // Shake the form
      if (hasGsap) {
        gsap.fromTo(form, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }
      // Focus the first invalid field
      const firstErr = form.querySelector('.has-error input, .has-error textarea, .has-error');
      if (firstErr) firstErr.focus();
      return;
    }

    /* ── Success: animate btn, reset form, redirect ── */
    btn.classList.add('is-sent');
    btn.disabled = true;

    if (hasGsap) {
      gsap.timeline()
        .to(btn, { scale: 0.97, duration: 0.12, ease: 'power1.out' })
        .to(btn, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
    }

    // Reset form fields
    form.reset();

    // Reset custom select UI
    const selectWrap = document.getElementById('cProgramSelect');
    if (selectWrap) {
      selectWrap.classList.remove('has-value', 'has-error');
      selectWrap.querySelector('.c-custom-select__value').textContent = 'Program of Interest';
      const hiddenInput = selectWrap.querySelector('#cProgram');
      if (hiddenInput) hiddenInput.value = '';
      selectWrap.querySelectorAll('.c-custom-select__option').forEach(o => {
        o.classList.remove('is-selected');
        o.setAttribute('aria-selected', 'false');
      });
      selectWrap.querySelectorAll('.c-field-error').forEach(el => el.remove());
    }

    // Clear all inline errors
    form.querySelectorAll('.c-field-error').forEach(el => el.remove());
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));

    // Redirect to 404 page after a short delay (so animation is visible).
    // Always re-enable the button so the form stays usable if navigation fails.
    setTimeout(() => {
      window.location.href = '404.html';
      // Re-enable after a further tick in case redirect doesn't fire (e.g. local dev)
      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('is-sent');
      }, 100);
    }, 600);
  });
}