
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
        console.log('--- GLOBAL TABLE SEARCH ---');

        const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE '%product%' OR table_name LIKE '%order%'
    `);

        if (res.rows.length === 0) {
            console.log('No product or order tables found anywhere!');
        } else {
            res.rows.forEach(r => console.log(`${r.table_schema}.${r.table_name}`));
        }

    } catch (err) {
        console.error('Search failed:', err);
    } finally {
        await client.end();
    }
}
run();
