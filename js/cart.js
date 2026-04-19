/**
 * Shopping Cart Logic
 */

const CART_KEY = 'marrakech_luxe_cart';

const Cart = {
    items: JSON.parse(localStorage.getItem(CART_KEY)) || [],

    save() {
        localStorage.setItem(CART_KEY, JSON.stringify(this.items));
        this.updateBadge();
        // Dispatch event for other listeners
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: this.items }));
    },

    add(productId, quantity = 1) {
        const existing = this.items.find(item => item.id === productId);
        if (existing) {
            existing.quantity += parseInt(quantity);
        } else {
            const product = PRODUCTS.find(p => p.id === productId);
            if (product) {
                this.items.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    quantity: parseInt(quantity)
                });
            }
        }
        this.save();
        this.renderDrawer();
        
        // Open drawer on add
        if (typeof toggleCartDrawer === 'function') {
            const drawer = document.getElementById('cart-drawer');
            if (drawer && !drawer.classList.contains('open')) {
                toggleCartDrawer();
            }
        }
        
        this.showToast('Produit ajouté au panier !', 'success');
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.showToast('Produit retiré du panier', 'info');
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(1, parseInt(quantity));
            this.save();
        }
    },

    clear() {
        this.items = [];
        this.save();
    },

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    getCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = this.getCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            if (count > 0) {
                badge.classList.add('bump');
                setTimeout(() => badge.classList.remove('bump'), 300);
            }
        });
    },

    renderDrawer() {
        const container = document.getElementById('cart-drawer-items');
        const progressContainer = document.getElementById('cart-shipping-progress');
        const footerCounter = document.getElementById('cart-drawer-total');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="text-center" style="padding: 5rem 2rem; opacity: 0.8; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <div style="width: 80px; height: 80px; background: var(--bg-surface); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                        <i class="fas fa-shopping-basket" style="font-size: 2.2rem; color: var(--accent-red);"></i>
                    </div>
                    <p style="font-weight: 900; font-size: 1rem; color: var(--accent-slate); letter-spacing: 0.1em; margin-bottom: 0.5rem;">VOTRE PANIER EST VIDE</p>
                    <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 2rem;">Il semblerait que vous n'ayez pas encore ajouté d'articles.</p>
                    <button onclick="toggleCartDrawer()" class="btn btn-secondary btn-sm" style="width: 100%;">CONTINUER MES ACHATS</button>
                </div>
            `;
            if (footerCounter) footerCounter.textContent = '0 DH';
            return;
        }

        container.innerHTML = this.items.map(item => `
            <div class="cart-drawer-item animate-slide-right">
                <div class="drawer-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="drawer-item-info">
                    <h4>${item.name}</h4>
                    <div class="flex-between" style="margin-top:0.5rem">
                        <span class="drawer-item-price">${item.price} DH</span>
                        <div class="flex gap-sm align-center">
                            <span class="text-xs text-muted">Qté: ${item.quantity}</span>
                            <button onclick="Cart.remove('${item.id}')" style="border:none;background:none;color:var(--text-muted);cursor:pointer;font-size:0.8rem">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        this.renderFreeShippingProgress();

        if (footerCounter) {
            footerCounter.textContent = this.getTotal() + ' DH';
        }
    },

    renderFreeShippingProgress() {
        const threshold = CONFIG.freeShippingThreshold || 700;
        const total = this.getTotal();
        const progress = Math.min((total / threshold) * 100, 100);
        const remaining = threshold - total;

        const container = document.getElementById('cart-shipping-progress');
        if (!container) return;

        if (total === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = `
            <div class="shipping-progress-wrapper" style="margin-bottom: 2rem; padding: 0 1.5rem;">
                <div class="flex-between mb-sm" style="font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; color: var(--accent-slate);">
                    <span>${progress >= 100 ? 'LIVRAISON GRATUITE ATTEINTE !' : 'LIVRAISON GRATUITE'}</span>
                    <span>${progress >= 100 ? '<i class="fas fa-check-circle text-success"></i>' : remaining.toLocaleString() + ' DH RESTANTS'}</span>
                </div>
                <div class="progress-bar-bg" style="height: 6px; background: rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; position: relative;">
                    <div class="progress-bar-fill ${progress >= 100 ? 'success' : 'pulse'}" 
                         style="width: ${progress}%; height: 100%; height: 100%; background: ${progress >= 100 ? '#22c55e' : 'var(--accent-red)'}; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);">
                    </div>
                </div>
                ${progress < 100 ? `
                    <p style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.5rem; text-align: center;">
                        Ajoutez <span style="color: var(--accent-red); font-weight: 800;">${remaining.toLocaleString()} DH</span> pour profiter de la livraison gratuite !
                    </p>
                ` : `
                    <p style="font-size: 0.7rem; color: #16a34a; margin-top: 0.5rem; text-align: center; font-weight: 700;">
                        Félicitations ! Vous bénéficiez de la livraison gratuite à domicile.
                    </p>
                `}
            </div>
        `;
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type} animate-slide-up`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
            <span class="toast-msg">${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

// Initialize badges on load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
