/**
 * MARRAKECH LUXE — Main UI Logic
 */

const WHATSAPP_NUMBER = window.getWhatsAppClean ? getWhatsAppClean() : '212699705617';

const App = {
    init() {
        this.updateCurrentYear();
        this.initSearch();
        this.renderFeaturedProducts();
        this.setupWhatsAppButton();
        this.setupScrollProgress();
        this.setupBackToTop();
        this.initPageLoader();
        
        // Initialize Wishlist UI
        if (window.Wishlist) Wishlist.updateUI();

        // Global Error Handling
        this.initErrorBoundaries();

        // Listen for store updates
        window.addEventListener('storage', () => {
            if (window.ProductDB) {
                window.ProductDB.fetchAll().then(() => this.renderFeaturedProducts());
            }
        });

        // Event Bus Listeners
        if (window.BUS) {
            BUS.on('products-updated', () => this.renderFeaturedProducts());
            BUS.on('stock-changed', () => this.renderFeaturedProducts());
        }

        this.initScrollEffects();
        this.initRevealOnScroll();
    },

    initPageLoader() {
        const loader = document.createElement('div');
        loader.className = 'page-load-progress';
        document.body.appendChild(loader);

        // Simulate initial progress
        setTimeout(() => {
            loader.style.width = '30%';
        }, 50);

        window.addEventListener('load', () => {
            loader.style.width = '100%';
            setTimeout(() => {
                loader.classList.add('finished');
                setTimeout(() => loader.remove(), 400);
            }, 300);
        });
    },

    initErrorBoundaries() {
        window.onerror = (msg, url, lineNo, columnNo, error) => {
            console.error('Global Error Tracked:', { msg, url, lineNo });
            this.notify("Une petite erreur s'est produite. Nous l'avons signalée à notre équipe.", "warning");
            return false;
        };

        window.onunhandledrejection = (event) => {
            console.error('Unhandled Promise Rejection:', event.reason);
            this.notify("Erreur de connexion. Veuillez vérifier votre réseau.", "error");
        };
    },

    /**
     * Unified Notification Portal
     * @param {string} msg 
     * @param {string} type - 'success' | 'error' | 'warning' | 'info'
     */
    notify(msg, type = 'success') {
        if (window.Cart && Cart.showToast) {
            Cart.showToast(msg, type);
        } else {
            alert(msg); // Fallback
        }
    },

    initScrollEffects() {
        const header = document.querySelector('.header-main');
        if (!header) return;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    },

    initRevealOnScroll() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                    // We don't unobserve if we want them to re-animate, but for luxury sites, once usually feels cleaner.
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Targeted elements for high-end entry - Now generalized to ANY .reveal-hidden
        const revealElements = document.querySelectorAll('.ali-card, .advantages, .hero-promos > div, .cat-item, .section-title-editorial, .reveal-hidden');
        
        revealElements.forEach((el, index) => {
            el.classList.add('reveal-hidden'); // Ensure base class
            if (index < 4) el.classList.add('stagger-' + ((index % 4) + 1));
            observer.observe(el);
        });
    },

    updateCurrentYear() {
        const el = document.getElementById('current-year');
        if (el) el.textContent = new Date().getFullYear();
    },

    // Legacy banner rendering removed - layout is now static in index.html for stability

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
        container.innerHTML = products.map((p, index) => `
            <div class="search-suggestion-item animate-fade" style="animation-delay: ${index * 0.05}s" onclick="window.location.href='/product-detail.html?id=${p.id}'">
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

    // Legacy MegaMenu removed - Sidebar is now primary

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
    },

    async renderFeaturedProducts() {
        const productGrid = document.getElementById('ali-product-grid');
        if (!productGrid) return;

        if (window.ProductDB) {
            await ProductDB.fetchAll();
        }

        const allProducts = (window.PRODUCTS || []).filter(p => p.visible !== false);
        
        // Show all products or a selection
        productGrid.innerHTML = allProducts.length
            ? allProducts.map(p => this.generateProductCard(p)).join('')
            : '<p style="color:var(--text-muted);padding:2rem">Aucun produit disponible.</p>';
        
        this.updateCartBadge();
    },

    showSkeletons(grids) {
        const skeletonHtml = Array(6).fill(this.generateSkeletonCard()).join('');
        grids.forEach(grid => {
            if (grid) grid.innerHTML = skeletonHtml;
        });
    },

    generateSkeletonCard() {
        return `
            <div class="compact-card skeleton-container">
                <div class="card-img-wrapper skeleton" style="height: 180px;"></div>
                <div class="skeleton" style="height: 12px; width: 40%; margin-bottom: 0.5rem;"></div>
                <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 1rem;"></div>
                <div class="card-bottom">
                    <div class="skeleton" style="height: 24px; width: 50%;"></div>
                    <div class="skeleton" style="height: 42px; width: 100%; border-radius: var(--radius-sm);"></div>
                </div>
            </div>
        `;
    },

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge && window.Cart) {
            badge.innerText = Cart.getCount();
        }
    },

    setupScrollProgress() {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            bar.style.width = scrollHeight > 0 ? ((scrollTop / scrollHeight) * 100) + '%' : '0%';
        }, { passive: true });
    },

    setupBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.setAttribute('aria-label', 'Retour en haut');
        btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        document.body.appendChild(btn);

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 400);
        }, { passive: true });
    },

    generateProductCard(p) {
        // High-Fidelity AliExpress Structure
        const soldCount = Math.floor(Math.random() * 500) + 10;
        return `
            <div class="ali-card animate-fade" onclick="window.location.href='/product-detail.html?id=${p.id}'">
                <div class="ali-card-img">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                    <div class="choice-tag-mini">Choice</div>
                </div>
                <div class="ali-card-info">
                    <div class="ali-card-cat">${p.category}</div>
                    <h3 class="ali-card-title">${p.name}</h3>
                    <div class="ali-card-stats">
                        <span class="stars"><i class="fas fa-star"></i> 4.8</span>
                        <span class="sold">${soldCount}+ vendus</span>
                    </div>
                    <div class="ali-card-price">
                        <span class="ali-price-now">${p.price}<span>DH</span></span>
                    </div>
                    <button class="ali-buy-btn" onclick="event.stopPropagation(); App.addToCart('${p.id}', event)">
                        <i class="fas fa-cart-plus"></i> AJOUTER
                    </button>
                </div>
            </div>
        `;
    },

    generateStockBadge(stock) {
        const threshold = (CONFIG.preferences && CONFIG.preferences.lowStockThreshold) || 5;
        if (stock <= 0) return `<div class="stock-badge critical"><i class="fas fa-times-circle"></i> RUPTURE</div>`;
        if (stock <= threshold) return `<div class="stock-badge critical"><i class="fas fa-fire"></i> DERNIERS ARTICLES</div>`;
        if (stock <= threshold * 2) return `<div class="stock-badge low"><i class="fas fa-clock"></i> STOCK LIMITÉ</div>`;
        return '';
    },

    addToCart(id, event) {
        if (window.Cart) {
            Cart.add(id);
            this.updateCartBadge();
            
            // Visual feedback on the button if event is provided
            if (event && event.currentTarget) {
                const btn = event.currentTarget;
                const originalContent = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.style.background = '#22c55e';
                
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.style.background = '';
                }, 1500);
            }
        }
    },

    updateCartBadge() {
        if (window.Cart && typeof Cart.updateBadge === 'function') {
            Cart.updateBadge();
        }
    },

    showToast(msg, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast animate-fade ${type}`;
        toast.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${msg}</span>
            </div>
        `;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());

window.toggleCartDrawer = function() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (drawer && backdrop) {
        const isOpen = drawer.classList.contains('open');
        if (!isOpen && window.Cart) {
            Cart.renderDrawer();
        }
        drawer.classList.toggle('open');
        backdrop.classList.toggle('visible');
        document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
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
