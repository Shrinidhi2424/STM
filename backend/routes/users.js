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
// update user - only Admins
router.put('/:id', authenticateJWT, authorizeRole('Admin'), async (req, res) => {
  const id = req.params.id;
  const { Name, Email, Password, Role } = req.body;
  try {
    // build update fields dynamically
    const fields = [];
    const values = [];
    if (Name !== undefined) { fields.push('Name = ?'); values.push(Name); }
    if (Email !== undefined) { fields.push('Email = ?'); values.push(Email); }
    if (Role !== undefined) { fields.push('Role = ?'); values.push(Role); }
    if (Password !== undefined && Password !== '') {
      const hashed = await bcrypt.hash(Password, 10);
      fields.push('Password = ?'); values.push(hashed);
    }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(id);
    const sql = `UPDATE User SET ${fields.join(', ')} WHERE UserID = ?`;
    await db.query(sql, values);
    const [rows] = await db.query('SELECT UserID, Name, Email, Role FROM User WHERE UserID = ?', [id]);
    const user = rows[0];
    const io = getIO(); io && io.emit('user_updated', user);
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// delete user - only Admins
router.delete('/:id', authenticateJWT, authorizeRole('Admin'), async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM User WHERE UserID = ?', [id]);
    const io = getIO(); io && io.emit('user_deleted', { UserID: id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
