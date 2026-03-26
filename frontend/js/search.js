/**
 * public/js/search.js
 * Enhances the resource search + filter experience:
 *  - Auto-submits the form when dropdown filters change (no need to click Search)
 *  - Handles "Clear Filters" button
 *  - Highlights search term matches in resource card names
 */

document.addEventListener('DOMContentLoaded', () => {

  const searchForm    = document.getElementById('searchForm');
  const searchInput   = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('category');
  const availableFilter = document.getElementById('available');
  const clearBtn      = document.getElementById('clearFilters');

  if (!searchForm) return;

  // ── Auto-submit on filter dropdown change ─────────────────────────────────
  // When the user changes category or availability, the page reloads immediately
  // so results update without requiring a manual Search button click
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      searchForm.submit();
    });
  }

  if (availableFilter) {
    availableFilter.addEventListener('change', () => {
      searchForm.submit();
    });
  }

  // ── Clear Filters ──────────────────────────────────────────────────────────
  // Resets the form and redirects to /resources (all results)
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput)    searchInput.value    = '';
      if (categoryFilter) categoryFilter.value = 'all';
      if (availableFilter) availableFilter.value = '';
      // Submit with cleared values → shows all resources
      searchForm.submit();
    });
  }

  // ── Highlight search matches in resource card names ────────────────────────
  // Reads the current search query from the URL and wraps matching text
  // in <mark> tags for visual highlighting
  const urlParams   = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  if (searchQuery && searchQuery.trim().length > 0) {
    const cardNames = document.querySelectorAll('.resource-card__name');

    cardNames.forEach(nameEl => {
      const original = nameEl.textContent;
      const regex    = new RegExp(`(${escapeRegex(searchQuery.trim())})`, 'gi');
      const highlighted = original.replace(regex, '<mark class="search-highlight">$1</mark>');

      // Only update DOM if there's actually a match
      if (highlighted !== original) {
        nameEl.innerHTML = highlighted;
      }
    });
  }

  // ── Helper: escape special regex characters in search query ───────────────
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ── Add search highlight style dynamically ─────────────────────────────────
  // Injects a <style> tag so no extra CSS file is needed for this small rule
  const highlightStyle = document.createElement('style');
  highlightStyle.textContent = `
    mark.search-highlight {
      background: rgba(240, 165, 0, 0.3);
      color: inherit;
      border-radius: 2px;
      padding: 0 2px;
    }
  `;
  document.head.appendChild(highlightStyle);

});
