/**
 * One-time migration script to hash plaintext passwords in the User table.
 * Usage: node scripts/hash_passwords.js
 */
const db = require('../db');
const bcrypt = require('bcrypt');

async function run() {
  try {
    const [rows] = await db.query('SELECT UserID, Password FROM User');
    for (const r of rows) {
      const pwd = r.Password || '';
      // naive check for bcrypt hash prefix
      if (pwd.startsWith('$2')) {
        console.log(`User ${r.UserID} already hashed, skipping`);
        continue;
      }
      const hashed = await bcrypt.hash(pwd, 10);
      await db.query('UPDATE User SET Password = ? WHERE UserID = ?', [hashed, r.UserID]);
      console.log(`Hashed password for user ${r.UserID}`);
    }
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
