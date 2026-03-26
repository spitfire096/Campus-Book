/**
 * public/js/validate-resource.js
 * Client-side validation for the Admin resource create/edit form.
 * Uses custom DOM manipulation — NO HTML5 built-in constraint validation.
 */

document.addEventListener('DOMContentLoaded', () => {

  const form         = document.getElementById('resourceForm');
  if (!form) return;

  // ── Field and error span references ──────────────────────────────────────
  const nameInput     = document.getElementById('name');
  const categoryInput = document.getElementById('category');
  const capacityInput = document.getElementById('capacity');
  const nameError     = document.getElementById('nameError');
  const categoryError = document.getElementById('categoryError');
  const capacityError = document.getElementById('capacityError');

  // ── Helper: show error ────────────────────────────────────────────────────
  function showError(input, errorEl, message) {
    if (!errorEl) return;
    errorEl.textContent     = message;
    input.style.borderColor = 'var(--color-error)';
    input.style.boxShadow   = '0 0 0 3px rgba(248,81,73,0.18)';
  }

  // ── Helper: clear error ───────────────────────────────────────────────────
  function clearError(input, errorEl) {
    if (!errorEl) return;
    errorEl.textContent     = '';
    input.style.borderColor = '';
    input.style.boxShadow   = '';
  }

  // ── Helper: mark valid ────────────────────────────────────────────────────
  function markValid(input, errorEl) {
    clearError(input, errorEl);
    input.style.borderColor = 'var(--color-success)';
    input.style.boxShadow   = '0 0 0 3px rgba(63,185,80,0.15)';
  }

  // ── Validate: Name ────────────────────────────────────────────────────────
  function validateName() {
    const value = nameInput.value.trim();
    if (!value) {
      showError(nameInput, nameError, 'Resource name is required.');
      return false;
    }
    if (value.length < 2) {
      showError(nameInput, nameError, 'Name must be at least 2 characters.');
      return false;
    }
    if (value.length > 100) {
      showError(nameInput, nameError, 'Name must be under 100 characters.');
      return false;
    }
    markValid(nameInput, nameError);
    return true;
  }

  // ── Validate: Category ────────────────────────────────────────────────────
  function validateCategory() {
    if (!categoryInput.value) {
      showError(categoryInput, categoryError, 'Please select a category.');
      return false;
    }
    markValid(categoryInput, categoryError);
    return true;
  }

  // ── Validate: Capacity ────────────────────────────────────────────────────
  function validateCapacity() {
    const value = parseInt(capacityInput.value);
    if (!capacityInput.value || isNaN(value)) {
      showError(capacityInput, capacityError, 'Capacity is required.');
      return false;
    }
    if (value < 1) {
      showError(capacityInput, capacityError, 'Capacity must be at least 1.');
      return false;
    }
    if (value > 500) {
      showError(capacityInput, capacityError, 'Capacity cannot exceed 500.');
      return false;
    }
    markValid(capacityInput, capacityError);
    return true;
  }

  // ── Live validation on blur ───────────────────────────────────────────────
  nameInput.addEventListener('blur', validateName);
  categoryInput.addEventListener('blur', validateCategory);
  capacityInput.addEventListener('blur', validateCapacity);

  // ── Live feedback while typing ─────────────────────────────────────────────
  nameInput.addEventListener('input', () => {
    if (nameError && nameError.textContent) validateName();
  });

  capacityInput.addEventListener('input', () => {
    if (capacityError && capacityError.textContent) validateCapacity();
  });

  categoryInput.addEventListener('change', validateCategory);

  // ── Form Submit ───────────────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    const nameOk     = validateName();
    const catOk      = validateCategory();
    const capOk      = validateCapacity();

    if (!nameOk || !catOk || !capOk) {
      e.preventDefault();
      // Focus the first invalid field
      if (!nameOk)     nameInput.focus();
      else if (!catOk) categoryInput.focus();
      else             capacityInput.focus();
    }
  });

});
