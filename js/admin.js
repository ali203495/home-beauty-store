/**
 * ADMIN INTELLIGENCE ENGINE — EL-WALI-SHOP
 * Comprehensive management logic with deep analytics and active controls.
 */

const ADMIN_CREDENTIALS = {
    username: 'abdelaali',
    // SHA-256 hash of '!@#$1234'
    passwordHash: '0fb2c3ee97570dcf77fb841e26b3678fb2bf7f25e6d5f949c926454825ffc764',
    recoveryEmail: 'abdelaali.markabi@gmail.com'
};

const Admin = {
    async init() {
        this.checkAuth();
        this.loadTheme();
        await ProductDB.fetchAll(); // Ensure data is loaded
        
        // Initial Render
        if (document.getElementById('stat-revenue')) {
            this.renderAll();
        }
        this.setupEventListeners();
        this.logActivity('Système initialisé', 'info');
    },

    /** ── Authentication ───────────────────────────────────── */

    async hashPassword(string) {
        if (!window.crypto || !window.crypto.subtle) return string; 
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    async login(username, password) {
        const hashedInput = await this.hashPassword(password);
        const isUserMatch = (username.trim().toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase());
        const isPassMatch = (hashedInput === ADMIN_CREDENTIALS.passwordHash);

        if (isUserMatch && isPassMatch) {
            sessionStorage.setItem('mlh_admin_logged_in', 'true');
            sessionStorage.setItem('mlh_admin_login_time', Date.now().toString());
            this.logActivity(`Connexion réussie : ${username}`, 'success');
            return true;
        }
        
        this.logActivity(`Tentative de connexion échouée : ${username}`, 'error');
        return false;
    },

    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('mlh_admin_logged_in') === 'true';
        if (!isLoggedIn && !window.location.pathname.includes('admin-login')) {
            window.location.href = 'admin-login.html';
        }
    },

    /** ── Rendering Engine ─────────────────────────────────── */
    async renderAll() {
        await this.computeStats();
        this.renderOverview();
        this.renderProducts();
        this.renderInventory();
        await this.renderOrders();
        this.renderCustomers();
        this.renderPromos();
        this.renderLogs();
    },

    async computeStats() {
        const orders = await OrderDB.getOrders();
        const customers = await CustomerDB.getCustomers();
        const lowStock = PRODUCTS.filter(p => p.stock < 10).length;
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

        const revEl = document.getElementById('stat-revenue');
        const ordEl = document.getElementById('stat-orders');
        const lowEl = document.getElementById('stat-low-stock');
        const custEl = document.getElementById('stat-customers');

        if (revEl) revEl.innerText = `${totalRevenue.toLocaleString()} DH`;
        if (ordEl) ordEl.innerText = orders.length;
        if (lowEl) lowEl.innerText = lowStock;
        if (custEl) custEl.innerText = customers.length;
    },

    renderOverview() {
        const recentOrdersList = document.getElementById('recent-orders-list');
        const topProductsList = document.getElementById('top-products-list');
        
        if (recentOrdersList) {
            OrderDB.getOrders().then(orders => {
                recentOrdersList.innerHTML = orders.slice(0, 5).map(o => `
                    <div class="flex-between py-md border-bottom" style="font-size: 0.85rem;">
                        <div>
                            <span class="text-bold">#${o.id}</span>
                            <div class="text-muted">${o.customer.name}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-bold text-red">${o.total} DH</div>
                            <div class="text-muted" style="font-size: 0.7rem;">${o.status}</div>
                        </div>
                    </div>
                `).join('') || '<p class="text-muted">Aucune commande.</p>';
            });
        }

        if (topProductsList) {
            // Simple Top Products (Mock logic for now based on rating/reviews)
            const topProds = [...PRODUCTS].sort((a, b) => b.reviews - a.reviews).slice(0, 5);
            topProductsList.innerHTML = topProds.map(p => `
                <div class="flex align-center gap-md py-md border-bottom">
                    <img src="${p.image}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                    <div style="flex: 1;">
                        <div class="text-bold" style="font-size: 0.85rem;">${p.name}</div>
                        <div class="text-muted" style="font-size: 0.7rem;">${p.category}</div>
                    </div>
                    <div class="text-bold text-red">${p.price} DH</div>
                </div>
            `).join('') || '<p class="text-muted">Aucun produit.</p>';
        }
    },

    renderProducts(filtered = null) {
        const tbody = document.getElementById('admin-product-table-body');
        if (!tbody) return;
        
        const prods = filtered || PRODUCTS;
        
        tbody.innerHTML = prods.map(p => `
            <tr>
                <td>
                    <div class="flex align-center gap-md">
                        <img src="${p.image}" style="width: 32px; height: 32px; border-radius: 4px;">
                        <span class="text-bold">${p.name}</span>
                    </div>
                </td>
                <td><span class="badge glass">${p.category}</span></td>
                <td class="text-bold">${p.price} DH</td>
                <td>
                    <div class="flex align-center gap-sm">
                        <span class="text-bold ${p.stock < 10 ? 'text-red' : ''}">${p.stock}</span>
                        <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                            <div style="width: ${Math.min(p.stock, 100)}%; height: 100%; background: ${p.stock < 10 ? 'var(--accent-red)' : '#22c55e'}; border-radius: 2px;"></div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge" style="background: ${p.visible ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color: ${p.visible ? '#22c55e' : '#ef4444'};">
                        ${p.visible ? 'En ligne' : 'Masqué'}
                    </span>
                </td>
                <td class="text-right">
                    <button class="glass p-xs mr-xs" onclick="Admin.editProduct('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="glass p-xs" onclick="Admin.toggleVisibility('${p.id}')"><i class="fas ${p.visible ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center py-xl text-muted">Aucun produit trouvé.</td></tr>';
    },

    renderInventory() {
        const tbody = document.getElementById('admin-inventory-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = PRODUCTS.map(p => `
            <tr>
                <td class="text-bold">${p.name}</td>
                <td>
                    <span class="badge" style="font-size: 1rem; ${p.stock < 10 ? 'background: rgba(239, 68, 68, 0.2); color: #ef4444;' : ''}">${p.stock} unités</span>
                </td>
                <td class="text-muted" style="font-size: 0.8rem;">${new Date(p.lastUpdated || Date.now()).toLocaleString()}</td>
                <td>
                    ${p.stock < 10 ? '<span class="text-red text-bold"><i class="fas fa-exclamation-triangle"></i> STOCK FAIBLE</span>' : '<span class="text-muted">Normal</span>'}
                </td>
                <td class="text-right">
                    <div class="flex gap-xs justify-end">
                        <button class="glass px-md py-xs" onclick="Admin.adjustStock('${p.id}', 10)">+10</button>
                        <button class="glass px-md py-xs" onclick="Admin.adjustStock('${p.id}', 50)">+50</button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    async renderOrders(filtered = null) {
        const tbody = document.getElementById('admin-order-table-body');
        if (!tbody) return;
        
        const orders = filtered || await OrderDB.getOrders();

        tbody.innerHTML = orders.map(o => `
            <tr>
                <td class="text-bold text-red">#${o.id}</td>
                <td>
                    <div class="text-bold">${o.customer.name}</div>
                    <div class="text-muted" style="font-size: 0.75rem;">${o.customer.phone}</div>
                </td>
                <td>${o.items.length} articles</td>
                <td class="text-bold">${o.total} DH</td>
                <td>
                    <select onchange="Admin.updateOrderStatus('${o.id}', this.value)" class="glass p-xs text-primary" style="font-size: 0.7rem; font-weight: 800;">
                        <option value="Nouveau" ${o.status === 'Nouveau' ? 'selected' : ''}>NOUVEAU</option>
                        <option value="En cours" ${o.status === 'En cours' ? 'selected' : ''}>EN COURS</option>
                        <option value="Livré" ${o.status === 'Livré' ? 'selected' : ''}>LIVRÉ</option>
                    </select>
                </td>
                <td class="text-right">
                   <button class="glass p-xs" onclick="Admin.viewOrderDetails('${o.id}')"><i class="fas fa-external-link-alt"></i></button>
                </td>
            </tr>
        `).join('');
    },

    async renderCustomers() {
        const tbody = document.getElementById('admin-customer-table-body');
        if (!tbody) return;
        
        const customers = await CustomerDB.getCustomers();

        tbody.innerHTML = customers.map(c => `
            <tr>
                <td class="text-bold">${c.name}</td>
                <td class="text-muted">${c.phone}</td>
                <td><span class="badge glass">${c.orderCount} commandes</span></td>
                <td class="text-bold text-red">${c.totalSpent.toLocaleString()} DH</td>
                <td class="text-muted">${new Date(c.lastOrderDate).toLocaleDateString()}</td>
                <td class="text-right">
                    <button class="glass p-xs" title="Voir l'historique"><i class="fas fa-history"></i></button>
                </td>
            </tr>
        `).join('');
    },

    renderPromos() {
        const heroForm = document.getElementById('hero-config-form');
        const promoForm = document.getElementById('promo-config-form');

        if (heroForm) {
            heroForm.heroTitle.value = CONFIG.heroTitle || '';
            heroForm.heroSubtitle.value = CONFIG.heroSubtitle || '';
        }
        if (promoForm) {
            promoForm.promoEnabled.checked = CONFIG.promoBannerVisible !== false;
            promoForm.promoText.value = CONFIG.promoBannerTitle || '';
        }
    },

    renderLogs() {
        const container = document.getElementById('activity-log-container');
        if (!container) return;
        
        const logs = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
        
        container.innerHTML = logs.reverse().slice(0, 20).map(log => `
            <div class="flex align-center gap-md py-sm border-bottom">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: ${log.type === 'error' ? '#ef4444' : log.type === 'success' ? '#22c55e' : '#3b82f6'};"></div>
                <div style="flex: 1; font-size: 0.85rem;">
                    <span class="text-bold">${log.action}</span>
                    <span class="text-muted px-md" style="font-size: 0.75rem;">${new Date(log.time).toLocaleTimeString()}</span>
                </div>
            </div>
        `).join('') || '<p class="text-muted">Aucun journal disponible.</p>';
    },

    /** ── Action Hub ────────────────────────────────────────── */
    
    switchTab(tabId, el = null) {
        // Handle nav links
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        if (el) el.classList.add('active');
        else {
            const link = document.querySelector(`.nav-link[onclick*="'${tabId}'"]`);
            if (link) link.classList.add('active');
        }

        // Handle content
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
        });
        const target = document.getElementById(`tab-${tabId}`);
        if (target) {
            target.classList.add('active');
            this.logActivity(`Navigation vers ${tabId}`, 'info');
        }
    },

    async toggleVisibility(id) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (p) {
            const newStatus = !p.visible;
            await ProductDB.update(id, { visible: newStatus });
            this.renderProducts();
            this.showToast(newStatus ? 'Produit activé' : 'Produit masqué');
            this.logActivity(`Visibilité produit ${p.name} : ${newStatus}`, 'success');
        }
    },

    async adjustStock(id, amount) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (p) {
            const newStock = (p.stock || 0) + amount;
            await ProductDB.update(id, { stock: newStock, lastUpdated: new Date().toISOString() });
            this.renderInventory();
            this.renderProducts();
            this.computeStats();
            this.showToast(`Stock mis à jour (+${amount})`);
            this.logActivity(`Réapprovisionnement ${p.name} : +${amount}`, 'success');
        }
    },

    async updateOrderStatus(id, status) {
        await OrderDB.updateStatus(id, status);
        this.renderOrders();
        this.computeStats();
        this.showToast('Statut commande mis à jour');
        this.logActivity(`Status commande #${id} changé en ${status}`, 'info');
    },

    saveHeroConfig(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        CONFIG.heroTitle = data.get('heroTitle');
        CONFIG.heroSubtitle = data.get('heroSubtitle');
        localStorage.setItem('elwali_site_settings', JSON.stringify(CONFIG));
        this.showToast('Configuration Hero mise à jour !');
        this.logActivity('Mise à jour configuration Hero', 'success');
    },

    savePromoConfig(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        CONFIG.promoBannerVisible = data.get('promoEnabled') === 'on';
        CONFIG.promoBannerTitle = data.get('promoText');
        localStorage.setItem('elwali_site_settings', JSON.stringify(CONFIG));
        this.showToast('Configuration Promo mise à jour !');
        this.logActivity('Mise à jour configuration Promo', 'success');
    },

    globalSearch(query) {
        const q = query.toLowerCase();
        if (q.length < 2) {
            this.renderProducts();
            this.renderOrders();
            return;
        }

        const filteredProds = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        this.renderProducts(filteredProds);

        OrderDB.getOrders().then(orders => {
            const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q));
            this.renderOrders(filteredOrders);
        });
    },

    logActivity(action, type = 'info') {
        const logs = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
        logs.push({ action, type, time: Date.now() });
        localStorage.setItem('admin_activity_logs', JSON.stringify(logs));
        this.renderLogs();
    },

    /** ── UI Shell ─────────────────────────────────────────── */

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('admin_theme', next);
        
        const icon = document.querySelector('.theme-toggle i');
        icon.className = next === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    },

    loadTheme() {
        const saved = localStorage.getItem('admin_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        const icon = document.querySelector('.theme-toggle i');
        if (icon) icon.className = saved === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    },

    showToast(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        toastMsg.innerText = msg;
        toast.style.display = 'block';
        setTimeout(() => toast.style.transform = 'translateY(0)', 10);
        
        setTimeout(() => {
            toast.style.transform = 'translateY(100px)';
            setTimeout(() => toast.style.display = 'none', 300);
        }, 3000);
    },

    openProductModal(id = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('product-modal-title');
        
        form.reset();
        if (id) {
            const p = PRODUCTS.find(prod => prod.id === id);
            title.innerText = 'Modifier Produit';
            form.id.value = p.id;
            form.name.value = p.name;
            form.category.value = p.category;
            form.price.value = p.price;
            form.stock.value = p.stock || 0;
            form.image.value = p.image;
        } else {
            title.innerText = 'Nouveau Produit';
            form.id.value = '';
        }
        
        modal.style.display = 'flex';
    },

    closeModal(id) {
        document.getElementById(id).style.display = 'none';
    },

    async handleProductSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const id = data.get('id');
        
        const productData = {
            name: data.get('name'),
            category: data.get('category'),
            price: parseFloat(data.get('price')),
            stock: parseInt(data.get('stock')),
            image: data.get('image'),
            lastUpdated: new Date().toISOString()
        };

        if (id) {
            await ProductDB.update(id, productData);
            this.showToast('Produit mis à jour');
            this.logActivity(`Produit modifié : ${productData.name}`, 'success');
        } else {
            productData.id = 'p-' + Date.now();
            productData.visible = true;
            await ProductDB.saveProduct(productData);
            this.showToast('Produit créé avec succès');
            this.logActivity(`Nouveau produit créé : ${productData.name}`, 'success');
        }

        this.closeModal('product-modal');
        this.renderAll();
    },

    logout() {
        sessionStorage.removeItem('mlh_admin_logged_in');
        window.location.href = 'admin-login.html';
    },

    setupEventListeners() {
        // Toggle Sidebar on mobile (placeholder)
        document.addEventListener('keydown', (e) => {
            if (e.key === 't' && e.ctrlKey) this.toggleTheme();
        });
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => Admin.init());
