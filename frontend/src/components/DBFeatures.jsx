import React, { useEffect, useState } from 'react';
import { DBFeatures as DBFeaturesAPI, Players } from '../api';

export default function DBFeatures(){
  const [aggregates, setAggregates] = useState([]);
  const [topScorers, setTopScorers] = useState([]);
  const [matchResults, setMatchResults] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [goalsPerGame, setGoalsPerGame] = useState(null);
  const [addResultForm, setAddResultForm] = useState({ MatchID:'', ScoreTeam1:'', ScoreTeam2:'', WinnerTeamID:'' });
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    (async ()=>{
      try {
        const pls = await Players.list();
        setPlayers(Array.isArray(pls) ? pls : []);
      } catch (err) { console.error(err); setPlayers([]); }
    })();
  }, []);

  const loadAggregates = async () => {
    setLoading(true);
    try { const res = await DBFeaturesAPI.aggregates(); setAggregates(res || []); } catch (e){ alert('Failed: '+e.message); }
    setLoading(false);
  };
  const loadTop = async () => {
    setLoading(true);
    try { const res = await DBFeaturesAPI.topScorers(); setTopScorers(res || []); } catch (e){ alert('Failed: '+e.message); }
    setLoading(false);
  };
  const loadMatches = async () => {
    setLoading(true);
    try { const res = await DBFeaturesAPI.matchResults(); setMatchResults(res || []); } catch (e){ alert('Failed: '+e.message); }
    setLoading(false);
  };

  const runGoals = async () => {
    if (!selectedPlayer) return alert('Select a player');
    try { const res = await DBFeaturesAPI.goalsPerGame(selectedPlayer); setGoalsPerGame(res.val ?? res); } catch (e){ alert('Failed: '+e.message); }
  };

  const submitAddResult = async (e) => {
    e.preventDefault();
    try {
      await DBFeaturesAPI.addResult({
        MatchID: Number(addResultForm.MatchID),
        ScoreTeam1: Number(addResultForm.ScoreTeam1),
        ScoreTeam2: Number(addResultForm.ScoreTeam2),
        WinnerTeamID: Number(addResultForm.WinnerTeamID)
      });
      alert('Procedure executed');
      setAddResultForm({ MatchID:'', ScoreTeam1:'', ScoreTeam2:'', WinnerTeamID:'' });
    } catch (err){ alert('Failed: '+err.message); }
  };

  return (
    <div>
      <h2>DB Features</h2>

      <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
        <div className="card" style={{minWidth:300}}>
          <h4>Aggregates (vw_player_aggregates)</h4>
          <button className="btn" onClick={loadAggregates} disabled={loading}>Load</button>
          <div className="list">
            {aggregates.map(a=> (
              <div key={a.PlayerID} className="list-item">
                <div><strong>Player {a.PlayerID}</strong><div className="small">Games: {a.Games} • Goals: {a.TotalGoals} • Avg: {Number(a.AvgRating).toFixed(2)}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{minWidth:300}}>
          <h4>Top Scorers (vw_top_scorers)</h4>
          <button className="btn" onClick={loadTop} disabled={loading}>Load</button>
          <div className="list">
            {topScorers.map(p=> (
              <div key={p.PlayerID} className="list-item">
                <div><strong>{p.PlayerName}</strong><div className="small">Goals: {p.TotalGoals}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{minWidth:300}}>
          <h4>Match Results (vw_match_results)</h4>
          <button className="btn" onClick={loadMatches} disabled={loading}>Load</button>
          <div className="list">
            {matchResults.map(r=> (
              <div key={r.ResultID} className="list-item">
                <div><strong>{r.Team1} vs {r.Team2}</strong><div className="small">{r.MatchDate} {r.MatchTime} • {r.ScoreTeam1} - {r.ScoreTeam2}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{minWidth:300}}>
          <h4>Goals Per Game (function)</h4>
          <select value={selectedPlayer} onChange={e=>setSelectedPlayer(e.target.value)}>
            <option value="">-- Select player --</option>
            {players.map(p=> <option key={p.PlayerID} value={p.PlayerID}>{p.PlayerName}</option>)}
          </select>
          <button className="btn" onClick={runGoals}>Run</button>
          {goalsPerGame !== null && <div className="small">Goals per game: {Number(goalsPerGame).toFixed(2)}</div>}
        </div>

        <div className="card" style={{minWidth:300}}>
          <h4>Call Stored Procedure: AddResult</h4>
          <form onSubmit={submitAddResult} className="form-row">
            <input placeholder="MatchID" value={addResultForm.MatchID} onChange={e=>setAddResultForm({...addResultForm,MatchID:e.target.value})} />
            <input placeholder="ScoreTeam1" value={addResultForm.ScoreTeam1} onChange={e=>setAddResultForm({...addResultForm,ScoreTeam1:e.target.value})} />
            <input placeholder="ScoreTeam2" value={addResultForm.ScoreTeam2} onChange={e=>setAddResultForm({...addResultForm,ScoreTeam2:e.target.value})} />
            <input placeholder="WinnerTeamID" value={addResultForm.WinnerTeamID} onChange={e=>setAddResultForm({...addResultForm,WinnerTeamID:e.target.value})} />
            <button className="btn" type="submit">Run</button>
          </form>
        </div>
      </div>
    </div>
  );
}
