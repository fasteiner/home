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
    const select = document.getElementById('theme-select');
    if (select) select.value = theme;
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
    const select = document.getElementById('theme-select');
    if (select) {
      select.value = saved || 'system';
      select.addEventListener('change', function() {
        setTheme(this.value);
      });
    }
  });
})();
