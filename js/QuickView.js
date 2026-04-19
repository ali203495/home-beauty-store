/**
 * MARRAKECH LUXE — Quick View Module
 */

const QuickView = {
    modalId: 'quick-view-modal',
    contentId: 'quick-view-content',

    open(productId) {
        const product = (window.PRODUCTS || []).find(p => p.id === productId);
        if (!product) return;

        this.render(product);
        const modal = document.getElementById(this.modalId);
        if (modal) modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    },

    close() {
        const modal = document.getElementById(this.modalId);
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
    },

    render(p) {
        const content = document.getElementById(this.contentId);
        if (!content) return;

        content.innerHTML = `
            <div class="quick-view-grid">
                <div class="quick-view-img">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="quick-view-info">
                    <button class="close-btn" onclick="QuickView.close()">&times;</button>
                    <span class="card-cat">${p.category}</span>
                    <h2 class="page-title" style="font-size: 1.5rem; margin: 0.5rem 0;">${p.name}</h2>
                    <div class="card-price" style="font-size: 1.8rem; margin-bottom: 1.5rem;">${p.price} DH</div>
                    
                    <p class="text-secondary" style="margin-bottom: 2rem; line-height: 1.6;">
                        ${p.description || 'Découvrez ce produit premium chez MARRAKECH LUXE. Qualité garantie et livraison rapide à Marrakech.'}
                    </p>

                    <div class="quick-view-actions">
                        <div class="quantity-input">
                            <button onclick="this.nextElementSibling.stepDown()">-</button>
                            <input type="number" id="quick-qty" value="1" min="1" max="99">
                            <button onclick="this.previousElementSibling.stepUp()">+</button>
                        </div>
                        <button class="btn btn-primary btn-lg w-full" onclick="QuickView.addToCart('${p.id}')">
                            <i class="fas fa-shopping-basket"></i> AJOUTER AU PANIER
                        </button>
                    </div>

                    <a href="/product-detail.html?id=${p.id}" class="text-sm text-red text-bold" style="display: block; margin-top: 1.5rem; text-align: center;">
                        VOIR TOUS LES DÉTAILS <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        `;
    },

    addToCart(id) {
        const qty = document.getElementById('quick-qty')?.value || 1;
        if (window.Cart) {
            Cart.add(id, qty);
            this.close();
        }
    }
};
