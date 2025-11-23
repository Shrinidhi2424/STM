// backend/scripts/setup_db_features.js
// Run this script once to create views, triggers, procedures, functions and indexes.

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const sqlPath = path.join(__dirname, '..', 'sql', 'features.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sports_tournament',
    multipleStatements: true
  });

  try {
    console.log('Applying DB feature SQL...');
    const [results] = await conn.query(sql);
    console.log('SQL executed. Results:', results);
  } catch (err) {
    console.error('Error running SQL:', err.message);
  } finally {
    await conn.end();
  }
}

if (require.main === module) run().catch(err => { console.error(err); process.exit(1); });
