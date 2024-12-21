const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'delivprojdb',
    password: '2OO4',
    port: 5432,
});

async function checkAndFixUserData(userId) {
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        console.log('\nUser data:', userResult.rows[0]);

        const profileResult = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
        console.log('\nProfile data:', profileResult.rows[0]);

        if (userResult.rows.length > 0 && profileResult.rows.length === 0) {
            console.log('\nCreating missing profile...');
            const user = userResult.rows[0];
            await pool.query(`
                INSERT INTO user_profiles (user_id, full_name, phone, address, profile_image_url)
                VALUES ($1, $2, $3, $4, $5)
            `, [userId, user.name || 'Username', user.phone_number, user.address, user.profile_image_url]);
            console.log('Profile created successfully');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

checkAndFixUserData(20);