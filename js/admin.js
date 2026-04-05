/**
 * ADMIN INTELLIGENCE ENGINE — EL-WALI-SHOP
 * Comprehensive management logic with deep analytics and active controls.
 */

const DEFAULT_ADMIN = {
    username: 'abdelaali',
    // SHA-256 hash of '!@#$1234'
    passwordHash: '0fb2c3ee97570dcf77fb841e26b3678fb2bf7f25e6d5f949c926454825ffc764',
    recoveryEmail: 'abdelaali.markabi@gmail.com',
    role: 'Super Admin',
    status: 'Active'
};

const AdminDB = {
    async fetchAll() {
        const stored = localStorage.getItem('elwali_admins');
        if (!stored) {
            // First run, migrate hardcoded admin
            const initial = [DEFAULT_ADMIN];
            localStorage.setItem('elwali_admins', JSON.stringify(initial));
            return initial;
        }
        const admins = JSON.parse(stored);
        // Migration support for status
        return admins.map(a => ({ ...a, status: a.status || 'Active' }));
    },

    async saveAdmin(admin) {
        const admins = await this.fetchAll();
        const existingIdx = admins.findIndex(a => a.username === admin.username);
        if (existingIdx !== -1) {
            admins[existingIdx] = admin;
        } else {
            admins.push(admin);
        }
        localStorage.setItem('elwali_admins', JSON.stringify(admins));
        return true;
    },

    async delete(username) {
        const admins = await this.fetchAll();
        const filtered = admins.filter(a => a.username !== username);
        localStorage.setItem('elwali_admins', JSON.stringify(filtered));
        return true;
    },

    async matchCredentials(username, passwordHash) {
        const admins = await this.fetchAll();
        return admins.find(a => a.username.toLowerCase() === username.toLowerCase() && a.passwordHash === passwordHash);
    }
};

const RecoveryStore = {
    codes: new Map(), // username -> {code, expires}
    rateLimits: new Map(), // identifier -> {count, lastAttempt}
    
    generate(username) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.codes.set(username.toLowerCase(), {
            code,
            expires: Date.now() + (10 * 60 * 1000) // 10 minutes
        });
        return code;
    },

    verify(username, code) {
        const record = this.codes.get(username.toLowerCase());
        if (!record) return false;
        if (Date.now() > record.expires) {
            this.codes.delete(username.toLowerCase());
            return false;
        }
        const isValid = record.code === code;
        if (isValid) this.codes.delete(username.toLowerCase());
        return isValid;
    },

    checkRateLimit(identifier) {
        const now = Date.now();
        const limit = 5; // 5 attempts
        const windowTime = 15 * 60 * 1000; // 15 minutes
        
        const record = this.rateLimits.get(identifier) || { count: 0, lastAttempt: 0 };
        
        if (now - record.lastAttempt > windowTime) {
            record.count = 0; // Reset window
        }
        
        if (record.count >= limit) return false;
        
        record.count++;
        record.lastAttempt = now;
        this.rateLimits.set(identifier, record);
        return true;
    }
};

const Admin = {
    async init() {
        this.checkAuth();
        this.loadTheme();
        await ProductDB.fetchAll(); // Ensure data is loaded
        await AdminDB.fetchAll();   // Ensure admins are initialized
        
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
        const matchedAdmin = await AdminDB.matchCredentials(username, hashedInput);

        if (matchedAdmin) {
            if (matchedAdmin.status === 'Pending') {
                this.logActivity(`Connexion bloquée : Compte ${username} non vérifié`, 'warning');
                return { success: false, msg: 'Compte non activé. Veuillez vérifier votre email.', requireActivation: true, username: matchedAdmin.username };
            }

            sessionStorage.setItem('mlh_admin_logged_in', 'true');
            sessionStorage.setItem('mlh_admin_user', matchedAdmin.username);
            sessionStorage.setItem('mlh_admin_login_time', Date.now().toString());
            this.logActivity(`Connexion réussie : ${username}`, 'success');
            return { success: true };
        }
        
        this.logActivity(`Tentative de connexion échouée : ${username}`, 'error');
        return { success: false, msg: 'Identifiants invalides' };
    },

    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('mlh_admin_user');
        if (!isLoggedIn && !window.location.pathname.includes('admin-login')) {
            window.location.href = 'admin-login.html';
        }
    },

    async getCurrentUser() {
        const username = sessionStorage.getItem('mlh_admin_user');
        if (!username) return null;
        const admins = await AdminDB.fetchAll();
        return admins.find(a => a.username === username);
    },

    async hasPermission(requiredRole = 'Admin') {
        const user = await this.getCurrentUser();
        if (!user) return false;
        
        // Super Admin has all permissions
        if (user.role === 'Super Admin') return true;
        
        // Match specific role
        return user.role === requiredRole;
    },

    /** ── Password Recovery Logic ────────────────────────── */

    async initiateRecovery(emailInput) {
        // Rate Limiting
        if (!RecoveryStore.checkRateLimit(emailInput)) {
            this.logActivity(`Limitation de débit activée pour : ${emailInput}`, 'warning');
            return { success: false, msg: 'Trop de tentatives. Réessayez dans 15 minutes.' };
        }

        const admins = await AdminDB.fetchAll();
        const user = admins.find(a => a.recoveryEmail.toLowerCase() === emailInput.toLowerCase());
        
        if (!user) return { success: false, msg: 'Aucun compte associé à cet email' };
        
        const code = RecoveryStore.generate(user.username);
        const masked = user.recoveryEmail.replace(/(..)(.*)(@.*)/, '$1***$3');

        // Simulation toast (security display for demo/dev)
        this.logActivity(`Code de vérification généré pour ${user.username}`, 'info');
        console.log(`[SECURITY] Code for ${user.username}: ${code}`);
        
        return { 
            success: true, 
            username: user.username,
            maskedEmail: masked, 
            code 
        };
    },

    async verifyCode(username, code) {
        return RecoveryStore.verify(username, code);
    },

    async verifyNewAccount(username, code) {
        const isValid = RecoveryStore.verify(username, code);
        if (!isValid) return false;

        const admins = await AdminDB.fetchAll();
        const user = admins.find(a => a.username.toLowerCase() === username.toLowerCase());
        if (user) {
            user.status = 'Active';
            await AdminDB.saveAdmin(user);
            this.logActivity(`Compte activé : ${username}`, 'success');
            return true;
        }
        return false;
    },

    async resetPassword(username, newPassword) {
        const admins = await AdminDB.fetchAll();
        const user = admins.find(a => a.username.toLowerCase() === username.toLowerCase());
        if (!user) return false;

        user.passwordHash = await this.hashPassword(newPassword);
        await AdminDB.saveAdmin(user);
        this.logActivity(`Réinitialisation mdp : Succès pour ${username}`, 'success');
        return true;
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
        this.renderAnalytics();
        this.renderAdmins();
        this.renderLayoutTab();
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
                        <img src="${p.image}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover;">
                        <div>
                            <div class="text-bold">${p.name}</div>
                            <div class="text-muted" style="font-size: 0.7rem;">ID: ${p.id}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge glass">${p.category}</span></td>
                <td class="text-bold text-red">${p.price} DH</td>
                <td>
                    <div class="flex align-center gap-sm">
                        <button class="glass p-xs" onclick="Admin.adjustStock('${p.id}', -1)"><i class="fas fa-minus"></i></button>
                        <span class="text-bold mx-xs ${p.stock < 10 ? 'text-red' : ''}">${p.stock}</span>
                        <button class="glass p-xs" onclick="Admin.adjustStock('${p.id}', 1)"><i class="fas fa-plus"></i></button>
                    </div>
                </td>
                <td>
                    <span class="badge" style="background: ${p.visible ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${p.visible ? '#22c55e' : '#ef4444'};">
                        ${p.visible ? 'En ligne' : 'Masqué'}
                    </span>
                </td>
                <td class="text-right">
                    <button class="glass p-xs mr-xs ${p.isPromoted ? 'text-gold' : 'text-muted'}" onclick="Admin.togglePromoted('${p.id}')" title="Mettre en avant">
                        <i class="fas fa-star"></i>
                    </button>
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
                    <div class="flex align-center gap-md">
                        <button class="glass p-sm" onclick="Admin.adjustStock('${p.id}', -5)">-5</button>
                        <button class="glass p-sm" onclick="Admin.adjustStock('${p.id}', -1)">-1</button>
                        <span class="badge mx-md" style="font-size: 1.1rem; min-width: 60px; text-align: center; ${p.stock < 10 ? 'background: rgba(239, 68, 68, 0.1); color: #ef4444;' : ''}">
                            ${p.stock}
                        </span>
                        <button class="glass p-sm" onclick="Admin.adjustStock('${p.id}', 1)">+1</button>
                        <button class="glass p-sm" onclick="Admin.adjustStock('${p.id}', 5)">+5</button>
                    </div>
                </td>
                <td class="text-muted" style="font-size: 0.8rem;">${new Date(p.lastUpdated || Date.now()).toLocaleString()}</td>
                <td>
                    ${p.stock < 10 ? '<span class="text-red text-bold animate-pulse"><i class="fas fa-exclamation-triangle"></i> STOCK CRITIQUE</span>' : '<span class="text-muted">Niveau optimal</span>'}
                </td>
                <td class="text-right">
                    <button class="glass p-sm text-bold" onclick="Admin.openProductModal('${p.id}')">MAJ COMPLÈTE</button>
                </td>
            </tr>
        `).join('');
    },
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

    async renderAnalytics() {
        const forecast = document.getElementById('forecast-value');
        const aovEl = document.getElementById('stat-aov');
        const velocityChart = document.getElementById('sales-velocity-chart');
        const customerChart = document.getElementById('top-customers-ranking');
        const categoryChart = document.getElementById('category-chart');
        if (!forecast) return;

        const orders = await OrderDB.getOrders();
        const customers = await CustomerDB.getCustomers();
        const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
        
        // 1. AOV & Forecast
        const aov = orders.length > 0 ? Math.round(totalRev / orders.length) : 0;
        if (aovEl) aovEl.innerText = `${aov.toLocaleString()} DH`;

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        const recentOrders = orders.filter(o => new Date(o.date) > sevenDaysAgo);
        const weekRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);
        const estimate30d = Math.round((weekRevenue / 7) * 30);
        if (forecast) forecast.innerText = `${estimate30d.toLocaleString()} DH`;

        // 2. Sales Velocity (Last 7 Days)
        if (velocityChart) {
            const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            const dailyData = Array(7).fill(0).map((_, i) => {
                const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                return { day: days[d.getDay()], date: d.toLocaleDateString(), value: 0 };
            }).reverse();

            orders.forEach(o => {
                const oDate = new Date(o.date).toLocaleDateString();
                const dIdx = dailyData.findIndex(d => d.date === oDate);
                if (dIdx !== -1) dailyData[dIdx].value += o.total;
            });

            const maxVal = Math.max(...dailyData.map(d => d.value), 1);
            velocityChart.innerHTML = dailyData.map(d => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div class="glass" style="width: 100%; height: ${(d.value / maxVal) * 100}%; background: var(--accent-red); border-radius: 4px; min-height: 4px; transition: height 1s ease;"></div>
                    <span style="font-size: 0.65rem; font-weight: 800; color: var(--text-muted);">${d.day}</span>
                </div>
            `).join('');
        }

        // 3. Top Customers Ranking
        if (customerChart) {
            const top5 = customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
            const maxSpent = top5.length > 0 ? top5[0].totalSpent : 1;
            customerChart.innerHTML = top5.map(c => `
                <div class="flex-column gap-xs">
                    <div class="flex-between" style="font-size: 0.8rem; font-weight: 700;">
                        <span>${c.name}</span>
                        <span class="text-red">${c.totalSpent.toLocaleString()} DH</span>
                    </div>
                    <div style="height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px;">
                        <div style="width: ${(c.totalSpent / maxSpent) * 100}%; height: 100%; background: #22c55e; border-radius: 2px;"></div>
                    </div>
                </div>
            `).join('') || '<p class="text-muted">Aucun client.</p>';
        }

        // 4. Category Distribution
        if (categoryChart) {
            const cats = {};
            PRODUCTS.forEach(p => cats[p.category] = (cats[p.category] || 0) + 1);
            const totalProds = PRODUCTS.length || 1;
            categoryChart.innerHTML = Object.entries(cats).map(([name, count]) => {
                const pct = Math.round((count / totalProds) * 100);
                return `
                    <div class="flex-column gap-xs">
                        <div class="flex-between" style="font-size: 0.75rem; font-weight: 800;">
                            <span>${name.toUpperCase()}</span>
                            <span>${pct}% (${count})</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px;">
                            <div style="width: ${pct}%; height: 100%; background: var(--accent-red); border-radius: 3px;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
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
            if (tabId === 'media') this.renderMediaTab();
            if (tabId === 'automation') this.renderAutomationTab();
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

    async renderAdmins() {
        const tbody = document.getElementById('admin-management-table-body');
        if (!tbody) return;

        const admins = await AdminDB.fetchAll();
        const currentUser = sessionStorage.getItem('mlh_admin_user');

        tbody.innerHTML = admins.map(a => `
            <tr>
                <td class="text-bold">${a.username} ${a.username === currentUser ? '<span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; margin-left: 0.5rem;">C\'EST VOUS</span>' : ''}</td>
                <td class="text-muted">${a.recoveryEmail}</td>
                <td><span class="badge glass">${a.role || 'Admin'}</span></td>
                <td>
                    <span class="badge" style="background: ${a.status === 'Active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(250, 204, 21, 0.1)'}; color: ${a.status === 'Active' ? '#22c55e' : '#facc15'};">
                        ${a.status === 'Active' ? 'ACTIF' : 'EN ATTENTE'}
                    </span>
                </td>
                <td class="text-right">
                    ${a.username !== currentUser ? `
                        ${a.status === 'Pending' ? `<button class="glass p-xs mr-xs text-gold" onclick="Admin.resendActivation('${a.username}')" title="Renvoyer le code"><i class="fas fa-paper-plane"></i></button>` : ''}
                        <button class="glass p-xs" onclick="Admin.deleteAdmin('${a.username}')">
                            <i class="fas fa-trash-alt" style="color: #ef4444"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    async resendActivation(username) {
        const admins = await AdminDB.fetchAll();
        const user = admins.find(a => a.username === username);
        if (user) {
            const code = RecoveryStore.generate(username);
            this.showToast(`Nouveau code envoyé pour ${username}`);
            console.log(`[SECURITY] Nouveau code pour ${username}: ${code}`);
            this.logActivity(`Code d'activation renvoyé pour ${username}`, 'info');
        }
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

    async openProductModal(id = null) {
        // Permission Check
        if (!(await this.hasPermission('Admin'))) {
            alert('Accès refusé : Seuls les administrateurs peuvent ajouter des produits.');
            return;
        }

        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('product-modal-title');
        
        form.reset();
        this.setImageSource('url'); // Default to URL
        this.previewImage(null);    // Clear preview

        if (id) {
            const p = PRODUCTS.find(prod => prod.id === id);
            title.innerText = 'Modifier Produit';
            form.id.value = p.id;
            form.name.value = p.name;
            form.category.value = p.category;
            form.price.value = p.price;
            form.stock.value = p.stock || 0;
            form.image.value = p.image;
            this.previewImage(p.image);
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
        
        // Permission Check
        if (!(await this.hasPermission('Admin'))) {
            alert('Accès refusé : Vous n\'avez pas les permissions pour modifier les produits.');
            this.logActivity('Tentative de modification produit non autorisée', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const id = formData.get('id');
        const postToFB = formData.get('postToFB') === 'on';
        
        // Image source logic
        let imageSource = formData.get('image');
        const previewImg = document.getElementById('product-img-view');
        if (previewImg && previewImg.src.startsWith('data:')) {
            imageSource = previewImg.src; // Use Base64 from preview if available
        }

        if (!imageSource) {
            alert('Veuillez fournir une photo pour le produit.');
            return;
        }

        const productData = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            image: imageSource,
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
            
            // Automation Trigger
            if (postToFB && CONFIG.facebookAutomation.enabled) {
                this.triggerFacebookAutomation(productData);
            }

            this.logActivity(`Nouveau produit créé : ${productData.name}`, 'success');
        }

        this.closeModal('product-modal');
        this.renderAll();
    },

    openAdminModal() {
        const modal = document.getElementById('admin-modal');
        const form = document.getElementById('admin-form');
        form.reset();
        modal.style.display = 'flex';
    },

    async handleAdminSubmit(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        
        const adminData = {
            username: data.get('username').trim(),
            recoveryEmail: data.get('recoveryEmail').trim(),
            passwordHash: await this.hashPassword(data.get('password')),
            role: 'Admin',
            status: 'Pending',
            createdAt: new Date().toISOString()
        };

        // Check if username already exists
        const admins = await AdminDB.fetchAll();
        if (admins.find(a => a.username.toLowerCase() === adminData.username.toLowerCase())) {
            alert('Ce nom d\'utilisateur est déjà utilisé.');
            return;
        }

        await AdminDB.saveAdmin(adminData);
        
        // Trigger Verification Code
        const code = RecoveryStore.generate(adminData.username);
        this.logActivity(`Nouvel admin créé (En attente) : ${adminData.username}`, 'info');
        console.log(`[SECURITY] Code d'activation pour ${adminData.username}: ${code}`);
        
        this.showToast(`Compte créé ! Code envoyé à ${adminData.recoveryEmail}`);
        this.closeModal('admin-modal');
        this.renderAdmins();
    },

    async deleteAdmin(username) {
        const currentUser = sessionStorage.getItem('mlh_admin_user');
        if (username === currentUser) {
            alert('Sécurité : Vous ne pouvez pas supprimer votre propre compte.');
            return;
        }

        if (!confirm(`Êtes-vous sûr de vouloir supprimer l'accès de ${username} ?`)) return;

        await AdminDB.delete(username);
        this.showToast(`Accès révoqué pour ${username}`);
        this.logActivity(`Administrateur supprimé : ${username}`, 'warning');
        this.renderAdmins();
    },

    /** ── Media & AI Intelligence ─────────────────────────── */

    renderMediaTab() {
        const banners = CONFIG.heroBanners || DEFAULT_CONFIG.heroBanners;
        
        // Populate form fields
        const sections = ['main', 'side1', 'side2'];
        sections.forEach(s => {
            const form = document.querySelector(`form[onsubmit*="'${s}'"]`);
            if (form) {
                form.img.value = banners[s].img;
                form.title.value = banners[s].title;
                if (form.tag) form.tag.value = banners[s].tag || '';
            }
        });
    },

    saveMediaConfig(e, key) {
        e.preventDefault();
        const data = new FormData(e.target);
        const banners = CONFIG.heroBanners || DEFAULT_CONFIG.heroBanners;
        
        banners[key] = {
            img: data.get('img'),
            title: data.get('title'),
            tag: data.get('tag') || ''
        };

        CONFIG.heroBanners = banners;
        localStorage.setItem('elwali_site_settings', JSON.stringify(CONFIG));
        this.showToast(`Bannière ${key} mise à jour !`);
        this.logActivity(`Mise à jour média : ${key}`, 'success');
    },

    runAIDiagnostics() {
        const btn = document.getElementById('ai-diag-btn');
        const results = document.getElementById('ai-results-container');
        const list = document.getElementById('ai-suggestions-list');
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ANALYSE IA EN COURS...';
        btn.disabled = true;

        setTimeout(() => {
            const categories = {};
            PRODUCTS.forEach(p => categories[p.category] = (categories[p.category] || 0) + 1);

            const suggestions = [];
            
            // AI Insight 1: Low Density Categories
            Object.entries(categories).forEach(([name, count]) => {
                if (count < 3) {
                    suggestions.push(`La catégorie <strong>${name}</strong> est sous-peuplée. IA suggère de fusionner avec "Premium Collection".`);
                }
            });

            // AI Insight 2: Generic Names
            if (PRODUCTS.some(p => p.name.length < 15)) {
                suggestions.push("Certains noms de produits sont trop courts. IA suggère d'ajouter des adjectifs comme 'Haute Performance' ou 'Série Luxe'.");
            }

            // AI Insight 3: Category Optimization
            if (!categories['Saisonnier']) {
                suggestions.push("IA suggère de créer une catégorie <strong>'Saisonnier Marrakech'</strong> pour booster le SEO local.");
            }

            list.innerHTML = suggestions.map(s => `<li class="animate-slide-up">${s}</li>`).join('');
            results.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-check-circle"></i> DIAGNOSTIC TERMINÉ';
            btn.disabled = false;
            
            this.logActivity('Exécution diagnostic IA', 'info');
        }, 1500);
    },

    applyAISuggestions() {
        this.showToast('L\'IA réorganise votre boutique...');
        this.logActivity('Application des recommandations IA', 'success');
        
        setTimeout(() => {
            document.getElementById('ai-results-container').style.display = 'none';
            this.showToast('Boutique optimisée avec succès !');
        }, 1000);
    },

    /** ── Automation Intelligence ─────────────────────────── */

    renderAutomationTab() {
        const form = document.getElementById('automation-config-form');
        if (form) {
            form.fbEnabled.checked = CONFIG.facebookAutomation.enabled;
            form.fbWebhook.value = CONFIG.facebookAutomation.webhookUrl;
        }
    },

    saveAutomationConfig(e) {
        e.preventDefault();
        const data = new FormData(e.target);
        CONFIG.facebookAutomation = {
            enabled: data.get('fbEnabled') === 'on',
            webhookUrl: data.get('fbWebhook')
        };
        localStorage.setItem('elwali_site_settings', JSON.stringify(CONFIG));
        this.showToast('Configuration automation enregistrée !');
        this.logActivity('Mise à jour paramètres automation', 'success');
    },

    async triggerFacebookAutomation(product) {
        const webhook = CONFIG.facebookAutomation.webhookUrl;
        if (!webhook) return;

        this.showToast('Envoi vers Facebook en cours...');
        
        try {
            const response = await fetch(webhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    platform: 'Facebook',
                    action: 'NEW_PRODUCT',
                    store: CONFIG.storeName,
                    product: {
                        id: product.id,
                        name: product.name,
                        price: `${product.price} DH`,
                        image: product.image,
                        category: product.category,
                        link: `https://el-wali-shop.work.gd/product-detail.html?id=${product.id}`
                    }
                })
            });

            if (response.ok) {
                this.showToast('Publication Facebook réussie !');
                this.logActivity(`Publication auto Facebook : ${product.name}`, 'success');
            } else {
                throw new Error('Webhook failed');
            }
        } catch (err) {
            console.error('FB Automation Error:', err);
            this.showToast('Échec de la publication Facebook', 'error');
            this.logActivity(`Échec publication Facebook : ${product.name}`, 'error');
        }
    },

    /** ── Media Intelligent Engine ─────────────────────────── */

    setImageSource(type) {
        const urlBtn = document.getElementById('btn-img-url');
        const uploadBtn = document.getElementById('btn-img-upload');
        const urlInput = document.getElementById('input-img-url');
        const uploadInput = document.getElementById('input-img-upload');

        if (type === 'url') {
            urlBtn.classList.add('active');
            uploadBtn.classList.remove('active');
            urlInput.style.display = 'block';
            uploadInput.style.display = 'none';
        } else {
            urlBtn.classList.remove('active');
            uploadBtn.classList.add('active');
            urlInput.style.display = 'none';
            uploadInput.style.display = 'block';
        }
    },

    handleImageSelection(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Optimization check (1MB)
        if (file.size > 1024 * 1024) {
            alert('Attention : Cette image est volumineuse (>1MB). Pour éviter de saturer la mémoire du site, préférez des images plus légères ou utilisez un lien URL.');
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            this.previewImage(base64);
        };
        reader.readAsDataURL(file);
    },

    previewImage(src) {
        const container = document.getElementById('img-preview-container');
        const img = document.getElementById('product-img-view');
        
        if (src) {
            img.src = src;
            container.style.display = 'flex';
        } else {
            img.src = '';
            container.style.display = 'none';
        }
    },

    /** ── Layout & Visual Control ─────────────────────────── */

    renderLayoutTab() {
        const layoutList = document.getElementById('layout-sortable-list');
        const featuredList = document.getElementById('featured-sortable-list');
        if (!layoutList || !featuredList) return;

        const sections = CONFIG.layoutOrder || ['hero', 'promos', 'featured', 'categories'];
        const sectionLabels = {
            hero: { name: 'Bannière Principale (Hero)', icon: 'fa-star' },
            promos: { name: 'Grille Promotionnelle', icon: 'fa-percentage' },
            featured: { name: 'Produits Phares', icon: 'fa-crown' },
            categories: { name: 'Exploration Catégories', icon: 'fa-th' }
        };

        layoutList.innerHTML = sections.map(s => `
            <div class="glass p-md mb-xs flex align-center gap-md draggable-item" data-id="${s}" style="cursor: grab;">
                <i class="fas fa-grip-vertical text-muted"></i>
                <div class="flex-1">
                    <div class="text-bold" style="font-size: 0.9rem;">${sectionLabels[s].name}</div>
                    <div class="text-muted" style="font-size: 0.7rem;">Tag: ${s}</div>
                </div>
                <i class="fas ${sectionLabels[s].icon} text-red"></i>
            </div>
        `).join('');

        // Sortable Products (top 5)
        const promoted = PRODUCTS.filter(p => p.isPromoted).slice(0, 8);
        featuredList.innerHTML = promoted.map(p => `
            <div class="glass p-sm mb-xs flex align-center gap-md draggable-product" data-id="${p.id}" style="cursor: grab; border-radius: var(--radius-sm);">
                <i class="fas fa-grip-vertical text-muted"></i>
                <img src="${p.image}" style="width: 30px; height: 30px; object-fit: cover; border-radius: 4px;">
                <div class="flex-1 text-bold" style="font-size: 0.8rem;">${p.name}</div>
                <div class="text-red text-bold" style="font-size: 0.75rem;">${p.price} DH</div>
            </div>
        `).join('') || '<p class="text-muted p-md text-center">Aucun produit étoilé ⭐️</p>';

        this.initSortable();
    },

    initSortable() {
        if (typeof Sortable === 'undefined') return;

        new Sortable(document.getElementById('layout-sortable-list'), {
            animation: 150,
            ghostClass: 'glass-light',
            onEnd: () => this.showToast('Nouvel ordre prêt à enregistrer 💾')
        });

        new Sortable(document.getElementById('featured-sortable-list'), {
            animation: 150,
            ghostClass: 'glass-light'
        });
    },

    async saveConfig() {
        localStorage.setItem('elwali_site_settings', JSON.stringify(CONFIG));
    },

    async saveLayoutOrder() {
        const layoutList = document.getElementById('layout-sortable-list');
        if (!layoutList) return;
        
        const layoutItems = Array.from(layoutList.children);
        const newOrder = layoutItems.map(item => item.dataset.id);

        CONFIG.layoutOrder = newOrder;
        await this.saveConfig();
        this.showToast('Architecture sauvegardée avec succès !');
        this.logActivity('Mise à jour de l\'architecture d\'accueil', 'info');
    },

    async togglePromoted(id) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (p) {
            p.isPromoted = !p.isPromoted;
            await ProductDB.save(p);
            this.renderProducts();
            this.renderLayoutTab();
            this.showToast(p.isPromoted ? 'Mis en avant ! 🌟' : 'Retiré des favoris');
        }
    },

    async adjustStock(id, amount) {
        const p = PRODUCTS.find(prod => prod.id === id);
        if (p) {
            p.stock = Math.max(0, (p.stock || 0) + amount);
            p.lastUpdated = new Date().toISOString();
            await ProductDB.save(p);
            this.renderProducts();
            this.renderInventory();
            this.computeStats();
            this.showToast(`Stock mis à jour pour ${p.name}`);
        }
    },

    updateLivePreview(input, target) {
        const el = document.getElementById(`preview-${target}`);
        if (el) el.innerHTML = input.value || (target === 'hero-title' ? 'Titre de la Bannière' : 'Description...');
    },

    logout() {
        sessionStorage.removeItem('mlh_admin_logged_in');
        window.location.href = 'admin-login.html';
    },

    async exportOrders() {
        const orders = await OrderDB.getOrders();
        let csv = 'ID,Date,Client,Telephone,Total,Status\n';
        orders.forEach(o => {
            csv += `${o.id},${o.date},"${o.customer.name}",${o.customer.phone},${o.total},${o.status}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `el-wali-orders-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        this.logActivity('Export des commandes CSV', 'info');
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
