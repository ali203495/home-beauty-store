/**
 * Localization Engine - EL-WALI-SHOP
 * Supports: French (fr), Arabic (ar), English (en)
 */

const I18N_KEY = 'mlh_lang';

const translations = {
    fr: {
        // Shared Navigation
        nav_home: "Accueil",
        nav_products: "Produits",
        nav_cart: "Panier",
        nav_contact: "Contact",
        nav_search: "Rechercher...",
        
        // Admin Sidebar & Tabs
        admin_dashboard: "Tableau de Bord",
        admin_stats: "Statistiques",
        admin_inventory: "Inventaire",
        admin_orders: "Commandes",
        admin_customers: "Clients",
        admin_promos: "Promotions",
        admin_layout: "Mise en Page",
        admin_admins: "Gestion Admins",
        admin_media: "Contenu & IA",
        admin_automation: "Automatisations",
        admin_logs: "Logs Système",
        admin_logout: "Déconnexion",
        
        // Admin Titles
        admin_title_overview: "Aperçu Intelligence",
        admin_title_products: "Catalogue Produits",
        admin_title_inventory: "Gestion des Stocks",
        admin_title_analytics: "Intelligence & Statistiques",
        
        // Admin Buttons/Actions
        admin_btn_add_product: "AJOUTER PRODUIT",
        admin_btn_save: "ENREGISTRER",
        admin_btn_cancel: "ANNULER",
        admin_btn_export: "EXPORTER CSV",
        
        // Admin Stats Labels
        stat_revenue: "Chiffre d'Affaires",
        stat_orders: "Commandes",
        stat_low_stock: "Stock Critique",
        stat_customers: "Clients Uniques",
        
        // Storefront
        hero_tag: "BOUTIQUE DE LUXE À MARRAKECH",
        hero_title: "L'élégance pour votre maison et votre beauté.",
        hero_subtitle: "Découvrez notre sélection exclusive d'électroménager premium, climatisation haute performance et cosmétiques de luxe.",
        msg_added: "Produit ajouté au panier !",
        msg_removed: "Produit retiré du panier"
    },
    en: {
        // Shared Navigation
        nav_home: "Home",
        nav_products: "Products",
        nav_cart: "Cart",
        nav_contact: "Contact",
        nav_search: "Search...",
        
        // Admin Sidebar & Tabs
        admin_dashboard: "Dashboard",
        admin_stats: "Analytics",
        admin_inventory: "Inventory",
        admin_orders: "Orders",
        admin_customers: "Customers",
        admin_promos: "Promotions",
        admin_layout: "Layout",
        admin_admins: "Staff Management",
        admin_media: "Media & AI",
        admin_automation: "Automations",
        admin_logs: "System Logs",
        admin_logout: "Logout",
        
        // Admin Titles
        admin_title_overview: "Intelligence Overview",
        admin_title_products: "Product Catalog",
        admin_title_inventory: "Inventory Management",
        admin_title_analytics: "Intelligence & Stats",
        
        // Admin Buttons/Actions
        admin_btn_add_product: "ADD PRODUCT",
        admin_btn_save: "SAVE CHANGES",
        admin_btn_cancel: "CANCEL",
        admin_btn_export: "EXPORT CSV",
        
        // Admin Stats Labels
        stat_revenue: "Total Revenue",
        stat_orders: "Total Orders",
        stat_low_stock: "Critical Stock",
        stat_customers: "Unique Customers",
        
        // Storefront
        hero_tag: "LUXURY STORE IN MARRAKECH",
        hero_title: "Elegance for your home and beauty.",
        hero_subtitle: "Browse our premium selection of appliances, high-performance ACs, and luxury cosmetics.",
        msg_added: "Added to cart!",
        msg_removed: "Removed from cart"
    },
    ar: {
        // Shared Navigation
        nav_home: "الرئيسية",
        nav_products: "المنتجات",
        nav_cart: "السلة",
        nav_contact: "اتصل بنا",
        nav_search: "بحث...",
        
        // Admin Sidebar & Tabs
        admin_dashboard: "لوحة القيادة",
        admin_stats: "الإحصائيات",
        admin_inventory: "المخزون",
        admin_orders: "الطلبات",
        admin_customers: "الزبناء",
        admin_promos: "العروض",
        admin_layout: "التصميم",
        admin_admins: "إدارة المدراء",
        admin_media: "الوسائط والذكاء",
        admin_automation: "الأتمتة",
        admin_logs: "سجلات النظام",
        admin_logout: "تسجيل الخروج",
        
        // Admin Titles
        admin_title_overview: "نظرة عامة ذكية",
        admin_title_products: "كتالوج المنتجات",
        admin_title_inventory: "إدارة المخازن",
        admin_title_analytics: "الذكاء والإحصائيات",
        
        // Admin Buttons/Actions
        admin_btn_add_product: "إضافة منتج",
        admin_btn_save: "حفظ التغييرات",
        admin_btn_cancel: "إلغاء",
        admin_btn_export: "تصدير CSV",
        
        // Admin Stats Labels
        stat_revenue: "إجمالي المبيعات",
        stat_orders: "الطلبات",
        stat_low_stock: "مخزون حرج",
        stat_customers: "زبناء فريدون",
        
        // Storefront
        hero_tag: "متجر الفخامة في مراكش",
        hero_title: "الأناقة لمنزلك وجمالك.",
        hero_subtitle: "اكتشف مجموعتنا الحصرية من الأجهزة المنزلية المتميزة وأجهزة التكييف ومستحضرات التجميل الفاخرة.",
        msg_added: "تمت الإضافة إلى السلة!",
        msg_removed: "تمت الإزالة من السلة"
    }
};

const I18n = {
    lang: localStorage.getItem(I18N_KEY) || 'fr',

    init() {
        this.apply(this.lang);
    },

    setLang(lang) {
        this.lang = lang;
        localStorage.setItem(I18N_KEY, lang);
        this.apply(lang);
        window.dispatchEvent(new CustomEvent('langChanged', { detail: lang }));
    },

    apply(lang) {
        const t = translations[lang];
        if (!t) return;

        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        if (lang === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }

        // Apply translations to all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = t[key];
                } else {
                    el.innerText = t[key];
                }
            }
        });
        
        // Additional localized style adjustments
        this.applyLayoutAdjustments(lang);
    },

    applyLayoutAdjustments(lang) {
        // You can add logic here for font changes or specific padding for certain languages
        if (lang === 'ar') {
            document.body.style.fontFamily = "'Cairo', sans-serif";
        } else {
            document.body.style.fontFamily = "inherit";
        }
    },

    get(key) {
        const t = translations[this.lang];
        return (t && t[key]) ? t[key] : key;
    }
};

document.addEventListener('DOMContentLoaded', () => I18n.init());
