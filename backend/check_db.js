
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
        console.log('--- DB Content Check ---');

        const sizes = await client.query('SELECT id, label FROM product_sizes LIMIT 1');
        console.log('Product Size:', JSON.stringify(sizes.rows[0]));

        const frames = await client.query('SELECT id, label FROM frame_options LIMIT 1');
        console.log('Frame Option:', JSON.stringify(frames.rows[0]));

        const orders = await client.query('SELECT count(*) FROM orders');
        console.log('Total Orders before:', orders.rows[0].count);

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await client.end();
    }
}
run();
