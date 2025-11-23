// backend/routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getIO } = require('../socket');
const bcrypt = require('bcrypt');
const { authenticateJWT, authorizeRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT UserID, Name, Email, Role FROM User');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create user - only Admins can create users
router.post('/', authenticateJWT, authorizeRole('Admin'), async (req, res) => {
  const { Name, Email, Password, Role } = req.body;
  try {
    const hashed = await bcrypt.hash(Password, 10);
    const [r] = await db.query('INSERT INTO User (Name, Email, Password, Role) VALUES (?, ?, ?, ?)',
      [Name, Email, hashed, Role]);
    const [rows] = await db.query('SELECT UserID, Name, Email, Role FROM User WHERE UserID = ?', [r.insertId]);
    const user = rows[0];
    const io = getIO(); io && io.emit('user_created', user);
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update & delete similar patterns (omitted for brevity — implement like other modules)
module.exports = router;
