const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./lib/db-adapter');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'mlh_super_secret_2026';

// --- MIDDLEWARE: LOGGING ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- MIDDLEWARE: CORS ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'https://home-beauty-store-19cf.vercel.app',
    'https://home-beauty-store-api.onrender.com',
    'https://el-wali-shop.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        const isAllowed = allowedOrigins.some(o => origin.startsWith(o)) || 
                         origin.endsWith('.vercel.app') || 
                         origin.endsWith('.onrender.com');

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS Blocked: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(bodyParser.json());

// Serving static files (Critical for Vercel/Render combined deployments)
app.use(express.static(path.join(__dirname, '/')));

// --- CORE: SYSTEM MONITORING ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        node_version: process.version
    });
});

app.get('/api/health/detailed', async (req, res) => {
    try {
        const dbConnected = await db.testConnection();
        res.json({
            status: dbConnected ? 'fully_operational' : 'degraded',
            timestamp: new Date().toISOString(),
            details: {
                api: 'online',
                database: dbConnected ? 'connected' : 'disconnected',
                environment: process.env.NODE_ENV || 'production',
                platform: process.env.VERCEL === '1' ? 'Vercel' : 'Standard Node'
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// --- CORE: AUTHENTICATION ---
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Accès non autorisé' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Session expirée' });
    }
};

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username et password requis' });
    }

    try {
        const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
        if (!admin) return res.status(401).json({ error: 'Identifiants invalides' });

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) return res.status(401).json({ error: 'Identifiants invalides' });

        const token = jwt.sign(
            { id: admin.username, role: admin.role }, 
            JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            token, 
            admin: { username: admin.username, role: admin.role } 
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
});

// --- ENDPOINTS: PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM products WHERE visible = 1');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const row = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (!row) return res.status(404).json({ error: 'Produit introuvable' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
    const p = req.body;
    // Simple validation
    if (!p.id || !p.name || !p.price) {
        return res.status(400).json({ error: 'Données produit incomplètes' });
    }

    const query = `INSERT INTO products 
        (id, name, category, price, rating, reviews, image, badge, visible, description, specs, stock, lastUpdated) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        name=EXCLUDED.name, category=EXCLUDED.category, price=EXCLUDED.price, rating=EXCLUDED.rating, 
        reviews=EXCLUDED.reviews, image=EXCLUDED.image, badge=EXCLUDED.badge, visible=EXCLUDED.visible, 
        description=EXCLUDED.description, specs=EXCLUDED.specs, stock=EXCLUDED.stock, lastUpdated=EXCLUDED.lastUpdated`;
    
    try {
        await db.run(query, [
            p.id, p.name, p.category, p.price, p.rating, p.reviews, 
            p.image, p.badge, p.visible, p.description, 
            typeof p.specs === 'string' ? p.specs : JSON.stringify(p.specs), 
            p.stock, new Date().toISOString()
        ]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ENDPOINTS: ORDERS ---
app.post('/api/orders', async (req, res) => {
    const { order, items } = req.body;
    if (!order || !items || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Commande invalide' });
    }

    try {
        await db.run(`INSERT INTO orders 
            (id, date, total, status, customer_name, customer_phone, customer_address, customer_neighborhood) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [order.id, order.date, order.total, order.status || 'Nouveau', order.customer.name, order.customer.phone, order.customer.address, order.customer.neighborhood]);

        for (let item of items) {
            await db.run(`INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
                VALUES (?, ?, ?, ?, ?)`, [order.id, item.id, item.name, item.quantity, item.price]);
        }
        res.json({ success: true, orderId: order.id });
    } catch (err) {
        console.error('Order Error:', err);
        res.status(500).json({ error: 'Impossible d\'enregistrer la commande' });
    }
});

app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM orders ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({ error: 'Quelque chose a mal tourné !' });
});

// Vercel Deployment Export
if (process.env.VERCEL === '1') {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`--- Marrakech Luxe Production Server ---`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
