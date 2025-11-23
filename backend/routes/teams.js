// backend/routes/teams.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getIO } = require('../socket');

// GET all teams
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Team');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET single team
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Team WHERE TeamID = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'DB error' });
  }
});

// CREATE team
router.post('/', async (req, res) => {
  const { TeamName, CoachID, SportType } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Team (TeamName, CoachID, SportType) VALUES (?, ?, ?)',
      [TeamName, CoachID || null, SportType || null]
    );
    const createdId = result.insertId;
    const [rows] = await db.query('SELECT * FROM Team WHERE TeamID = ?', [createdId]);
    const team = rows[0];

    const io = getIO();
    io && io.emit('team_created', team);

    res.json({ ok: true, team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE team
router.put('/:id', async (req, res) => {
  const { TeamName, CoachID, SportType } = req.body;
  try {
    await db.query('UPDATE Team SET TeamName = ?, CoachID = ?, SportType = ? WHERE TeamID = ?',
      [TeamName, CoachID || null, SportType || null, req.params.id]);
    const [rows] = await db.query('SELECT * FROM Team WHERE TeamID = ?', [req.params.id]);
    const team = rows[0];

    const io = getIO();
    io && io.emit('team_updated', team);

    res.json({ ok: true, team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE team
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Team WHERE TeamID = ?', [req.params.id]);
    const io = getIO();
    io && io.emit('team_deleted', { TeamID: Number(req.params.id) });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
