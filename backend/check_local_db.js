
const { Client } = require('pg');

const client = new Client({
    user: 'canvas_user',
    host: 'localhost',
    database: 'canvas_platform',
    password: 'canvas_secret',
    port: 5432,
});

async function run() {
    try {
        console.log('Connecting to local DB...');
        await client.connect();
        console.log('Connected to local DB.');

        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name).join(', '));

        const sizes = await client.query('SELECT id, label FROM product_sizes LIMIT 1');
        console.log('Product Size:', JSON.stringify(sizes.rows[0]));

    } catch (err) {
        console.error('Local DB connection failed:', err.message);
    } finally {
        await client.end();
    }
}
run();
