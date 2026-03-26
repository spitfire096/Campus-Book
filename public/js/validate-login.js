/**
 * public/js/validate-login.js
 * Custom client-side validation for the login form.
 * NO HTML5 built-in validation — purely DOM manipulation.
 */

document.addEventListener('DOMContentLoaded', () => {

  const form          = document.getElementById('loginForm');
  if (!form) return;

  // ── Field and error references ────────────────────────────────────────────
  const emailInput    = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError    = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');

  // ── Helper: show an inline field error ────────────────────────────────────
  function showError(input, errorEl, message) {
    errorEl.textContent     = message;
    input.style.borderColor = 'var(--color-error)';
    input.style.boxShadow   = '0 0 0 3px rgba(248,81,73,0.18)';
  }

  // ── Helper: clear a field's error state ───────────────────────────────────
  function clearError(input, errorEl) {
    errorEl.textContent     = '';
    input.style.borderColor = '';
    input.style.boxShadow   = '';
  }

  // ── Validate: Email ───────────────────────────────────────────────────────
  function validateEmail() {
    const value = emailInput.value.trim();

    if (!value) {
      showError(emailInput, emailError, 'Please enter your email address.');
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(value)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      return false;
    }

    clearError(emailInput, emailError);
    return true;
  }

  // ── Validate: Password ────────────────────────────────────────────────────
  function validatePassword() {
    const value = passwordInput.value;

    if (!value) {
      showError(passwordInput, passwordError, 'Please enter your password.');
      return false;
    }

    if (value.length < 6) {
      showError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      return false;
    }

    clearError(passwordInput, passwordError);
    return true;
  }

  // ── Live: clear errors as user starts correcting input ────────────────────
  emailInput.addEventListener('input', () => {
    if (emailError.textContent) validateEmail();
  });

  passwordInput.addEventListener('input', () => {
    if (passwordError.textContent) validatePassword();
  });

  // ── Blur: validate when focus leaves a field ──────────────────────────────
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);

  // ── Submit: run all validators before allowing POST ───────────────────────
  form.addEventListener('submit', (e) => {
    const emailOk    = validateEmail();
    const passwordOk = validatePassword();

    if (!emailOk || !passwordOk) {
      e.preventDefault();
    }
    // Valid → form submits to POST /auth/login
  });

});
