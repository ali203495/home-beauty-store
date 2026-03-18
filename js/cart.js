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

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span class="toast-msg">${message}</span>
    `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Initialize badges on load
document.addEventListener('DOMContentLoaded', () => Cart.updateBadge());
