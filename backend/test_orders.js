const axios = require('axios');

async function testOrders() {
    try {
        const loginRes = await axios.post('http://localhost:4000/api/v1/auth/login', {
            email: 'medbenamor1919@gmail.com',
            password: 'Password123!'
        });
        const token = loginRes.data.access_token;

        const res = await axios.get('http://localhost:4000/api/v1/admin/orders', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', res.data);
    } catch (e) {
        console.error('Error:', e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
    }
}

testOrders();
