// src/components/Teams.jsx
import React, { useEffect, useState } from 'react';
import { Teams as TeamAPI } from '../api';
import { socket } from '../socket';
import { useAuth } from '../auth/AuthProvider';

export default function TeamsComponent() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ TeamName: '', CoachID: '', SportType: '' });
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await TeamAPI.list();
      setList(data || []);
    } catch (err) {
      console.error('Failed to load teams:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    // real-time updates
    socket.on('team_created', (t) => setList((prev) => [t, ...prev]));
    socket.on('team_updated', (t) => setList((prev) => prev.map((x) => (x.TeamID === t.TeamID ? t : x))));
    socket.on('team_deleted', ({ TeamID }) => setList((prev) => prev.filter((x) => x.TeamID !== TeamID)));

    return () => {
      socket.off('team_created');
      socket.off('team_updated');
      socket.off('team_deleted');
    };
  }, []);

  const { user } = useAuth();
  const role = user?.role;
  const canModify = role === 'Admin';

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.TeamName.trim()) return alert('Team name is required');
    try {
      await TeamAPI.create({
        TeamName: form.TeamName.trim(),
        CoachID: form.CoachID ? Number(form.CoachID) : null,
        SportType: form.SportType || null,
      });
      setForm({ TeamName: '', CoachID: '', SportType: '' });
    } catch (err) {
      alert('Create failed: ' + (err.message || err));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete team?')) return;
    try {
      await TeamAPI.del(id);
    } catch (err) {
      alert('Delete failed: ' + (err.message || err));
    }
  }

  async function handleEdit(team) {
    const newName = prompt('Team name', team.TeamName);
    if (newName == null) return;
    const coach = prompt('CoachID (leave blank for null)', team.CoachID ?? '');
    const sport = prompt('SportType', team.SportType ?? '');

    try {
      await TeamAPI.update(team.TeamID, {
        TeamName: newName.trim() || team.TeamName,
        CoachID: coach === '' ? null : coach ? Number(coach) : null,
        SportType: sport || null,
      });
    } catch (err) {
      alert('Update failed: ' + (err.message || err));
    }
  }

  return (
    <div>
      <h2>Teams</h2>

      {canModify && (
        <form onSubmit={handleCreate} className="form-row">
        <input
          placeholder="Team name"
          value={form.TeamName}
          onChange={(e) => setForm({ ...form, TeamName: e.target.value })}
          required
        />
        <input
          placeholder="CoachID (optional)"
          value={form.CoachID}
          onChange={(e) => setForm({ ...form, CoachID: e.target.value })}
        />
        <input
          placeholder="SportType"
          value={form.SportType}
          onChange={(e) => setForm({ ...form, SportType: e.target.value })}
        />
          <button className="btn" type="submit">Add</button>
        </form>
      )}

      <div className="list">
        {loading ? (
          <div className="small">Loading...</div>
        ) : list.length === 0 ? (
          <div className="small">No teams found.</div>
        ) : (
          list.map((t) => (
            <div className="list-item" key={t.TeamID}>
              <div>
                <strong>{t.TeamName}</strong> <span className="small">ID:{t.TeamID}</span>
                <div className="small">CoachID: {t.CoachID ?? '—'} • {t.SportType ?? '—'}</div>
              </div>
              <div>
                {canModify && (
                  <>
                    <button className="btn" onClick={() => handleEdit(t)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(t.TeamID)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
