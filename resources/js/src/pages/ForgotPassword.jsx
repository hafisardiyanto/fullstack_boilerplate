import React, { useState } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import '../forgot.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await api.post('/api/forgot-password', { email });
      setMsg(res.data.message || 'If that email exists, a reset link was sent.');
    } catch (error) {
      setErr(error.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-400">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h3 className="text-xl mb-4">Reset Password</h3>

        {msg && <div className="text-green-600 mb-2">{msg}</div>}
        {err && <div className="text-red-600 mb-2">{err}</div>}

        <form onSubmit={submit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full border p-2 rounded mb-3"
          />
          <button className="w-full bg-sky-600 text-white p-2 rounded" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-4 text-sm">
          <Link to="/login" className="text-sky-700">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
