/**
 * MARRAKECH LUXE — Main UI Logic
 */

const WHATSAPP_NUMBER = window.getWhatsAppClean ? getWhatsAppClean() : '212699705617';

const App = {
    init() {
        this.updateCurrentYear();
        this.initSearch();
        this.renderHeroBanners();
        this.renderFeaturedProducts();
        this.setupWhatsAppButton();
        this.setupMegaMenu();
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
        const header = document.querySelector('.main-header');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 30) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
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
        const selectors = '.section, .hero-grid, .hero-small, .cat-strip, .compact-card, .trust-bar-inner > div, .reveal-hidden';
        const revealElements = document.querySelectorAll(selectors);
        
        revealElements.forEach((el, index) => {
            // Only add default 'reveal-up' if no directional animation is specified
            if (!el.classList.contains('reveal-left') && 
                !el.classList.contains('reveal-right') && 
                !el.classList.contains('reveal-scale') && 
                !el.classList.contains('reveal-up')) {
                el.classList.add('reveal-up');
            }
            
            // Auto-stagger in grids if not manually specified
            if (![...el.classList].some(c => c.startsWith('stagger-'))) {
                if (el.parentElement.classList.contains('grid') || el.parentElement.classList.contains('flex')) {
                    const staggerClass = `stagger-${(index % 4) + 1}`;
                    el.classList.add(staggerClass);
                }
            }

            observer.observe(el);
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
    },

    async renderFeaturedProducts() {
        const topVentesGrid = document.getElementById('top-ventes-grid');
        const promotionsGrid = document.getElementById('promotions-grid');
        const nouveautesGrid = document.getElementById('nouveautes-grid');

        if (!topVentesGrid && !promotionsGrid && !nouveautesGrid) return;

        // Show skeletons initially
        this.showSkeletons([topVentesGrid, promotionsGrid, nouveautesGrid]);

        if (window.ProductDB) {
            await ProductDB.fetchAll();
        }

        const allProducts = (window.PRODUCTS || []).filter(p => p.visible !== false);
        
        // Brief delay to ensure skeletons are seen (Premium Feel)
        setTimeout(() => {
            if (topVentesGrid) {
                const topProducts = [...allProducts]
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 6);
                topVentesGrid.innerHTML = topProducts.length
                    ? topProducts.map(p => this.generateProductCard(p)).join('')
                    : '<p style="color:var(--text-muted);padding:2rem">Aucun produit disponible.</p>';
            }

            if (promotionsGrid) {
                const promoProducts = allProducts
                    .filter(p => p.badge)
                    .slice(0, 6);
                promotionsGrid.innerHTML = promoProducts.length
                    ? promoProducts.map(p => this.generateProductCard(p, true)).join('')
                    : '<p style="color:var(--text-muted);padding:2rem">Aucune promotion disponible.</p>';
            }

            if (nouveautesGrid) {
                const newProducts = [...allProducts].reverse().slice(0, 6);
                nouveautesGrid.innerHTML = newProducts.length
                    ? newProducts.map(p => this.generateProductCard(p)).join('')
                    : '<p style="color:var(--text-muted);padding:2rem">Aucune nouveauté disponible.</p>';
            }
            
            this.updateCartBadge();
        }, 600);
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

    generateProductCard(p, isPromo = false) {
        const badge = isPromo ? `<span class="card-badge">PROMO</span>` : (p.badge ? `<span class="card-badge">${p.badge}</span>` : '');
        const oldPrice = isPromo ? `<span class="card-price-old">${Math.round(p.price * 1.2)} DH</span>` : '';
        const isWishlisted = window.Wishlist ? Wishlist.isWishlisted(p.id) : false;
        const stockBadge = this.generateStockBadge(p.stock);

        return `
            <div class="compact-card animate-fade" onclick="window.location.href='/product-detail.html?id=${p.id}'">
                ${badge}
                <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                        data-id="${p.id}" 
                        onclick="event.stopPropagation(); Wishlist.toggle('${p.id}')">
                    <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                </button>
                <div class="card-img-wrapper">
                    <img src="${p.image}" alt="${p.name}" loading="lazy">
                    <div class="card-quick-view" onclick="event.stopPropagation(); QuickView.open('${p.id}')">
                        <i class="fas fa-eye"></i> Aperçu
                    </div>
                </div>
                <div class="card-cat">${p.category}</div>
                <h3 class="card-title">${p.name}</h3>
                ${stockBadge}
                <div class="card-bottom">
                    <div class="card-price-row">
                        <span class="card-price">${p.price} DH</span>
                        ${oldPrice}
                    </div>
                    <button class="card-btn" onclick="event.stopPropagation(); App.addToCart('${p.id}', event)">
                        <i class="fas fa-shopping-basket"></i> AJOUTER
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
                btn.innerHTML = '<i class="fas fa-check"></i> AJOUTÉ !';
                btn.classList.add('bg-success'); // Assuming a success color
                btn.style.background = '#22c55e';
                
                setTimeout(() => {
                    btn.innerHTML = originalContent;
                    btn.classList.remove('bg-success');
                    btn.style.background = '';
                }, 2000);
            }

            this.showToast('Produit ajouté au panier !');
        }
    },

    showToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast animate-fade';
        toast.innerText = msg;
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
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
