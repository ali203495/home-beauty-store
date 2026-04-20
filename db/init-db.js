const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'marrakech_luxe.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Data from js/products.js
const INITIAL_PRODUCTS = [
    { id: 'app-01', name: 'Mélangeur Professionnel UltraPower', category: 'Electroménager', price: 1850, rating: 4.8, reviews: 124, image: 'assets/webp/appliances.webp', badge: 'Populaire', visible: 1, description: 'Mélangeur haute performance avec moteur de 1500W, idéal pour les smoothies et soupes.', specs: JSON.stringify({ 'Puissance': '1500W', 'Capacité': '2L', 'Garantie': '2 ans' }), stock: 25 },
    { id: 'app-02', name: 'Cafetière Espresso Artisan', category: 'Electroménager', price: 3200, rating: 4.9, reviews: 89, image: 'assets/webp/appliances.webp', badge: 'Nouveau', visible: 1, description: 'Machine à espresso manuelle pour un café de qualité barista à la maison.', specs: JSON.stringify({ 'Pression': '15 Bars', 'Réservoir': '1.5L', 'Matériau': 'Acier Inoxydable' }), stock: 25 },
    { id: 'app-03', name: 'Réfrigérateur Split Side-by-Side', category: 'Electroménager', price: 12500, rating: 4.8, reviews: 45, image: 'assets/webp/appliances.webp', badge: 'Luxe', visible: 1, description: 'Réfrigérateur grand volume avec distributeur d\'eau et glaçons filtré.', specs: JSON.stringify({ 'Capacité': '540L', 'Classe': 'A++', 'Technologie': 'No Frost' }), stock: 25 },
    { id: 'app-04', name: 'Lave-linge Frontal ProSmart', category: 'Electroménager', price: 4800, rating: 4.7, reviews: 67, image: 'assets/webp/appliances.webp', badge: 'Efficace', visible: 1, description: 'Lave-linge intelligent avec moteur Inverter et programme vapeur.', specs: JSON.stringify({ 'Capacité': '9kg', 'Vitesse': '1400 tr/min', 'Programmes': '15' }), stock: 25 },
    { id: 'ac-01', name: 'Climatiseur Split Inverter 12000 BTU', category: 'Climatisation', price: 4500, rating: 4.7, reviews: 56, image: 'assets/webp/aircon.webp', badge: 'Service Inclus', visible: 1, description: 'Climatiseur haute efficacité avec installation professionnelle incluse à Marrakech.', specs: JSON.stringify({ 'Capacité': '12000 BTU', 'Type': 'Inverter', 'Installation': 'Gratuite' }), stock: 25 },
    { id: 'ac-02', name: 'Climatiseur Mobile Compact', category: 'Climatisation', price: 2800, rating: 4.5, reviews: 34, image: 'assets/webp/aircon.webp', badge: '', visible: 1, description: 'Solution de refroidissement mobile facile à déplacer, parfaite pour les appartements.', specs: JSON.stringify({ 'Capacité': '9000 BTU', 'Bruit': 'Low DB', 'Kit Fenêtre': 'Inclus' }), stock: 25 },
    { id: 'mk-01', name: 'Palette Ombre à Paupières Rose Gold', category: 'Maquillage', price: 450, rating: 4.9, reviews: 210, image: 'assets/webp/makeup.webp', badge: 'Luxe', visible: 1, description: 'Palette de 12 teintes pigmentées allant du mat au scintillant.', specs: JSON.stringify({ 'Teintes': '12', 'Fini': 'Mat & Irisé', 'Tenue': '24h' }), stock: 25 },
    { id: 'mk-02', name: 'Fond de Teint Velours Lumière', category: 'Maquillage', price: 380, rating: 4.8, reviews: 156, image: 'assets/webp/makeup.webp', badge: '', visible: 1, description: 'Base de maquillage à couvrance totale avec fini naturel et lumineux.', specs: JSON.stringify({ 'Volume': '30ml', 'SPF': '15', 'Type de peau': 'Tous types' }), stock: 25 },
    { id: 'kit-01', name: 'Set de Casseroles Signature Premium', category: 'Cuisine', price: 1250, rating: 4.7, reviews: 42, image: 'assets/webp/kitchen_cleaning.webp', badge: 'Offre', visible: 1, description: 'Ensemble de 5 pièces en acier inoxydable multicouche pour une cuisson uniforme.', specs: JSON.stringify({ 'Pièces': '5', 'Compatibilité': 'Induction/Gaz', 'Revêtement': 'Anti-adhésif' }), stock: 25 },
    { id: 'kit-02', name: 'Service de Table en Céramique (18 pcs)', category: 'Cuisine', price: 850, rating: 4.9, reviews: 15, image: 'assets/webp/kitchen_cleaning.webp', badge: 'Premium', visible: 1, description: 'Élégant service de table complet pour 6 personnes, design moderne et épuré.', specs: JSON.stringify({ 'Pièces': '18', 'Compatibles': 'Micro-ondes/Lave-vaisselle' }), stock: 25 },
    { id: 'cln-01', name: 'Pack Nettoyage Éclat Total', category: 'Fournitures de Nettoyage', price: 250, rating: 4.6, reviews: 78, image: 'assets/webp/kitchen_cleaning.webp', badge: '', visible: 1, description: 'Kit complet comprenant nettoyant multi-surfaces, dégraissant et lustrant.', specs: JSON.stringify({ 'Volume Total': '3L', 'Parfums': 'Citron/Lavande' }), stock: 25 },
    { id: 'cln-02', name: 'Aspirateur Robot CleanPro X', category: 'Équipements de Nettoyage', price: 2400, rating: 4.7, reviews: 64, image: 'assets/webp/appliances.webp', badge: 'Promo', visible: 1, description: 'Robot aspirateur intelligent avec navigation laser et fonction lavage de sol.', specs: JSON.stringify({ 'Autonomie': '120 min', 'Aspiration': '2500 Pa', 'Bruit': '60 dB' }), stock: 25 },
    { id: 'cln-03', name: 'Nettoyeur Vapeur Multi-usage', category: 'Équipements de Nettoyage', price: 1450, rating: 4.8, reviews: 52, image: 'assets/webp/kitchen_cleaning.webp', badge: 'Best-Seller', visible: 1, description: 'Nettoyeur vapeur pour assainir toutes les surfaces sans produits chimiques.', specs: JSON.stringify({ 'Pression': '4 Bars', 'Temps chauffe': '5 min', 'Accessoires': '10' }), stock: 25 },
    { id: 'cln-04', name: 'Pack Désinfectant Hospitalier (5L)', category: 'Fournitures de Nettoyage', price: 350, rating: 4.9, reviews: 110, image: 'assets/webp/kitchen_cleaning.webp', badge: 'Pro', visible: 1, description: 'Solution désinfectante à large spectre pour environnements exigeants (aéroport, bureaux).', specs: JSON.stringify({ 'Volume': '5L', 'Efficacité': 'Virucide/Bactéricide', 'Usage': 'Diluable' }), stock: 25 }
];

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log('--- Database Initialization ---');
    
    // Read and execute schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Schema Error:', err);
            process.exit(1);
        }
        console.log('Table schema created successfully.');

        // Insert initial products
        const stmt = db.prepare(`INSERT OR IGNORE INTO products 
            (id, name, category, price, rating, reviews, image, badge, visible, description, specs, stock, lastUpdated) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

        INITIAL_PRODUCTS.forEach(p => {
            stmt.run(p.id, p.name, p.category, p.price, p.rating, p.reviews, p.image, p.badge, p.visible, p.description, p.specs, p.stock, new Date().toISOString());
        });
        stmt.finalize();

        // Create default super admin (password: admin123)
        // Hash for admin123: $2a$10$O0O/GzR8m.S20.Kk86P1y.N9u0j76uX5F.3J2I6B7Ua3E4m.5sO - actually using bcrypt later.
        // For now, let's just use a clear dummy or wait for bcrypt in server.js.
        // We'll insert it manually for testing.
        db.run(`INSERT OR IGNORE INTO admins (username, passwordHash, role, status) VALUES (?, ?, ?, ?)`,
            ['admin', '$2b$10$EpRnsD4GZp4WvL3pSInJ.O3662I1c88JvYv7q8J8Zf4a6E1D7u67y', 'Super Admin', 'Active']
        );

        console.log('Database seeded with initial products and admin.');
        db.close();
    });
});
