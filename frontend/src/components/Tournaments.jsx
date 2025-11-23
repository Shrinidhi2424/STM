import React, { useEffect, useState } from 'react';
import { Tournaments as TournamentAPI } from '../api';
import { socket } from '../socket';
import { useAuth } from '../auth/AuthProvider';

export default function Tournaments() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ TournamentName: '', Format: 'League', StartDate: '', EndDate: '' });

  async function load() {
    const d = await TournamentAPI.list();
    setList(d || []);
  }

  useEffect(() => {
    load();

    socket.on('tournament_created', t => setList(prev => [t, ...prev]));
    socket.on('tournament_updated', t =>
      setList(prev => prev.map(x => x.TournamentID === t.TournamentID ? t : x))
    );
    socket.on('tournament_deleted', ({ TournamentID }) =>
      setList(prev => prev.filter(x => x.TournamentID !== TournamentID))
    );

    return () => {
      socket.off('tournament_created');
      socket.off('tournament_updated');
      socket.off('tournament_deleted');
    };
  }, []);

  const { user } = useAuth();
  const role = user?.role;
  const canModify = role === 'Admin';

  async function create(e) {
    e.preventDefault();
    try {
      await TournamentAPI.create(form);
      setForm({ TournamentName: '', Format: 'League', StartDate: '', EndDate: '' });
    } catch (err) {
      alert('Create failed: ' + err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete tournament?')) return;
    try {
      await TournamentAPI.del(id);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }

  async function edit(t) {
    const name = prompt('Name', t.TournamentName);
    if (name == null) return;
    const format = prompt('Format (League/Knockout)', t.Format);
    const sd = prompt('StartDate YYYY-MM-DD', t.StartDate || '');
    const ed = prompt('EndDate YYYY-MM-DD', t.EndDate || '');
    try {
      await TournamentAPI.update(t.TournamentID, { TournamentName: name, Format: format, StartDate: sd, EndDate: ed });
    } catch (e) {
      alert('Update failed: ' + e.message);
    }
  }

  return (
    <div>
      <h2>Tournaments</h2>
      {canModify && (
        <form onSubmit={create} className="form-row">
        <input
          placeholder="Name"
          value={form.TournamentName}
          onChange={e => setForm({ ...form, TournamentName: e.target.value })}
          required
        />
        <select value={form.Format} onChange={e => setForm({ ...form, Format: e.target.value })}>
          <option>League</option>
          <option>Knockout</option>
        </select>
        <input type="date" value={form.StartDate} onChange={e => setForm({ ...form, StartDate: e.target.value })} />
        <input type="date" value={form.EndDate} onChange={e => setForm({ ...form, EndDate: e.target.value })} />
          <button className="btn" type="submit">Add</button>
        </form>
      )}

      <div className="list">
        {list.map(t => (
          <div className="list-item" key={t.TournamentID}>
            <div>
              <strong>{t.TournamentName}</strong> <span className="small">ID:{t.TournamentID}</span>
              <div className="small">{t.Format} • {t.StartDate || '—'} → {t.EndDate || '—'}</div>
            </div>
            <div>
              {canModify && (
                <>
                  <button className="btn" onClick={() => edit(t)}>Edit</button>
                  <button className="btn danger" onClick={() => remove(t.TournamentID)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
