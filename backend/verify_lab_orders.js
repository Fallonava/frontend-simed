
const axios = require('axios');
const LOGIN_URL = 'http://localhost:3000/api/auth/login';
const ORDERS_URL = 'http://localhost:3000/api/service-orders';

async function verifyLabOrders() {
    try {
        // 1. Login
        const loginRes = await axios.post(LOGIN_URL, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        // 2. Fetch Lab Orders
        console.log('Fetching Lab Orders...');
        const res = await axios.get(`${ORDERS_URL}?type=LAB`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response Status:', res.status);
        console.log('Orders Found:', res.data.length);
        if (res.data.length > 0) {
            console.log('First Order:', JSON.stringify(res.data[0], null, 2));
        } else {
            console.log('No orders found with type=LAB');
        }

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

verifyLabOrders();
