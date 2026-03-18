/**
 * Localization Engine - Marrakech Luxe Home
 */

const I18N_KEY = 'mlh_lang';

const translations = {
    fr: {
        nav_home: "Accueil",
        nav_products: "Produits",
        nav_cart: "Panier",
        nav_contact: "Contact",
        nav_search: "Rechercher...",
        hero_tag: "BOUTIQUE DE LUXE À MARRAKECH",
        hero_title: "L'élégance pour votre maison et votre beauté.",
        hero_subtitle: "Découvrez notre sélection exclusive d'électroménager premium, climatisation haute performance et cosmétiques de luxe.",
        hero_btn_collection: "Découvrir la collection",
        hero_btn_contact: "Nous contacter",
        cat_title: "Parcourez nos Catégories",
        cat_subtitle: "Tout ce dont vous avez besoin pour un foyer moderne.",
        featured_title: "Les Favoris du Mois",
        featured_tag: "Produits Phares",
        footer_brand_desc: "Votre partenaire de confiance à Marrakech pour l'équipement de la maison et la beauté haut de gamme.",
        footer_support: "Support",
        footer_store: "Magasin",
        footer_contact: "Contact",
        cart_title: "Votre Panier",
        cart_empty_title: "Votre panier est vide",
        cart_empty_text: "Il est temps de commencer votre shopping !",
        cart_empty_products_btn: "Voir les produits",
        cart_summary_title: "Résumé de la commande",
        cart_subtotal: "Sous-total",
        cart_delivery_marrakech: "Livraison (Marrakech)",
        cart_delivery_free: "Gratuite",
        cart_total: "Total",
        cart_checkout_btn: "Passer à la Caisse",
        cart_need_help: "Besoin d'aide ?",
        cart_whatsapp_direct: "WhatsApp Direct",
        checkout_title: "Caisse",
        checkout_form_header: "Coordonnées de Livraison",
        checkout_summary: "Votre Commande",
        checkout_confirm: "Confirmer ma commande",
        checkout_subtotal: "Sous-total",
        checkout_delivery: "Livraison",
        checkout_total_label: "Total à payer",
        form_fname: "Prénom",
        form_lname: "Nom",
        form_fname_ph: "Ex: Ahmed",
        form_lname_ph: "Ex: Alami",
        form_phone_label: "Téléphone (Mobile/WhatsApp)",
        form_address_label: "Adresse de livraison",
        form_address_ph: "N° de maison, Rue, Appartement...",
        form_neighborhood_label: "Quartier (Marrakech)",
        form_neighborhood_ph: "Sélectionner votre quartier",
        pay_mode_cod: "Mode de paiement : Paiement à la livraison (Cash on Delivery)",
        modal_order_confirmed_title: "Commande Confirmée !",
        modal_order_confirmed_text: "Merci de votre confiance. Notre service client vous contactera par téléphone pour confirmer la livraison.",
        modal_back_to_shop_btn: "Retour à la Boutique",
        modal_order_received_title: "Commande Reçue !",
        modal_order_received_text: "Merci pour votre commande chez Marrakech Luxe Home. Nous vous contacterons sous peu pour confirmer la livraison.",
        modal_back_to_home_btn: "Retour à l'accueil",
        msg_added: "Produit ajouté au panier !",
        msg_removed: "Produit retiré du panier"
    },
    ar: {
        nav_home: "الرئيسية",
        nav_products: "المنتجات",
        nav_cart: "السلة",
        nav_contact: "اتصل بنا",
        nav_search: "بحث...",
        hero_tag: "متجر الفخامة في مراكش",
        hero_title: "الأناقة لمنزلك وجمالك.",
        hero_subtitle: "اكتشف مجموعتنا الحصرية من الأجهزة المنزلية المتميزة، وأجهزة التكييف عالية الأداء، ومستحضرات التجميل الفاخرة.",
        hero_btn_collection: "اكتشف المجموعة",
        hero_btn_contact: "اتصل بنا",
        cat_title: "تصفح فئاتنا",
        cat_subtitle: "كل ما تحتاجه لمنزل عصري.",
        featured_title: "المفضلات لهذا الشهر",
        featured_tag: "منتجات مختارة",
        footer_brand_desc: "شريكك الموثوق في مراكش لتجهيزات المنزل والجمال الراقي.",
        footer_support: "سند",
        footer_store: "المتجر",
        footer_contact: "اتصل",
        cart_title: "سلة التسوق",
        cart_empty_title: "سلتك فارغة",
        cart_empty_text: "حان الوقت لبدء التسوق!",
        cart_empty_products_btn: "عرض المنتجات",
        cart_summary_title: "ملخص الطلب",
        cart_subtotal: "المجموع الفرعي",
        cart_delivery_marrakech: "التوصيل (مراكش)",
        cart_delivery_free: "مجاني",
        cart_total: "المجموع الكلي",
        cart_checkout_btn: "إتمام الطلب",
        cart_need_help: "هل تحتاج مساعدة؟",
        cart_whatsapp_direct: "واتساب مباشر",
        checkout_title: "الدفع",
        checkout_form_header: "تفاصيل التوصيل",
        checkout_summary: "طلبيتك",
        checkout_confirm: "تأكيد الطلب",
        checkout_subtotal: "المجموع الفرعي",
        checkout_delivery: "التوصيل",
        checkout_total_label: "المبلغ الإجمالي",
        form_fname: "الاسم الشخصي",
        form_lname: "الاسم العائلي",
        form_fname_ph: "مثال: أحمد",
        form_lname_ph: "مثال: العلمي",
        form_phone_label: "رقم الهاتف (موبايل/واتساب)",
        form_address_label: "عنوان التوصيل",
        form_address_ph: "رقم المنزل، الشارع، الشقة...",
        form_neighborhood_label: "الحي (مراكش)",
        form_neighborhood_ph: "اختر حيك",
        pay_mode_cod: "طريقة الدفع: الدفع عند الاستلام",
        modal_order_confirmed_title: "تم تأكيد الطلب!",
        modal_order_confirmed_text: "شكراً لثقتكم. فريق خدمة العملاء سيتصل بكم لتأكيد موعد التوصيل.",
        modal_back_to_shop_btn: "العودة للمتجر",
        modal_order_received_title: "تم استلام الطلب!",
        modal_order_received_text: "شكراً لثقتكم. سيتصل بكم فريقنا قريباً.",
        modal_back_to_home_btn: "العودة للرئيسية",
        msg_added: "تمت إضافة المنتج إلى السلة!",
        msg_removed: "تمت إزالة المنتج من السلة"
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
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        if (lang === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }

        // Apply translations to elements with data-i18n attribute
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
    },

    get(key) {
        return translations[this.lang][key] || key;
    }
};

document.addEventListener('DOMContentLoaded', () => I18n.init());
