// src/components/Results.jsx
import React, { useEffect, useState } from 'react';
import { Results as ResultAPI, Matches as MatchAPI } from '../api';
import { socket } from '../socket';
import { useAuth } from '../auth/AuthProvider';

export default function Results() {
  const [list, setList] = useState([]);
  const [matches, setMatches] = useState([]);

  const [form, setForm] = useState({
    MatchID: '',
    ScoreTeam1: 0,
    ScoreTeam2: 0,
    WinnerTeamID: '',
    EnteredBy: ''
  });

  async function load() {
    try {
      const [r, m] = await Promise.all([
        ResultAPI.list(),
        MatchAPI.list()
      ]);

      setList(r || []);
      setMatches(m || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();

    socket.on('result_created', r => setList(prev => [r, ...prev]));
    socket.on('result_updated', r =>
      setList(prev => prev.map(x => x.ResultID === r.ResultID ? r : x))
    );
    socket.on('result_deleted', ({ ResultID }) =>
      setList(prev => prev.filter(x => x.ResultID !== ResultID))
    );

    return () => {
      socket.off('result_created');
      socket.off('result_updated');
      socket.off('result_deleted');
    };
  }, []);

  const { user } = useAuth();
  const role = user?.role;
  const canModify = role === 'Admin' || role === 'Referee';

  async function create(e) {
    e.preventDefault();

    try {
      await ResultAPI.create({
        MatchID: Number(form.MatchID),
        ScoreTeam1: Number(form.ScoreTeam1),
        ScoreTeam2: Number(form.ScoreTeam2),
        WinnerTeamID: form.WinnerTeamID === '' ? null : Number(form.WinnerTeamID),
        EnteredBy: form.EnteredBy === '' ? null : Number(form.EnteredBy)
      });

      setForm({ MatchID: '', ScoreTeam1: 0, ScoreTeam2: 0, WinnerTeamID: '', EnteredBy: '' });
    } catch (err) {
      alert('Create failed: ' + err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete result?')) return;
    await ResultAPI.del(id);
  }

  async function edit(r) {
    const s1 = prompt('Score Team 1', r.ScoreTeam1);
    if (s1 === null) return;

    const s2 = prompt('Score Team 2', r.ScoreTeam2);
    if (s2 === null) return;

    const win = prompt('WinnerTeamID (blank = none)', r.WinnerTeamID || '');

    await ResultAPI.update(r.ResultID, {
      MatchID: r.MatchID,
      ScoreTeam1: Number(s1),
      ScoreTeam2: Number(s2),
      WinnerTeamID: win === '' ? null : Number(win),
      EnteredBy: r.EnteredBy
    });
  }

  return (
    <div>
      <h2>Results</h2>

      {canModify && (
        <form onSubmit={create} className="form-row">
        <select
          value={form.MatchID}
          onChange={e => setForm({ ...form, MatchID: e.target.value })}
          required
        >
          <option value="">-- Match --</option>
          {matches.map(m => (
            <option key={m.MatchID} value={m.MatchID}>
              {m.Team1ID} vs {m.Team2ID} ({m.MatchDate})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Team 1 Score"
          value={form.ScoreTeam1}
          onChange={e => setForm({ ...form, ScoreTeam1: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Team 2 Score"
          value={form.ScoreTeam2}
          onChange={e => setForm({ ...form, ScoreTeam2: e.target.value })}
          required
        />

        <input
          placeholder="WinnerTeamID (optional)"
          value={form.WinnerTeamID}
          onChange={e => setForm({ ...form, WinnerTeamID: e.target.value })}
        />

        <input
          placeholder="EnteredBy (Referee UserID)"
          value={form.EnteredBy}
          onChange={e => setForm({ ...form, EnteredBy: e.target.value })}
        />

          <button className="btn" type="submit">Add Result</button>
        </form>
      )}

      <div className="list">
        {list.map(r => (
          <div className="list-item" key={r.ResultID}>
            <div>
              <strong>Match {r.MatchID}</strong>
              <div className="small">
                {r.ScoreTeam1} - {r.ScoreTeam2}
              </div>
              <div className="small">
                Winner: {r.WinnerTeamID || '—'} • EnteredBy: {r.EnteredBy || '—'}
              </div>
            </div>

            <div>
              {canModify && (
                <>
                  <button className="btn" onClick={() => edit(r)}>Edit</button>
                  <button className="btn danger" onClick={() => remove(r.ResultID)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
