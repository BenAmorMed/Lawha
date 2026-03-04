
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
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
        console.log('Orders Columns:', res.rows.map(r => r.column_name).join(', '));
        client.end();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
