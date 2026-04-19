/**
 * MARRAKECH LUXE — Wishlist Management
 */

const Wishlist = {
    key: 'marrakech_luxe_wishlist',
    items: [],

    init() {
        this.items = JSON.parse(localStorage.getItem(this.key)) || [];
        this.updateUI();
    },

    toggle(id) {
        const index = this.items.indexOf(id);
        if (index === -1) {
            this.items.push(id);
            this.showToast('Produit ajouté aux coups de cœur !', 'heart');
        } else {
            this.items.splice(index, 1);
            this.showToast('Produit retiré des coups de cœur.', 'heart-broken');
        }
        this.save();
        this.updateUI();
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { id, items: this.items } }));
    },

    isWishlisted(id) {
        return this.items.includes(id);
    },

    save() {
        localStorage.setItem(this.key, JSON.stringify(this.items));
    },

    updateUI() {
        // Update all wishlist buttons visually
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');
            if (this.isWishlisted(id)) {
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            } else {
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            }
        });

        // Update badge if it exists (e.g., in a future wishlist drawer)
        const badge = document.getElementById('wishlist-badge');
        if (badge) {
            badge.textContent = this.items.length;
            badge.style.display = this.items.length > 0 ? 'flex' : 'none';
        }
    },

    showToast(msg, icon) {
        if (window.App && App.showToast) {
            App.showToast(msg);
        } else {
            console.log(`Wishlist Toast: ${msg}`);
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Wishlist.init());
