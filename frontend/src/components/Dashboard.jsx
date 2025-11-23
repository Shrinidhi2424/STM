// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Teams as TeamAPI, Players as PlayerAPI, Matches as MatchAPI } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ teams: 0, players: 0, matches: 0 });

  async function load() {
    try {
      const [teams, players, matches] = await Promise.all([
        TeamAPI.list(),
        PlayerAPI.list(),
        MatchAPI.list()
      ]);

      setStats({
        teams: teams?.length || 0,
        players: players?.length || 0,
        matches: matches?.length || 0
      });
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    load();
  }, [])

  return (
    <div>
      <h2>Overview</h2>
      <div className="stats">
        <div className="stat card">
          <div className="small">Teams</div>
          <div style={{fontSize:22,fontWeight:700}}>{stats.teams}</div>
        </div>
        <div className="stat card">
          <div className="small">Players</div>
          <div style={{fontSize:22,fontWeight:700}}>{stats.players}</div>
        </div>
        <div className="stat card">
          <div className="small">Matches</div>
          <div style={{fontSize:22,fontWeight:700}}>{stats.matches}</div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Project Abstract</h3>
        <p className="small">Click to open the project abstract you uploaded.</p>
        <a href="/mnt/data/STM ABSTRACT FINAL (1).pdf" target="_blank" rel="noreferrer">Open STM ABSTRACT FINAL (1).pdf</a>
      </div>
    </div>
  );
}
