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
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { 
            items: this.items,
            total: this.getTotal(),
            count: this.getCount()
        }}));
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
        
        if (window.App && App.showToast) App.showToast('Produit ajouté au panier !', 'success');
    },

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        if (window.App && App.showToast) App.showToast('Produit retiré du panier', 'info');
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
                <div class="cart-empty-state">
                    <div class="empty-icon-wrap">
                        <i class="fas fa-shopping-basket"></i>
                    </div>
                    <p class="empty-title">VOTRE PANIER EST VIDE</p>
                    <p class="empty-text">Continuez vos achats pour découvrir nos offres.</p>
                    <button onclick="toggleCartDrawer()" class="btn btn-primary w-full">EXPLORER LA BOUTIQUE</button>
                </div>
            `;
            if (footerCounter) footerCounter.textContent = '0 DH';
            return;
        }

        container.innerHTML = this.items.map(item => `
            <div class="cart-drawer-item">
                <div class="drawer-item-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="drawer-item-info">
                    <div class="flex-between">
                        <h4>${item.name}</h4>
                        <button onclick="Cart.remove('${item.id}'); Cart.renderDrawer();" class="item-remove-btn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="flex-between" style="margin-top: 10px;">
                        <span class="drawer-item-price">${item.price} DH</span>
                        <div class="quantity-controls">
                            <button onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1}); Cart.renderDrawer();">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1}); Cart.renderDrawer();">+</button>
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
            <div class="shipping-progress-wrapper">
                <div class="flex-between" style="font-size: 12px; font-weight: 700; color: var(--ali-text); margin-bottom: 8px;">
                    <span>${progress >= 100 ? 'LIVRAISON GRATUITE ATTEINTE !' : 'LIVRAISON GRATUITE'}</span>
                    <span style="color: var(--ali-red)">${progress >= 100 ? '✓' : remaining + ' DH RESTANTS'}</span>
                </div>
                <div class="progress-bar-bg" style="height: 6px; background: #eee; border-radius: 3px; overflow: hidden;">
                    <div class="progress-bar-fill" 
                         style="width: ${progress}%; height: 100%; background: var(--ali-red); transition: width 0.5s ease;">
                    </div>
                </div>
            </div>
        `;
    },

    showToast(message, type = 'success') {
        if (window.App && App.showToast) {
            App.showToast(message, type);
        } else {
            console.warn("App.showToast not found, falling back to basic alert");
            // alert(message);
        }
    }
};

// Initialize badges on load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
