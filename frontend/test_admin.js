const axios = require('axios');

async function testAdmin() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:4000/api/v1/auth/login', {
            email: 'medbenamor1919@gmail.com',
            password: 'Password123!'
        });

        const token = loginRes.data.access_token;
        console.log('Token:', token.substring(0, 20) + '...');

        console.log('Fetching analytics...');
        const analyticsRes = await axios.get('http://localhost:4000/api/v1/admin/orders/analytics/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success!', Object.keys(analyticsRes.data));
    } catch (e) {
        console.error('Error:', e.response ? e.response.status + ' ' + JSON.stringify(e.response.data) : e.message);
    }
}

testAdmin();
