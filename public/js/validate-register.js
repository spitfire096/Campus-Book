/**
 * public/js/validate-register.js
 * Custom client-side validation for the registration form.
 * Uses ONLY DOM manipulation — NO HTML5 built-in validation (novalidate is set).
 */

document.addEventListener('DOMContentLoaded', () => {

  const form            = document.getElementById('registerForm');
  if (!form) return;

  // ── Field references ──────────────────────────────────────────────────────
  const nameInput       = document.getElementById('name');
  const emailInput      = document.getElementById('email');
  const passwordInput   = document.getElementById('password');
  const confirmInput    = document.getElementById('confirmPassword');

  // ── Error span references ─────────────────────────────────────────────────
  const nameError       = document.getElementById('nameError');
  const emailError      = document.getElementById('emailError');
  const passwordError   = document.getElementById('passwordError');
  const confirmError    = document.getElementById('confirmPasswordError');

  // ── Password strength elements ─────────────────────────────────────────────
  const strengthFill    = document.getElementById('strengthFill');
  const strengthLabel   = document.getElementById('strengthLabel');

  // ── Helper: show an error on a field ─────────────────────────────────────
  function showError(input, errorEl, message) {
    errorEl.textContent = message;
    input.style.borderColor = 'var(--color-error)';
    input.style.boxShadow   = '0 0 0 3px rgba(248,81,73,0.18)';
  }

  // ── Helper: clear error on a field ───────────────────────────────────────
  function clearError(input, errorEl) {
    errorEl.textContent = '';
    input.style.borderColor = '';
    input.style.boxShadow   = '';
  }

  // ── Helper: mark field as valid ───────────────────────────────────────────
  function markValid(input, errorEl) {
    clearError(input, errorEl);
    input.style.borderColor = 'var(--color-success)';
    input.style.boxShadow   = '0 0 0 3px rgba(63,185,80,0.15)';
  }

  // ── Validate: Name ────────────────────────────────────────────────────────
  function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
      showError(nameInput, nameError, 'Full name is required.');
      return false;
    }
    if (value.length < 2) {
      showError(nameInput, nameError, 'Name must be at least 2 characters.');
      return false;
    }
    if (!/^[a-zA-Z\s'\-\.]+$/.test(value)) {
      showError(nameInput, nameError, 'Name can only contain letters, spaces, and hyphens.');
      return false;
    }
    markValid(nameInput, nameError);
    return true;
  }

  // ── Validate: Email ───────────────────────────────────────────────────────
  function validateEmail() {
    const value = emailInput.value.trim();
    if (!value) {
      showError(emailInput, emailError, 'Email address is required.');
      return false;
    }
    // RFC-compliant basic email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(value)) {
      showError(emailInput, emailError, 'Please enter a valid email address.');
      return false;
    }
    markValid(emailInput, emailError);
    return true;
  }

  // ── Validate: Password ────────────────────────────────────────────────────
  function validatePassword() {
    const value = passwordInput.value;
    if (!value) {
      showError(passwordInput, passwordError, 'Password is required.');
      return false;
    }
    if (value.length < 6) {
      showError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      return false;
    }
    markValid(passwordInput, passwordError);
    return true;
  }

  // ── Validate: Confirm Password ────────────────────────────────────────────
  function validateConfirm() {
    const value = confirmInput.value;
    if (!value) {
      showError(confirmInput, confirmError, 'Please confirm your password.');
      return false;
    }
    if (value !== passwordInput.value) {
      showError(confirmInput, confirmError, 'Passwords do not match.');
      return false;
    }
    markValid(confirmInput, confirmError);
    return true;
  }

  // ── Password Strength Meter ────────────────────────────────────────────────
  // Calculates a score 0–4 and updates the visual strength bar
  function updateStrength() {
    const val = passwordInput.value;
    let score = 0;

    if (val.length >= 6)                         score++; // length ok
    if (val.length >= 10)                        score++; // longer is stronger
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++; // mixed case
    if (/\d/.test(val))                          score++; // contains digit
    if (/[^A-Za-z0-9]/.test(val))               score++; // special character

    const percent = (score / 5) * 100;
    strengthFill.style.width = percent + '%';

    const levels = [
      { color: 'var(--color-error)',   label: 'Very Weak' },
      { color: 'var(--color-error)',   label: 'Weak'      },
      { color: 'var(--color-warning)', label: 'Fair'      },
      { color: 'var(--color-warning)', label: 'Good'      },
      { color: 'var(--color-success)', label: 'Strong'    }
    ];

    const level = levels[Math.min(score, 4)];
    strengthFill.style.backgroundColor = level.color;

    if (strengthLabel) {
      strengthLabel.textContent = val.length > 0 ? level.label : '';
    }
  }

  // ── Live validation on blur (when user leaves a field) ─────────────────────
  nameInput.addEventListener('blur', validateName);
  emailInput.addEventListener('blur', validateEmail);
  passwordInput.addEventListener('blur', validatePassword);
  confirmInput.addEventListener('blur', validateConfirm);

  // ── Live feedback while typing ─────────────────────────────────────────────
  nameInput.addEventListener('input', () => {
    if (nameError.textContent) validateName();
  });

  emailInput.addEventListener('input', () => {
    if (emailError.textContent) validateEmail();
  });

  passwordInput.addEventListener('input', () => {
    updateStrength();
    if (passwordError.textContent) validatePassword();
    // Re-validate confirm if already been touched
    if (confirmError.textContent) validateConfirm();
  });

  confirmInput.addEventListener('input', () => {
    if (confirmError.textContent) validateConfirm();
  });

  // ── Form Submit: Run all validators ───────────────────────────────────────
  form.addEventListener('submit', (e) => {
    const isNameValid     = validateName();
    const isEmailValid    = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmValid  = validateConfirm();

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
      e.preventDefault(); // Block form submission

      // Scroll to the first error field
      const firstErrorField = form.querySelector('input[style*="color-error"]')
        || form.querySelector('.field-error:not(:empty)');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    // If all valid, form submits normally to POST /auth/register
  });

});
