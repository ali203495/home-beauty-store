/**
 * AliExpress High-Fidelity Checkout Logic
 * Handles single-page order processing, validation, and localStorage persistence.
 */

const Checkout = {
    init() {
        // Redirection if cart is empty
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
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 10) val = val.substring(0, 10);
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
                firstName: formData.get('firstname'),
                lastName: formData.get('lastname'),
                phone: formData.get('phone'),
                city: city,
                neighborhood: formData.get('neighborhood') || '',
                address: formData.get('address')
            },
            items: JSON.parse(JSON.stringify(Cart.items)),
            subtotal: subtotal,
            shipping: shipping,
            total: subtotal + shipping,
            status: 'En attente'
        };

        try {
            // Simulate processing
            await new Promise(r => setTimeout(r, 1200));

            // Save to localStorage
            const orders = JSON.parse(localStorage.getItem('mlh_orders') || '[]');
            orders.unshift(orderData);
            localStorage.setItem('mlh_orders', JSON.stringify(orders));

            // Clear Cart and Redirect
            Cart.clear();
            window.location.href = `order-success.html?id=${orderData.id}`;
        } catch (err) {
            console.error("Order Submit Error:", err);
            alert("Une erreur est survenue. Veuillez réessayer.");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Checkout.init());
