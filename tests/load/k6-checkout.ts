// tests/load/k6-checkout.ts
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up
    { duration: '1m', target: 500 }, // Stay at 500 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be under 500ms
    http_req_failed: ['rate<0.01'],    // Less than 1% failure
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const payload = JSON.stringify({
    customerName: 'Load Test User',
    customerEmail: `test-${Math.random()}@example.com`,
    customerPhone: '0600000000',
    shippingAddress: 'Marrakech Load Test Street',
    totalAmount: 99.99,
    checkoutId: `load-test-${Date.now()}-${Math.random()}`,
    items: [
      { productId: 1, quantity: 1, priceAtTime: 99.99 }
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/api/orders`, payload, params);

  check(res, {
    'is status 200': (r) => r.status === 200,
    'has checkoutId': (r) => r.json().checkoutId !== undefined,
  });

  sleep(0.5);
}
