/**
 * EL-WALI-SHOP — Main UI Logic
 */

const getWhatsAppClean = () => {
    let clean = (CONFIG.whatsappNumber || '0699705617').replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '212' + clean.substring(1);
    return clean;
};

const WHATSAPP_NUMBER = getWhatsAppClean();

const App = {
    init() {
        this.updateCurrentYear();
        this.initSearch();
        this.renderHeroBanners();
        this.renderDynamicLayout();
        this.renderFeaturedProducts();
        this.setupWhatsAppButton();
        this.setupMegaMenu();
        
        // Listen for store updates
        window.addEventListener('storage', () => {
            if (window.ProductDB) {
                window.ProductDB.fetchAll().then(() => this.renderFeaturedProducts());
            }
        });
    },

    updateCurrentYear() {
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    },

    renderHeroBanners() {
        const banners = CONFIG.heroBanners;
        if (!banners) return;

        const mainImg = document.getElementById('hero-main-img');
        const mainTag = document.getElementById('hero-main-tag');
        const mainTitle = document.getElementById('hero-main-title');
        
        const side1Img = document.getElementById('hero-side1-img');
        const side1Title = document.getElementById('hero-side1-title');
        
        const side2Img = document.getElementById('hero-side2-img');
        const side2Title = document.getElementById('hero-side2-title');

        if (mainImg) mainImg.src = banners.main.img;
        if (mainTag) mainTag.innerHTML = banners.main.tag;
        if (mainTitle) mainTitle.innerHTML = banners.main.title;

        if (side1Img) side1Img.src = banners.side1.img;
        if (side1Title) side1Title.innerHTML = banners.side1.title;

        if (side2Img) side2Img.src = banners.side2.img;
        if (side2Title) side2Title.innerHTML = banners.side2.title;
    },

    initSearch() {
        const searchInput = document.getElementById('global-search');
        const searchBtn = document.querySelector('.search-btn');
        const suggestionsBox = document.getElementById('search-suggestions');

        if (!searchInput || !suggestionsBox) return;

        const performSearch = () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
            }
        };

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query || query.length < 2) {
                suggestionsBox.style.display = 'none';
                return;
            }

            const allProducts = window.PRODUCTS || [];
            const matches = allProducts.filter(p => 
                (p.visible !== false) && (
                    p.name.toLowerCase().includes(query) || 
                    p.category.toLowerCase().includes(query)
                )
            ).slice(0, 8); // Top 8 matches

            if (matches.length > 0) {
                this.renderSearchSuggestions(matches, suggestionsBox);
                suggestionsBox.style.display = 'block';
            } else {
                suggestionsBox.style.display = 'none';
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        if (searchBtn) {
            searchBtn.addEventListener('click', performSearch);
        }

        // Close suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    },

    renderSearchSuggestions(products, container) {
        container.innerHTML = products.map(p => `
            <div class="search-suggestion-item" onclick="window.location.href='/product-detail.html?id=${p.id}'">
                <div class="search-suggestion-img">
                    <img src="${p.image}" alt="${p.name}">
                </div>
                <div class="search-suggestion-info">
                    <div class="search-suggestion-name">${p.name}</div>
                    <div class="search-suggestion-cat">${p.category}</div>
                    <div class="search-suggestion-price">${p.price} DH</div>
                </div>
            </div>
        `).join('');
    },

    setupMegaMenu() {
        const toggle = document.getElementById('mega-menu-btn');
        const menu = document.getElementById('mega-menu');
        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                menu.classList.toggle('open');
                toggle.classList.toggle('active');
            });

            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                    menu.classList.remove('open');
                    toggle.classList.remove('active');
                }
            });
        }
    },

    setupWhatsAppButton() {
        const waBtn = document.createElement('a');
        waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}`;
        waBtn.target = '_blank';
        waBtn.className = 'floating-wa';
        waBtn.innerHTML = `
            <i class="fab fa-whatsapp"></i>
            <span>Besoin d'aide ? Chattez avec nous</span>
        `;
        document.body.appendChild(waBtn);

        const style = document.createElement('style');
        style.innerHTML = `
            .floating-wa {
                position: fixed;
                bottom: 2rem;
                left: 2rem;
                background: #25d366;
                color: white;
                padding: 0.8rem 1.5rem;
                border-radius: 50px;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-weight: 800;
                font-size: 0.85rem;
                box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
                z-index: 999;
                transition: all 0.3s ease;
                text-transform: uppercase;
            }
            .floating-wa:hover { transform: scale(1.05) translateY(-5px); background: #128c7e; }
            @media (max-width: 768px) {
                .floating-wa span { display: none; }
                .floating-wa { padding: 1rem; border-radius: 50%; bottom: 1.5rem; left: 1.5rem; }
            }
        `;
        document.head.appendChild(style);
    },

    async renderFeaturedProducts() {
        const topVentesGrid = document.getElementById('top-ventes-grid');
        const promotionsGrid = document.getElementById('promotions-grid');

        if (!topVentesGrid && !promotionsGrid) return;

        // Ensure products are loaded (ProductDB is global from products.js)
        if (window.ProductDB) {
            await ProductDB.fetchAll();
        }

        const allProducts = window.PRODUCTS || [];
        
        if (topVentesGrid) {
            // First 12 products as "Top Ventes"
            const topProducts = allProducts.slice(0, 12);
            topVentesGrid.innerHTML = topProducts.map(p => this.generateProductCard(p)).join('');
        }

        if (promotionsGrid) {
            // Filter products with a discount or just show next 6
            const promoProducts = allProducts.slice(12, 18);
            promotionsGrid.innerHTML = promoProducts.map(p => this.generateProductCard(p, true)).join('');
        }
        
        this.updateCartBadge();
    },

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge && window.Cart) {
            badge.innerText = Cart.getCount();
        }
    },

    generateProductCard(p, isPromo = false) {
        const badge = isPromo ? `<span class="card-badge">PROMO</span>` : (p.badge ? `<span class="card-badge">${p.badge}</span>` : '');
        const oldPrice = isPromo ? `<span class="card-price-old">${Math.round(p.price * 1.2)} DH</span>` : '';

        return `
            <div class="compact-card animate-fade" onclick="window.location.href='/product-detail?id=${p.id}'">
                ${badge}
                <div class="card-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                </div>
                <div class="card-cat">${p.category}</div>
                <h3 class="card-title">${p.name}</h3>
                <div class="card-bottom">
                    <div class="card-price-row">
                        <span class="card-price">${p.price} DH</span>
                        ${oldPrice}
                    </div>
                    <button class="card-btn" onclick="event.stopPropagation(); App.addToCart('${p.id}')">
                        <i class="fas fa-shopping-cart"></i> AJOUTER
                    </button>
                </div>
            </div>
        `;
    },

    addToCart(id) {
        if (window.Cart) {
            Cart.add(id);
            this.updateCartBadge();
            this.showToast('Produit ajouté au panier !');
        }
    },

    showToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast animate-fade';
        toast.style.cssText = `
            background: var(--accent-slate);
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            margin-top: 1rem;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 0.75rem;
            box-shadow: var(--shadow-md);
            border-left: 4px solid var(--accent-red);
        `;
        toast.innerText = msg;
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
};

// Global container for toasts
const toastStyle = document.createElement('style');
toastStyle.innerHTML = `
    #toast-container {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        z-index: 2000;
        pointer-events: none;
    }
`;
document.head.appendChild(toastStyle);

document.addEventListener('DOMContentLoaded', () => App.init());

// Global Mobile Toggles
window.toggleMobileDrawer = function() {
    const drawer = document.getElementById('mobile-nav-drawer');
    const backdrop = document.getElementById('mobile-drawer-backdrop');
    if (drawer && backdrop) {
        drawer.classList.toggle('open');
        backdrop.style.display = drawer.classList.contains('open') ? 'block' : 'none';
        document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
    }
};

window.toggleMobileSearch = function() {
    const overlay = document.getElementById('mobile-search-overlay');
    if (overlay) {
        overlay.classList.toggle('open');
        if (overlay.classList.contains('open')) {
            document.getElementById('mobile-search-input')?.focus();
        }
    }
};

window.handleGlobalSearch = function(query, suggestionBoxId) {
    const suggestionsBox = document.getElementById(suggestionBoxId);
    if (!suggestionsBox) return;
    
    query = query.trim().toLowerCase();
    if (!query || query.length < 2) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const allProducts = window.PRODUCTS || [];
    const matches = allProducts.filter(p => 
        (p.visible !== false) && (
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        )
    ).slice(0, 5);

    if (matches.length > 0) {
        App.renderSearchSuggestions(matches, suggestionsBox);
        suggestionsBox.style.display = 'block';
    } else {
        suggestionsBox.style.display = 'none';
    }
};
