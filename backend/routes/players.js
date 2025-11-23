// backend/routes/players.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getIO } = require('../socket');

// GET all players
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT p.*, t.TeamName FROM Player p LEFT JOIN Team t ON p.TeamID = t.TeamID');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE player
router.post('/', async (req, res) => {
  const { PlayerName, Age, Position, TeamID } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO Player (PlayerName, Age, Position, TeamID) VALUES (?, ?, ?, ?)',
      [PlayerName, Age || null, Position || null, TeamID || null]
    );
    const [rows] = await db.query('SELECT * FROM Player WHERE PlayerID = ?', [result.insertId]);
    const player = rows[0];

    const io = getIO();
    io && io.emit('player_created', player);

    res.json({ ok: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE player
router.put('/:id', async (req, res) => {
  const { PlayerName, Age, Position, TeamID } = req.body;
  try {
    await db.query('UPDATE Player SET PlayerName = ?, Age = ?, Position = ?, TeamID = ? WHERE PlayerID = ?',
      [PlayerName, Age || null, Position || null, TeamID || null, req.params.id]);
    const [rows] = await db.query('SELECT * FROM Player WHERE PlayerID = ?', [req.params.id]);
    const player = rows[0];

    const io = getIO();
    io && io.emit('player_updated', player);

    res.json({ ok: true, player });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE player
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Player WHERE PlayerID = ?', [req.params.id]);
    const io = getIO();
    io && io.emit('player_deleted', { PlayerID: Number(req.params.id) });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
