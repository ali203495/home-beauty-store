async function testOrder() {
    const orderData = {
        order: {
            id: 'ALI-' + Date.now().toString(36).toUpperCase(),
            date: new Date().toISOString(),
            subtotal: 1850,
            shipping: 0,
            total: 1850,
            status: 'Nouveau',
            customer: {
                firstName: 'Abdelaali',
                lastName: 'Markabi',
                phone: '0615653798',
                city: 'rak',
                address: 'Avenue Mohammed V',
                neighborhood: 'Guéliz'
            }
        },
        items: [
            { id: 'app-01', name: 'Mélangeur Professionnel UltraPower', quantity: 1, price: 1850 }
        ]
    };

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await response.json();
        console.log('Order Result:', result);
    } catch (err) {
        console.error('Order Error:', err);
    }
}

async function testStats() {
    // Note: This requires a token. For a simple local test, we can check if the endpoint exists and responds.
    // However, since we want to verify real data, let's just use the order submission and check the DB manually if needed.
    // Or we could trigger a login to get a token.
    console.log('Stats check would require JWT. Skipping automated token retrieval for now, will verify manually in dashboard.');
}

testOrder();
