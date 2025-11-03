import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function OauthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const role = params.get('role');

    if (!token) {
      nav('/login');
      return;
    }

    // Simpan token dan set axios default header
    localStorage.setItem('token', token);
    if (role) localStorage.setItem('role', role);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // optionally: call backend to fetch user profile and then redirect
    api.get('/api/user')
      .then(res => {
        // if you use AuthContext, you may want to set context user here,
        // or simply redirect and AuthProvider will pick up token on mount.
        const u = res.data?.data ?? res.data;
        // optional: navigate according to role
        if (u?.role === 'admin') nav('/admin');
        else nav('/dashboard');
      })
      .catch(err => {
        console.error('oauth fetch user error', err);
        nav('/login');
      });
  }, []);

  return <div>Processing Google login...</div>;
}
