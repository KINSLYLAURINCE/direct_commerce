const db = require('../config/database');
const bcrypt = require('bcrypt');
const { sendAdminCredentials } = require('./emailService');

const createAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminUsername = process.env.ADMIN_USERNAME;

    const roleResult = await db.query(
      "SELECT id FROM roles WHERE name = 'admin'"
    );
    
    if (roleResult.rows.length === 0) {
      console.error('Admin role not found');
      return;
    }

    const adminRoleId = roleResult.rows[0].id;

    // Update in place when the account already exists. Never delete: the user id
    // is embedded in issued JWTs, so deleting invalidates every active session.
    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1',
      [adminEmail, adminUsername]
    );

    if (existing.rows.length > 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await db.query(
        'UPDATE users SET email = $1, username = $2, password = $3, role_id = $4 WHERE id = $5',
        [adminEmail, adminUsername, hashedPassword, adminRoleId, existing.rows[0].id]
      );

      console.log(`✅ Admin account exists (id=${existing.rows[0].id}) - credentials synced`);
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await db.query(
      'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)',
      [adminUsername, adminEmail, hashedPassword, adminRoleId]
    );

    console.log('✅ Admin account created successfully');

    // Only notify on genuine creation, not on every restart.
    try {
      await sendAdminCredentials(adminEmail, adminUsername, adminPassword);
      console.log('📧 Admin credentials sent to email');
    } catch (emailError) {
      console.error('⚠️ Could not send admin credentials email:', emailError.message);
    }

  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

module.exports = createAdmin;