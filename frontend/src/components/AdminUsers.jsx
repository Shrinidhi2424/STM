import React, { useEffect, useState } from 'react';
import { Users } from '../api';

export default function AdminUsers(){
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ Name:'', Email:'', Password:'', Role:'Coach' });

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

      <div>
        {loading ? <div>Loading...</div> : (
          <div className="list">
            {list.map(u=> (
              <div key={u.UserID} className="list-item">
                <div>
                  <div><strong>{u.Name}</strong></div>
                  <div className="small">{u.Email} — {u.Role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
