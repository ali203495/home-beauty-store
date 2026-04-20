-- Marrakech Luxe Production Schema

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    rating REAL DEFAULT 4.5,
    reviews INTEGER DEFAULT 0,
    image TEXT,
    badge TEXT,
    visible BOOLEAN DEFAULT TRUE,
    description TEXT,
    specs TEXT, -- JSON string
    stock INTEGER DEFAULT 25,
    lastUpdated TEXT
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_city TEXT DEFAULT 'Marrakech',
    customer_neighborhood TEXT,
    customer_address TEXT,
    subtotal REAL DEFAULT 0,
    shipping REAL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Nouveau'
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
    username TEXT PRIMARY KEY,
    passwordHash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin',
    recoveryEmail TEXT,
    status TEXT NOT NULL DEFAULT 'Active'
);
