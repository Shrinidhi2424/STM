// backend/routes/tournaments.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getIO } = require('../socket');

// GET all tournaments
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Tournament ORDER BY StartDate DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single tournament
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Tournament WHERE TournamentID = ?',
      [req.params.id]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE tournament
router.post('/', async (req, res) => {
  const { TournamentName, Format, StartDate, EndDate } = req.body;
  try {
    const [r] = await db.query(
      `INSERT INTO Tournament 
       (TournamentName, Format, StartDate, EndDate) 
       VALUES (?, ?, ?, ?)`,
      [TournamentName, Format, StartDate, EndDate]
    );

    const [rows] = await db.query('SELECT * FROM Tournament WHERE TournamentID = ?', [r.insertId]);
    const tournament = rows[0];
    const io = getIO(); io && io.emit('tournament_created', tournament);

    res.json({ ok: true, tournament });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE tournament
router.put('/:id', async (req, res) => {
  const { TournamentName, Format, StartDate, EndDate } = req.body;
  try {
    await db.query(
      `UPDATE Tournament 
       SET TournamentName = ?, Format = ?, StartDate = ?, EndDate = ?
       WHERE TournamentID = ?`,
      [TournamentName, Format, StartDate, EndDate, req.params.id]
    );

    const [rows] = await db.query('SELECT * FROM Tournament WHERE TournamentID = ?', [req.params.id]);
    const tournament = rows[0];

    const io = getIO(); io && io.emit('tournament_updated', tournament);

    res.json({ ok: true, tournament });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tournament
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Tournament WHERE TournamentID = ?', [req.params.id]);

    const io = getIO();
    io && io.emit('tournament_deleted', { TournamentID: Number(req.params.id) });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
