/**
 * ADMIN SESSION MODULE
 * Handles inactivity timeout (30 mins) and auto-logout.
 */

window.AdminSession = {
    TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    WARNING_MS: 5 * 60 * 1000,  // 5 minutes warning
    lastActivity: Date.now(),
    checkInterval: null,

    startTracker() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        
        // Update last activity on user events
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(name => {
            document.addEventListener(name, () => this.resetTimer(), { passive: true });
        });

        // Periodic check
        this.checkInterval = setInterval(() => this.check(), 10000); // Check every 10s
        this.resetTimer();
    },

    resetTimer() {
        this.lastActivity = Date.now();
        this.hideWarning();
    },

    check() {
        const now = Date.now();
        const elapsed = now - this.lastActivity;

        if (elapsed >= this.TIMEOUT_MS) {
            this.logout();
        } else if (elapsed >= this.TIMEOUT_MS - this.WARNING_MS) {
            this.showWarning(Math.ceil((this.TIMEOUT_MS - elapsed) / 60000));
        }
    },

    showWarning(minutes) {
        let warning = document.getElementById('session-warning-overlay');
        if (!warning) {
            warning = document.createElement('div');
            warning.id = 'session-warning-overlay';
            warning.style = `
                position: fixed; top: 2rem; left: 50%; transform: translateX(-50%);
                background: rgba(245, 158, 11, 0.95); color: #000; padding: 1rem 2rem;
                border-radius: 12px; font-weight: 800; z-index: 9999;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5); backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2); pointer-events: none;
                animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            `;
            document.body.appendChild(warning);
        }
        warning.innerHTML = `<i class="fas fa-clock"></i> SESSION EXPIRANT : Déconnexion automatique dans ${minutes} min(s)`;
        warning.style.display = 'block';
    },

    hideWarning() {
        const warning = document.getElementById('session-warning-overlay');
        if (warning) warning.style.display = 'none';
    },

    logout() {
        clearInterval(this.checkInterval);
        AdminAuth.logout();
    }
};
