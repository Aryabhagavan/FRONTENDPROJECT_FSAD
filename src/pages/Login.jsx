import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await login(credentials);
        if (res.success) {
            navigate('/dashboard'); // Common entry point that will redirect based on role
        } else {
            setError(res.message);
        }
        setLoading(false);
    };

    return (
        <div className="animate-up" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '1rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Login to Nspire Farming Society</p>
                </div>

                {error && (
                    <div style={{ 
                        display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem', 
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem' 
                    }}>
                        <AlertCircle size={18} /> <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Username</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="johndoe"
                            required
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="********"
                            required
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn buyer-theme" style={{ width: '100%' }}>
                        {loading ? <Loader2 className="animate-spin" /> : <LogIn size={18} />} 
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create one</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
