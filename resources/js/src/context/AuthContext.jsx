import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth from token
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // pastikan header selalu ada
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const res = await api.get('/api/user');

      // support bentuk data {data: user} atau langsung user
      const u = res.data?.data ?? res.data;

      setUser(u);
    } catch (err) {
      console.error('fetchUser error:', err);

      // token invalid / expired → bersihkan
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      delete api.defaults.headers.common['Authorization'];

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);


  // ====================================================
  // LOGIN
  // ====================================================
  const login = async (email, password) => {
    const res = await api.post('/api/login', { email, password });

    const token = res.data.token;
    const returnedUser = res.data.user || res.data.data || res.data;

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


  // ====================================================
  // LOGOUT
  // ====================================================
  const logout = async () => {
    try {
      await api.post('/api/logout'); // optional
    } catch (_) {}

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
