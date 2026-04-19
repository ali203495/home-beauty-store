/**
 * MARRAKECH LUXE — Theme Toggle Module
 */

const ThemeToggle = {
    storageKey: 'mlh-theme',

    init() {
        const savedTheme = localStorage.getItem(this.storageKey) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(savedTheme);
        this.renderToggle();
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.storageKey, theme);
        this.updateButtons(theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
    },

    renderToggle() {
        const containers = document.querySelectorAll('.theme-toggle-container');
        containers.forEach(container => {
            container.innerHTML = `
                <button class="theme-btn" onclick="ThemeToggle.toggle()" aria-label="Changer de thème">
                    <i class="fas fa-moon moon-icon"></i>
                    <i class="fas fa-sun sun-icon"></i>
                </button>
            `;
        });
        this.updateButtons(document.documentElement.getAttribute('data-theme'));
    },

    updateButtons(theme) {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('dark', theme === 'dark');
        });
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => ThemeToggle.init());
