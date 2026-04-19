/**
 * MARRAKECH LUXE — Promotion & Coupon Engine
 * Handles coupon validation, application, and persistence.
 */

const PromotionDB = {
    async fetchAll() {
        const stored = localStorage.getItem('mlh_promo_coupons');
        let coupons = [];
        try {
            coupons = stored ? JSON.parse(stored) : this.getDefaultCoupons();
        } catch (e) {
            console.error('Failed to parse coupons', e);
            coupons = this.getDefaultCoupons();
        }
        return coupons;
    },

    getDefaultCoupons() {
        return [
            { code: 'BIENVENUE10', type: 'percent', value: 10, active: true, usageCount: 0 },
            { code: 'LUXE50', type: 'fixed', value: 50, active: true, usageCount: 0 }
        ];
    },

    async saveAll(coupons) {
        localStorage.setItem('mlh_promo_coupons', JSON.stringify(coupons));
        return true;
    },

    async validate(code) {
        const coupons = await this.fetchAll();
        const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
        
        if (!coupon) return { valid: false, msg: 'Code promo invalide ou expiré.' };
        return { valid: true, coupon };
    },

    /**
     * Calculates the discount amount
     * @param {Object} coupon 
     * @param {number} subtotal 
     */
    calculateDiscount(coupon, subtotal) {
        if (coupon.type === 'percent') {
            return (subtotal * coupon.value) / 100;
        } else {
            return Math.min(coupon.value, subtotal); // Cannot discount more than subtotal
        }
    },

    async recordUsage(code) {
        const coupons = await this.fetchAll();
        const idx = coupons.findIndex(c => c.code.toUpperCase() === code.trim().toUpperCase());
        if (idx !== -1) {
            coupons[idx].usageCount = (coupons[idx].usageCount || 0) + 1;
            await this.saveAll(coupons);
        }
    },

    async add(coupon) {
        const coupons = await this.fetchAll();
        if (coupons.some(c => c.code.toUpperCase() === coupon.code.toUpperCase())) {
            throw new Error('Ce code promo existe déjà.');
        }
        coupons.push({ ...coupon, usageCount: 0 });
        return this.saveAll(coupons);
    },

    async delete(code) {
        const coupons = await this.fetchAll();
        const filtered = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
        return this.saveAll(filtered);
    }
};

// Global object for sharing logic
window.PromotionDB = PromotionDB;
