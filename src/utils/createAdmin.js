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

    // Delete existing admin if exists
    await db.query(
      'DELETE FROM users WHERE email = $1 OR username = $2',
      [adminEmail, adminUsername]
    );
    console.log('🗑️ Old admin deleted (if existed)');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    await db.query(
      'INSERT INTO users (username, email, password, role_id) VALUES ($1, $2, $3, $4)',
      [adminUsername, adminEmail, hashedPassword, adminRoleId]
    );

    console.log('✅ Admin account created successfully');
    
    await sendAdminCredentials(adminEmail, adminUsername, adminPassword);
    console.log('📧 Admin credentials sent to email');

  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

module.exports = createAdmin;