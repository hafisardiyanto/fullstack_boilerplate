import React, { useEffect, useState } from 'react';
import api from '../utils/api';

// simple admin UI without external libs
export default function AdminDashboard(){
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  // form for creating user
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'user', phone:'' });
  const [editing, setEditing] = useState(null); // id when editing

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/users', { params: { page, q } });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ fetchUsers(); }, [page, q]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/api/admin/users/${editing}`, form);
        setEditing(null);
      } else {
        await api.post('/api/admin/users', form);
      }
      setForm({ name:'', email:'', password:'', role:'user', phone:'' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleEditClick = async (id) => {
    try {
      const res = await api.get(`/api/admin/users/${id}`);
      const u = res.data;
      setForm({ name:u.name, email:u.email, password:'', role:u.role, phone:u.phone || '' });
      setEditing(id);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete user?')) return;
    await api.delete(`/api/admin/users/${id}`);
    fetchUsers();
  };

  return (
    <div style={{padding:20}}>
      <h2>Admin Dashboard — Users</h2>

      <div style={{display:'flex', gap:10, marginBottom:10}}>
        <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} />
        <button onClick={()=>fetchUsers()}>Search</button>
      </div>

      <div style={{display:'flex', gap:20}}>
        <div style={{flex:1}}>
          <h3>User list</h3>
          {loading ? <div>Loading...</div> : (
            <table border="1" cellPadding="8" style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.data?.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <button onClick={()=>handleEditClick(u.id)}>Edit</button>
                      <button onClick={()=>handleDelete(u.id)}>Delete</button>
                    </td>
                  </tr>
                )) || <tr><td colSpan="5">No users</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        <div style={{width:320}}>
          <h3>{editing ? 'Edit user' : 'Create user'}</h3>
          <form onSubmit={handleCreateOrUpdate}>
            <div><input name="name" placeholder="Name" value={form.name} onChange={handleChange} required/></div>
            <div><input name="email" placeholder="Email" value={form.email} onChange={handleChange} required/></div>
            <div><input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} /></div>
            <div>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div><input name="password" placeholder="Password (optional)" value={form.password} onChange={handleChange} /></div>
            <div>
              <button type="submit">{editing ? 'Update' : 'Create'}</button>
              {editing && <button type="button" onClick={()=>{ setEditing(null); setForm({name:'',email:'',password:'',role:'user',phone:''}) }}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
