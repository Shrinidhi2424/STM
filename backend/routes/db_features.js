const express = require('express');
const router = express.Router();
const db = require('../db');

// Aggregates view
router.get('/aggregates', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_player_aggregates LIMIT 200');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/top-scorers', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_top_scorers ORDER BY TotalGoals DESC LIMIT 200');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/match-results', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM vw_match_results LIMIT 200');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/add-result', async (req, res) => {
  const { MatchID, ScoreTeam1, ScoreTeam2, WinnerTeamID } = req.body;
  try {
    const [r] = await db.query('CALL AddResult(?, ?, ?, ?)', [MatchID, ScoreTeam1, ScoreTeam2, WinnerTeamID]);
    res.json({ ok: true, result: r });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/goals-per-game/:playerId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT goals_per_game(?) AS val', [req.params.playerId]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
