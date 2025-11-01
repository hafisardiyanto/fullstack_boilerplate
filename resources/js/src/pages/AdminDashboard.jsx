import React, { useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import '../AdminDashboard.css';

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: '',
    password_confirmation: ''
  });

  const [errors, setErrors] = useState({});

  // =====================
  // FETCH USERS
  // =====================
  // =====================
// FETCH USERS
// =====================
const fetchUsers = async () => {
  setLoading(true);
  try {
    const res = await api.get('/api/admin/users');
    // lihat bentuk data yang dikembalikan backend
    console.log('GET /api/admin/users response.data =', res.data);

    // Jika backend pakai paginate -> data berada di res.data.data (array)
    // Jika backend langsung return array -> res.data adalah array
    const usersArray = Array.isArray(res.data.data)
      ? res.data.data
      : Array.isArray(res.data)
        ? res.data
        : [];

    setUsers(usersArray);
  } catch (e) {
    console.error('fetchUsers error:', e);
    // optional: tampilkan pesan singkat ke user
    // alert(e.response?.data?.message || 'Gagal memuat data user');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================
  // HANDLE FORM
  // =====================
  const openNewForm = () => {
    setSelectedUser(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      password: '',
      password_confirmation: ''
    });
    setShowForm(true);
  };

  const openEditForm = (u) => {
    setSelectedUser(u);
    setForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      password: '',
      password_confirmation: ''
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      if (selectedUser) {
        // UPDATE USER
        const payload = {
          name: form.name,
          phone: form.phone,
          role: form.role,
        };
        if (form.password) {
          payload.password = form.password;
          payload.password_confirmation = form.password_confirmation;
        }

        await api.put(`/api/admin/users/${selectedUser.id}`, payload);
      } else {
        // CREATE NEW USER
        await api.post('/api/admin/users', form);
      }

      fetchUsers();
      setShowForm(false);
      setSelectedUser(null);
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    }
  };

  // =====================
  // DELETE USER
  // =====================
  const deleteUser = async (u) => {
    if (!window.confirm(`Hapus user ${u.email}?`)) return;

    try {
      await api.delete(`/api/admin/users/${u.id}`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.message || 'Gagal hapus');
    }
  };

  return (
    <div className="admin-root">
      {/* ========== SIDEBAR ========== */}
      <aside className="sidebar">
        <div className="brand">Admin Panel</div>

        <button
          className={`sb-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveMenu('dashboard')}
        >
          Dashboard
        </button>

        <div className="sb-dropdown">
          <button
            className={`sb-item ${activeMenu === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveMenu(activeMenu === 'settings' ? '' : 'settings')}
          >
            Settings ▾
          </button>

          {activeMenu === 'settings' && (
            <div className="sb-sub">
              <button
                className="sb-subitem"
                onClick={() => setActiveMenu('users')}
              >
                User Management
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========== MAIN ========== */}
      <main className="main">
        {activeMenu === 'dashboard' && (
          <div className="box">
            <h2>Dashboard</h2>
            <p>Welcome, Admin.</p>
          </div>
        )}

        {activeMenu === 'users' && (
          <div className="box">
            <h2>User Management</h2>

            <button className="btn" onClick={openNewForm}>+ User Baru</button>

            {/* ===================== TABLE LIST USER ===================== */}
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="5">Loading...</td></tr>
                ) : users.length ? (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>
                        <button className="btn small" onClick={() => openEditForm(u)}>Edit</button>
                        <button className="btn small danger" onClick={() => deleteUser(u)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5">No users</td></tr>
                )}
              </tbody>
            </table>

            {/* ===================== FORM POPUP ===================== */}
            {showForm && (
              <div className="form-popup">
                <div className="form-box">
                  <h3>{selectedUser ? 'Edit User' : 'User Baru'}</h3>

                  <form onSubmit={submitForm}>
                    <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                    {errors.name && <p className="err">{errors.name[0]}</p>}

                    <input name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={!!selectedUser}/>
                    {errors.email && <p className="err">{errors.email[0]}</p>}

                    <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />

                    <select name="role" value={form.role} onChange={handleChange}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>

                    <input type="password" name="password" placeholder="Password (opsional)" value={form.password} onChange={handleChange} />
                    {errors.password && <p className="err">{errors.password[0]}</p>}

                    <input type="password" name="password_confirmation" placeholder="Konfirmasi Password" value={form.password_confirmation} onChange={handleChange} />

                    <div className="actions">
                      <button type="submit" className="btn">Simpan</button>
                      <button type="button" className="btn secondary" onClick={() => setShowForm(false)}>Batal</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
