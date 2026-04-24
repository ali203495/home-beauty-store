async function runFullTest() {
    const baseUrl = 'http://localhost:3000';
    
    console.log('--- Step 1: Admin Login ---');
    const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password123' }) // Assuming password123 based on earlier init-db check
    });
    
    let token = '';
    if (loginRes.ok) {
        const loginData = await loginRes.json();
        token = loginData.token;
        console.log('Login successful.');
    } else {
        console.log('Login failed (expected if password different). Proceeding with public tests...');
    }

    console.log('\n--- Step 2: Product Fetch ---');
    const prodRes = await fetch(`${baseUrl}/api/products`);
    const prods = await prodRes.json();
    console.log(`Available products: ${prods.length}`);

    console.log('\n--- Step 3: Order Submission ---');
    const orderData = {
        order: {
            id: 'E2E-' + Date.now().toString(36).toUpperCase(),
            date: new Date().toISOString(),
            subtotal: 1250,
            shipping: 35,
            total: 1285,
            status: 'Nouveau',
            customer: {
                firstName: 'Test',
                lastName: 'User',
                phone: '0600000000',
                city: 'cas',
                address: 'Boulevard Anfa',
                neighborhood: 'Maarif'
            }
        },
        items: [{ id: 'kit-01', name: 'Set de Casseroles Signature Premium', quantity: 1, price: 1250 }]
    };

    const orderRes = await fetch(`${baseUrl}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    const orderResult = await orderRes.json();
    console.log('Order Result:', orderResult);

    if (token) {
        console.log('\n--- Step 4: Verification via Stats API ---');
        const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await statsRes.json();
        console.log('Real-time Stats:', JSON.stringify(stats, null, 2));
    }
}

runFullTest();
