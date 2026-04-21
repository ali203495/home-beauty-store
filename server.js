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

// Health Check for Deployment Services (Render/Vercel)
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() }));

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3000/',
    'http://localhost:5500',
    'https://home-beauty-store-19cf.vercel.app',
    'https://home-beauty-store-19cf.vercel.app/',
    'https://home-beauty-store-api.onrender.com', // Self-ping
    'https://el-wali-shop.vercel.app' // Potential custom domain
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(o => origin.startsWith(o));
        if (isAllowed) return callback(null, true);
        
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// --- CORE: SYSTEM MONITORING ---

app.get('/health', (req, res) => res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() }));

app.get('/api/health/detailed', async (req, res) => {
    const dbConnected = await db.testConnection();
    res.json({
        status: dbConnected ? 'fully_operational' : 'degraded',
        timestamp: new Date().toISOString(),
        details: {
            api: 'online',
            database: dbConnected ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV || 'development',
            platform: process.env.VERCEL === '1' ? 'Vercel' : 'Standard Node'
        }
    });
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
    try {
        const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
        if (!admin) return res.status(401).json({ error: 'Identifiants invalides' });

        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (!isMatch) return res.status(401).json({ error: 'Identifiants invalides' });

        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, admin: { username: admin.username, role: admin.role } });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
    const query = `INSERT INTO products 
        (id, name, category, price, rating, reviews, image, badge, visible, description, specs, stock, lastUpdated) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
        name=EXCLUDED.name, category=EXCLUDED.category, price=EXCLUDED.price, rating=EXCLUDED.rating, 
        reviews=EXCLUDED.reviews, image=EXCLUDED.image, badge=EXCLUDED.badge, visible=EXCLUDED.visible, 
        description=EXCLUDED.description, specs=EXCLUDED.specs, stock=EXCLUDED.stock, lastUpdated=EXCLUDED.lastUpdated`;
    
    try {
        await db.run(query, [p.id, p.name, p.category, p.price, p.rating, p.reviews, p.image, p.badge, p.visible, p.description, JSON.stringify(p.specs), p.stock, new Date().toISOString()]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.run('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ENDPOINTS: ORDERS ---

app.post('/api/orders', async (req, res) => {
    const { order, items } = req.body;
    try {
        const resOrder = await db.run(`INSERT INTO orders 
            (id, date, total, status, customer_name, customer_phone, customer_address, customer_neighborhood) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
            [order.id, order.date, order.total, order.status, order.customer.name, order.customer.phone, order.customer.address, order.customer.neighborhood]);

        for (let item of items) {
            await db.run(`INSERT INTO order_items (order_id, product_id, product_name, quantity, price) 
                VALUES (?, ?, ?, ?, ?)`, [order.id, item.id, item.name, item.quantity, item.price]);
        }
        res.json({ success: true, orderId: order.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
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

app.get('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
    try {
        const order = await db.get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
        if (!order) return res.status(404).json({ error: 'Commande introuvable' });
        const items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        res.json({ ...order, items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
    try {
        await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);
        await db.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const rows = await db.all('SELECT status, COUNT(*) as count, SUM(total) as revenue FROM orders GROUP BY status');
        const prodCount = await db.get('SELECT COUNT(*) as productCount FROM products');
        res.json({ orders: rows, products: prodCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Vercel Deployment Export
if (process.env.VERCEL === '1') {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`--- Marrakech Luxe Production Server ---`);
    console.log(`Mode: Local Development (SQLite)`);
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
