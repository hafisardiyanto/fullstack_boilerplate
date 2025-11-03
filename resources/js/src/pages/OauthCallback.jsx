import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function OauthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const role = params.get('role');

      if (!token) {
        nav('/login');
        return;
      }

      try {
        // Simpan token & role
        localStorage.setItem('token', token);
        if (role) localStorage.setItem('role', role);

        // set axios header supaya fetchUser bisa langsung memakai
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // optional: fetch user here or let AuthProvider do it
        // const res = await api.get('/api/user');

        // notify AuthProvider to re-fetch user
        window.dispatchEvent(new Event('auth:login'));

        // bersihkan URL (hapus token dari address bar)
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }

        // redirect to suitable page (AuthProvider will fetch user)
        // you may decide to redirect to '/' and let App decide
        nav('/');
      } catch (err) {
        console.error('OauthCallback error', err);
        nav('/login');
      }
    })();
  }, []);

  return <div>Processing OAuth login... please wait.</div>;
}
