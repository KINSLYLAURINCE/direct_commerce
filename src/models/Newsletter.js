const db = require('../config/database');

class Newsletter {
  static async create(email) {
    const query = `
      INSERT INTO newsletter_subscribers (email) 
      VALUES ($1) 
      ON CONFLICT (email) DO UPDATE SET is_active = true
      RETURNING *
    `;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM newsletter_subscribers WHERE is_active = true ORDER BY created_at DESC';
    const result = await db.query(query);
    return result.rows;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM newsletter_subscribers WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async unsubscribe(email) {
    const query = 'UPDATE newsletter_subscribers SET is_active = false WHERE email = $1 RETURNING *';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async delete(email) {
    const query = 'DELETE FROM newsletter_subscribers WHERE email = $1 RETURNING *';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }
}

module.exports = Newsletter;