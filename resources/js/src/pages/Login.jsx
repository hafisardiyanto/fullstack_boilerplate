import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../App.css';

// Jika pakai Vite import asset:
// import googleLogo from '../assets/google-logo.svg';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email:'', password:'', remember:false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(form.email, form.password, form.remember);

      // redirect based on user role
      if (user?.role === 'admin') navigate('/admin');        // atau '/admin/dashboard'
      else navigate('/dashboard');                            // atau '/user/dashboard'
    } catch (err) {
      setError(err.response?.data?.message || 'Login Gagal');
    } finally { setLoading(false); }
  };

  const handleGoogle = () => {
  // baca dari env (sesuaikan VITE_API_URL di .env)
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // redirect user ke backend yang meng-handle Socialite Google redirect
  window.location.href = `${API}/auth/google/redirect`;
};

  return (
    <div style={{display:'flex', justifyContent:'center'}}>
      <div className="outer-outline">
        <div className="login-box">
          <div className="form-frame">
            <h2 className="login-title">Login</h2>

            {error && <div style={{color:'#ef4444', marginBottom:8}}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="email" style={{fontSize:14, display:'block', marginBottom:6}}>Email</label>
              <input id="email" name="email" type="email" value={form.email}
                onChange={handleChange} className="login-input" required />

              <label htmlFor="password" style={{fontSize:14, display:'block', marginBottom:6}}>Password</label>
              <input id="password" name="password" type="password" value={form.password}
                onChange={handleChange} className="login-input" required />

              <div className="checkbox-row">
                <input id="remember" name="remember" type="checkbox" checked={form.remember} onChange={handleChange} />
                <label htmlFor="remember">Remember me</label>
                <div style={{marginLeft:'auto'}}><Link to="/forgot-password" style={{color:'#0369a1'}}>Forgot password?</Link></div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

          <div className="google-login-container">
  <button type="button" className="google-login-btn" onClick={handleGoogle}>
    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="google-icon"/>
    <span>Masuk dengan Google</span>
  </button>
</div>



          <div className="small-note">
            Belum punya akun? <Link to="/Register" style={{color:'#1d4ed8'}}>Daftar</Link>
          </div>

        </div>
      </div>
    </div>
    </div>
  );
}
