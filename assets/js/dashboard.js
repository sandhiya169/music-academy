/* ==========================================================
   CADENCE CONSERVATORY — dashboard.js
   Shared behaviour for the Student + Admin dashboards.
   - Sidebar menu items swap the visible panel WITHOUT leaving
     the page (no navigation, just show/hide + active state).
   - Logout / Back to Home are the only sidebar links that
     actually navigate.
   - Every other actionable button inside dashboard content
     (marked with .js-stub) goes to 404.html, per spec.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  initMobileSidebar();
  initPanelSwitching();
  initStubButtons();
  initSearchFilter();
  initUserEmail();
  initLeaveForm();
});

/* ---------- Mobile sidebar open/close ---------- */
function initMobileSidebar(){
  const toggle = document.getElementById('dashMobileToggle');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');
  if (!toggle || !sidebar || !overlay) return;

  const open = () => { sidebar.classList.add('is-open'); overlay.classList.add('is-open'); };
  const close = () => { sidebar.classList.remove('is-open'); overlay.classList.remove('is-open'); };

  toggle.addEventListener('click', open);
  overlay.addEventListener('click', close);
  sidebar.querySelectorAll('.dash-nav__item').forEach(item => item.addEventListener('click', close));
}

/* ---------- Sidebar menu → in-page panel switching ---------- */
function initPanelSwitching(){
  const navItems = document.querySelectorAll('[data-panel-target]');
  const panels = document.querySelectorAll('.dash-panel');
  const pageTitle = document.getElementById('dashPageTitle');
  const pageDesc = document.getElementById('dashPageDesc');
  if (!navItems.length || !panels.length) return;

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.panelTarget;

      navItems.forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');

      panels.forEach(panel => {
        panel.classList.toggle('is-active', panel.id === targetId);
      });

      if (pageTitle && item.dataset.title) pageTitle.innerHTML = item.dataset.title;
      if (pageDesc && item.dataset.desc) pageDesc.textContent = item.dataset.desc;

      const activePanel = document.getElementById(targetId);
      if (activePanel) activePanel.scrollIntoView({ block: 'start', behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ---------- Generic content buttons → 404 ---------- */
function initStubButtons(){
  document.querySelectorAll('.js-stub').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '404.html';
    });
  });
}

/* ---------- Simple client-side search filter for tables/lists ---------- */
function initSearchFilter(){
  document.querySelectorAll('[data-filter-input]').forEach(input => {
    const targetSelector = input.dataset.filterInput;
    const rows = document.querySelectorAll(targetSelector);

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  });
}

/* ---------- Show logged-in email in the header + sidebar ---------- */
function initUserEmail(){
  const email = sessionStorage.getItem('dashUserEmail');
  if (!email) return;

  /* Header chip (desktop) */
  const headerChip = document.getElementById('dashUserEmailChip');
  if (headerChip) {
    headerChip.textContent = email;
    headerChip.setAttribute('title', `Signed in as ${email}`);
  }

  /* Sidebar chip (mobile) */
  const sidebarChip = document.getElementById('dashSidebarEmail');
  if (sidebarChip) {
    sidebarChip.textContent = email;
    sidebarChip.setAttribute('title', `Signed in as ${email}`);
  }
}

/* ---------- Leave Request form validation ---------- */
function initLeaveForm(){
  const form = document.getElementById('leaveRequestForm');
  if (!form) return;

  const programEl   = document.getElementById('leaveProgram');
  const dateEl      = document.getElementById('leaveDate');
  const reasonEl    = document.getElementById('leaveReason');
  const hintReason  = document.getElementById('hint-reason');
  const successMsg  = document.getElementById('leaveSuccess');
  const submitBtn   = document.getElementById('leaveSubmitBtn');

  /* -- Character counter for textarea -- */
  if (reasonEl && hintReason) {
    reasonEl.addEventListener('input', () => {
      hintReason.textContent = `${reasonEl.value.length} / 300`;
    });
  }

  /* -- Inline validation helpers -- */
  function setFieldState(groupId, errorId, isValid, message = '') {
    const group = document.getElementById(groupId);
    const errEl = document.getElementById(errorId);
    if (!group || !errEl) return;
    group.classList.toggle('is-invalid', !isValid);
    group.classList.toggle('is-valid', isValid);
    errEl.textContent = isValid ? '' : message;
  }

  function validateProgram() {
    const ok = programEl.value !== '';
    setFieldState('fg-program', 'err-program', ok, 'Please select a program.');
    return ok;
  }

  function validateDate() {
    const val = dateEl.value;
    if (!val) {
      setFieldState('fg-date', 'err-date', false, 'Please choose a date of absence.');
      return false;
    }
    const chosen  = new Date(val);
    const today   = new Date();
    today.setHours(0, 0, 0, 0);
    if (chosen < today) {
      setFieldState('fg-date', 'err-date', false, 'Date of absence must be today or in the future.');
      return false;
    }
    // Don't allow more than 1 year ahead
    const maxDate = new Date(today);
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (chosen > maxDate) {
      setFieldState('fg-date', 'err-date', false, 'Date cannot be more than one year ahead.');
      return false;
    }
    setFieldState('fg-date', 'err-date', true);
    return true;
  }

  /* -- Live validation on blur -- */
  programEl.addEventListener('change', validateProgram);
  dateEl.addEventListener('change', validateDate);
  dateEl.addEventListener('blur', validateDate);

  /* -- Form submission -- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Clear previous success message
    if (successMsg) successMsg.textContent = '';

    const okProgram = validateProgram();
    const okDate    = validateDate();

    if (!okProgram || !okDate) {
      // Focus the first invalid field
      if (!okProgram) programEl.focus();
      else if (!okDate) dateEl.focus();
      return;
    }

    /* -- Success state -- */
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }

    // Reset fields, then redirect to 404
    setTimeout(() => {
      form.reset();
      if (hintReason) hintReason.textContent = '0 / 300';
      ['fg-program', 'fg-date'].forEach(id => {
        const g = document.getElementById(id);
        if (g) g.classList.remove('is-valid', 'is-invalid');
      });
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Leave Request';
      }
      window.location.href = '404.html';
    }, 600);
  });
}
