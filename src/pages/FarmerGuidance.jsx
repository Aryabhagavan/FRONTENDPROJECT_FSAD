import React, { useState, useEffect } from 'react';
import { Megaphone, BookOpen, Loader2, TrendingUp } from 'lucide-react';
import { getSuggestions } from '../services/api';

const FarmerGuidance = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const res = await getSuggestions();
                setSuggestions(res.data);
            } catch (err) {
                console.error('Failed to fetch guidance', err);
            }
            setLoading(false);
        };
        fetchSuggestions();
    }, []);

    return (
        <div className="farmer-theme">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>Expert Guidance</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Latest agricultural advice from certified farming experts</p>
            </div>

            {/* Stats card */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                <TrendingUp size={48} color="var(--primary)" />
                <div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{suggestions.length}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active guidance tips from field experts</div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                </div>
            ) : suggestions.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <BookOpen size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No guidance posted yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Check back soon — farming experts will post tips here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {suggestions.map((s, idx) => (
                        <div key={s.id || idx} className="glass-card animate-up" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                    background: 'var(--primary-glow)', display: 'grid', placeItems: 'center'
                                }}>
                                    <Megaphone size={20} color="var(--primary)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '1rem', lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '1rem' }}>
                                        "{s.advice}"
                                    </p>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600 }}>
                                            Expert
                                        </span>
                                        {s.expertName || 'AgriConnect Expert'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FarmerGuidance;
