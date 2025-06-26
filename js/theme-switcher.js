// Theme Switcher: toggles between light, dark, and system
(function() {
  const THEME_KEY = 'theme-preference';
  const root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme'); // system
    }
  }

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  }

  function initSwitcher() {
    const navCollapse = document.getElementById('navbarSupportedContent');
    if (!navCollapse) return;
    const switcher = document.createElement('div');
    switcher.className = 'theme-switcher';
    switcher.innerHTML = `
      <select id="theme-select" aria-label="Theme switcher" class="form-control form-control-sm mt-3">
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    `;
    navCollapse.appendChild(switcher);
    const select = document.getElementById('theme-select');
    select.value = getSavedTheme() || 'system';
    select.addEventListener('change', function() {
      setTheme(this.value);
    });
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    if (!getSavedTheme() || getSavedTheme() === 'system') {
      applyTheme('system');
    }
  });

  // On load
  document.addEventListener('DOMContentLoaded', function() {
    const saved = getSavedTheme();
    applyTheme(saved === 'system' || !saved ? getSystemTheme() : saved);
    initSwitcher();
  });
})();
