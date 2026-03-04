
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

        console.log('Fetching table names...');
        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

        // 1. Get IDs
        const sizeRes = await client.query('SELECT id FROM product_sizes LIMIT 1');
        const frameRes = await client.query('SELECT id FROM frame_options LIMIT 1');

        if (sizeRes.rows.length === 0) {
            console.error('No product sizes found');
            process.exit(1);
        }

        const productSizeId = sizeRes.rows[0].id;
        const frameOptionId = frameRes.rows[0]?.id;

        console.log(`Using productSizeId: ${productSizeId}`);
        console.log(`Using frameOptionId: ${frameOptionId}`);

        // 2. Mock Order Data
        const orderData = {
            productSizeId,
            frameOptionId,
            designJson: { elements: [] },
            previewUrl: "https://example.com/preview.png",
            shippingFirstName: "John",
            shippingLastName: "Doe",
            shippingAddress: "123 Main St",
            shippingCity: "Tunis",
            shippingPostalCode: "1000",
            shippingPhone: "55123456",
            guestEmail: "john@example.com"
        };

        // 3. POST Order
        console.log('Sending POST request to /api/v1/orders...');
        const response = await fetch('http://localhost:3000/api/v1/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        console.log('Order POST Result:', JSON.stringify(result, null, 2));

        // 4. Verify in DB
        console.log('Verifying order in database...');
        const verifyRes = await client.query(`
      SELECT o.status, o.total,
             pj.status as print_job_status
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN print_jobs pj ON pj.order_item_id = oi.id
      ORDER BY o.created_at DESC LIMIT 1;
    `);

        console.log('Database Verification Result:', JSON.stringify(verifyRes.rows[0], null, 2));

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await client.end();
    }
}

run();
