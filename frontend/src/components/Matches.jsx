// src/components/Matches.jsx
import React, { useEffect, useState } from 'react';
import { Matches as MatchAPI, Teams as TeamAPI, Tournaments as TournamentAPI } from '../api';
import { socket } from '../socket';
import { useAuth } from '../auth/AuthProvider';

export default function Matches() {

  const [list, setList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);

  const [form, setForm] = useState({
    TournamentID: '',
    Team1ID: '',
    Team2ID: '',
    MatchDate: '',
    MatchTime: '',
    Venue: '',
    Status: 'Scheduled'
  });

  async function load() {
    const [m, t, tr] = await Promise.all([
      MatchAPI.list(),
      TeamAPI.list(),
      TournamentAPI.list()
    ]);

    setList(m || []);
    setTeams(t || []);
    setTournaments(tr || []);
  }

  useEffect(() => {
    load();

    socket.on('match_created', m => setList(prev => [m, ...prev]));
    socket.on('match_updated', m => setList(prev => prev.map(x => x.MatchID === m.MatchID ? m : x)));
    socket.on('match_deleted', ({ MatchID }) => setList(prev => prev.filter(x => x.MatchID !== MatchID)));

    return () => {
      socket.off('match_created');
      socket.off('match_updated');
      socket.off('match_deleted');
    };
  }, []);

  const { user } = useAuth();
  const role = user?.role;
  const canModify = role === 'Admin';

  async function create(e) {
    e.preventDefault();
    try {
      await MatchAPI.create({
        TournamentID: form.TournamentID || null,
        Team1ID: form.Team1ID || null,
        Team2ID: form.Team2ID || null,
        MatchDate: form.MatchDate,
        MatchTime: form.MatchTime,
        Venue: form.Venue,
        Status: form.Status
      });

      setForm({
        TournamentID: '',
        Team1ID: '',
        Team2ID: '',
        MatchDate: '',
        MatchTime: '',
        Venue: '',
        Status: 'Scheduled'
      });

    } catch (err) {
      alert('Create failed: ' + err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete match?')) return;
    await MatchAPI.del(id);
  }

  async function edit(m) {
    const date = prompt('MatchDate YYYY-MM-DD', m.MatchDate || '');
    const time = prompt('MatchTime HH:MM:SS', m.MatchTime || '');
    const venue = prompt('Venue', m.Venue || '');
    const status = prompt('Status (Scheduled/Completed/Cancelled)', m.Status || 'Scheduled');

    try {
      await MatchAPI.update(m.MatchID, {
        ...m,
        MatchDate: date,
        MatchTime: time,
        Venue: venue,
        Status: status
      });
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  }

  return (
    <div>
      <h2>Matches</h2>

      {canModify && (
        <form onSubmit={create} className="form-row">

        <select value={form.TournamentID}
          onChange={e => setForm({ ...form, TournamentID: e.target.value })}>
          <option value=''>-- Tournament (optional) --</option>
          {tournaments.map(t =>
            <option key={t.TournamentID} value={t.TournamentID}>{t.TournamentName}</option>
          )}
        </select>

        <select value={form.Team1ID}
          onChange={e => setForm({ ...form, Team1ID: e.target.value })}>
          <option value=''>-- Team 1 --</option>
          {teams.map(t =>
            <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>
          )}
        </select>

        <select value={form.Team2ID}
          onChange={e => setForm({ ...form, Team2ID: e.target.value })}>
          <option value=''>-- Team 2 --</option>
          {teams.map(t =>
            <option key={t.TeamID} value={t.TeamID}>{t.TeamName}</option>
          )}
        </select>

        <input type="date"
          value={form.MatchDate}
          onChange={e => setForm({ ...form, MatchDate: e.target.value })} />

        <input type="time"
          value={form.MatchTime}
          onChange={e => setForm({ ...form, MatchTime: e.target.value })} />

        <input placeholder="Venue"
          value={form.Venue}
          onChange={e => setForm({ ...form, Venue: e.target.value })} />

          <button className="btn" type="submit">Add</button>
        </form>
      )}

      <div className="list">
        {list.map(m => (
          <div className="list-item" key={m.MatchID}>
            <div>
              <strong>
                {m.Team1Name || m.Team1ID} vs {m.Team2Name || m.Team2ID}
              </strong>
              <div className="small">
                {m.TournamentName || '—'} • {m.MatchDate} {m.MatchTime} • {m.Venue}
              </div>
              <div className="small">Status: {m.Status}</div>
            </div>

            <div>
              {canModify && (
                <>
                  <button className="btn" onClick={() => edit(m)}>Edit</button>
                  <button className="btn danger" onClick={() => remove(m.MatchID)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
