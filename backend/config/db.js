const { Pool } = require('pg');
const dotenv = require('dotenv');

// Cargar .env.test si el entorno es de pruebas
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT || 5432,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 1000,
});

pool.on('connect', () => console.log('✅ Nueva conexión a PostgreSQL api-ratings'));
pool.on('error', err => console.error('❌ Error en el pool de PostgreSQL:', err));

module.exports = pool;