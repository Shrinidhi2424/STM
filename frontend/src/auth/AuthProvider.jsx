import React, { createContext, useContext, useEffect, useState } from 'react';
import { request } from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    // fetch current user
    (async ()=>{
      try {
        const res = await request('/auth/me');
        setUser(res.user);
      } catch (err) {
        setUser(null);
      } finally { setLoading(false); }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (err) {}
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
