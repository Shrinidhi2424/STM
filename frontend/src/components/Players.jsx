// src/components/Players.jsx
import React, { useEffect, useState } from 'react';
import { Players as PlayerAPI } from '../api';
import { socket } from '../socket';
import { useAuth } from '../auth/AuthProvider';

export default function Players() {

  const [list, setList] = useState([]);

  const [form, setForm] = useState({
    PlayerName: '',
    Age: '',
    Position: '',
    TeamID: ''
  });

  async function load() {
    const d = await PlayerAPI.list();
    setList(d || []);
  }

  useEffect(() => {
    load();

    socket.on('player_created', p => setList(prev => [p, ...prev]));
    socket.on('player_updated', p => setList(prev => prev.map(x => x.PlayerID === p.PlayerID ? p : x)));
    socket.on('player_deleted', ({ PlayerID }) =>
      setList(prev => prev.filter(x => x.PlayerID !== PlayerID))
    );

    return () => {
      socket.off('player_created');
      socket.off('player_updated');
      socket.off('player_deleted');
    };
  }, []);

  const { user } = useAuth();
  const role = user?.role;
  const canModify = role === 'Admin';

  async function create(e) {
    e.preventDefault();
    try {
      await PlayerAPI.create({
        PlayerName: form.PlayerName,
        Age: form.Age ? Number(form.Age) : null,
        Position: form.Position,
        TeamID: form.TeamID ? Number(form.TeamID) : null
      });

      setForm({ PlayerName: '', Age: '', Position: '', TeamID: '' });

    } catch (err) {
      alert('Create failed: ' + err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete player?')) return;
    try {
      await PlayerAPI.del(id);
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  }

  async function edit(player) {
    const name = prompt('Name', player.PlayerName);
    if (name == null) return;

    const age = prompt('Age', player.Age || '');
    const pos = prompt('Position', player.Position || '');
    const team = prompt('TeamID', player.TeamID || '');

    try {
      await PlayerAPI.update(player.PlayerID, {
        PlayerName: name,
        Age: age || null,
        Position: pos,
        TeamID: team || null
      });
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  }

  return (
    <div>
      <h2>Players</h2>

      {canModify && (
        <form onSubmit={create} className="form-row">
        <input
          placeholder="Player name"
          value={form.PlayerName}
          onChange={e => setForm({ ...form, PlayerName: e.target.value })}
          required
        />

        <input
          placeholder="Age"
          value={form.Age}
          onChange={e => setForm({ ...form, Age: e.target.value })}
        />

        <input
          placeholder="Position"
          value={form.Position}
          onChange={e => setForm({ ...form, Position: e.target.value })}
        />

        <input
          placeholder="TeamID"
          value={form.TeamID}
          onChange={e => setForm({ ...form, TeamID: e.target.value })}
        />

          <button className="btn" type="submit">Add</button>
        </form>
      )}

      <div className="list">
        {list.map(p => (
          <div className="list-item" key={p.PlayerID}>
            <div>
              <strong>{p.PlayerName}</strong>{" "}
              <span className="small">ID:{p.PlayerID}</span>

              <div className="small">
                {p.Position} • Age: {p.Age || "—"} • Team: {p.TeamName || p.TeamID || "—"}
              </div>
            </div>

            <div>
              {canModify && (
                <>
                  <button className="btn" onClick={() => edit(p)}>Edit</button>
                  <button className="btn danger" onClick={() => remove(p.PlayerID)}>Delete</button>
                </>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
