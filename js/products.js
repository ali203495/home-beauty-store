/**
 * LUMIÈRE HOME & BEAUTY (Marrakech LUXE HOME)
 * Product Database & Storage Management
 */

// Initial hardcoded products (used if localStorage is empty)
const INITIAL_PRODUCTS = [
    // --- Electroménager (Home Appliances) ---
    {
        id: 'app-01',
        name: 'Mélangeur Professionnel UltraPower',
        category: 'Electroménager',
        price: 1850,
        rating: 4.8,
        reviews: 124,
        image: 'assets/webp/appliances.webp',
        badge: 'Populaire',
        description: 'Mélangeur haute performance avec moteur de 1500W, idéal pour les smoothies et soupes.',
        specs: { 'Puissance': '1500W', 'Capacité': '2L', 'Garantie': '2 ans' }
    },
    {
        id: 'app-02',
        name: 'Cafetière Espresso Artisan',
        category: 'Electroménager',
        price: 3200,
        rating: 4.9,
        reviews: 89,
        image: 'assets/webp/appliances.webp',
        badge: 'Nouveau',
        description: 'Machine à espresso manuelle pour un café de qualité barista à la maison.',
        specs: { 'Pression': '15 Bars', 'Réservoir': '1.5L', 'Matériau': 'Acier Inoxydable' }
    },
    {
        id: 'app-03',
        name: 'Réfrigérateur Split Side-by-Side',
        category: 'Electroménager',
        price: 12500,
        rating: 4.8,
        reviews: 45,
        image: 'assets/webp/appliances.webp',
        badge: 'Luxe',
        description: 'Réfrigérateur grand volume avec distributeur d\'eau et glaçons filtré.',
        specs: { 'Capacité': '540L', 'Classe': 'A++', 'Technologie': 'No Frost' }
    },
    {
        id: 'app-04',
        name: 'Lave-linge Frontal ProSmart',
        category: 'Electroménager',
        price: 4800,
        rating: 4.7,
        reviews: 67,
        image: 'assets/webp/appliances.webp',
        badge: 'Efficace',
        description: 'Lave-linge intelligent avec moteur Inverter et programme vapeur.',
        specs: { 'Capacité': '9kg', 'Vitesse': '1400 tr/min', 'Programmes': '15' }
    },

    // --- Climatisation (Air Conditioners) ---
    {
        id: 'ac-01',
        name: 'Climatiseur Split Inverter 12000 BTU',
        category: 'Climatisation',
        price: 4500,
        rating: 4.7,
        reviews: 56,
        image: 'assets/webp/aircon.webp',
        badge: 'Service Inclus',
        description: 'Climatiseur haute efficacité avec installation professionnelle incluse à Marrakech.',
        specs: { 'Capacité': '12000 BTU', 'Type': 'Inverter', 'Installation': 'Gratuite' }
    },
    {
        id: 'ac-02',
        name: 'Climatiseur Mobile Compact',
        category: 'Climatisation',
        price: 2800,
        rating: 4.5,
        reviews: 34,
        image: 'assets/webp/aircon.webp',
        description: 'Solution de refroidissement mobile facile à déplacer, parfaite pour les appartements.',
        specs: { 'Capacité': '9000 BTU', 'Bruit': 'Low DB', 'Kit Fenêtre': 'Inclus' }
    },

    // --- Maquillage & Beauté ---
    {
        id: 'mk-01',
        name: 'Palette Ombre à Paupières Rose Gold',
        category: 'Maquillage',
        price: 450,
        rating: 4.9,
        reviews: 210,
        image: 'assets/webp/makeup.webp',
        badge: 'Luxe',
        description: 'Palette de 12 teintes pigmentées allant du mat au scintillant.',
        specs: { 'Teintes': '12', 'Fini': 'Mat & Irisé', 'Tenue': '24h' }
    },
    {
        id: 'mk-02',
        name: 'Fond de Teint Velours Lumière',
        category: 'Maquillage',
        price: 380,
        rating: 4.8,
        reviews: 156,
        image: 'assets/webp/makeup.webp',
        description: 'Base de maquillage à couvrance totale avec fini naturel et lumineux.',
        specs: { 'Volume': '30ml', 'SPF': '15', 'Type de peau': 'Tous types' }
    },

    // --- Cuisine ---
    {
        id: 'kit-01',
        name: 'Set de Casseroles Signature Premium',
        category: 'Cuisine',
        price: 1250,
        rating: 4.7,
        reviews: 42,
        image: 'assets/webp/kitchen_cleaning.webp',
        badge: 'Offre',
        description: 'Ensemble de 5 pièces en acier inoxydable multicouche pour une cuisson uniforme.',
        specs: { 'Pièces': '5', 'Compatibilité': 'Induction/Gaz', 'Revêtement': 'Anti-adhésif' }
    },
    {
        id: 'kit-02',
        name: 'Service de Table en Céramique (18 pcs)',
        category: 'Cuisine',
        price: 850,
        rating: 4.9,
        reviews: 15,
        image: 'assets/webp/kitchen_cleaning.webp',
        badge: 'Premium',
        description: 'Élégant service de table complet pour 6 personnes, design moderne et épuré.',
        specs: { 'Pièces': '18', 'Compatibles': 'Micro-ondes/Lave-vaisselle' }
    },

    // --- Produits de Nettoyage ---
    {
        id: 'cln-01',
        name: 'Pack Nettoyage Éclat Total',
        category: 'Fournitures de Nettoyage',
        price: 250,
        rating: 4.6,
        reviews: 78,
        image: 'assets/webp/kitchen_cleaning.webp',
        description: 'Kit complet comprenant nettoyant multi-surfaces, dégraissant et lustrant.',
        specs: { 'Volume Total': '3L', 'Parfums': 'Citron/Lavande' }
    },
    {
        id: 'cln-02',
        name: 'Aspirateur Robot CleanPro X',
        category: 'Équipements de Nettoyage',
        price: 2400,
        rating: 4.7,
        reviews: 64,
        image: 'assets/webp/appliances.webp',
        badge: 'Promo',
        description: 'Robot aspirateur intelligent avec navigation laser et fonction lavage de sol.',
        specs: { 'Autonomie': '120 min', 'Aspiration': '2500 Pa', 'Bruit': '60 dB' }
    },
    {
        id: 'cln-03',
        name: 'Nettoyeur Vapeur Multi-usage',
        category: 'Équipements de Nettoyage',
        price: 1450,
        rating: 4.8,
        reviews: 52,
        image: 'assets/webp/kitchen_cleaning.webp',
        badge: 'Best-Seller',
        description: 'Nettoyeur vapeur pour assainir toutes les surfaces sans produits chimiques.',
        specs: { 'Pression': '4 Bars', 'Temps chauffe': '5 min', 'Accessoires': '10' }
    },
    {
        id: 'cln-04',
        name: 'Pack Désinfectant Hospitalier (5L)',
        category: 'Fournitures de Nettoyage',
        price: 350,
        rating: 4.9,
        reviews: 110,
        image: 'assets/webp/kitchen_cleaning.webp',
        badge: 'Pro',
        description: 'Solution désinfectante à large spectre pour environnements exigeants (aéroport, bureaux).',
        specs: { 'Volume': '5L', 'Efficacité': 'Virucide/Bactéricide', 'Usage': 'Diluable' }
    },
    {
        id: 'cln-05',
        name: 'EL-WALI Cleaning Soap',
        category: 'Fournitures de Nettoyage',
        price: 45,
        rating: 4.8,
        reviews: 24,
        image: 'assets/webp/kitchen_cleaning.webp',
        badge: 'Efficace',
        description: 'Cleans surfaces quickly without harmful chemicals',
        specs: { 'Type': 'Savon de nettoyage', 'Usage': 'Multi-surfaces', 'Parfum': 'Frais' }
    },
    {
        id: 'cln-06',
        name: 'EL-WALI Floor Cleaner',
        category: 'Nettoyage des Sols',
        price: 60,
        rating: 4.7,
        reviews: 38,
        image: 'assets/webp/kitchen_cleaning.webp',
        badge: 'Pro',
        description: 'Removes dirt and odors effectively',
        specs: { 'Type': 'Nettoyant sol', 'Concentré': 'Oui', 'Volume': '1L' }
    },
    {
        id: 'cln-07',
        name: 'EL-WALI Cleaning Cloth',
        category: 'Outils de Nettoyage',
        price: 20,
        rating: 4.9,
        reviews: 15,
        image: 'assets/webp/kitchen_cleaning.webp',
        badge: 'Top',
        description: 'Soft and absorbs water quickly',
        specs: { 'Matière': 'Microfibre', 'Taille': '40x40cm', 'Lavage': 'Machine' }
    },

    // --- Produits de Plastique ---
    {
        id: 'pl-01',
        name: 'Organisateurs de Cuisine Modulaires',
        category: 'Plastique',
        price: 180,
        rating: 4.8,
        reviews: 95,
        image: 'assets/webp/plastic.webp',
        description: 'Ensemble de bacs de rangement transparents sans BPA pour frigo et placards.',
        specs: { 'Nombre': '6 bacs', 'Matériau': 'Plastique sans BPA', 'Lavage': 'Lave-vaisselle' }
    },
    {
        id: 'pl-02',
        name: 'Bassines Colorées Empilables (Set de 3)',
        category: 'Plastique',
        price: 95,
        rating: 4.4,
        reviews: 28,
        image: 'assets/webp/plastic.webp',
        description: 'Série de 3 bassines de tailles différentes, résistantes et aux couleurs vives.',
        specs: { 'Tailles': 'S, M, L', 'Usage': 'Multi-usage', 'Origine': 'Maroc' }
    }
];

// Initialize dynamic products
let PRODUCTS = [];

/**
 * Data Access Object for Products
 * Synchronizes with Supabase for persistence
 */
const ProductDB = {
    async fetchAll() {
        if (!window.supabaseClient) {
            console.warn('Supabase not connected. Falling back to local/initial.');
            PRODUCTS = INITIAL_PRODUCTS;
            return PRODUCTS;
        }

        const { data, error } = await window.supabaseClient.from('products').select('*');
        if (error) {
            console.error('Error fetching products:', error);
            PRODUCTS = INITIAL_PRODUCTS;
            return PRODUCTS;
        }
        
        // Seed if empty
        if (!data || data.length === 0) {
            console.log('Seeding initial products to Supabase...');
            for (const p of INITIAL_PRODUCTS) {
                await window.supabaseClient.from('products').insert([p]);
            }
            PRODUCTS = INITIAL_PRODUCTS;
            return PRODUCTS;
        }

        PRODUCTS = data;
        return PRODUCTS;
    },

    async saveProduct(product) {
        if(!window.supabaseClient) return;
        const { error } = await window.supabaseClient.from('products').insert([product]);
        if (error) console.error('Error saving product:', error);
        await this.fetchAll();
    },

    async update(id, updatedData) {
        if(!window.supabaseClient) return;
        const { error } = await window.supabaseClient.from('products').update(updatedData).eq('id', id);
        if (error) console.error('Error updating product:', error);
        await this.fetchAll();
    },

    async delete(id) {
        if(!window.supabaseClient) return;
        const { error } = await window.supabaseClient.from('products').delete().eq('id', id);
        if (error) console.error('Error deleting product:', error);
        await this.fetchAll();
    }
};

/**
 * Data Access Object for Orders
 * Synchronizes with Supabase for persistence
 */
const OrderDB = {
    async getOrders() {
        if(!window.supabaseClient) return JSON.parse(localStorage.getItem('mlh_orders')) || [];
        const { data, error } = await window.supabaseClient.from('orders').select('*').order('date', { ascending: false });
        if (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
        return data;
    },

    async saveOrder(order) {
        if(!window.supabaseClient) {
            const orders = JSON.parse(localStorage.getItem('mlh_orders')) || [];
            orders.unshift(order);
            localStorage.setItem('mlh_orders', JSON.stringify(orders));
            return;
        }
        const { error } = await window.supabaseClient.from('orders').insert([order]);
        if (error) console.error('Error saving order:', error);
    },

    async updateStatus(orderId, status) {
        if(!window.supabaseClient) return;
        const { error } = await window.supabaseClient.from('orders').update({status}).eq('id', orderId);
        if (error) console.error('Error updating order status:', error);
    },

    async deleteOrder(orderId) {
        if(!window.supabaseClient) return;
        const { error } = await window.supabaseClient.from('orders').delete().eq('id', orderId);
        if (error) console.error('Error deleting order:', error);
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PRODUCTS, ProductDB, OrderDB };
}
