
const { DataSource } = require('typeorm');
const path = require('path');

async function sync() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        port: 5432,
        username: 'postgres.hmxbmddejuvwvqofggne',
        password: 'OKKINxw8922y9PF0',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        entities: [path.join(__dirname, 'dist/**/*.entity.js')],
        synchronize: true,
        logging: true,
    });

    try {
        console.log('Connecting and synchronizing...');
        await dataSource.initialize();
        console.log('Database synchronized successfully.');
    } catch (err) {
        console.error('Synchronization failed:', err);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

sync();
