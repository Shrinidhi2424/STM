// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Teams from './components/Teams';
import Players from './components/Players';
import Tournaments from './components/Tournaments';
import Matches from './components/Matches';
import Results from './components/Results';
import PlayerStats from './components/PlayerStats';
import './index.css';
import Login from './components/Login';
import AdminUsers from './components/AdminUsers';
import DBFeatures from './components/DBFeatures';
import { useAuth } from './auth/AuthProvider';

export default function App(){
  const [view, setView] = useState('dashboard');
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="app"><div className="card">Loading...</div></div>;
  if (!user) return <Login />;

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1>Sports Tournament Management</h1>
          <div className="small">Signed in as <strong>{user.name}</strong> — {user.role}</div>
        </div>

        <div className="nav">
          <button className={view==='dashboard'?'active':''} onClick={()=>setView('dashboard')}>Dashboard</button>
          <button className={view==='teams'?'active':''} onClick={()=>setView('teams')}>Teams</button>
          <button className={view==='players'?'active':''} onClick={()=>setView('players')}>Players</button>
          <button className={view==='tournaments'?'active':''} onClick={()=>setView('tournaments')}>Tournaments</button>
          <button className={view==='matches'?'active':''} onClick={()=>setView('matches')}>Matches</button>
          <button className={view==='results'?'active':''} onClick={()=>setView('results')}>Results</button>
          <button className={view==='stats'?'active':''} onClick={()=>setView('stats')}>Player Stats</button>
          {user.role === 'Admin' && <button className={view==='users'?'active':''} onClick={()=>setView('users')}>Users</button>}
          {user.role === 'Admin' && <button className={view==='dbfeatures'?'active':''} onClick={()=>setView('dbfeatures')}>DB Features</button>}
          <button onClick={logout} style={{marginLeft:8}}>Sign out</button>
        </div>
      </div>

      <div className="card">
        {view==='dashboard' && <Dashboard />}
        {view==='teams' && <Teams />}
        {view==='players' && <Players />}
        {view==='tournaments' && <Tournaments />}
        {view==='matches' && <Matches />}
        {view==='results' && <Results />}
        {view==='stats' && <PlayerStats />}
        {view==='users' && user.role === 'Admin' && <AdminUsers />}
        {view==='dbfeatures' && user.role === 'Admin' && <DBFeatures />}
      </div>
    </div>
  );
}
