const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'marrakech_luxe_secret_2024';
const DB_PATH = path.join(__dirname, 'db', 'marrakech_luxe.db');

// Database Connection
const db = new sqlite3.Database(DB_PATH);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// --- API AUTH MIDDLEWARE ---
const authenticateAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Accès non autorisé' });

    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Session expirée' });
        req.admin = decoded;
        next();
    });
};

// --- ENDPOINTS: PRODUCTS ---

app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products WHERE visible = 1', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Produit introuvable' });
        res.json(row);
    });
});

app.post('/api/admin/products', authenticateAdmin, (req, res) => {
    const p = req.body;
    const stmt = db.prepare(`INSERT OR REPLACE INTO products 
        (id, name, category, price, rating, reviews, image, badge, visible, description, specs, stock, lastUpdated) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    stmt.run(p.id, p.name, p.category, p.price, p.rating, p.reviews, p.image, p.badge, p.visible, p.description, JSON.stringify(p.specs), p.stock, new Date().toISOString(), function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
    stmt.finalize();
});

app.delete('/api/admin/products/:id', authenticateAdmin, (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// --- ENDPOINTS: ORDERS ---

app.post('/api/orders', (req, res) => {
    const { order, items } = req.body;
    
    db.serialize(() => {
        const stmt = db.prepare(`INSERT INTO orders 
            (id, date, customer_name, customer_phone, customer_city, customer_neighborhood, customer_address, subtotal, shipping, total) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run(order.id, order.date, order.customer.name, order.customer.phone, order.customer.city, order.customer.neighborhood, order.customer.address, order.subtotal, order.shipping, order.total, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            
            const itemStmt = db.prepare(`INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)`);
            items.forEach(item => {
                itemStmt.run(order.id, item.id, item.name, item.quantity, item.price);
            });
            itemStmt.finalize();
            
            res.status(201).json({ success: true, orderId: order.id });
        });
        stmt.finalize();
    });
});

// --- ENDPOINTS: ADMIN ---

app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, admin) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!admin) return res.status(401).json({ error: 'Identifiants invalides' });

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) return res.status(401).json({ error: 'Identifiants invalides' });

        const token = jwt.sign({ username: admin.username, role: admin.role }, SECRET_KEY, { expiresIn: '8h' });
        res.json({ success: true, token, user: { username: admin.username, role: admin.role } });
    });
});

app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
    db.all('SELECT * FROM orders ORDER BY date DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
    db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all('SELECT * FROM order_items WHERE order_id = ?', [req.params.id], (err, items) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ ...order, items });
        });
    });
});

app.patch('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
    const { status } = req.body;
    db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.delete('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
    db.run('DELETE FROM orders WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        db.run('DELETE FROM order_items WHERE order_id = ?', [req.params.id], (err2) => {
            res.json({ success: true });
        });
    });
});

app.get('/api/admin/stats', authenticateAdmin, (req, res) => {
    db.all('SELECT status, COUNT(*) as count, SUM(total) as revenue FROM orders GROUP BY status', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        db.get('SELECT COUNT(*) as productCount FROM products', [], (err, prodCount) => {
            res.json({ orders: rows, products: prodCount });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`--- Marrakech Luxe Production Server ---`);
    console.log(`Server running at http://localhost:${PORT}`);
});
