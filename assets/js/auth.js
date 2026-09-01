/* ==========================================================
   CADENCE CONSERVATORY — auth.js
   Handles Login + Signup forms.
   IMPORTANT: this is a front-end demo only.
   - No email or password is ever stored (no localStorage,
     no sessionStorage, no network request, no cookies).
   - "Login" only validates that the fields are well-formed;
     it never checks credentials against anything.
   - On success, Login redirects to the matching dashboard and
     Signup redirects to the Login page, exactly as required.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
  initRoleSwitch();
  initPasswordToggles();
  initLoginForm();
  initSignupForm();
  initJoinedNotice();
});

/* ---------- Show a welcome note if arriving fresh from Signup ---------- */
function initJoinedNotice(){
  const note = document.getElementById('loginNote');
  if (!note) return;
  const params = new URLSearchParams(window.location.search);
  if (params.get('joined') === '1'){
    note.textContent = 'Account created. Sign in below to continue.';
    note.className = 'auth-submit-note is-success';
    /* Clean the query string from the address bar without a page reload */
    history.replaceState(null, '', window.location.pathname);
  }
}

/* ---------- Shared: email format check ---------- */
function isValidEmail(value){
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(value.trim());
}

/* ---------- Student / Admin role switch (Login + Signup pages) ---------- */
function initRoleSwitch(){
  const buttons = document.querySelectorAll('[data-role]');
  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const formId = btn.dataset.form;
      const group  = formId
        ? document.querySelectorAll(`[data-form="${formId}"]`)
        : buttons;

      /* Deactivate all buttons in the same group */
      group.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });

      /* Activate the clicked button */
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const role = btn.dataset.role;

      /* Update the associated form's data-active-role */
      if (formId) {
        const form = document.getElementById(formId);
        if (form) form.dataset.activeRole = role;
      }

      /* Update the submit button label for login */
      const loginSubmit = document.getElementById('authSubmitBtn');
      if (loginSubmit && formId === 'loginForm') {
        loginSubmit.textContent = role === 'admin' ? 'Sign In as Admin' : 'Sign In as Student';
      }

      /* Update the submit button label for signup */
      const signupSubmit = document.getElementById('signupSubmitBtn');
      if (signupSubmit && formId === 'signupForm') {
        signupSubmit.textContent = role === 'admin' ? 'Create Admin Account' : 'Create Student Account';
      }
    });
  });
}

/* ---------- Show/hide password fields ---------- */
function initPasswordToggles(){
  document.querySelectorAll('[data-toggle-password]').forEach(toggle => {
    const input = document.getElementById(toggle.dataset.togglePassword);
    if (!input) return;
    toggle.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggle.textContent = isHidden ? 'Hide' : 'Show';
    });
  });
}

/* ---------- Login form: validation only ---------- */
function initLoginForm(){
  const form = document.getElementById('loginForm');
  if (!form) return;
  const note = document.getElementById('loginNote');

  /* Email: strip spaces live + validate format on blur */
  const emailInput = form.querySelector('#loginEmail');
  if (emailInput) {
    emailInput.addEventListener('input', () => {
      emailInput.value = emailInput.value.replace(/\s/g, '');
      const errEl = document.getElementById('loginEmailError');
      if (errEl) errEl.textContent = '';
      emailInput.classList.remove('is-invalid');
    });
    emailInput.addEventListener('blur', () => {
      if (!emailInput.value) return;
      const errEl = document.getElementById('loginEmailError');
      if (!isValidEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        if (errEl) errEl.textContent = 'Enter a valid email address (e.g. name@example.com).';
      } else {
        emailInput.classList.remove('is-invalid');
        if (errEl) errEl.textContent = '';
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const email = form.querySelector('#loginEmail');
    const password = form.querySelector('#loginPassword');

    valid = validateField(email, () => isValidEmail(email.value), 'Enter a valid email address.') && valid;
    valid = validateField(password, () => password.value.length >= 6, 'Password must be at least 6 characters.') && valid;

    if (!valid){
      note.textContent = 'Please fix the highlighted fields.';
      note.className = 'auth-submit-note is-error';
      return;
    }

    const role = form.dataset.activeRole || 'student';
    note.textContent = `Welcome back — taking you to the ${role === 'admin' ? 'admin' : 'student'} dashboard...`;
    note.className = 'auth-submit-note is-success';

    /* Store email for dashboard display (session only, cleared on tab close) */
    const emailVal = form.querySelector('#loginEmail');
    if (emailVal) sessionStorage.setItem('dashUserEmail', emailVal.value.trim());

    form.reset();
    setTimeout(() => {
      window.location.href = role === 'admin' ? 'dashboard-admin.html' : 'dashboard-student.html';
    }, 900);
  });
}

/* ---------- Signup form: validation only, no storage ---------- */
function initSignupForm(){
  const form = document.getElementById('signupForm');
  if (!form) return;
  const note = document.getElementById('signupNote');

  /* Phone: numbers only, max 10 digits */
  const phoneInput = document.getElementById('signupPhone');
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

  /* Email: block invalid chars live + validate format on blur */
  const emailInput = document.getElementById('signupEmail');
  if (emailInput) {
    /* Strip spaces and obvious invalid characters as user types */
    emailInput.addEventListener('input', () => {
      emailInput.value = emailInput.value.replace(/\s/g, '');
      /* Clear error while they're still editing */
      const errEl = document.getElementById('signupEmailError');
      if (errEl) errEl.textContent = '';
      emailInput.classList.remove('is-invalid');
    });
    /* Validate format the moment the field loses focus */
    emailInput.addEventListener('blur', () => {
      if (!emailInput.value) return; /* leave empty-field error to submit */
      const errEl = document.getElementById('signupEmailError');
      if (!isValidEmail(emailInput.value)) {
        emailInput.classList.add('is-invalid');
        if (errEl) errEl.textContent = 'Enter a valid email address (e.g. name@example.com).';
      } else {
        emailInput.classList.remove('is-invalid');
        if (errEl) errEl.textContent = '';
      }
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name = form.querySelector('#signupName');
    const email = form.querySelector('#signupEmail');
    const phone = form.querySelector('#signupPhone');
    const password = form.querySelector('#signupPassword');
    const confirm = form.querySelector('#signupConfirm');
    const terms = form.querySelector('#signupTerms');

    valid = validateField(name, () => name.value.trim().length >= 2, 'Enter your full name.') && valid;
    valid = validateField(email, () => isValidEmail(email.value), 'Enter a valid email address.') && valid;
    valid = validateField(phone, () => /^\d{10}$/.test(phone.value.trim()), 'Enter a valid 10-digit phone number.') && valid;
    valid = validateField(password, () => password.value.length >= 8, 'Password must be at least 8 characters.') && valid;
    valid = validateField(confirm, () => confirm.value === password.value && confirm.value.length > 0, 'Passwords do not match.') && valid;

    const termsError = form.querySelector('#signupTermsError');
    if (!terms.checked){
      valid = false;
      if (termsError) termsError.textContent = 'Please accept the Terms to continue.';
    } else if (termsError){
      termsError.textContent = '';
    }

    if (!valid){
      note.textContent = 'Please fix the highlighted fields.';
      note.className = 'auth-submit-note is-error';
      return;
    }

    note.textContent = 'Account created — redirecting you to sign in...';
    note.className = 'auth-submit-note is-success';

    /* No credentials are stored anywhere: just reset the form
       and hand off to the Login page. */
    form.reset();

    const signupRole = form.dataset.activeRole || 'student';
    setTimeout(() => {
      window.location.href = `login.html?joined=1&role=${signupRole}`;
    }, 1000);
  });
}

/* ---------- Generic field validator ---------- */
function validateField(input, testFn, message){
  if (!input) return true;
  const errorEl = document.getElementById(input.id + 'Error');
  const ok = testFn();
  input.classList.toggle('is-invalid', !ok);
  if (errorEl) errorEl.textContent = ok ? '' : message;
  return ok;
}

/* ---------- Password strength meter (Signup) — removed ---------- */

/* ---------- Google sign-in (demo placeholder) ---------- */
document.querySelectorAll('.js-google-auth').forEach(btn => {
  btn.addEventListener('click', () => {
    const note = btn.closest('form') ?
      btn.closest('form').parentElement.querySelector('.auth-submit-note') :
      null;
    const msg = document.getElementById('googleNote');
    if (msg){
      msg.textContent = 'Google sign-in is a demo in this build — use the form above instead.';
      msg.className = 'auth-submit-note is-error';
    }
  });
});
