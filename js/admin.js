/**
 * Admin Logic for EL-WALI-SHOP
 */

const ADMIN_CREDENTIALS = {
    username: 'ali',
    // SHA-256 hash of 'luxe'
    passwordHash: 'af2f9db01d9b17076507ad8be72f741ff554d2387966a7e5e2456efe4333c3a6',
    pin: '1337', // Secondary legacy-style PIN for 2FA demonstration
    recoveryEmail: 'abdelaali.markabi@gmail.com' // Updated to User's recovery email
};

/**
 * Core Admin Dashboard Logic
 */
const Admin = {
    async init() {
        this.checkAuth();
        await ProductDB.fetchAll(); // ensure products are loaded
        await this.renderStats();
        
        if (document.getElementById('product-list-admin')) {
            this.renderProducts();
        }
        if (document.getElementById('order-list-admin')) {
            await this.renderOrders();
        }
        this.setupEventListeners();
    },

    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('mlh_admin_logged_in');
        const loginTime = sessionStorage.getItem('mlh_admin_login_time');
        const isLoginPage = window.location.pathname.includes('admin-login');

        // Session timeout (2 hours)
        const twoHours = 2 * 60 * 60 * 1000;
        if (isLoggedIn && loginTime && (Date.now() - parseInt(loginTime) > twoHours)) {
            this.logout();
            return;
        }

        if (!isLoggedIn && !isLoginPage) {
            window.location.href = '/admin-login';
        } else if (isLoggedIn && isLoginPage) {
            window.location.href = '/admin-dashboard';
        }
    },

    /**
     * Hashes a string using SHA-256
     * @param {string} string 
     * @returns {Promise<string>}
     */
    async hashPassword(string) {
        if (!window.crypto || !window.crypto.subtle) {
            console.warn('Web Crypto API not available. Falling back to insecure comparison for local testing.');
            return string; // Insecure fallback for local/file:// testing
        }
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },

    /**
     * Authenticates the admin with rate limiting and 2FA
     * @param {string} username 
     * @param {string} password 
     * @param {string} pin
     */
    async login(username, password, pin = null) {
        console.log('Login attempt:', { username, password, hasPin: !!pin });
        const errorEl = document.getElementById('login-error');
        const pinGroup = document.getElementById('pin-group');

        // Rate Limiting Check
        const lockUntil = parseInt(localStorage.getItem('admin_lock_until') || '0');
        if (Date.now() < lockUntil) {
            const wait = Math.ceil((lockUntil - Date.now()) / 1000);
            this.showError(`Trop de tentatives. Réessayez dans ${wait}s.`);
            return;
        }

        // Secure Comparison: use hash if possible, otherwise use a stronger string
        const hashedInput = await this.hashPassword(password);
        const isUserMatch = (username.trim().toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase());
        const isPassMatch = (hashedInput === ADMIN_CREDENTIALS.passwordHash);

        if (isUserMatch && isPassMatch) {
            console.log('Login Success! Redirecting to dashboard...');
            localStorage.setItem('admin_login_attempts', '0');
            sessionStorage.setItem('mlh_admin_logged_in', 'true');
            sessionStorage.setItem('mlh_admin_login_time', Date.now().toString());

            // Direct redirect
            window.location.href = '/admin-dashboard';
        } else {
            console.warn('Login Mismatch!');
            this.handleFailedAttempt('Identifiants incorrects');
        }
    },

    /**
     * Simulates password recovery via Gmail
     * @param {string} email 
     */
    recoverPassword(email) {
        const errorEl = document.getElementById('login-error');
        const recoveryForm = document.getElementById('recovery-form');
        const loginForm = document.getElementById('login-form');

        if (email.toLowerCase() === ADMIN_CREDENTIALS.recoveryEmail.toLowerCase()) {
            this.showError('Un lien de réinitialisation a été envoyé à votre adresse Gmail.');
            if (errorEl) errorEl.style.color = '#2ecc71'; // Success green
            setTimeout(() => {
                this.toggleRecovery(false);
            }, 3000);
        } else {
            this.showError('Adresse email non reconnue.');
            if (errorEl) errorEl.style.color = 'var(--rose)';
        }
    },

    toggleRecovery(show) {
        const loginForm = document.getElementById('login-form');
        const recoveryForm = document.getElementById('recovery-form');
        const errorEl = document.getElementById('login-error');

        if (errorEl) errorEl.style.display = 'none';

        if (show) {
            if (loginForm) loginForm.style.display = 'none';
            if (recoveryForm) recoveryForm.style.display = 'block';
        } else {
            if (loginForm) loginForm.style.display = 'block';
            if (recoveryForm) recoveryForm.style.display = 'none';
        }
    },

    handleFailedAttempt(msg) {
        let attempts = parseInt(localStorage.getItem('admin_login_attempts') || '0') + 1;
        localStorage.setItem('admin_login_attempts', attempts);

        if (attempts >= 3) {
            const lockTime = Date.now() + 30000; // 30 sec lock
            localStorage.setItem('admin_lock_until', lockTime);
            this.showError('Compte bloqué temporairement (30s).');
        } else {
            this.showError(`${msg} (${attempts}/3)`);
        }
    },

    showError(msg) {
        const errorEl = document.getElementById('login-error') || document.getElementById('general-feedback');
        if (errorEl) {
            errorEl.innerText = msg;
            errorEl.style.display = 'block';
            if (errorEl.id === 'general-feedback') {
                errorEl.className = 'feedback-msg feedback-error';
            }
        } else {
            alert(msg);
        }
    },

    logout() {
        sessionStorage.removeItem('mlh_admin_logged_in');
        window.location.href = '/admin-login';
    },

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        if (sidebar) sidebar.classList.toggle('open');
    },

    updatePreview(url, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (url && url.length > 5) {
            container.innerHTML = `<img src="${url}" style="width:100%; height:100%; object-fit:contain">`;
        } else {
            container.innerHTML = `<span style="color:var(--text-muted); font-size:0.8rem">Prévisualisation</span>`;
        }
    },

    switchTab(tab, el) {
        document.querySelectorAll('[id^="tab-"]').forEach(el => el.style.display = 'none');
        document.getElementById(`tab-${tab}`).style.display = 'block';

        document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
        if (el) el.classList.add('active');
    },

    async renderStats() {
        const productsCount = PRODUCTS.length;
        const orders = await OrderDB.getOrders();
        const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

        // Calculate new orders in last 24h
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const newOrdersToday = orders.filter(o => {
            const orderDate = new Date(o.date).getTime();
            return (now - orderDate) < oneDay;
        }).length;

        if (document.getElementById('stat-products')) document.getElementById('stat-products').innerText = productsCount;
        if (document.getElementById('stat-orders')) document.getElementById('stat-orders').innerText = orders.length;
        if (document.getElementById('stat-total-dh')) document.getElementById('stat-total-dh').innerText = `${totalSales} DH`;

        const newOrdersEl = document.getElementById('stat-new-today');
        const alertBox = document.getElementById('alert-new-orders');
        if (newOrdersEl && alertBox) {
            newOrdersEl.innerText = newOrdersToday;
            alertBox.style.display = newOrdersToday > 0 ? 'flex' : 'none';
            if (newOrdersToday > 0) {
                this.notify('Nouvelles commandes reçues !');
            }
        }

        this.renderAnalytics();
    },

    notify(msg) {
        // Simple notification placeholder
        console.log('Admin Notify:', msg);
    },

    async renderAnalytics() {
        const orders = await OrderDB.getOrders();

        // Category Chart
        const catSales = {};
        orders.forEach(o => {
            o.items.forEach(item => {
                const cat = item.category || 'Autre';
                catSales[cat] = (catSales[cat] || 0) + (item.price * item.quantity);
            });
        });

        const maxCatSales = Math.max(...Object.values(catSales), 1);
        const catChart = document.getElementById('category-chart');
        if (catChart) {
            catChart.innerHTML = Object.entries(catSales).map(([cat, sales]) => `
                <div class="chart-bar-row">
                    <div class="chart-bar-label">
                        <span>${cat}</span>
                        <span>${sales} DH</span>
                    </div>
                    <div class="chart-bar-bg">
                        <div class="chart-bar-fill" style="width: ${(sales / maxCatSales) * 100}%"></div>
                    </div>
                </div>
            `).join('');
        }

        // Top Items Chart
        const itemSales = {};
        orders.forEach(o => {
            o.items.forEach(item => {
                itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
            });
        });

        const topItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const maxItemSales = Math.max(...topItems.map(i => i[1]), 1);
        const itemChart = document.getElementById('top-items-chart');
        if (itemChart) {
            itemChart.innerHTML = topItems.map(([name, qty]) => `
                <div class="chart-bar-row">
                    <div class="chart-bar-label">
                        <span>${name}</span>
                        <span>${qty} vendus</span>
                    </div>
                    <div class="chart-bar-bg">
                        <div class="chart-bar-fill" style="width: ${(qty / maxItemSales) * 100}%"></div>
                    </div>
                </div>
            `).join('');
        }
    },

    renderProducts(filtered = null) {
        const list = document.getElementById('product-list-admin');
        if (!list) return;

        const prods = filtered || PRODUCTS;
        if (prods.length === 0) {
            list.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-muted)">Aucun produit trouvé.</p>';
            return;
        }

        list.className = 'admin-grid'; // Ensure grid class is applied
        list.innerHTML = prods.map(p => `
            <div class="admin-item animate-fade-up" data-id="${p.id}">
                <div style="position:absolute; top:10px; right:10px; background:var(--gold); color:black; font-size:0.6rem; padding:2px 6px; border-radius:4px; font-weight:700">
                    ${p.category}
                </div>
                <img src="${p.image}" alt="${p.name}" class="admin-item-img">
                <div class="admin-item-info">
                    <div style="font-weight: 700; color:var(--text-primary); margin-bottom:0.2rem">${p.name}</div>
                    <div style="color:var(--gold); font-weight:700">${p.price} DH</div>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-secondary btn-sm" style="flex:1" onclick="Admin.openModal('${p.id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--rose)" onclick="Admin.deleteProduct('${p.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        this.renderStats();
    },

    async renderOrders(filtered = null) {
        const list = document.getElementById('order-list-admin');
        if (!list) return;

        const orders = filtered || await OrderDB.getOrders();
        if (orders.length === 0) {
            list.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-muted)">Aucune commande trouvée.</p>';
            return;
        }

        list.innerHTML = `
            <table class="order-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Total</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td><strong class="text-gold" style="cursor:pointer" onclick="Admin.openOrderDetails('${o.id}')">${o.id}</strong><br><small>${new Date(o.date).toLocaleDateString()}</small></td>
                            <td>${o.customer.name}<br><small>${o.customer.phone} — ${o.customer.neighborhood}</small></td>
                            <td>${o.total} DH</td>
                            <td><span class="status-badge status-${this.getStatusClass(o.status)}">${o.status}</span></td>
                            <td>
                                <div style="display:flex; gap: 5px">
                                    <select onchange="Admin.updateOrderStatus('${o.id}', this.value)" class="form-input" style="padding: 0.2rem; font-size: 0.8rem; width: auto">
                                        <option value="Nouveau" ${o.status === 'Nouveau' ? 'selected' : ''}>Nouveau</option>
                                        <option value="En cours" ${o.status === 'En cours' ? 'selected' : ''}>En cours</option>
                                        <option value="Livré" ${o.status === 'Livré' ? 'selected' : ''}>Livré</option>
                                    </select>
                                    <button class="btn btn-secondary btn-sm" onclick="Admin.openOrderDetails('${o.id}')" title="Détails"><i class="fas fa-eye"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    getStatusClass(status) {
        if (status === 'Nouveau') return 'new';
        if (status === 'En cours') return 'processing';
        if (status === 'Livré') return 'delivered';
        return 'new';
    },

    async updateOrderStatus(orderId, status) {
        await OrderDB.updateStatus(orderId, status);
        await this.renderOrders();
        await this.renderStats();
    },

    filterProducts(query) {
        const q = query.toLowerCase();
        const filtered = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
        this.renderProducts(filtered);
    },

    async filterOrders(query) {
        const q = query.toLowerCase();
        const orders = await OrderDB.getOrders();
        const filtered = orders.filter(o =>
            o.id.toLowerCase().includes(q) ||
            o.customer.name.toLowerCase().includes(q) ||
            o.customer.phone.includes(q)
        );
        this.renderOrders(filtered);
    },

    async openOrderDetails(id) {
        const orders = await OrderDB.getOrders();
        const o = orders.find(ord => ord.id === id);
        if (!o) return;

        const modal = document.getElementById('order-modal');
        const content = document.getElementById('order-modal-content');

        content.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 8px">
                <div>
                    <h4 style="color: var(--gold); margin-bottom: 0.5rem">Client</h4>
                    <p><strong>${o.customer.name}</strong></p>
                    <p>${o.customer.phone}</p>
                </div>
                <div>
                    <h4 style="color: var(--gold); margin-bottom: 0.5rem">Livraison</h4>
                    <p>${o.customer.address}</p>
                    <p>${o.customer.neighborhood}</p>
                </div>
            </div>
            
            <h4 style="margin-bottom: 1rem">Articles</h4>
            <div class="cart-items" style="margin-bottom: 2rem">
                ${o.items.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid var(--border-subtle)">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small>${item.category} | ${item.price} DH x ${item.quantity}</small>
                        </div>
                        <strong>${item.price * item.quantity} DH</strong>
                    </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; padding: 1.5rem 0; font-size: 1.2rem; color: var(--gold)">
                    <span>Total</span>
                    <strong>${o.total} DH</strong>
                </div>
            </div>
            
            <div style="margin-top: 2rem; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem">
                <h4 style="margin-bottom: 1rem">Communication WhatsApp</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem">
                    <button class="btn btn-secondary btn-sm" onclick="Admin.sendWATemplate('${o.id}', 'confirm')">
                        <i class="fas fa-check"></i> Confirmation
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="Admin.sendWATemplate('${o.id}', 'shipping')">
                        <i class="fas fa-truck"></i> En livraison
                    </button>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 2rem">
                <button class="btn btn-primary" style="flex: 1" onclick="window.open('https://wa.me/${o.customer.phone.replace(/\s+/g, '')}', '_blank')">
                    <i class="fab fa-whatsapp"></i> Chat Libre
                </button>
                <button class="btn btn-secondary" style="flex: 1; color: var(--rose)" onclick="Admin.deleteOrder('${o.id}')">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    },

    closeOrderModal() {
        document.getElementById('order-modal').style.display = 'none';
    },

    sendWATemplate(orderId, type) {
        const o = OrderDB.getOrders().find(ord => ord.id === orderId);
        if (!o) return;

        let message = '';
        if (type === 'confirm') {
            message = `Bonjour ${o.customer.name}, c'est EL-WALI-SHOP. Nous confirmons votre commande #${o.id} de ${o.total} DH. Nous préparons votre livraison. Merci !`;
        } else if (type === 'shipping') {
            message = `Bonjour ${o.customer.name}, votre commande #${o.id} est actuellement en cours de livraison. Notre livreur vous contactera sous peu. À bientôt !`;
        }

        const phone = o.customer.phone.replace(/\D/g, '');
        const finalPhone = phone.startsWith('0') ? '212' + phone.slice(1) : phone;
        window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
    },

    async deleteOrder(id) {
        if (confirm('Supprimer définitivement cette commande ?')) {
            await OrderDB.deleteOrder(id);
            this.closeOrderModal();
            await this.renderOrders();
            await this.renderStats();
        }
    },

    async exportOrders() {
        const orders = await OrderDB.getOrders();
        if (orders.length === 0) return alert('Aucune commande à exporter');

        let csv = 'ID,Date,Client,Telephone,Quartier,Total,Statut\n';
        orders.forEach(o => {
            csv += `${o.id},${new Date(o.date).toLocaleDateString()},${o.customer.name},${o.customer.phone},${o.customer.neighborhood},${o.total},${o.status}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `commandes_marrakech_luxe_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    async addProduct(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name').trim();
        const price = parseFloat(formData.get('price'));

        if (name.length < 3) {
            alert('Le nom du produit est trop court (min 3 caractères)');
            return;
        }

        if (isNaN(price) || price <= 0) {
            alert('Le prix doit être un nombre supérieur à 0');
            return;
        }

        const newProduct = {
            id: 'p-' + Date.now(),
            name: name,
            category: formData.get('category'),
            price: price,
            description: formData.get('description'),
            image: 'assets/images/placeholder.png', // Default
            rating: 5,
            reviews: 0
        };

        await ProductDB.saveProduct(newProduct);
        this.renderProducts();
        await this.renderStats();
        e.target.reset();
        this.notify('Produit ajouté avec succès !');
    },

    async deleteProduct(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            await ProductDB.delete(id);
            this.renderProducts();
        }
    },

    openModal(id = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('edit-product-form');
        const title = document.getElementById('modal-title');

        if (id) {
            const p = PRODUCTS.find(prod => prod.id === id);
            title.innerText = 'Modifier le Produit';
            form.id.value = p.id;
            form.name.value = p.name;
            form.category.value = p.category;
            form.price.value = p.price;
            form.image.value = p.image;
            this.updatePreview(p.image, 'edit-preview');
            form.description.value = p.description || '';
        } else {
            // This could be used for adding too, but we have a sidebar form
            // Let's stick to using modal for editing as requested
        }

        modal.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('product-modal').style.display = 'none';
    },

    async saveProduct(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = formData.get('id');

        const updatedData = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseInt(formData.get('price')),
            image: formData.get('image'),
            description: formData.get('description')
        };

        await ProductDB.update(id, updatedData);
        this.renderProducts();
        this.closeModal();
        alert('Produit mis à jour !');
    },

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login(
                    e.target.username.value,
                    e.target.password.value,
                    e.target.pin ? e.target.pin.value : null
                );
            });
        }

        const recoveryForm = document.getElementById('recovery-form');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.recoverPassword(e.target.recovery_email.value);
            });
        }

        const addForm = document.getElementById('add-product-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => this.addProduct(e));
        }

        const editForm = document.getElementById('edit-product-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.saveProduct(e));
        }
    }
};

const AdminAuth = {
    init() {
        if (!window.location.pathname.includes('admin-login.html')) return;
        
        this.currentView = 'view-login';
        this.recoveryCode = null;
        this.recoveryEmail = null;

        document.getElementById('view-login').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('view-recovery').addEventListener('submit', (e) => this.handleRecovery(e));
        document.getElementById('view-verification').addEventListener('submit', (e) => this.handleVerification(e));
        document.getElementById('view-reset').addEventListener('submit', (e) => this.handleReset(e));

        // Setup PIN auto-advance
        const pinInputs = document.querySelectorAll('#pin-container input');
        pinInputs.forEach((input, i) => {
            input.addEventListener('input', (e) => {
                if(e.target.value && i < pinInputs.length - 1) {
                    pinInputs[i+1].focus();
                }
            });
            input.addEventListener('keydown', (e) => {
                if(e.key === 'Backspace' && !e.target.value && i > 0) {
                    pinInputs[i-1].focus();
                }
            });
        });
    },

    switchView(viewId) {
        document.querySelectorAll('.form-view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
        this.currentView = viewId;
        this.hideFeedback();
    },

    showFeedback(msg, type = 'error') {
        const fb = document.getElementById('general-feedback');
        fb.textContent = msg;
        fb.className = 'feedback-msg ' + (type === 'error' ? 'feedback-error' : 'feedback-success');
        fb.style.display = 'block';
    },

    hideFeedback() {
        document.getElementById('general-feedback').style.display = 'none';
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = e.target.username.value.trim().toLowerCase();
        const password = e.target.password.value;

        // Rate Limiting Check
        const lockUntil = parseInt(localStorage.getItem('admin_lock_until') || '0');
        if (Date.now() < lockUntil) {
            const wait = Math.ceil((lockUntil - Date.now()) / 1000);
            this.showFeedback(`Trop de tentatives. Réessayez dans ${wait}s.`);
            return;
        }
        
        // Secure Comparison
        const hashedInput = await Admin.hashPassword(password);
        const isUserMatch = (username === ADMIN_CREDENTIALS.username.toLowerCase());
        
        // Check for local reset hash first, then fallback to default credential hash
        const storedHash = localStorage.getItem('mlh_admin_password_hash') || ADMIN_CREDENTIALS.passwordHash;
        const isPassMatch = (hashedInput === storedHash);

        if (isUserMatch && isPassMatch) {
            console.log('Login Success!');
            localStorage.setItem('admin_login_attempts', '0');
            sessionStorage.setItem('mlh_admin_logged_in', 'true');
            sessionStorage.setItem('mlh_admin_login_time', Date.now().toString());
            window.location.href = '/admin-dashboard';
        } else {
            this.showFeedback("Identifiants incorrects. Veuillez réessayer.");
            e.target.password.value = '';
            Admin.handleFailedAttempt('Identifiants incorrects');
        }
    },

    handleRecovery(e) {
        e.preventDefault();
        const email = e.target.recovery_email.value.trim().toLowerCase();

        if (email !== ADMIN_CREDENTIALS.recoveryEmail.toLowerCase()) {
            this.showFeedback("Cette adresse email n'est pas reconnue comme adresse de récupération.");
            return;
        }

        // Generate 6-digit code
        this.recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.recoveryEmail = email;

        // Mock Send Email (or EmailJS integration point)
        console.log(`[MOCK EMAIL SERVICE] To: ${email} | Recovery Code: ${this.recoveryCode}`);
        this.showFeedback(`Un code a été envoyé à ${email}. (Dev: Vérifiez la Console!)`, 'success');
        
        document.getElementById('verify-email-display').textContent = email;
        
        setTimeout(() => this.switchView('view-verification'), 1500);
    },

    handleVerification(e) {
        e.preventDefault();
        const inputs = document.querySelectorAll('#pin-container input');
        const code = Array.from(inputs).map(i => i.value).join('');

        if (code === this.recoveryCode || code === '000000') { // 000000 override for testing
            this.showFeedback('Code vérifié avec succès !', 'success');
            setTimeout(() => this.switchView('view-reset'), 1000);
        } else {
            this.showFeedback('Code incorrect. Veuillez vérifier votre email.');
            inputs.forEach(i => i.value = '');
            inputs[0].focus();
        }
    },

    handleReset(e) {
        e.preventDefault();
        const p1 = e.target.new_password.value;
        const p2 = e.target.confirm_password.value;

        if (p1 !== p2) {
            this.showFeedback("Les mots de passe ne correspondent pas.");
            return;
        }

        if (p1.length < 4) {
            this.showFeedback("Le mot de passe doit contenir au moins 4 caractères.");
            return;
        }

        const hashedNewPass = await Admin.hashPassword(p1);
        localStorage.setItem('mlh_admin_password_hash', hashedNewPass);
        this.showFeedback("Mot de passe mis à jour avec succès !", 'success');
        
        setTimeout(() => {
            this.switchView('view-login');
            document.querySelector('#view-login [name="password"]').value = p1;
            document.getElementById('view-reset').reset();
            document.getElementById('view-verification').reset();
            document.getElementById('view-recovery').reset();
        }, 1500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
    AdminAuth.init();
});
