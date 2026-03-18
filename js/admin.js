/**
 * Admin Logic for Marrakech Luxe Home
 */

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'luxe' // In a real app, this would be on a server
};

const Admin = {
    init() {
        this.checkAuth();
        this.renderStats();
        this.renderAnalytics();
        if (document.getElementById('product-list-admin')) {
            this.renderProducts();
        }
        if (document.getElementById('order-list-admin')) {
            this.renderOrders();
        }
        this.setupEventListeners();
    },

    checkAuth() {
        const isLoggedIn = sessionStorage.getItem('mlh_admin_logged_in');
        const isLoginPage = window.location.pathname.includes('admin-login.html');

        if (!isLoggedIn && !isLoginPage) {
            window.location.href = 'admin-login.html';
        } else if (isLoggedIn && isLoginPage) {
            window.location.href = 'admin-dashboard.html';
        }
    },

    login(username, password) {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            sessionStorage.setItem('mlh_admin_logged_in', 'true');
            window.location.href = 'admin-dashboard.html';
        } else {
            alert('Identifiants incorrects');
        }
    },

    logout() {
        sessionStorage.removeItem('mlh_admin_logged_in');
        window.location.href = 'admin-login.html';
    },

    switchTab(tab, el) {
        document.querySelectorAll('[id^="tab-"]').forEach(el => el.style.display = 'none');
        document.getElementById(`tab-${tab}`).style.display = 'block';

        document.querySelectorAll('.admin-nav-item').forEach(item => item.classList.remove('active'));
        if (el) el.classList.add('active');
    },

    renderStats() {
        const productsCount = PRODUCTS.length;
        const orders = OrderDB.getOrders();
        const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

        if (document.getElementById('stat-products')) document.getElementById('stat-products').innerText = productsCount;
        if (document.getElementById('stat-orders')) document.getElementById('stat-orders').innerText = orders.length;
        if (document.getElementById('stat-total-dh')) document.getElementById('stat-total-dh').innerText = `${totalSales} DH`;

        this.renderAnalytics();
    },

    renderAnalytics() {
        const orders = OrderDB.getOrders();

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

        list.innerHTML = prods.map(p => `
            <div class="admin-item" data-id="${p.id}">
                <img src="${p.image}" alt="${p.name}" class="admin-item-img">
                <div class="admin-item-info">
                    <strong>${p.name}</strong><br>
                    <small>${p.category} — ${p.price} DH</small>
                </div>
                <div class="admin-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="Admin.openModal('${p.id}')">Modifier</button>
                    <button class="btn btn-secondary btn-sm" style="color:var(--rose)" onclick="Admin.deleteProduct('${p.id}')">Supprimer</button>
                </div>
            </div>
        `).join('');
        this.renderStats();
    },

    renderOrders(filtered = null) {
        const list = document.getElementById('order-list-admin');
        if (!list) return;

        const orders = filtered || OrderDB.getOrders();
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

    updateOrderStatus(orderId, status) {
        OrderDB.updateStatus(orderId, status);
        this.renderOrders();
        this.renderStats();
    },

    filterProducts(query) {
        const q = query.toLowerCase();
        const filtered = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
        this.renderProducts(filtered);
    },

    filterOrders(query) {
        const q = query.toLowerCase();
        const orders = OrderDB.getOrders();
        const filtered = orders.filter(o =>
            o.id.toLowerCase().includes(q) ||
            o.customer.name.toLowerCase().includes(q) ||
            o.customer.phone.includes(q)
        );
        this.renderOrders(filtered);
    },

    openOrderDetails(id) {
        const orders = OrderDB.getOrders();
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
            
            <div style="display: flex; gap: 1rem">
                <button class="btn btn-primary" style="flex: 1" onclick="window.open('https://wa.me/${o.customer.phone.replace(/\s+/g, '')}', '_blank')">
                    <i class="fab fa-whatsapp"></i> Contacter via WhatsApp
                </button>
                <button class="btn btn-secondary" style="flex: 1" onclick="Admin.deleteOrder('${o.id}')">
                    <i class="fas fa-trash"></i> Supprimer la Commande
                </button>
            </div>
        `;

        modal.style.display = 'flex';
    },

    closeOrderModal() {
        document.getElementById('order-modal').style.display = 'none';
    },

    deleteOrder(id) {
        if (confirm('Supprimer définitivement cette commande ?')) {
            OrderDB.deleteOrder(id);
            this.closeOrderModal();
            this.renderOrders();
            this.renderStats();
        }
    },

    exportOrders() {
        const orders = OrderDB.getOrders();
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

    addProduct(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProduct = {
            id: 'p-' + Date.now(),
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseInt(formData.get('price')),
            image: formData.get('image') || 'assets/images/appliances.png',
            rating: 5,
            reviews: 0,
            description: formData.get('description'),
            specs: {}
        };

        // Add to local DB
        ProductDB.add(newProduct);
        this.renderProducts();
        e.target.reset();
        alert('Produit ajouté !');
    },

    deleteProduct(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            ProductDB.delete(id);
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

    saveProduct(e) {
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

        ProductDB.update(id, updatedData);
        this.renderProducts();
        this.closeModal();
        alert('Produit mis à jour !');
    },

    setupEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login(e.target.username.value, e.target.password.value);
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

document.addEventListener('DOMContentLoaded', () => Admin.init());
