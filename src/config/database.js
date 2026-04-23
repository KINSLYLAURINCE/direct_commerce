const { Pool } = require('pg');
require('dotenv').config();
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      }
);

pool.connect()
  .then(() => console.log('✅ PostgreSQL connecté'))
  .catch(err => console.error('❌ Erreur connexion DB:', err.message));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};