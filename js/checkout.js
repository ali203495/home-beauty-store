/**
 * AliExpress High-Fidelity Checkout Logic
 * Handles single-page order processing, validation, and localStorage persistence.
 */

const Checkout = {
    async init() {
        const params = new URLSearchParams(window.location.search);
        const directId = params.get('id');

        if (directId && window.Cart) {
            // Check if it's already in cart, if not add it
            const exists = Cart.items.find(i => i.id === directId);
            if (!exists) {
                if (window.ProductDB) await ProductDB.fetchAll();
                Cart.add(directId);
            }
        }

        // Redirection if cart is STILL empty
        if (Cart.items.length === 0) {
            window.location.href = 'index.html';
            return;
        }

        this.renderSummary();
        this.setupEventListeners();
    },

    setupEventListeners() {
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }

        const phoneInput = document.getElementById('phone-input');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                // Strict cleansing: Only allow digits, max 10
                let val = e.target.value.replace(/\D/g, '');
                if (val.startsWith('0')) {
                    if (val.length > 10) val = val.substring(0, 10);
                } else if (val.length > 9) { // International or missing 0
                    val = val.substring(0, 9);
                }
                e.target.value = val;
            });
        }
    },

    renderSummary() {
        // Render items list
        const listContainer = document.getElementById('checkout-items-list');
        if (listContainer) {
            listContainer.innerHTML = Cart.items.map(item => `
                <div class="receipt-item-mini">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="receipt-item-mini-info">
                        <div class="receipt-item-mini-name">${item.name}</div>
                        <div class="receipt-item-mini-price">${item.quantity} x ${item.price} DH</div>
                    </div>
                    <div style="font-weight: 800;">${(item.price * item.quantity).toLocaleString()} DH</div>
                </div>
            `).join('');
        }

        // Calculate Totals
        const subtotal = Cart.getTotal();
        const threshold = 100; // Marrakech Choice Threshold
        const citySelector = document.getElementById('city-selector');
        const city = citySelector ? citySelector.value : 'rak';
        
        // Basic shipping logic for demonstration
        let shipping = 0;
        if (subtotal < threshold) {
            shipping = (city === 'rak') ? 20 : 45;
        }

        const total = subtotal + shipping;

        // Update UI
        const subtotalEl = document.getElementById('subtotal-val');
        const shippingEl = document.getElementById('shipping-val');
        const totalEl = document.getElementById('total-val');

        if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} DH`;
        if (shippingEl) {
            shippingEl.textContent = shipping === 0 ? 'Gratuite' : `${shipping} DH`;
            shippingEl.style.color = shipping === 0 ? '#22c55e' : 'var(--ali-red)';
        }
        if (totalEl) totalEl.textContent = `${total.toLocaleString()} DH`;
    },

    updateShippingUI() {
        const citySelector = document.getElementById('city-selector');
        const neighborhoodRow = document.getElementById('neighborhood-row');
        
        if (citySelector && neighborhoodRow) {
            neighborhoodRow.style.display = citySelector.value === 'rak' ? 'block' : 'none';
        }
        this.renderSummary();
    },

    async submitOrder() {
        const form = document.getElementById('checkout-form');
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> TRAITEMENT...';
        btn.disabled = true;

        const formData = new FormData(form);
        const subtotal = Cart.getTotal();
        
        // Shipping calc mirroring renderSummary
        const threshold = 100;
        const city = formData.get('city');
        let shipping = (subtotal < threshold) ? ((city === 'rak') ? 20 : 45) : 0;

        const orderData = {
            id: 'ALI-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toISOString(),
            customer: {
                firstName: formData.get('firstname')?.trim(),
                lastName: formData.get('lastname')?.trim(),
                phone: formData.get('phone')?.trim(),
                city: city,
                neighborhood: formData.get('neighborhood')?.trim() || '',
                address: formData.get('address')?.trim()
            },
            items: JSON.parse(JSON.stringify(Cart.items)),
            subtotal: parseFloat(subtotal) || 0,
            shipping: parseFloat(shipping) || 0,
            total: parseFloat(subtotal + shipping) || 0,
            status: 'En attente'
        };

        // --- Data Integrity Guard ---
        if (!orderData.customer.firstName || !orderData.customer.lastName || !orderData.customer.phone || !orderData.customer.address) {
            btn.innerHTML = originalText;
            btn.disabled = false;
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            const res = await OrderDB.saveOrder(orderData);
            if (res && res.success) {
                Cart.clear();
                window.location.href = `order-success.html?id=${orderData.id}`;
            } else {
                throw new Error(res ? res.error : "Erreur inconnue");
            }
        } catch (err) {
            console.error("Order Submit Error:", err);
            alert("Une erreur est survenue lors de l'enregistrement : " + (err.message || "Veuillez réessayer."));
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Checkout.init());
