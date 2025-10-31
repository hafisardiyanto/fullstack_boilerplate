import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../Registe.css'; // file regis css

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user',        // default
    admin_code: ''       // optional
  });

  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const clientValidate = () => {
    const e = {};
    if (!form.name.trim()) e.name = ['Name is required'];
    if (!form.email.trim()) e.email = ['Email is required'];
    if (!form.password) e.password = ['Password is required'];
    else if (form.password.length < 8) e.password = ['Password must be at least 8 characters'];
    if (form.password !== form.password_confirmation) e.password_confirmation = ['Password confirmation does not match'];
    // optional: require admin_code on client if role admin and you want to enforce input
    // if (form.role === 'admin' && !form.admin_code.trim()) e.admin_code = ['Admin code is required'];
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setErrors({});
    const clientErrors = clientValidate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      // if using Sanctum cookie flow
      await api.get('/sanctum/csrf-cookie');

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        role: form.role === 'admin' ? 'admin' : 'user',
        ...(form.role === 'admin' ? { admin_code: form.admin_code } : {})
      };

      const res = await api.post('/api/register', payload);

      setMsg(res.data?.message || 'Terdaftar. Cek email Anda untuk notifikasi.');
      // optional: if backend returns created user, you can show more info
      setTimeout(() => nav('/login'), 1500);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setMsg(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register</h2>
        {msg && <div className="msg">{msg}</div>}

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          {errors.name && <div className="error">{errors.name[0]}</div>}

          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          {errors.email && <div className="error">{errors.email[0]}</div>}

          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
          {errors.password && <div className="error">{errors.password[0]}</div>}

          <input name="password_confirmation" type="password" placeholder="Confirm password" value={form.password_confirmation} onChange={handleChange} />
          {errors.password_confirmation && <div className="error">{errors.password_confirmation[0]}</div>}

          <label style={{display: 'block', marginTop: '8px'}}>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <small style={{ display:'block', color:'#666', marginTop:6 }}>
            Note: jika udah  mempunyai role maka harus menrima code & jika mempunyai role admin maka diterima.
          </small>

          {form.role === 'admin' && (
            <>
              <input
                name="admin_code"
                type="text"
                placeholder="Admin registration code (if required)"
                value={form.admin_code}
                onChange={handleChange}
                style={{ marginTop: 8 }}
              />
              {errors.admin_code && <div className="error">{errors.admin_code[0]}</div>}
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Daftar'}
          </button>
        </form>
      </div>
    </div>
  );
}
