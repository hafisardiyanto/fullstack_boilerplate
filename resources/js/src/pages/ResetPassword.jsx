import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../reset.css';

export default function ResetPassword(){
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', token: '', password:'', password_confirmation:'' });
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    setForm(prev => ({ ...prev, token, email }));
  }, [searchParams]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(null); setErr(null);
    try {
      const payload = {
        token: form.token,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation
      };
      const res = await api.post('/api/reset-password', payload);
      setMsg(res.data.message || 'Password reset successful.');
      // optional: redirect to login after 2s
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErr(error.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-400">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h3 className="text-xl mb-4">Set a new password</h3>
        {msg && <div className="text-green-600 mb-2">{msg}</div>}
        {err && <div className="text-red-600 mb-2">{err}</div>}

        <form onSubmit={submit}>
          <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded mb-3" required/>
          <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="New password" className="w-full border p-2 rounded mb-3" required/>
          <input name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Confirm password" className="w-full border p-2 rounded mb-3" required/>
          <button className="w-full bg-sky-600 text-white p-2 rounded" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
        </form>
      </div>
    </div>
  );
}
