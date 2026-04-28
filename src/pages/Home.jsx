import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Sprout, ShieldCheck, TrendingUp, Handshake, ChevronRight } from 'lucide-react';

const Home = () => {
    const { isAuthenticated } = useAuth();
    
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    const features = [
        { icon: Handshake, title: "Sector Connections", desc: "Farmers connect with buyers, support programs, experts, and public initiatives." },
        { icon: ShieldCheck, title: "Verified Information", desc: "Admins manage schemes, reports, users, and platform content accuracy." },
        { icon: Sprout, title: "Expert Guidance", desc: "Agricultural experts publish practical advice for better crops and income." },
        { icon: TrendingUp, title: "Livelihood Growth", desc: "Marketplace listings, offers, schemes, and awareness content support farmer benefit." }
    ];

    return (
        <div className="animate-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
            {/* Hero Section */}
            <section style={{ 
                height: '80vh', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', 
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div className="glass-card" style={{ padding: '4rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '40px' }}>
                    <h1 style={{ 
                        fontSize: '4.5rem', 
                        lineHeight: 1, 
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 900
                    }}>
                        Nspire Farming Society
                    </h1>
                    <p style={{ 
                        fontSize: '1.5rem', 
                        color: 'var(--text-muted)', 
                        maxWidth: '700px', 
                        margin: '0 auto 3rem auto' 
                    }}>
                        Raising farming awareness and helping farmers improve their livelihood through resources, expert support, schemes, and sector connections.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/register" className="btn farmer-theme" style={{ padding: '1rem 2.5rem', fontSize: '1.2rem' }}>
                            Get Started <ChevronRight size={20} />
                        </Link>
                        <Link to="/login" className="btn" style={{ background: 'transparent', border: '1px solid var(--border)', padding: '1rem 2.5rem', fontSize: '1.2rem' }}>
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', padding: '4rem 0' }}>
                {features.map((f, i) => (
                    <div key={i} className="glass-card" style={{ padding: '2.5rem', textAlign: 'left' }}>
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            background: 'var(--surface)', 
                            borderRadius: '12px', 
                            display: 'grid', 
                            placeItems: 'center', 
                            marginBottom: '1.5rem',
                            color: 'var(--primary)'
                        }}>
                            <f.icon size={26} />
                        </div>
                        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>{f.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{f.desc}</p>
                    </div>
                ))}
            </section>

            {/* Footer */}
            <footer style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', marginTop: '4rem' }}>
                <p>© 2026 Nspire Farming Society Platform. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
