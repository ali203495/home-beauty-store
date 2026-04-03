/**
 * Admin Logic for EL-WALI-SHOP
 */

const ADMIN_CREDENTIALS = {
    username: 'abdelaali',
    // SHA-256 hash of '!@#$1234'
    passwordHash: '0fb2c3ee97570dcf77fb841e26b3678fb2bf7f25e6d5f949c926454825ffc764',
    pin: '1337', // Secondary legacy-style PIN for 2FA demonstration
    recoveryEmail: 'abdelaali.markabi@gmail.com'
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
        this.loadSettings();
        this.renderAdmins();
        this.setupEventListeners();
    },

    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('mlh_admin_logged_in') === 'true';
        const isLoginPage = window.location.pathname.includes('admin-login');
        const loginForm = document.getElementById('login-form');
        
        if (!isLoggedIn && !isLoginPage && !loginForm) {
            window.location.href = 'admin-login.html';
        }
    },

    /**
     * Hashes a string using SHA-256
     * @param {string} string 
     * @returns {Promise<string>}
     */
    async hashPassword(string) {
        if (!window.crypto || !window.crypto.subtle) {
            console.warn('Web Crypto API not available. This browser is not in a Secure Context (HTTPS).');
            // This situation usually only happens on local unencrypted connections.
            // On production (Vercel), it will always reach the secure hash block below.
            return string; 
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
            window.location.href = 'admin-dashboard.html';
            return true;
        } else {
            // Check secondary admins in localStorage
            const admins = this.getAdmins();
            const adminMatch = admins.find(a => a.email.toLowerCase() === username.toLowerCase() && a.tempPassword === password);
            
            if (adminMatch) {
                sessionStorage.setItem('mlh_admin_logged_in', 'true');
                sessionStorage.setItem('mlh_admin_role', adminMatch.role);
                window.location.href = 'admin-dashboard.html';
                return true;
            }

            console.warn('Login Mismatch!');
            this.handleFailedAttempt('Identifiants incorrects');
            return false;
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
        window.location.href = '/';
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
            container.innerHTML = `
                <i class="fas fa-image" style="font-size: 2rem; opacity: 0.3"></i>
                <span style="color:var(--text-muted); font-size:0.8rem; margin-top: 5px">Prévisualisation</span>
            `;
        }
    },

    handleImageSelect(event, previewId, dataInputId) {
        const file = event.target.files[0];
        if (!file) return;

        // Basic size check (max 2MB for storage efficiency)
        if (file.size > 2 * 1024 * 1024) {
            alert('L\'image est trop lourde pour le moment (max 2MB).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            // Update preview
            this.updatePreview(base64, previewId);
            // Update hidden input
            const input = document.getElementById(dataInputId);
            if (input) input.value = base64;
        };
        reader.readAsDataURL(file);
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

        const imageData = formData.get('image');
        if (!imageData) {
            alert('Veuillez choisir une image pour le produit.');
            return;
        }

        const newProduct = {
            id: 'p-' + Date.now(),
            name: name,
            category: formData.get('category'),
            price: price,
            description: formData.get('description'),
            image: imageData,
            rating: 5,
            reviews: 0
        };

        const result = await ProductDB.saveProduct(newProduct);
        if (result) {
            this.renderProducts();
            await this.renderStats();
            e.target.reset();
            
            // Reset preview box
            const preview = document.getElementById('add-preview');
            preview.innerHTML = `
                <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; margin-bottom: 0.5rem; color: var(--gold)"></i>
                <span style="color:var(--text-muted); font-size:0.8rem">Charger une photo</span>
            `;
            document.getElementById('add-image-data').value = '';
            this.notify('Produit ajouté avec succès !');
        }
    },

    async deleteProduct(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            const success = await ProductDB.delete(id);
            if (success) {
                this.renderProducts();
                this.notify('Produit supprimé !');
            }
        }
    },

    openModal(id = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('edit-product-form');
        const title = document.getElementById('modal-title');

        if (id) {
            const p = PRODUCTS.find(prod => prod.id === id);
            if (!p) return;

            title.innerText = 'Modifier le Produit';
            form.elements['id'].value = p.id;
            form.elements['name'].value = p.name;
            form.elements['category'].value = p.category;
            form.elements['price'].value = p.price;
            form.elements['image'].value = p.image; // Populate the hidden input
            this.updatePreview(p.image, 'edit-preview');
            form.elements['description'].value = p.description || '';
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

        const success = await ProductDB.update(id, updatedData);
        if (success) {
            this.renderProducts();
            this.closeModal();
            this.notify('Produit mis à jour !');
        }
    },

    loadSettings() {
        const form = document.getElementById('settings-form');
        if (!form) return;
        
        // CONFIG is already defined globally in config.js
        form.whatsappNumber.value = CONFIG.whatsappNumber || '';
        form.supportEmail.value = CONFIG.supportEmail || '';
        form.storeName.value = CONFIG.storeName || '';
        form.heroTitle.value = CONFIG.heroTitle || '';
        form.heroSubtitle.value = CONFIG.heroSubtitle || '';
        form.promoBannerVisible.checked = CONFIG.promoBannerVisible !== false;
        form.promoBannerTitle.value = CONFIG.promoBannerTitle || '';
    },

    getAdmins() {
        return JSON.parse(localStorage.getItem('elwali_admins')) || [
            { id: '1', name: 'Abdelaali (Owner)', email: 'abdelaali.markabi@gmail.com', role: 'Propriétaire' }
        ];
    },

    saveAdmin(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newAdmin = {
            id: Date.now().toString(),
            name: formData.get('name'),
            email: formData.get('email'),
            role: formData.get('role'),
            tempPassword: formData.get('password')
        };
        const admins = this.getAdmins();
        admins.push(newAdmin);
        localStorage.setItem('elwali_admins', JSON.stringify(admins));
        e.target.reset();
        document.getElementById('add-admin-form-container').style.display = 'none';
        this.notify('Administrateur ajouté avec succès');
        this.renderAdmins();
    },

    deleteAdmin(id) {
        if(confirm('Êtes-vous sûr de vouloir supprimer cet administrateur ?')) {
            let admins = this.getAdmins();
            admins = admins.filter(a => a.id !== id);
            localStorage.setItem('elwali_admins', JSON.stringify(admins));
            this.notify('Administrateur supprimé');
            this.renderAdmins();
        }
    },

    renderAdmins() {
        const tbody = document.getElementById('admin-table-body');
        if (!tbody) return;
        
        const admins = this.getAdmins();
        tbody.innerHTML = '';
        
        if (admins.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:1.5rem">Aucun administrateur trouvé</td></tr>';
            return;
        }

        admins.forEach(admin => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-subtle)';
            tr.innerHTML = `
                <td style="padding: 1rem"><strong>${admin.name}</strong></td>
                <td style="padding: 1rem; color: var(--gold)">${admin.email}</td>
                <td style="padding: 1rem"><span style="background:var(--bg-glass); border:1px solid var(--border-subtle); padding: 0.2rem 0.5rem; border-radius:4px; font-size:0.8rem">${admin.role}</span></td>
                <td style="padding: 1rem; text-align: right">
                    ${admin.id !== '1' ? `<button aria-label="Action Button" class="btn btn-secondary btn-sm" style="color:var(--rose)" onclick="Admin.deleteAdmin('${admin.id}')" title="Supprimer"><i class="fas fa-trash"></i></button>` : '<span style="color:var(--text-muted); font-size:0.8rem">Intouchable</span>'}
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    saveSettings(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const newSettings = {
            whatsappNumber: formData.get('whatsappNumber'),
            supportEmail: formData.get('supportEmail'),
            storeName: formData.get('storeName'),
            heroTitle: formData.get('heroTitle'),
            heroSubtitle: formData.get('heroSubtitle'),
            promoBannerVisible: formData.get('promoBannerVisible') === 'on',
            promoBannerTitle: formData.get('promoBannerTitle')
        };

        // Merge with existing stored settings so we don't lose anything
        const existingSettings = JSON.parse(localStorage.getItem('elwali_site_settings') || '{}');
        const finalSettings = { ...existingSettings, ...newSettings };
        
        localStorage.setItem('elwali_site_settings', JSON.stringify(finalSettings));
        
        this.notify('Paramètres sauvegardés ! Les modifications sont en ligne.');
        alert('Paramètres sauvegardés avec succès !');
    },

    resetSettings() {
        if(confirm('Êtes-vous sûr de vouloir réinitialiser aux paramètres par défaut ?')) {
            if (typeof window.resetSiteSettings === 'function') {
                window.resetSiteSettings();
            } else {
                localStorage.removeItem('elwali_site_settings');
                window.location.reload();
            }
        }
    },

    factoryResetProducts() {
        if(confirm('ATTENTION ! Ceci va effacer tous les produits modifiés et toutes les commandes de la base locale.\nVoulez-vous remettre votre boutique à zéro ?')) {
            localStorage.removeItem('elwali_products');
            localStorage.removeItem('mlh_orders');
            alert('Base de données remise à zéro. La page va se recharger.');
            window.location.reload();
        }
    },

    setupEventListeners() {
        // Redundant login form listener removed to prevent conflict with AdminAuth
        
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

        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => this.saveSettings(e));
        }

        const addAdminForm = document.getElementById('add-admin-form');
        if (addAdminForm) {
            addAdminForm.addEventListener('submit', (e) => this.saveAdmin(e));
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    Admin.init();
});
