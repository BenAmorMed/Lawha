
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
        console.log('Connected.');

        // List all tables
        const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Public Schema Tables:');
        res.rows.forEach(row => console.log(row.table_name));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.end();
    }
}

run();
