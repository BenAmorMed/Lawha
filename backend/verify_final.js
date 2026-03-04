
const { Client } = require('pg');

const client = new Client({
    user: 'postgres.hmxbmddejuvwvqofggne',
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    database: 'postgres',
    password: 'OKKINxw8922y9PF0',
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();

        const sizeRes = await client.query('SELECT id FROM product_sizes LIMIT 1');
        const templateRes = await client.query('SELECT id FROM templates LIMIT 1');

        const productSizeId = sizeRes.rows[0].id;
        const templateId = templateRes.rows[0].id;

        console.log('Using productSizeId:', productSizeId);
        console.log('Using templateId:', templateId);

        const orderData = {
            productSizeId,
            designJson: {
                templateId,
                layers: [
                    { type: 'image', id: 'img1', src: 'https://example.com/photo.jpg' }
                ]
            },
            previewUrl: "https://example.com/preview.png",
            shippingFirstName: "John",
            shippingLastName: "Doe",
            shippingAddress: "123 Main St",
            shippingCity: "Tunis",
            shippingPostalCode: "1000",
            shippingPhone: "55123456",
            guestEmail: "john@example.com"
        };

        console.log('--- POST /api/v1/orders ---');
        const response = await fetch('http://localhost:3000/api/v1/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        console.log('API Response:', JSON.stringify(result, null, 2));

        if (result.orderId) {
            console.log('--- DB Verification ---');
            const verifyRes = await client.query(`
        SELECT o.status, o.total_amount,
               pj.status as print_job_status
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        JOIN print_jobs pj ON pj.order_item_id = oi.id
        WHERE o.id = $1;
      `, [result.orderId]);

            console.log('DB Result:', JSON.stringify(verifyRes.rows[0], null, 2));
        }

    } catch (err) {
        console.error('Final verification failed:', err);
    } finally {
        await client.end();
    }
}

run();
