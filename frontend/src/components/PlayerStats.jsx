// src/components/PlayerStats.jsx
import React, { useEffect, useState } from 'react';
import { Stats as StatsAPI, Players as PlayerAPI, Matches as MatchAPI } from '../api';
import { socket } from '../socket';
import { useAuth } from '../auth/AuthProvider';

export default function PlayerStats() {
  const [list, setList] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  const [form, setForm] = useState({
    PlayerID: '',
    MatchID: '',
    Goals: '',
    Assists: '',
    Cards: '',
    Rating: ''
  });

  async function load() {
    try {
      const [stats, pls, m] = await Promise.all([
        StatsAPI.list(),
        PlayerAPI.list(),
        MatchAPI.list()
      ]);
      setList(stats || []);
      setPlayers(pls || []);
      setMatches(m || []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();

    socket.on('stats_created', s => setList(prev => [s, ...prev]));
    socket.on('stats_updated', s => setList(prev => prev.map(x => x.StatsID === s.StatsID ? s : x)));
    socket.on('stats_deleted', ({ StatsID }) => setList(prev => prev.filter(x => x.StatsID !== StatsID)));

    return () => {
      socket.off('stats_created');
      socket.off('stats_updated');
      socket.off('stats_deleted');
    };
  }, []);

  const { user } = useAuth();
  const canModify = user && user.role === 'Admin';

  async function create(e) {
    e.preventDefault();

    try {
      await StatsAPI.create({
        PlayerID: Number(form.PlayerID),
        MatchID: Number(form.MatchID),
        Goals: form.Goals === '' ? 0 : Number(form.Goals),
        Assists: form.Assists === '' ? 0 : Number(form.Assists),
        Cards: form.Cards === '' ? 0 : Number(form.Cards),
        Rating: form.Rating === '' ? null : Number(form.Rating)
      });

      setForm({ PlayerID: '', MatchID: '', Goals: '', Assists: '', Cards: '', Rating: '' });

    } catch (err) {
      alert('Create failed: ' + err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete stat?')) return;
    await StatsAPI.del(id);
  }

  async function edit(s) {
    const goals = prompt('Goals', s.Goals);
    if (goals === null) return;

    const assists = prompt('Assists', s.Assists);
    if (assists === null) return;

    const cards = prompt('Cards', s.Cards);
    if (cards === null) return;

    const rating = prompt('Rating', s.Rating ?? '');

    await StatsAPI.update(s.StatsID, {
      PlayerID: s.PlayerID,
      MatchID: s.MatchID,
      Goals: Number(goals),
      Assists: Number(assists),
      Cards: Number(cards),
      Rating: rating === '' ? null : Number(rating)
    });
  }

  return (
    <div>
      <h2>Player Stats</h2>

      {canModify && (
        <form onSubmit={create} className="form-row">
        <select
          value={form.PlayerID}
          onChange={e => setForm({ ...form, PlayerID: e.target.value })}
        >
          <option value="">-- Player --</option>
          {players.map(p => (
            <option key={p.PlayerID} value={p.PlayerID}>
              {p.PlayerName}
            </option>
          ))}
        </select>

        <select
          value={form.MatchID}
          onChange={e => setForm({ ...form, MatchID: e.target.value })}
        >
          <option value="">-- Match --</option>
          {matches.map(m => (
            <option key={m.MatchID} value={m.MatchID}>
              {m.Team1ID} vs {m.Team2ID}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Goals"
          value={form.Goals}
          onChange={e => setForm({ ...form, Goals: e.target.value })}
        />

        <input
          type="number"
          placeholder="Assists"
          value={form.Assists}
          onChange={e => setForm({ ...form, Assists: e.target.value })}
        />

        <input
          type="number"
          placeholder="Cards"
          value={form.Cards}
          onChange={e => setForm({ ...form, Cards: e.target.value })}
        />

        <input
          placeholder="Rating (0–10)"
          value={form.Rating}
          onChange={e => setForm({ ...form, Rating: e.target.value })}
        />

          <button className="btn" type="submit">Add</button>
        </form>
      )}

      <div className="list">
        {list.map(s => (
          <div className="list-item" key={s.StatsID}>
            <div>
              <strong>Player #{s.PlayerID}</strong>
              <div className="small">
                Match {s.MatchID} • Goals: {s.Goals} • Assists: {s.Assists} • Cards: {s.Cards} • Rating: {s.Rating ?? '—'}
              </div>
            </div>

            <div>
                    {canModify && (
                      <>
                        <button className="btn" onClick={() => edit(s)}>Edit</button>
                        <button className="btn danger" onClick={() => remove(s.StatsID)}>Delete</button>
                      </>
                    )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
