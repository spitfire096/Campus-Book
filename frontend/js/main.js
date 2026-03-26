/**
 * public/js/main.js
 * Global client-side behaviours loaded on every page:
 *  - Mobile navbar toggle
 *  - Delete confirmation dialogs
 *  - Auto-dismiss flash messages
 *  - Password visibility toggle (shared utility)
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Mobile Navbar Toggle ──────────────────────────────────────────────────
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked (mobile UX)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── Delete Confirmation ───────────────────────────────────────────────────
  // Attaches to any button with class .confirm-delete and data-name attribute
  document.querySelectorAll('.confirm-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = btn.dataset.name || 'this item';
      const confirmed = window.confirm(
        `Are you sure you want to delete ${name}?\n\nThis action cannot be undone.`
      );
      if (!confirmed) {
        e.preventDefault(); // Stop form submission
      }
    });
  });

  // ── Password Visibility Toggle ────────────────────────────────────────────
  // Works for any .input-toggle button with data-target="<input-id>"
  document.querySelectorAll('.input-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const input    = document.getElementById(targetId);
      if (!input) return;

      if (input.type === 'password') {
        input.type  = 'text';
        btn.textContent = '🙈';
      } else {
        input.type  = 'password';
        btn.textContent = '👁';
      }
    });
  });

  // ── Auto-dismiss Flash Messages ───────────────────────────────────────────
  const flashMessages = document.querySelectorAll('.flash');
  flashMessages.forEach(flash => {
    setTimeout(() => {
      flash.style.transition = 'opacity 0.5s ease, max-height 0.5s ease';
      flash.style.opacity    = '0';
      flash.style.maxHeight  = '0';
      flash.style.overflow   = 'hidden';
      flash.style.padding    = '0';
    }, 4000); // Dismiss after 4 seconds
  });

});
