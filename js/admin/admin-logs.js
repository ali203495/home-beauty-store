/**
 * ADMIN LOGS MODULE
 * Handles recording and rendering activity logs.
 */

window.AdminLogs = {
    STORAGE_KEY: 'admin_activity_logs',
    MAX_LOGS: 100,

    log(action, type = 'info') {
        const logs = this.getAll();
        logs.unshift({
            action,
            type,
            user: sessionStorage.getItem('mlh_admin_user') || 'Système',
            time: Date.now()
        });
        
        // Keep only the most recent logs
        const trimmed = logs.slice(0, this.MAX_LOGS);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
        
        // Re-render if we are on the logs tab
        if (typeof AdminUI !== 'undefined' && AdminUI.activeTab === 'logs') {
            this.render();
        }
    },

    getAll() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    render() {
        const container = document.getElementById('activity-log-container');
        if (!container) return;
        
        // Role Check: Only Super Admin see logs
        const role = sessionStorage.getItem('mlh_admin_role');
        if (role !== 'Super Admin') {
            container.innerHTML = '<p class="text-muted p-lg">Accès restreint aux Super Administrateurs uniquement.</p>';
            return;
        }

        const logs = this.getAll();
        
        container.innerHTML = `
            <div class="table-responsive">
                <table class="modern-table">
                    <thead>
                        <tr>
                            <th>Temps</th>
                            <th>Utilisateur</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${logs.map(log => `
                            <tr>
                                <td class="text-muted" style="font-size: 0.75rem;">${new Date(log.time).toLocaleString()}</td>
                                <td><span class="badge glass">${log.user}</span></td>
                                <td>
                                    <div class="flex align-center gap-sm">
                                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${this.getTypeColor(log.type)};"></div>
                                        <span class="${log.type === 'error' ? 'text-red' : ''}">${log.action}</span>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    getTypeColor(type) {
        switch(type) {
            case 'error': return '#ef4444';
            case 'success': return '#22c55e';
            case 'warning': return '#facc15';
            default: return '#3b82f6';
        }
    }
};
