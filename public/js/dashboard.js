/**
 * public/js/dashboard.js
 * Dynamic UI enhancements for the user dashboard:
 *  - Animate stats cards counting up on load
 *  - Highlight bookings happening today
 *  - Show/hide admin controls based on role (role injected via data attribute)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Animate Stats Numbers ─────────────────────────────────────────────────
  // Each .stats-card__num counts up from 0 to its final value
  const statNumbers = document.querySelectorAll('.stats-card__num');

  statNumbers.forEach(el => {
    const target   = parseInt(el.textContent, 10);
    if (isNaN(target) || target === 0) return;

    const duration = 800; // ms
    const steps    = 30;
    const stepVal  = target / steps;
    const interval = duration / steps;
    let current    = 0;

    el.textContent = '0';

    const timer = setInterval(() => {
      current += stepVal;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current);
      }
    }, interval);
  });

  // ── Highlight Today's Bookings ────────────────────────────────────────────
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA', {
    weekday: 'short',
    month:   'short',
    day:     'numeric'
  });

  const bookingDates = document.querySelectorAll('.booking-card__date');
  bookingDates.forEach(dateEl => {
    if (dateEl.textContent.trim() === todayStr) {
      // Add a "Today" badge to the parent card
      const card = dateEl.closest('.booking-card');
      if (card) {
        card.style.borderColor = 'var(--color-accent)';
        card.style.boxShadow   = '0 0 0 1px var(--color-accent)';

        const todayTag = document.createElement('span');
        todayTag.className   = 'badge badge--confirmed';
        todayTag.textContent = 'Today';
        todayTag.style.marginLeft = '8px';
        dateEl.appendChild(todayTag);
      }
    }
  });

  // ── Fade in booking cards ─────────────────────────────────────────────────
  // Staggered entrance animation for booking list items
  const bookingCards = document.querySelectorAll('.booking-card');
  bookingCards.forEach((card, i) => {
    card.style.opacity   = '0';
    card.style.transform = 'translateY(12px)';
    card.style.transition = `opacity 0.3s ease ${i * 60}ms, transform 0.3s ease ${i * 60}ms`;

    // Trigger reflow then animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.opacity   = '1';
        card.style.transform = 'translateY(0)';
      });
    });
  });

});
