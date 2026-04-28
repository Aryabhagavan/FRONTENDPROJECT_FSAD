import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'BUYER'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!formData.email.endsWith('@gmail.com')) {
            setError('Only @gmail.com IDs are allowed!');
            return;
        }

        setLoading(true);
        const res = await register(formData);
        if (res.success) {
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    const roles = [
        { value: 'BUYER', label: 'Public', description: 'Explore farming content, schemes, discussions, and crop opportunities.' },
        { value: 'FARMER', label: 'Farmer', description: 'Sell your harvest and get expert advice.' },
        { value: 'EXPERT', label: 'Farming Expert', description: 'Provide guidance to our agricultural community.' },
        { value: 'ADMIN', label: 'Administrator', description: 'Maintain security and platform integrity.' }
    ];

    return (
        <div className="animate-up" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '2rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Join Nspire Farming</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Empowering the future of agriculture</p>
                </div>

                {error && (
                    <div style={{ 
                        display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem', 
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid #ef444455',
                        borderRadius: '8px', marginBottom: '2rem' 
                    }}>
                        <AlertCircle size={18} /> <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="username"
                            required
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Email Address (@gmail.com only)</label>
                        <input 
                            type="email" 
                            className="form-input" 
                            placeholder="john@gmail.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Choose Your Role</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                            {roles.map(role => (
                                <div 
                                    key={role.value}
                                    onClick={() => setFormData({ ...formData, role: role.value })}
                                    style={{ 
                                        padding: '1rem', 
                                        borderRadius: '12px', 
                                        border: '1px solid',
                                        borderColor: formData.role === role.value ? 'var(--primary)' : 'var(--border)',
                                        background: formData.role === role.value ? 'var(--primary-glow)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)'
                                    }}
                                >
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: formData.role === role.value ? 'var(--primary)' : 'var(--text-main)' }}>{role.label}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{role.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '2rem' }}>
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="********"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn farmer-theme" style={{ width: '100%', marginTop: '1rem' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={18} />} 
                        {loading ? 'Processing...' : 'Create Account'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Already part of the community? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
