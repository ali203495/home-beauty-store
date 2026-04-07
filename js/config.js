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
            img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2000&auto=format&fit=crop",
            tag: "LIVRAISON PARTOUT",
            title: "Préparez l'été à <span class='text-red'>Marrakech !</span>"
        },
        side1: {
            img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1000&auto=format&fit=crop",
            title: "Lunettes Edition Limitée"
        },
        side2: {
            img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000&auto=format&fit=crop",
            title: "Sneakers Performance"
        }
    },
    layoutOrder: ['hero', 'promos', 'featured', 'categories'],
    activeCampaigns: [
        { id: 'c1', name: 'Soldes Été', active: true, discount: '20%' }
    ],
    facebookAutomation: {
        enabled: false,
        webhookUrl: "",
        pageIdentity: "EL-WALI-SHOP (Brand)"
    },
    emailConfig: {
        serviceId: "YOUR_SERVICE_ID",
        templateId_activation: "YOUR_ACTIVATION_TEMPLATE_ID",
        templateId_recovery: "YOUR_RECOVERY_TEMPLATE_ID",
        publicKey: "YOUR_PUBLIC_KEY"
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
