/**
 * ADMIN CORE APP
 * Coordinates modules and handles high-level application state.
 */

window.Admin = {
    // Expose Module Methods for Legacy Compatibility
    init: () => AdminApp.init(),
    login: (u, p) => AdminAuth.login(u, p),
    logout: () => AdminAuth.logout(),
    switchTab: (id, el) => AdminUI.switchTab(id, el),
    
    // Recovery (Proxy to Auth/DB as needed)
    initiateRecovery: (email) => AdminAuth.initiateRecovery(email),
    verifyCode: (user, code) => RecoveryStore.verify(user, code),
    verifyNewAccount: (user, code) => AdminAuth.verifyNewAccount(user, code),
    resetPassword: (user, pass) => AdminAuth.resetPassword(user, pass),
    
    // UI Proxy
    showToast: (m, t) => AdminUI.showToast(m, t),
    renderAll: () => AdminUI.renderAll(),
    
    // Actions
    deleteAdmin: (u) => AdminUI.confirmDeleteAdmin(u)
};

window.AdminApp = {
    async init() {
        console.log('Initializing Admin Intelligence Engine (Modular Version)...');
        
        // 1. Storage Sync
        await AdminDB.fetchAll();

        // 2. Auth Check
        const isLoginPage = window.location.pathname.includes('admin-login');
        const isLoggedIn = sessionStorage.getItem('mlh_admin_logged_in') === 'true';

        if (!isLoggedIn && !isLoginPage) {
            window.location.href = 'admin-login.html';
            return;
        }

        // 3. System Components Init
        if (isLoggedIn) {
            AdminSession.startTracker();
            if (!isLoginPage) {
                await AdminUI.init();
            }
        }

        // 4. Global Event Listeners
        this.setupKeyboardShortcuts();
    },

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't') AdminUI.toggleTheme();
            if (e.ctrlKey && e.key === 'l') AdminLogs.render();
        });
    }
};

// Auto-init on DOM Load
document.addEventListener('DOMContentLoaded', () => AdminApp.init());
