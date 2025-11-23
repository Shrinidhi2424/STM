// backend/routes/matches.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getIO } = require('../socket');

// GET all matches with joined details
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT m.*, 
             t.TournamentName,
             team1.TeamName AS Team1Name,
             team2.TeamName AS Team2Name
      FROM MatchInfo m
      LEFT JOIN Tournament t ON m.TournamentID = t.TournamentID
      LEFT JOIN Team team1 ON m.Team1ID = team1.TeamID
      LEFT JOIN Team team2 ON m.Team2ID = team2.TeamID
      ORDER BY m.MatchDate, m.MatchTime
    `;

    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single match
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM MatchInfo WHERE MatchID = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE match
router.post('/', async (req, res) => {
  const { TournamentID, Team1ID, Team2ID, MatchDate, MatchTime, Venue, Status } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO MatchInfo 
       (TournamentID, Team1ID, Team2ID, MatchDate, MatchTime, Venue, Status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        TournamentID || null,
        Team1ID || null,
        Team2ID || null,
        MatchDate,
        MatchTime,
        Venue,
        Status || 'Scheduled'
      ]
    );

    const [rows] = await db.query('SELECT * FROM MatchInfo WHERE MatchID = ?', [result.insertId]);
    const match = rows[0];

    const io = getIO(); io && io.emit('match_created', match);

    res.json({ ok: true, match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE match
router.put('/:id', async (req, res) => {
  const { TournamentID, Team1ID, Team2ID, MatchDate, MatchTime, Venue, Status } = req.body;

  try {
    await db.query(
      `UPDATE MatchInfo 
       SET TournamentID = ?, Team1ID = ?, Team2ID = ?, MatchDate = ?, MatchTime = ?, Venue = ?, Status = ?
       WHERE MatchID = ?`,
      [
        TournamentID || null,
        Team1ID || null,
        Team2ID || null,
        MatchDate,
        MatchTime,
        Venue,
        Status,
        req.params.id
      ]
    );

    const [rows] = await db.query('SELECT * FROM MatchInfo WHERE MatchID = ?', [req.params.id]);
    const match = rows[0];

    const io = getIO(); io && io.emit('match_updated', match);

    res.json({ ok: true, match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE match
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM MatchInfo WHERE MatchID = ?', [req.params.id]);

    const io = getIO(); io && io.emit('match_deleted', { MatchID: Number(req.params.id) });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
