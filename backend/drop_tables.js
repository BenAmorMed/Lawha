
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
        console.log('Connected to Supabase. Dropping all tables...');

        // Drop all tables in public schema
        await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
        console.log('Tables dropped successfully.');

    } catch (err) {
        console.error('Drop failed:', err);
    } finally {
        await client.end();
    }
}
run();
