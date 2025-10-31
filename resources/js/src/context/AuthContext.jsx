import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from token (if exists)
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }
      // set axios header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // backend endpoint should return authenticated user
      const res = await api.get('/api/user');
      // res.data could be resource or raw user — adjust accordingly
      setUser(res.data.data || res.data);
    } catch (e) {
      console.error('fetchUser', e);
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUser(); }, []);

  // LOGIN: return user so caller can redirect
  const login = async (email, password, remember = false) => {
    // If you use Sanctum cookie-based auth, replace this flow accordingly.
    const res = await api.post('/api/login', { email, password });

    // backend must return { user, token }
    const token = res.data.token;
    const returnedUser = res.data.user || res.data.data || res.data;

    // save token & role
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (returnedUser?.role) {
      localStorage.setItem('role', returnedUser.role);
    }

    setUser(returnedUser);
    return returnedUser;
  };

  const logout = async () => {
    try {
      await api.post('/api/logout'); // optional: revoke token server-side
    } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    // redirect from caller (or you can window.location here)
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
