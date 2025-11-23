import React, { useEffect, useState } from 'react';
import { Users } from '../api';
import { useAuth } from '../auth/AuthProvider';

export default function AdminUsers(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ Name:'', Email:'', Password:'', Role:'Coach' });
  const { user: me } = useAuth();

  useEffect(()=>{ (async ()=>{
    try {
      const data = await Users.list();
      setList(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  })(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await Users.create(form);
      const data = await Users.list();
      setList(data);
      setForm({ Name:'', Email:'', Password:'', Role:'Coach' });
    } catch (err) { alert('Error creating user: ' + err.message); }
  };

  return (
    <div>
      <h3>Users</h3>
      {me && me.role === 'Admin' && (
        <div className="card" style={{marginBottom:12}}>
          <form onSubmit={submit} className="form-row">
            <input placeholder="Name" value={form.Name} onChange={e=>setForm({...form,Name:e.target.value})} />
            <input placeholder="Email" value={form.Email} onChange={e=>setForm({...form,Email:e.target.value})} />
            <input placeholder="Password" type="password" value={form.Password} onChange={e=>setForm({...form,Password:e.target.value})} />
            <select value={form.Role} onChange={e=>setForm({...form,Role:e.target.value})}>
              <option>Admin</option>
              <option>Coach</option>
              <option>Referee</option>
            </select>
            <button className="btn btn-primary" type="submit">Create</button>
          </form>
        </div>
      )}

      <div>
        {loading ? <div>Loading...</div> : (
          <div className="list">
            {list.map(u=> (
              <UserRow key={u.UserID} user={u} onUpdated={(updated)=>{
                setList(list.map(x=> x.UserID===updated.UserID ? updated : x));
              }} onDeleted={(id)=>{
                setList(list.filter(x=> x.UserID !== id));
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ user, onUpdated, onDeleted }){
  const { user: me } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ Name: user.Name, Email: user.Email, Password: '', Role: user.Role });

  const save = async () => {
    try {
      const payload = { Name: form.Name, Email: form.Email, Role: form.Role };
      if (form.Password) payload.Password = form.Password;
      const res = await Users.update(user.UserID, payload);
      onUpdated(res.user);
      setEditing(false);
      setForm({ ...form, Password: '' });
    } catch (err) { alert('Update failed: ' + err.message); }
  };

  const remove = async () => {
    if (!confirm(`Delete user ${user.Name}? This cannot be undone.`)) return;
    try {
      await Users.del(user.UserID);
      onDeleted(user.UserID);
    } catch (err) { alert('Delete failed: ' + err.message); }
  };

  return (
    <div className="list-item">
      <div style={{flex:1}}>
        {editing ? (
          <div className="form-row">
            <input value={form.Name} onChange={e=>setForm({...form,Name:e.target.value})} />
            <input value={form.Email} onChange={e=>setForm({...form,Email:e.target.value})} />
            <input placeholder="New password" type="password" value={form.Password} onChange={e=>setForm({...form,Password:e.target.value})} />
            <select value={form.Role} onChange={e=>setForm({...form,Role:e.target.value})}>
              <option>Admin</option>
              <option>Coach</option>
              <option>Referee</option>
            </select>
          </div>
        ) : (
          <div>
            <div><strong>{user.Name}</strong></div>
            <div className="small">{user.Email} — {user.Role}</div>
          </div>
        )}
      </div>
      <div style={{display:'flex',gap:8}}>
        {me && me.role === 'Admin' && (
          editing ? (
            <>
              <button className="btn" onClick={save}>Save</button>
              <button className="btn" onClick={()=>{ setEditing(false); setForm({ Name: user.Name, Email: user.Email, Password:'', Role: user.Role }); }}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn" onClick={()=>setEditing(true)}>Edit</button>
              <button className="btn" onClick={remove}>Delete</button>
            </>
          )
        )}
      </div>
    </div>
  );
}
