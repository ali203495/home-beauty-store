/**
 * Global Configuration for MARRAKECH LUXE
 * This supports dynamic overrides via Admin Dashboard overrides.
 */
const VERSION = '2.2';

const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const DEFAULT_CONFIG = {
    // API & Deployment
    apiBaseUrl: IS_PRODUCTION ? 'https://home-beauty-store-api.onrender.com' : 'http://localhost:3000',
    
    storeName: "MARRAKECH LUXE",
    whatsappNumber: "0615653798", 
    secondaryPhone: "0699705617", 
    whatsappMessage: "Bonjour MARRAKECH LUXE, je souhaiterais avoir des informations sur vos produits.",
    socialLinks: {
        facebook: "https://www.facebook.com/share/g/18L9fxx9pG/",
        instagram: "#",
        whatsapp: "https://wa.me/212615653798"
    },
    currency: "DH",
    freeShippingThreshold: 700,
    shippingZones: [
        { id: 'rak', name: 'Marrakech (Local)', fee: 0 },
        { id: 'cas', name: 'Casablanca / Rabat', fee: 35 },
        { id: 'nat', name: 'National (Autre ville)', fee: 45 }
    ],
    supportEmail: "abdelaali.markabi@gmail.com",
    heroTitle: "L'élégance pour votre maison et votre beauté.",
    heroSubtitle: "Découvrez notre sélection exclusive d'électroménager premium, climatisation haute performance et cosmétiques de luxe directement à Marrakech.",
    promoBannerVisible: true,
    promoBannerTitle: "Préparez l'été à Marrakech !",
    heroBanners: {
        main: {
            img: "assets/webp/hero_main.png",
            tag: "SÉLECTION LUXE",
            title: "L'ÉLÉGANCE À <span class='text-red'>MARRAKECH</span>"
        },
        side1: {
            img: "assets/webp/hero_side1.png",
            title: "ÉLECTROMÉNAGER PREMIUM"
        },
        side2: {
            img: "assets/webp/hero_side2.png",
            title: "BEAUTÉ & SOIN"
        }
    },
    layoutOrder: ['hero', 'promos', 'featured', 'categories'],
    activeCampaigns: [
        { id: 'c1', name: 'Soldes Été', active: true, discount: '20%' }
    ],
    facebookAutomation: {
        enabled: false,
        webhookUrl: "",
        pageIdentity: "MARRAKECH LUXE (Brand)"
    },
    emailConfig: {
        serviceId: "YOUR_SERVICE_ID",
        templateId_activation: "YOUR_ACTIVATION_TEMPLATE_ID",
        templateId_recovery: "YOUR_RECOVERY_TEMPLATE_ID",
        publicKey: "YOUR_PUBLIC_KEY"
    },
    paymentMethods: {
        cod: true, // Cash on Delivery
        cmi: false,
        paypal: false
    },
    preferences: {
        lowStockThreshold: 5,
        simulatedLatency: 400 // ms
    }
};

// Merge with dynamically controlled settings from Admin Panel
const storedSettings = JSON.parse(localStorage.getItem('elwali_site_settings') || '{}');
const CONFIG = { 
    ...DEFAULT_CONFIG, 
    ...storedSettings,
    
    // Config Methods
    save() {
        const { save, ...serializable } = this;
        localStorage.setItem('elwali_site_settings', JSON.stringify(serializable));
    },
    
    update(keyOrObj, value) {
        if (typeof keyOrObj === 'object') {
            Object.assign(this, keyOrObj);
        } else {
            this[keyOrObj] = value;
        }
        this.save();
    }
};

// Helper for WhatsApp Clean Number
function getWhatsAppClean() {
    return CONFIG.whatsappNumber.replace(/\s+/g, '').replace('+', '');
}

// Optional helper to flush settings
window.resetSiteSettings = () => {
    localStorage.removeItem('elwali_site_settings');
    window.location.reload();
};
