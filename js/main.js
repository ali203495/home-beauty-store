/**
 * Main UI Logic & Integrations
 */

const getWhatsAppClean = () => {
    let clean = (CONFIG.whatsappNumber || '0615653798').replace(/\D/g, '');
    if (clean.startsWith('0')) clean = '212' + clean.substring(1);
    return clean;
};

const WHATSAPP_NUMBER = getWhatsAppClean();
const WHATSAPP_GROUP_URL = CONFIG.socialLinks && CONFIG.socialLinks.whatsapp ? CONFIG.socialLinks.whatsapp : 'https://wa.me/' + WHATSAPP_NUMBER;
const FB_GROUP_URL = CONFIG.socialLinks && CONFIG.socialLinks.facebook ? CONFIG.socialLinks.facebook : 'https://www.facebook.com/share/g/18L9fxx9pG/';

const App = {
  /**
   * Initializes all global UI components and event listeners
   */
  init() {
    this.handleNavbar();
    this.handleMobileNav();
    this.initSearch();
    this.updateCurrentYear();
    this.setupScrollEffects();
    this.setupWhatsAppButton();
    this.applySiteSettings();
  },

  applySiteSettings() {
    // Dynamic injection of CONFIG text onto the frontend
    const els = {
      'site-name-display': CONFIG.storeName,
      'hero-title-display': CONFIG.heroTitle,
      'hero-sub-display': CONFIG.heroSubtitle,
      'contact-email-display': CONFIG.supportEmail,
      'contact-phone-display': CONFIG.whatsappNumber
    };

    for (const [id, value] of Object.entries(els)) {
      if (value) {
        document.querySelectorAll('.' + id + ', #' + id).forEach(el => {
          if (el.tagName === 'A' && el.href.includes('mailto:')) {
            el.href = 'mailto:' + value;
            el.innerText = value;
          } else if (el.tagName === 'A' && el.href.includes('tel:')) {
            el.href = 'tel:' + value;
            el.innerText = value;
          } else {
            el.innerText = value;
          }
        });
      }
    }
  },


  /**
   * Sets up scroll-based feedback (Progress bar and Scroll to Top button)
   */
  setupScrollEffects() {
    // Create Scroll to Top Button
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.setAttribute('aria-label', 'Retour en haut');
    document.body.appendChild(btn);

    const progressBar = document.getElementById('scroll-progress');

    window.addEventListener('scroll', () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;

      // Update Top Progress Bar
      if (progressBar) {
        progressBar.style.width = scrolled + '%';
      }

      // Toggle Scroll Top Button
      if (scrollPx > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  },

  /**
   * Manages navbar appearance on scroll
   */
  handleNavbar() {
    const nav = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    });
  },

  handleMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });
    }

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileNav.classList.remove('open'));
    });
  },

  setupWhatsAppButton() {
    // Floating WhatsApp Button
    const waBtn = document.createElement('a');
    waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    waBtn.target = '_blank';
    waBtn.className = 'floating-wa';
    waBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      <span>Contact Marrakech</span>
    `;
    document.body.appendChild(waBtn);

    // Add CSS for WA button dynamically if not in components.css
    const style = document.createElement('style');
    style.innerHTML = `
      .floating-wa {
        position: fixed;
        bottom: 30px;
        left: 30px;
        background: #25d366;
        color: white;
        padding: 12px 20px;
        border-radius: 50px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 600;
        box-shadow: 0 10px 25px rgba(37, 211, 102, 0.3);
        z-index: 999;
        text-decoration: none;
        transition: transform 0.3s var(--ease);
      }
      .floating-wa:hover { transform: scale(1.05) translateY(-5px); }
      @media (max-width: 768px) {
        .floating-wa span { display: none; }
        .floating-wa { padding: 15px; border-radius: 50%; bottom: 20px; left: 20px; }
      }
    `;
    document.head.appendChild(style);
  },

  setupSocialSharing() {
    window.shareToWhatsApp = (id) => {
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return;
      const text = encodeURIComponent(`Bonjour EL-WALI-SHOP ! Je suis intéressé par ce produit : ${product.name} (${product.price} DH). Voici le lien : ${window.location.origin}/product-detail?id=${product.id}`);
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
    };

    window.shareToFacebook = (id) => {
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return;
      const url = encodeURIComponent(`${window.location.origin}/product-detail?id=${product.id}`);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };
  },

  generateProductCard(p) {
    return `
      <div class="product-card" onclick="window.location.href='product-detail?id=${p.id}'">
        <div class="product-card-image">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          ${p.badge ? `<span class="product-card-badge badge-new">${p.badge}</span>` : ''}
          <div class="product-card-actions">
            <button class="product-action-btn" onclick="event.stopPropagation(); Cart.add('${p.id}')">
              <i class="fas fa-cart-plus"></i>
            </button>
            <button class="product-action-btn" onclick="event.stopPropagation(); shareToWhatsApp('${p.id}')">
              <i class="fab fa-whatsapp"></i>
            </button>
            <button class="product-action-btn" style="background:var(--gold); color:black" onclick="event.stopPropagation(); window.location.href='quick-buy?id=${p.id}'" title="Achat Rapide">
              <i class="fas fa-bolt"></i>
            </button>
          </div>
          <button class="product-card-quick-add" onclick="event.stopPropagation(); Cart.add('${p.id}')">
            Ajouter au panier
          </button>
        </div>
        <div class="product-card-body">
          <div class="product-category">${p.category}</div>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-rating">
            <div class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</div>
            <span class="rating-count">(${p.reviews})</span>
          </div>
          <div class="product-price-row">
            <span class="product-price">${p.price} DH</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Updates the copyright year in the footer
   */
  updateCurrentYear() {
    const el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
  },

  initSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = e.target.value.trim();
          if (query) {
            window.location.href = `products?search=${encodeURIComponent(query)}`;
          }
        }
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
