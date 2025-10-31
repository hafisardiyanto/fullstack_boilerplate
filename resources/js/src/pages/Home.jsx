import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div style={{padding:20}}>
      <h2>Welcome, {user?.name || user?.email}</h2>
      <button onClick={logout} className="btn btn-outline-secondary">Logout</button>
    </div>
  );
}
