import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

export default function Login(){
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{maxWidth:420, margin:'40px auto'}}>
      <div className="card">
        <h2>Sign in</h2>
        <form onSubmit={submit}>
          <div style={{marginBottom:8}}>
            <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e6e9ef'}} />
          </div>
          <div style={{marginBottom:8}}>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:10,borderRadius:6,border:'1px solid #e6e9ef'}} />
          </div>
          {error && <div style={{color:'#ef4444',marginBottom:8}}>{error}</div>}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <button className="btn btn-primary" type="submit">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
