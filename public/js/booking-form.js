/**
 * public/js/booking-form.js
 * Client-side logic for both the New Booking and Edit Booking forms:
 *  1. Custom form validation (no HTML5)
 *  2. Live fetch of booked time slots when resource + date change
 *  3. Visual highlighting of conflicting time options in the dropdowns
 */

document.addEventListener('DOMContentLoaded', () => {

  const form            = document.getElementById('bookingForm');
  if (!form) return;

  // ── Field references ──────────────────────────────────────────────────────
  const resourceSelect  = document.getElementById('resourceId');
  const dateInput       = document.getElementById('date');
  const startSelect     = document.getElementById('startTime');
  const endSelect       = document.getElementById('endTime');

  // ── Error span references ─────────────────────────────────────────────────
  const resourceError   = document.getElementById('resourceIdError');
  const dateError       = document.getElementById('dateError');
  const startError      = document.getElementById('startTimeError');
  const endError        = document.getElementById('endTimeError');

  // ── Booked slots UI elements ───────────────────────────────────────────────
  const bookedDisplay   = document.getElementById('bookedSlotsDisplay');
  const bookedList      = document.getElementById('bookedSlotsList');

  // ── Date minimum: set to today ─────────────────────────────────────────────
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // ── Helper: show a field error ─────────────────────────────────────────────
  function showError(input, errorEl, message) {
    if (!errorEl) return;
    errorEl.textContent     = message;
    input.style.borderColor = 'var(--color-error)';
    input.style.boxShadow   = '0 0 0 3px rgba(248,81,73,0.18)';
  }

  // ── Helper: clear a field error ────────────────────────────────────────────
  function clearError(input, errorEl) {
    if (!errorEl) return;
    errorEl.textContent     = '';
    input.style.borderColor = '';
    input.style.boxShadow   = '';
  }

  // ── Helper: convert "HH:MM" to minutes since midnight ─────────────────────
  function toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  // ── Validate: Resource ────────────────────────────────────────────────────
  function validateResource() {
    if (!resourceSelect) return true; // Edit form has no resource select
    if (!resourceSelect.value) {
      showError(resourceSelect, resourceError, 'Please select a resource.');
      return false;
    }
    clearError(resourceSelect, resourceError);
    return true;
  }

  // ── Validate: Date ────────────────────────────────────────────────────────
  function validateDate() {
    const value = dateInput.value;
    if (!value) {
      showError(dateInput, dateError, 'Please select a booking date.');
      return false;
    }
    // Date must not be in the past
    const selected = new Date(value);
    const today    = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      showError(dateInput, dateError, 'Booking date cannot be in the past.');
      return false;
    }
    clearError(dateInput, dateError);
    return true;
  }

  // ── Validate: Start Time ──────────────────────────────────────────────────
  function validateStartTime() {
    if (!startSelect.value) {
      showError(startSelect, startError, 'Please select a start time.');
      return false;
    }
    clearError(startSelect, startError);
    return true;
  }

  // ── Validate: End Time ────────────────────────────────────────────────────
  function validateEndTime() {
    if (!endSelect.value) {
      showError(endSelect, endError, 'Please select an end time.');
      return false;
    }
    if (startSelect.value && endSelect.value) {
      if (toMinutes(endSelect.value) <= toMinutes(startSelect.value)) {
        showError(endSelect, endError, 'End time must be after start time.');
        return false;
      }
    }
    clearError(endSelect, endError);
    return true;
  }

  // ── Fetch booked slots from the server ────────────────────────────────────
  // Called whenever resource or date changes
  async function fetchBookedSlots() {
    const resourceId = resourceSelect ? resourceSelect.value : getHiddenResourceId();
    const date       = dateInput.value;

    // Need both to make the request
    if (!resourceId || !date) {
      hideBookedSlots();
      return;
    }

    try {
      const url      = `/bookings/booked-slots?resourceId=${resourceId}&date=${date}`;
      const response = await fetch(url);
      const data     = await response.json();

      if (data.slots && data.slots.length > 0) {
        displayBookedSlots(data.slots);
        highlightConflictingOptions(data.slots);
      } else {
        hideBookedSlots();
        resetOptionHighlights();
      }

    } catch (err) {
      console.error('Failed to fetch booked slots:', err);
      hideBookedSlots();
    }
  }

  // ── Get hidden resource ID (edit form) ────────────────────────────────────
  function getHiddenResourceId() {
    const hidden = form.querySelector('input[name="resourceId"]');
    return hidden ? hidden.value : null;
  }

  // ── Render booked slots list ───────────────────────────────────────────────
  function displayBookedSlots(slots) {
    if (!bookedDisplay || !bookedList) return;

    bookedList.innerHTML = '';
    slots.forEach(slot => {
      const li = document.createElement('li');
      li.textContent = `${slot.startTime} – ${slot.endTime}`;
      bookedList.appendChild(li);
    });

    bookedDisplay.style.display = 'block';
  }

  // ── Hide booked slots panel ────────────────────────────────────────────────
  function hideBookedSlots() {
    if (bookedDisplay) bookedDisplay.style.display = 'none';
    if (bookedList)    bookedList.innerHTML = '';
  }

  // ── Highlight time options that overlap existing bookings ──────────────────
  // Marks option text with ⚠ and changes colour to warn the user
  function highlightConflictingOptions(bookedSlots) {
    [startSelect, endSelect].forEach(select => {
      Array.from(select.options).forEach(option => {
        if (!option.value) return; // Skip placeholder

        // Check if this slot overlaps any existing booking
        const slotMinutes  = toMinutes(option.value);
        let isConflicting  = false;

        bookedSlots.forEach(slot => {
          const bookedStart = toMinutes(slot.startTime);
          const bookedEnd   = toMinutes(slot.endTime);
          // A time option conflicts if it falls inside a booked range
          if (slotMinutes >= bookedStart && slotMinutes < bookedEnd) {
            isConflicting = true;
          }
        });

        if (isConflicting) {
          option.style.color           = 'var(--color-error)';
          option.style.backgroundColor = 'rgba(248,81,73,0.15)';
          // Add warning prefix if not already there
          if (!option.textContent.startsWith('⚠')) {
            option.textContent = `⚠ ${option.value} (Booked)`;
          }
        } else {
          // Reset to normal
          option.style.color           = '';
          option.style.backgroundColor = '';
          if (option.textContent.startsWith('⚠')) {
            option.textContent = option.value;
          }
        }
      });
    });
  }

  // ── Reset option highlights ────────────────────────────────────────────────
  function resetOptionHighlights() {
    [startSelect, endSelect].forEach(select => {
      Array.from(select.options).forEach(option => {
        option.style.color           = '';
        option.style.backgroundColor = '';
        if (option.textContent.startsWith('⚠')) {
          option.textContent = option.value;
        }
      });
    });
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  // Fetch slots when resource or date changes
  if (resourceSelect) {
    resourceSelect.addEventListener('change', () => {
      validateResource();
      fetchBookedSlots();
    });
  }

  if (dateInput) {
    dateInput.addEventListener('change', () => {
      validateDate();
      fetchBookedSlots();
    });
  }

  // Re-validate end time when start changes (ordering check)
  if (startSelect) {
    startSelect.addEventListener('change', () => {
      validateStartTime();
      if (endSelect.value) validateEndTime();
    });
  }

  if (endSelect) {
    endSelect.addEventListener('change', validateEndTime);
  }

  // ── Form Submit ───────────────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    const r1 = validateResource();
    const r2 = validateDate();
    const r3 = validateStartTime();
    const r4 = validateEndTime();

    if (!r1 || !r2 || !r3 || !r4) {
      e.preventDefault();
      // Scroll to first visible error
      const firstError = form.querySelector('.field-error:not(:empty)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  // ── Initial fetch if both resource and date already set (e.g. edit form) ──
  const hasResource = (resourceSelect && resourceSelect.value) || getHiddenResourceId();
  const hasDate     = dateInput && dateInput.value;
  if (hasResource && hasDate) {
    fetchBookedSlots();
  }

});
