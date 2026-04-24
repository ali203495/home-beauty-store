async function testValidation() {
    const baseUrl = 'http://localhost:3000';
    
    const testCases = [
        {
            name: 'Missing Name',
            data: {
                order: { id: 'ERR-01', date: new Date().toISOString(), total: 100, customer: { phone: '123', address: 'Addr' } },
                items: [{ id: '1', name: 'Item', quantity: 1, price: 100 }]
            }
        },
        {
            name: 'Empty Items',
            data: {
                order: { id: 'ERR-02', date: new Date().toISOString(), total: 100, customer: { name: 'Test', phone: '123', address: 'Addr' } },
                items: []
            }
        },
        {
            name: 'Malformed Item Price',
            data: {
                order: { id: 'ERR-03', date: new Date().toISOString(), total: 100, customer: { name: 'Test', phone: '123', address: 'Addr' } },
                items: [{ id: '1', name: 'Item', quantity: 1, price: null }]
            }
        }
    ];

    for (let test of testCases) {
        console.log(`\nTesting: ${test.name}`);
        const res = await fetch(`${baseUrl}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(test.data)
        });
        const result = await res.json();
        console.log(`Status: ${res.status}`);
        console.log(`Result:`, result);
    }
}

testValidation();
