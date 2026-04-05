/**
 * Global Configuration for EL-WALI-SHOP
 * This supports dynamic overrides via Admin Dashboard overrides.
 */
const DEFAULT_CONFIG = {
    storeName: "EL-WALI-SHOP",
    whatsappNumber: "0615653798", 
    secondaryPhone: "0699705617", 
    whatsappMessage: "Bonjour EL-WALI-SHOP, je souhaiterais avoir des informations sur vos produits.",
    socialLinks: {
        facebook: "https://www.facebook.com/share/g/18L9fxx9pG/",
        instagram: "#",
        whatsapp: "https://wa.me/212615653798"
    },
    currency: "DH",
    deliveryFee: 0,
    supportEmail: "abdelaali.markabi@gmail.com",
    heroTitle: "L'élégance pour votre maison et votre beauté.",
    heroSubtitle: "Découvrez notre sélection exclusive d'électroménager premium, climatisation haute performance et cosmétiques de luxe directement à Marrakech.",
    promoBannerVisible: true,
    promoBannerTitle: "Préparez l'été à Marrakech !",
    heroBanners: {
        main: {
            img: "/home/xyz/.gemini/antigravity/brain/2018e71b-31ac-41a2-9d4f-0605c24361e1/electro_promo_main_1775254691404.png",
            tag: "SÉLECTION PREMIUM",
            title: "CUISINES ÉQUIPÉES<br>JUSQU'À -25%"
        },
        side1: {
            img: "/home/xyz/.gemini/antigravity/brain/2018e71b-31ac-41a2-9d4f-0605c24361e1/electro_promo_tv_1775254832960.png",
            title: "UNIVERS TV 4K OLED"
        },
        side2: {
            img: "/home/xyz/.gemini/antigravity/brain/2018e71b-31ac-41a2-9d4f-0605c24361e1/electro_promo_beauty_1775254965058.png",
            title: "SOINS & BEAUTÉ LUXE"
        }
    }
};

// Merge with dynamically controlled settings from Admin Panel
const storedSettings = JSON.parse(localStorage.getItem('elwali_site_settings') || '{}');
const CONFIG = { ...DEFAULT_CONFIG, ...storedSettings };

// Optional helper to flush settings
window.resetSiteSettings = () => {
    localStorage.removeItem('elwali_site_settings');
    window.location.reload();
};
