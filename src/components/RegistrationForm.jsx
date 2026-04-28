import React, { useState } from 'react';
import { UserPlus, Shield, UserCircle, Leaf } from 'lucide-react';
import axios from 'axios';

const ROLE_OPTIONS = [
  { id: 'FARMER', label: 'Farmer', icon: <Leaf size={24} />, desc: 'Add crops and track your market.' },
  { id: 'PUBLIC', label: 'Public Buyer', icon: <UserCircle size={24} />, desc: 'Browse the market and learn.' },
  { id: 'EXPERT', label: 'Farming Expert', icon: <UserPlus size={24} />, desc: 'Provide tips and guidance.' },
  { id: 'ADMIN', label: 'Admin', icon: <Shield size={24} />, desc: 'Manage the platform.' }
];

const RegistrationForm = ({ onRegister }) => {
  const [role, setRole] = useState('FARMER');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!username) return;
    setLoading(true);

    try {
      // Create user entry
      const res = await axios.post("http://localhost:8080/users", {
        username: username,
        password: "defaultPassword123", // Simplified for demo
        role: role
      });

      // If user is expert, generate a blank expert profile too
      if (role === 'EXPERT') {
         await axios.post("http://localhost:8080/experts", {
             user: { id: res.data.id },
             qualification: "Pending",
             fieldOfExpertise: "General Agriculture",
             bio: "A highly passionate farming expert joining the community."
         });
      }

      onRegister({ ...res.data });
    } catch (err) {
      console.error(err);
      alert("Registration failed. Start the backend!");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', margin: '4rem auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Welcome to AgriConnect</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Select your role in our ecosystem to continue.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Choose Your Role</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {ROLE_OPTIONS.map((r) => (
              <div 
                key={r.id}
                onClick={() => setRole(r.id)}
                style={{
                  padding: '1rem',
                  border: `2px solid ${role === r.id ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  background: role === r.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ color: role === r.id ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {r.icon}
                </div>
                <h4 style={{ marginBottom: '0.25rem' }}>{r.label}</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '2rem' }}>
          <label htmlFor="username">Choose a Username</label>
          <input 
            type="text" 
            id="username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. jdoe23"
            required
          />
        </div>

        <button type="submit" className="btn" style={{ marginTop: '1rem' }} disabled={loading}>
          {loading ? 'Entering ecosystem...' : 'Join Platform'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
