import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import '../UserDashboard.css'; // pastikan path benar

export default function UserDashboard() {
  const { user, setUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Sidebar state
  const [openSettings, setOpenSettings] = useState(false);
  const [activePage, setActivePage] = useState('profile'); // which main page to show
  // Tabs in My Profile
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

  // Profile form
  const [form, setForm] = useState({ name:'', email:'', phone:'' });
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [saving, setSaving] = useState(false);

  // Password form
  const [pwd, setPwd] = useState({ current_password:'', password:'', password_confirmation:'' });
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
  }, [user]);

  // handle profile field change
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Save profile
  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null); setErr(null);
    try {
      const res = await api.put('/api/user', { name: form.name, phone: form.phone });
      // backend should return updated user
      const updated = res.data.data || res.data;
      setUser(updated);
      setMsg('Profile updated');
    } catch (error) {
      setErr(error.response?.data?.message || 'Error updating profile');
    } finally { setSaving(false); }
  };

  // Change password
  const changePassword = async (e) => {
    e.preventDefault();
    setChangingPwd(true); setMsg(null); setErr(null);
    try {
      await api.put('/api/user/password', pwd);
      setMsg('Password changed');
      setPwd({ current_password:'', password:'', password_confirmation:'' });
    } catch (error) {
      // backend should return 422/400 with message or errors
      const data = error.response?.data;
      setErr(data?.message || (data?.errors ? Object.values(data.errors).flat().join(', ') : 'ganti password gagal'));
    } finally { setChangingPwd(false); }
  };

  // Logout action
  const doLogout = async () => {
    try {
      await logout(); // from AuthContext
      navigate('/login');
    } catch (e) {
      // still navigate to login if logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/login');
    }
  };

  if (!user) return <div className="ud-loading">Loading...</div>;

  return (
    <div className="ud-root">
      <aside className="ud-sidebar">
        <div className="ud-brand">MyApp</div>

        <nav className="ud-nav">
          <button
            className={`ud-nav-item ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => { setActivePage('home'); setActiveTab('profile'); }}
          >
            Home
          </button>

          <div className="ud-nav-group">
            <button
              className="ud-nav-item ud-dropdown-toggle"
              onClick={() => setOpenSettings(prev => !prev)}
            >
              Settings
              <span className={`ud-caret ${openSettings ? 'open' : ''}`}>▾</span>
            </button>

            {openSettings && (
              <div className="ud-submenu">
                <button className="ud-subitem" onClick={() => { setActivePage('profile'); setActiveTab('profile'); }}>
                  My Profile
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="ud-sidebar-bottom">
          <div className="ud-userinfo">
            <div className="ud-user-name">{user.name}</div>
            <div className="ud-user-email">{user.email}</div>
          </div>
          <button className="ud-logout-btn" onClick={doLogout}>Logout</button>
        </div>
      </aside>

      <main className="ud-main">
        <header className="ud-header">
          <h1>{activePage === 'home' ? 'Dashboard' : 'My Profile'}</h1>
        </header>

        <section className="ud-content">
          {activePage === 'home' && (
            <div>
              <h2>Welcome, {user.name}!</h2>
              <p>Role: <strong>{user.role}</strong></p>
              <p>Use the sidebar to access Settings and Profile.</p>
            </div>
          )}

          {activePage === 'profile' && (
            <div className="ud-profile">
              <div className="ud-tabs">
                <button
                  className={`ud-tab ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >Profile</button>
                <button
                  className={`ud-tab ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >Change Password</button>
              </div>

              <div className="ud-tab-content">
                {msg && <div className="ud-msg success">{msg}</div>}
                {err && <div className="ud-msg error">{err}</div>}

                {activeTab === 'profile' && (
                  <form onSubmit={saveProfile} className="ud-form">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={handleChange} />

                    <label>Email (readonly)</label>
                    <input name="email" value={form.email} readOnly />

                    <label>Phone</label>
                    <input name="phone" value={form.phone} onChange={handleChange} />

                    <div>
                      <button type="submit" className="ud-btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save profile'}
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'password' && (
                  <form onSubmit={changePassword} className="ud-form">
                    <label>Current password</label>
                    <input type="password" placeholder="Current password" name="current_password"
                      value={pwd.current_password} onChange={e => setPwd({...pwd, current_password: e.target.value})} required />

                    <label>New password</label>
                    <input type="password" placeholder="New password" name="password"
                      value={pwd.password} onChange={e => setPwd({...pwd, password: e.target.value})} required />

                    <label>Confirm new password</label>
                    <input type="password" placeholder="Confirm new password" name="password_confirmation"
                      value={pwd.password_confirmation} onChange={e => setPwd({...pwd, password_confirmation: e.target.value})} required />

                    <div>
                      <button className="ud-btn" type="submit" disabled={changingPwd}>
                        {changingPwd ? 'Changing...' : 'Change password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
