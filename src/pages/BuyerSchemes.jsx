import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2, ExternalLink, Tag, ChevronRight } from 'lucide-react';
import { getSchemes } from '../services/api';

const BuyerSchemes = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSchemes = async () => {
            setLoading(true);
            try {
                const res = await getSchemes();
                setSchemes(res.data);
            } catch (err) {
                console.error('Failed to fetch schemes', err);
            }
            setLoading(false);
        };
        fetchSchemes();
    }, []);

    const categoryColor = {
        LOAN: '#3b82f6',
        SUBSIDY: 'var(--primary)',
        INSURANCE: '#8b5cf6',
        TRAINING: '#f59e0b',
    };

    return (
        <div className="buyer-theme">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>Government Schemes</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Explore subsidies, loans, and support programs available to you
                </p>
            </div>

            {/* Hero banner */}
            <div className="glass-card" style={{
                padding: '2rem',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(52,211,153,0.12))',
                borderLeft: '4px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <BookOpen size={56} color="var(--accent)" />
                <div>
                    <h3 style={{ marginBottom: '0.4rem' }}>Stay Informed, Stay Ahead</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                        The government regularly publishes new agricultural schemes. Check back often to take advantage of subsidies, crop insurance, and financial aid programs.
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--accent)" />
                </div>
            ) : schemes.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <BookOpen size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No schemes published yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Admins will post available government programs here.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {schemes.map((s, idx) => (
                        <div key={s.id || idx} className="glass-card animate-up" style={{ padding: '1.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <span style={{
                                    padding: '0.3rem 0.8rem', borderRadius: '20px',
                                    background: `${categoryColor[s.category] || '#6b7280'}22`,
                                    color: categoryColor[s.category] || '#6b7280',
                                    fontSize: '0.75rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                                }}>
                                    <Tag size={10} /> {s.category || 'GENERAL'}
                                </span>
                            </div>
                            <h3 style={{ marginBottom: '0.75rem', fontSize: '1.1rem' }}>{s.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                {s.description}
                            </p>
                            {s.eligibility && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <strong>Eligibility:</strong> {s.eligibility}
                                </div>
                            )}
                            {s.link && (
                                <a href={s.link} target="_blank" rel="noreferrer"
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                                    <ExternalLink size={14} /> Learn More <ChevronRight size={14} />
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BuyerSchemes;
