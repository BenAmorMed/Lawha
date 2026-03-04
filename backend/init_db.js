
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
        const sqlPath = path.join(__dirname, 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.connect();
        console.log('Connected to Supabase. Initializing schema...');

        await client.query(sql);
        console.log('Schema initialized successfully.');

    } catch (err) {
        console.error('Initialization failed:', err);
    } finally {
        await client.end();
    }
}
run();
