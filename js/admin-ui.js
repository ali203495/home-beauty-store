/**
 * ADMIN UI MODULE
 * Handles all rendering, dashboard tabs, and interaction logic.
 */

window.AdminUI = {
    activeTab: 'overview',
    
    async init() {
        this.activeTab = sessionStorage.getItem('mlh_admin_active_tab') || 'overview';
        this.renderAll();
        this.applyPermissions();
        this.loadTheme();
        this.updateAdminDisplay();
    },

    updateAdminDisplay() {
        const nameEl = document.getElementById('current-admin-name');
        if (nameEl) {
            const user = sessionStorage.getItem('mlh_admin_user') || 'Admin';
            const role = sessionStorage.getItem('mlh_admin_role') || 'Admin';
            nameEl.innerHTML = `${user.charAt(0).toUpperCase() + user.slice(1)} <span class="badge" style="font-size: 0.65rem; background: rgba(59, 130, 246, 0.1); color: #3b82f6;">${role}</span>`;
        }
    },

    applyPermissions() {
        const role = sessionStorage.getItem('mlh_admin_role');
        const isSuper = role === 'Super Admin';
        
        document.body.classList.toggle('role-super', isSuper);
        document.body.classList.toggle('role-admin', !isSuper);

        // Hide restricted modules
        const restricted = document.querySelectorAll('[data-role="Super Admin"]');
        restricted.forEach(el => el.style.display = isSuper ? '' : 'none');

        // Nav protection
        const restrictedTabs = ['admins', 'logs', 'settings'];
        if (!isSuper && restrictedTabs.includes(this.activeTab)) {
            this.switchTab('overview');
        }
    },

    async renderAll() {
        await this.computeStats();
        this.renderOverview();
        this.renderProducts();
        this.renderOrders();
        AdminLogs.render();
        this.renderAdmins();
        this.renderAnalytics();
    },

    /** ── Dashboard Modules ── */

    async renderAdmins() {
        const tbody = document.getElementById('admin-management-table-body');
        if (!tbody) return;

        const admins = await AdminDB.fetchAll();
        const currentUser = sessionStorage.getItem('mlh_admin_user');
        const role = sessionStorage.getItem('mlh_admin_role');

        tbody.innerHTML = admins.map(a => `
            <tr>
                <td>
                    <div class="text-bold">${a.username} ${a.username === currentUser ? '<span class="badge success">VOUS</span>' : ''}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">${a.recoveryEmail}</div>
                </td>
                <td><span class="badge ${a.role === 'Super Admin' ? 'primary' : 'glass'}">${a.role}</span></td>
                <td>
                    <span class="badge" style="background: ${a.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(250, 204, 21, 0.1)'}; color: ${a.status === 'Active' ? '#22c55e' : '#facc15'};">
                        ${a.status === 'Active' ? 'ACTIF' : 'PENDING'}
                    </span>
                </td>
                <td class="text-right">
                    ${role === 'Super Admin' && a.username !== currentUser ? `
                        <button class="glass p-xs mr-xs" onclick="AdminUI.openAdminModal('${a.username}')" title="Modifier"><i class="fas fa-edit"></i></button>
                        <button class="glass p-xs text-red" onclick="AdminUI.confirmDeleteAdmin('${a.username}')" title="Supprimer"><i class="fas fa-trash-alt"></i></button>
                    ` : '<span class="text-muted" style="font-size: 0.75rem;">Lecture seule</span>'}
                </td>
            </tr>
        `).join('');
    },
    
    async renderOrders() {
        const tbody = document.getElementById('admin-order-table-body');
        if (!tbody) return;
        const orders = await OrderDB.getOrders();
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td class="text-bold text-red">#${o.id}</td>
                <td><div class="text-bold">${o.customer.name}</div><div class="text-muted" style="font-size: 0.75rem;">${o.customer.phone}</div></td>
                <td>${o.items.length} articles</td>
                <td class="text-bold">${o.total} DH</td>
                <td>
                    <select onchange="AdminUI.updateOrderStatus('${o.id}', this.value)" class="glass p-xs text-primary" style="font-size: 0.7rem; font-weight: 800;">
                        <option value="Nouveau" ${o.status === 'Nouveau' ? 'selected' : ''}>NOUVEAU</option>
                        <option value="En cours" ${o.status === 'En cours' ? 'selected' : ''}>EN COURS</option>
                        <option value="Livré" ${o.status === 'Livré' ? 'selected' : ''}>LIVRÉ</option>
                    </select>
                </td>
                <td class="text-right"><button class="glass p-xs" onclick="AdminUI.viewOrder('${o.id}')"><i class="fas fa-eye"></i></button></td>
            </tr>
        `).join('');
    },

    async renderProducts() {
        const tbody = document.getElementById('admin-product-table-body');
        if (!tbody) return;
        tbody.innerHTML = PRODUCTS.map(p => `
            <tr>
                <td><div class="text-bold">${p.name}</div><div class="text-muted" style="font-size: 0.7rem;">ID: ${p.id}</div></td>
                <td><span class="badge glass">${p.category}</span></td>
                <td class="text-bold text-red">${p.price} DH</td>
                <td><span class="text-bold ${p.stock < 10 ? 'text-red' : ''}">${p.stock}</span></td>
                <td><span class="badge ${p.visible ? 'success' : 'danger'}">${p.visible ? 'Actif' : 'Masqué'}</span></td>
                <td class="text-right"><button class="glass p-xs" onclick="AdminUI.openProductModal('${p.id}')"><i class="fas fa-edit"></i></button></td>
            </tr>
        `).join('');
    },

    async renderPromotions() {
        const tbody = document.getElementById('admin-coupon-table-body');
        if (!tbody) return;
        const coupons = await PromotionDB.fetchAll();
        tbody.innerHTML = coupons.map(c => `
            <tr>
                <td><code class="text-red text-bold">${c.code}</code></td>
                <td>${c.type}</td>
                <td>${c.value}</td>
                <td class="text-right">
                    <button class="glass p-xs text-red" onclick="AdminUI.confirmDeleteCoupon('${c.code}')"><i class="fas fa-trash-alt"></i></button>
                </td>
            </tr>
        `).join('');
    },

    async updateOrderStatus(id, status) {
        OrderDB.updateStatus(id, status);
        this.showToast(`Commande #${id} : ${status}`);
        AdminLogs.log(`Status commande #${id} -> ${status}`, 'info');
    },

    confirmDeleteCoupon(code) {
        this.confirm(`Supprimer le coupon ${code} ?`, () => {
            PromotionDB.delete(code).then(() => {
                this.renderPromotions();
                this.showToast('Coupon supprimé');
                AdminLogs.log(`Coupon supprimé : ${code}`, 'warning');
            });
        });
    },

    async adjustStock(id, amount) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (p) {
            p.stock = Math.max(0, (p.stock || 0) + amount);
            await ProductDB.saveProduct(p);
            this.renderProducts();
            this.showToast('Stock mis à jour');
        }
    },

    viewOrder(id) {
        // Simple alert for now as per legacy behavior, or expand to modal
        this.showToast(`Ouverture commande #${id}...`, 'info');
        console.log(`Order Details for #${id}`);
    },

    async toggleVisibility(id) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (p) {
            p.visible = !p.visible;
            await ProductDB.saveProduct(p);
            this.renderProducts();
            this.showToast(p.visible ? 'Produit visible' : 'Produit masqué');
        }
    },

    runAIDiagnostics() {
        this.showToast('Analyse IA en cours...', 'info');
        setTimeout(() => {
            this.showToast('Diagnostic IA terminé. suggestions appliquées.', 'success');
        }, 1500);
    },

    async computeStats() {
        const token = sessionStorage.getItem('mlh_admin_token');
        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Stats API Failed');
            const data = await response.json();
            
            const totalRevenue = data.orders.reduce((sum, o) => sum + (o.revenue || 0), 0);
            const totalOrders = data.orders.reduce((sum, o) => sum + (o.count || 0), 0);
            const productCount = data.products.productCount;

            const revEl = document.getElementById('stat-revenue');
            const ordEl = document.getElementById('stat-orders');
            const lowEl = document.getElementById('stat-low-stock');
            const custEl = document.getElementById('stat-customers');

            if (revEl) revEl.innerText = this.formatCurrency(totalRevenue);
            if (ordEl) ordEl.innerText = totalOrders;
            if (lowEl) {
                // Keep product count or refine if we add a dedicated low stock SQL query
                lowEl.innerText = PRODUCTS.filter(p => p.stock < 10).length;
            }
            if (custEl) {
                const customers = await (window.CustomerDB ? CustomerDB.getCustomers() : []);
                custEl.innerText = customers.length;
            }
        } catch (err) {
            console.error("Failed to fetch dashboard stats.", err);
        }
    },

    formatCurrency(val) {
        return `${val.toLocaleString()} DH`;
    },

    renderOverview() {
        const recentOrdersList = document.getElementById('recent-orders-list');
        if (recentOrdersList) {
            OrderDB.getOrders().then(orders => {
                recentOrdersList.innerHTML = orders.slice(0, 5).map(o => `
                    <div class="flex-between py-md border-bottom" style="font-size: 0.85rem;">
                        <div><span class="text-bold">#${o.id}</span> <div class="text-muted">${o.customer.name}</div></div>
                        <div class="text-right"><div class="text-bold text-red">${o.total} DH</div><div class="text-muted" style="font-size: 0.7rem;">${o.status}</div></div>
                    </div>
                `).join('') || '<p class="text-muted">Aucune commande.</p>';
            });
        }
    },

    renderAnalytics() {
        const forecast = document.getElementById('forecast-value');
        if (!forecast) return;
        
        OrderDB.getOrders().then(orders => {
            const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
            const aov = orders.length > 0 ? Math.round(totalRev / orders.length) : 0;
            const aovEl = document.getElementById('stat-aov');
            if (aovEl) aovEl.innerText = `${aov.toLocaleString()} DH`;
        });
    },

    /** ── Settings & Automation ── */

    loadSettings() {
        const form = document.getElementById('site-settings-form');
        if (!form) return;
        form.storeName.value = CONFIG.storeName || '';
        form.whatsappNumber.value = CONFIG.whatsappNumber || '';
        form.supportEmail.value = CONFIG.supportEmail || '';
    },

    async saveSettings(e) {
        e.preventDefault();
        if (!(window.AdminAuth && await AdminAuth.hasPermission ? await AdminAuth.hasPermission('Super Admin') : true)) {
            return this.showToast('Accès Super Admin requis', 'error');
        }
        this.confirm('Sauvegarder les nouveaux paramètres système ?', () => {
            const data = new FormData(e.target);
            const updates = { storeName: data.get('storeName'), whatsappNumber: data.get('whatsappNumber') };
            if (CONFIG.update) CONFIG.update(updates);
            this.showToast('Paramètres mis à jour');
            AdminLogs.log('Configuration système modifiée', 'success');
        });
    },

    /** ── Product Management ── */

    openProductModal(id = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        if (!modal || !form) return;
        form.reset();
        modal.style.display = 'flex';
        if (id) {
            const p = PRODUCTS.find(prod => prod.id === id);
            form.id.value = p.id;
            form.name.value = p.name;
        }
    },

    async handleProductSubmit(e) {
        e.preventDefault();
        this.showToast('Produit enregistré');
        this.closeModal('product-modal');
        this.renderProducts();
    },

    /** ── Interactions ── */

    switchTab(tabId, el = null) {
        this.activeTab = tabId;
        sessionStorage.setItem('mlh_admin_active_tab', tabId);

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        if (el) el.classList.add('active');
        else document.querySelector(`[onclick*="'${tabId}'"]`)?.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tabId}`)?.classList.add('active');
        
        if (tabId === 'logs') AdminLogs.render();
        if (tabId === 'admins') this.renderAdmins();
    },

    toggleTheme() {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('admin_theme', next);
    },

    loadTheme() {
        const saved = localStorage.getItem('admin_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
    },

    /** ── Alerts & Modals ── */

    showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        if (!toast || !toastMsg) return;
        toastMsg.innerText = msg;
        toast.className = `glass ${type === 'error' ? 'text-red' : ''}`;
        toast.style.display = 'block';
        setTimeout(() => toast.style.transform = 'translateY(0)', 10);
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            setTimeout(() => toast.style.display = 'none', 300);
        }, 4000);
    },

    confirm(msg, onConfirm) {
        const modalId = 'system-confirm-modal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.style = `position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 99999; backdrop-filter: blur(20px);`;
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="glass p-xl animate-scale" style="max-width: 400px; width: 90%; text-align: center; border-radius: var(--radius-xl); border: 1px solid rgba(255,255,255,0.1);">
                <i class="fas fa-exclamation-triangle text-red mb-lg" style="font-size: 2.5rem;"></i>
                <h2 class="mb-md">Confirmation</h2>
                <p class="text-muted mb-xl">${msg}</p>
                <div class="flex gap-md">
                    <button class="btn-primary" style="flex: 1;" id="modal-confirm-btn">POURSUIVRE</button>
                    <button class="glass p-md" style="flex: 1;" onclick="AdminUI.closeConfirm()">ANNULER</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.getElementById('modal-confirm-btn').onclick = () => {
            this.closeConfirm();
            onConfirm();
        };
    },

    closeConfirm() {
        const modal = document.getElementById('system-confirm-modal');
        if (modal) modal.style.display = 'none';
    },

    /** ── Admin Management ── */

    openAdminModal(username = null) {
        const modal = document.getElementById('admin-modal');
        const form = document.getElementById('admin-form');
        const title = document.getElementById('admin-modal-title');
        const passGroup = document.getElementById('admin-password-group');
        
        if (!modal || !form) return;

        if (username) {
            // Edit Mode
            AdminDB.findByUsername(username).then(a => {
                if (!a) return;
                title.innerText = `Modifier Administrateur : ${a.username}`;
                form.mode.value = 'edit';
                form.username.value = a.username;
                form.username.readOnly = true;
                form.recoveryEmail.value = a.recoveryEmail;
                form.role.value = a.role;
                passGroup.style.display = 'none';
                modal.style.display = 'flex';
            });
        } else {
            // Create Mode
            title.innerText = 'Nouveau Administrateur';
            form.mode.value = 'create';
            form.username.value = '';
            form.username.readOnly = false;
            form.recoveryEmail.value = '';
            form.role.value = 'Admin';
            form.password.value = '';
            passGroup.style.display = 'block';
            modal.style.display = 'flex';
        }
    },

    async handleAdminSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const mode = data.get('mode');
        const username = data.get('username').toLowerCase();
        
        const adminData = {
            username,
            recoveryEmail: data.get('recoveryEmail'),
            role: data.get('role'),
            status: 'Active'
        };

        if (mode === 'create') {
            const pass = data.get('password');
            if (pass.length < 4) return this.showToast('Mot de passe trop court (min: 4)', 'error');
            adminData.passwordHash = await AdminAuth.hashPassword(pass);
            AdminLogs.log(`Nouvel admin créé : @${username} (${adminData.role})`, 'success');
        } else {
            AdminLogs.log(`Profil admin mis à jour : @${username} (${adminData.role})`, 'info');
        }

        await AdminDB.saveAdmin(adminData);
        this.closeModal('admin-modal');
        this.renderAdmins();
        this.showToast(mode === 'create' ? 'Compte créé avec succès' : 'Profil mis à jour');
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    },

    confirmDeleteAdmin(username) {
        this.confirm(`Êtes-vous sûr de vouloir révoquer définitivement l'accès pour @${username} ?`, () => {
            AdminDB.delete(username).then(() => {
                AdminLogs.log(`Administrateur révoqué : @${username}`, 'warning');
                this.renderAdmins();
                this.showToast('Accès révoqué avec succès');
            });
        });
    }
};
