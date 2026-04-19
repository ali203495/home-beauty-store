/**
 * Marrakech Luxe — Luxury Checkout Terminal Logic
 * Handles multi-step form navigation, validation, and order submission.
 */

const Checkout = {
    currentStep: 1,
    totalSteps: 3,
    
    init() {
        this.renderSummary();
        this.updateStepUI();
        this.setupEventListeners();
        
        // Check if cart is empty
        if (Cart.items.length === 0) {
            window.location.href = 'index.html';
        }
    },

    setupEventListeners() {
        const form = document.getElementById('checkout-terminal-form');
        if (form) {
            form.addEventListener('submit', (e) => e.preventDefault());
        }

        // Real-time phone validation for Morocco
        const phoneInput = document.getElementById('phone-input');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 10) val = val.substring(0, 10);
                e.target.value = val;
            });
        }
    },

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepUI();
            } else {
                this.submitOrder();
            }
        }
    },

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepUI();
        }
    },

    validateStep(step) {
        const currentStepEl = document.querySelector(`[data-step="${step}"]`);
        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
                input.style.animation = 'shake 0.4s ease-in-out';
                setTimeout(() => input.style.animation = '', 400);
            } else {
                input.classList.remove('error');
            }
        });

        if (!isValid) {
            if (window.App && App.notify) App.notify('Veuillez remplir les informations requises.', 'error');
        }

        return isValid;
    },

    updateStepUI() {
        // Update Step Progress Bar
        const progress = document.getElementById('stepper-progress');
        if (progress) {
            const width = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
            progress.style.width = `${width}%`;
        }

        // Update Step Indicators
        document.querySelectorAll('.step-item-luxury').forEach((item, index) => {
            const stepNum = index + 1;
            item.classList.toggle('active', stepNum === this.currentStep);
            item.classList.toggle('completed', stepNum < this.currentStep);
        });

        // Update Step Content with sliding effect
        document.querySelectorAll('.checkout-step-content').forEach((content) => {
            const stepNum = parseInt(content.dataset.step);
            if (stepNum === this.currentStep) {
                content.style.display = 'block';
                content.style.animation = 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            } else {
                content.style.display = 'none';
            }
        });

        // Update Buttons
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');

        if (prevBtn) prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
        if (nextBtn) {
            nextBtn.innerHTML = this.currentStep === this.totalSteps ? 
                'VALIDER LA COMMANDE <i class="fas fa-check"></i>' : 
                'CONTINUER <i class="fas fa-arrow-right"></i>';
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    renderSummary() {
        const itemsContainer = document.getElementById('terminal-summary-items');
        if (!itemsContainer) return;

        itemsContainer.innerHTML = Cart.items.map(item => `
            <div class="receipt-item">
                <img src="${item.image}" alt="${item.name}" class="receipt-item-img">
                <div style="flex: 1;">
                    <h4 style="font-weight: 800; font-size: 0.85rem; margin-bottom: 0.2rem; color: var(--accent-slate);">${item.name}</h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">${item.quantity} x ${item.price} DH</span>
                </div>
                <div style="font-weight: 900; font-size: 0.85rem; color: var(--accent-slate);">
                    ${(item.price * item.quantity).toLocaleString()} DH
                </div>
            </div>
        `).join('');

        const subtotal = Cart.getTotal();
        let discount = 0;

        if (this.appliedCoupon) {
            discount = PromotionDB.calculateDiscount(this.appliedCoupon, subtotal);
            document.getElementById('remise-row').style.display = 'flex';
            document.getElementById('coupon-name').textContent = this.appliedCoupon.code;
            document.getElementById('terminal-discount').textContent = `-${discount.toLocaleString()} DH`;
        } else {
            document.getElementById('remise-row').style.display = 'none';
        }

        // Calculate dynamic delivery fee
        const threshold = CONFIG.freeShippingThreshold || 700;
        let deliveryFee = 0;
        
        if (subtotal < threshold) {
            const cityKey = document.getElementById('city-selector')?.value;
            const zone = (CONFIG.shippingZones || []).find(z => z.id === cityKey) || (CONFIG.shippingZones || [])[0];
            deliveryFee = zone ? zone.fee : 0;
            
            const deliveryEl = document.getElementById('terminal-delivery-fee');
            if (deliveryEl) {
                deliveryEl.textContent = deliveryFee > 0 ? `${deliveryFee.toLocaleString()} DH` : 'Gratuite';
                deliveryEl.style.color = deliveryFee > 0 ? 'var(--accent-red)' : '#22c55e';
            }
        } else {
            const deliveryEl = document.getElementById('terminal-delivery-fee');
            if (deliveryEl) {
                deliveryEl.textContent = 'Gratuite';
                deliveryEl.style.color = '#22c55e';
            }
        }

        const total = subtotal - discount + deliveryFee;
        document.getElementById('terminal-subtotal').textContent = `${subtotal.toLocaleString()} DH`;
        
        // Counter Animation for Total
        const totalEl = document.getElementById('terminal-total');
        if (totalEl) {
            this.animateValue(totalEl, parseInt(totalEl.textContent) || 0, total, 400);
        }
    },

    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            obj.textContent = `${current.toLocaleString()} DH`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    },

    updateShippingUI() {
        const citySelector = document.getElementById('city-selector');
        const neighborhoodContainer = document.getElementById('neighborhood-container');
        
        if (citySelector && neighborhoodContainer) {
            // Only show neighborhood for Marrakech
            neighborhoodContainer.style.display = citySelector.value === 'rak' ? 'block' : 'none';
        }

        this.renderSummary();
    },

    async applyCoupon() {
        const input = document.getElementById('coupon-input');
        const feedback = document.getElementById('coupon-feedback');
        const code = input.value.trim();

        if (!code) return;

        const result = await PromotionDB.validate(code);
        if (result.valid) {
            this.appliedCoupon = result.coupon;
            feedback.textContent = 'Code promo appliqué !';
            feedback.style.color = '#22c55e';
            this.renderSummary();
        } else {
            feedback.textContent = result.msg;
            feedback.style.color = 'var(--accent-red)';
        }
    },

    async submitOrder() {
        const btn = document.getElementById('next-step-btn');
        const originalText = btn.innerHTML;
        
        // 1. Validate Stock first
        if (window.ProductDB) {
            const validation = await ProductDB.validateOrder(Cart.items);
            if (!validation.valid) {
                if (window.App && App.notify) {
                    App.notify(validation.errors[0], 'error');
                } else {
                    alert(validation.errors[0]);
                }
                return;
            }
        }

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> TRAITEMENT...';
        btn.disabled = true;

        const formData = new FormData(document.getElementById('checkout-terminal-form'));
        
        const subtotal = Cart.getTotal();
        const discount = this.appliedCoupon ? PromotionDB.calculateDiscount(this.appliedCoupon, subtotal) : 0;

        // Final Shipping Calculation
        const threshold = CONFIG.freeShippingThreshold || 700;
        let deliveryFee = 0;
        if (subtotal < threshold) {
            const cityKey = formData.get('city');
            const zone = (CONFIG.shippingZones || []).find(z => z.id === cityKey);
            deliveryFee = zone ? zone.fee : 0;
        }

        const orderData = {
            id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            date: new Date().toISOString(),
            customer: {
                firstName: formData.get('firstname'),
                lastName: formData.get('lastname'),
                phone: formData.get('phone'),
                city: formData.get('city'),
                neighborhood: formData.get('neighborhood'),
                address: formData.get('address'),
                notes: formData.get('notes')
            },
            items: JSON.parse(JSON.stringify(Cart.items)),
            subtotal: subtotal,
            discount: discount,
            shipping: deliveryFee,
            appliedCoupon: this.appliedCoupon ? this.appliedCoupon.code : null,
            total: subtotal - discount + deliveryFee,
            status: 'Nouveau'
        };

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Save order locally (or to DB if available)
            if (window.OrderDB) {
                await OrderDB.saveOrder(orderData);
            } else {
                const orders = JSON.parse(localStorage.getItem('mlh_orders')) || [];
                orders.unshift(orderData);
                localStorage.setItem('mlh_orders', JSON.stringify(orders));
            }

            // 2. Decrement Stock officially
            if (window.ProductDB) {
                for (const item of Cart.items) {
                    await ProductDB.decrementStock(item.id, item.quantity);
                }
            }

            // 3. Record Coupon Usage
            if (this.appliedCoupon) {
                await PromotionDB.recordUsage(this.appliedCoupon.code);
            }

            // Success Redirect
            Cart.clear();
            window.location.href = `order-success.html?id=${orderData.id}`;
        } catch (err) {
            console.error("Order error:", err);
            if (window.App && App.notify) {
                App.notify('Une erreur est survenue lors de la validation.', 'error');
            }
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Checkout.init());
