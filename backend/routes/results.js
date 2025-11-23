// backend/routes/results.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { getIO } = require('../socket');

// GET all results with match & team details
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT r.*, 
             m.MatchDate, m.MatchTime, m.Venue,
             t1.TeamName AS Team1Name,
             t2.TeamName AS Team2Name,
             winner.TeamName AS WinnerName
      FROM Result r
      LEFT JOIN MatchInfo m ON r.MatchID = m.MatchID
      LEFT JOIN Team t1 ON m.Team1ID = t1.TeamID
      LEFT JOIN Team t2 ON m.Team2ID = t2.TeamID
      LEFT JOIN Team winner ON r.WinnerTeamID = winner.TeamID
      ORDER BY r.ResultID DESC
    `;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single result
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Result WHERE ResultID = ?', [req.params.id]);
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const { authenticateJWT, authorizeRole } = require('../middleware/auth');

// CREATE result (Admin & Referee)
router.post('/', authenticateJWT, authorizeRole('Admin','Referee'), async (req, res) => {
  const { MatchID, ScoreTeam1, ScoreTeam2, WinnerTeamID, EnteredBy } = req.body;

  try {
    const [r] = await db.query(
      `INSERT INTO Result 
       (MatchID, ScoreTeam1, ScoreTeam2, WinnerTeamID, EnteredBy)
       VALUES (?, ?, ?, ?, ?)`,
      [
        MatchID,
        ScoreTeam1,
        ScoreTeam2,
        WinnerTeamID || null,
        EnteredBy || null
      ]
    );

    const [rows] = await db.query('SELECT * FROM Result WHERE ResultID = ?', [r.insertId]);
    const resultObj = rows[0];

    const io = getIO(); io && io.emit('result_created', resultObj);

    res.json({ ok: true, result: resultObj });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ error: 'Result for this match already exists' });

    res.status(500).json({ error: err.message });
  }
});

// UPDATE result (Admin & Referee)
router.put('/:id', authenticateJWT, authorizeRole('Admin','Referee'), async (req, res) => {
  const { ScoreTeam1, ScoreTeam2, WinnerTeamID, EnteredBy } = req.body;

  try {
    await db.query(
      `UPDATE Result
       SET ScoreTeam1 = ?, ScoreTeam2 = ?, WinnerTeamID = ?, EnteredBy = ?
       WHERE ResultID = ?`,
      [ScoreTeam1, ScoreTeam2, WinnerTeamID, EnteredBy, req.params.id]
    );

    const [rows] = await db.query('SELECT * FROM Result WHERE ResultID = ?', [req.params.id]);
    const updated = rows[0];

    const io = getIO(); io && io.emit('result_updated', updated);

    res.json({ ok: true, result: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE result (Admin & Referee)
router.delete('/:id', authenticateJWT, authorizeRole('Admin','Referee'), async (req, res) => {
  try {
    await db.query('DELETE FROM Result WHERE ResultID = ?', [req.params.id]);
    
    const io = getIO(); io && io.emit('result_deleted', { ResultID: Number(req.params.id) });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
