const { Client } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function createAdmin() {
    const client = new Client({
        connectionString: 'postgresql://postgres.hmxbmddejuvwvqofggne:OKKINxw8922y9PF0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const email = 'medbenamor1919@gmail.com';
        const password = 'Password123!';
        const role = 'admin';
        const fullName = 'Admin';
        const id = crypto.randomUUID();

        // Check if user already exists
        const checkRes = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkRes.rows.length > 0) {
            console.log(`User ${email} already exists. Updating to admin role...`);
            const hash = await bcrypt.hash(password, 10);
            await client.query('UPDATE users SET role = $1, "passwordHash" = $2 WHERE email = $3', [role, hash, email]);
            console.log(`User ${email} updated successfully. Password reset to: ${password}`);
        } else {
            console.log(`Creating new admin user: ${email}...`);
            const hash = await bcrypt.hash(password, 10);

            await client.query(`
                INSERT INTO users (id, email, "passwordHash", "fullName", role)
                VALUES ($1, $2, $3, $4, $5)
            `, [id, email, hash, fullName, role]);

            console.log(`Admin user created successfully!`);
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }

    } catch (err) {
        console.error('Failed to create admin:', err);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

createAdmin();
