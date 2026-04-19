/**
 * MARRAKECH LUXE — Landing Page Controller
 * Handles quick-purchase logic and specialized animations.
 */

const Landing = {
    // Target product ID for this specific landing page
    TARGET_PRODUCT_ID: 'mk-02', 

    /**
     * Rapid checkout trigger: adds product to cart and redirects.
     */
    async buyNow() {
        const productId = this.TARGET_PRODUCT_ID;
        
        console.log("Landing: Initiating quick purchase for", productId);

        if (window.Cart) {
            // 1. Add to cart (default 1 quantity)
            Cart.add(productId, 1);
            
            // 2. Redirect to checkout
            // We give it a tiny delay to ensure cart storage is finalized
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 100);
        } else {
            console.error("Cart module not found.");
            // Fallback redirect
            window.location.href = 'checkout.html';
        }
    },

    /**
     * Any specialized initialization logic (timers, ba-sliders, etc.)
     */
    init() {
        // Initialize urgency countdown if needed
        this.initUrgency();
    },

    initUrgency() {
        // Simple stock countdown simulation
        let stockCount = 7;
        const interval = setInterval(() => {
            if (stockCount > 2) {
                stockCount--;
                // If there was a span for it:
                // document.getElementById('stock-counter').textContent = stockCount;
            } else {
                clearInterval(interval);
            }
        }, 45000); // Decrémente toutes les 45s pour réalisme
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => Landing.init());
