// backend/routes/stats.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getIO } = require('../socket');

// GET all stats
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT s.*, 
             p.PlayerName, 
             m.MatchDate, m.MatchTime
      FROM PlayerStats s
      LEFT JOIN Player p ON s.PlayerID = p.PlayerID
      LEFT JOIN MatchInfo m ON s.MatchID = m.MatchID
      ORDER BY s.StatsID DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single stat
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM PlayerStats WHERE StatsID = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

// CREATE stat
router.post('/', async (req, res) => {
  const { PlayerID, MatchID, Goals, Assists, Cards, Rating } = req.body;

  try {
    const [r] = await db.query(
      `INSERT INTO PlayerStats 
       (PlayerID, MatchID, Goals, Assists, Cards, Rating)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [PlayerID, MatchID, Goals, Assists, Cards, Rating]
    );

    const [rows] = await db.query('SELECT * FROM PlayerStats WHERE StatsID = ?', [r.insertId]);
    const stat = rows[0];

    const io = getIO(); io && io.emit('stats_created', stat);

    res.json({ ok: true, stat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE stat
router.put('/:id', async (req, res) => {
  const { PlayerID, MatchID, Goals, Assists, Cards, Rating } = req.body;

  try {
    await db.query(
      `UPDATE PlayerStats
       SET PlayerID = ?, MatchID = ?, Goals = ?, Assists = ?, Cards = ?, Rating = ?
       WHERE StatsID = ?`,
      [PlayerID, MatchID, Goals, Assists, Cards, Rating, req.params.id]
    );

    const [rows] = await db.query('SELECT * FROM PlayerStats WHERE StatsID = ?', [req.params.id]);
    const updated = rows[0];

    const io = getIO(); io && io.emit('stats_updated', updated);

    res.json({ ok: true, stat: updated });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

// DELETE stat
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM PlayerStats WHERE StatsID = ?', [req.params.id]);

    const io = getIO(); io && io.emit('stats_deleted', { StatsID: Number(req.params.id) });

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
