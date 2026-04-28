import React, { useState, useEffect } from 'react';
import { 
    Send, 
    BookOpen, 
    MessageSquare, 
    Trash2, 
    CheckCircle,
    Loader2,
    Users
} from 'lucide-react';
import { 
    getSuggestions, 
    postSuggestion, 
    deleteSuggestion 
} from '../services/api';
import { useAuth } from '../AuthContext';

const ExpertDashboard = () => {
    const { user } = useAuth();
    const [suggestions, setSuggestions] = useState([]);
    const [newSuggestion, setNewSuggestion] = useState("");
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        setLoading(true);
        try {
            const res = await getSuggestions();
            setSuggestions(res.data);
        } catch (err) {
            console.error("Fetch failed", err);
        }
        setLoading(false);
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!newSuggestion.trim()) return;
        setPosting(true);
        try {
            await postSuggestion({ advice: newSuggestion, expertName: user.username });
            setNewSuggestion("");
            fetchSuggestions();
            alert("Advice broadcasted successfully!");
        } catch (err) {
            alert("Failed to post advice.");
        }
        setPosting(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this suggestion?")) {
            await deleteSuggestion(id);
            fetchSuggestions();
        }
    };

    return (
        <div className="expert-theme">
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={16} /> Total Advice Shared
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{suggestions.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> Active Farmers
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>GLOBAL REACH</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} /> Expert Status
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6' }}>CERTIFIED</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
                {/* Advice Broadcasting Hub */}
                <section>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Send size={24} color="#8b5cf6" /> Broadcast New Advice
                    </h3>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <form onSubmit={handlePost}>
                            <div className="form-group">
                                <label style={{ marginBottom: '1rem', display: 'block' }}>Write your agricultural guidance for the community</label>
                                <textarea 
                                    className="form-input" 
                                    style={{ minHeight: '150px', resize: 'vertical' }}
                                    placeholder="e.g. Current weather patterns suggest a high risk of fungal infections in wheat crops. Recommend using organic fungicides."
                                    required
                                    value={newSuggestion}
                                    onChange={(e) => setNewSuggestion(e.target.value)}
                                />
                            </div>
                            <button type="submit" disabled={posting} className="btn" style={{ background: '#8b5cf6', width: 'auto', padding: '0.8rem 2rem' }}>
                                {posting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {posting ? 'Broadcasting...' : 'Share with Farmers'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* History Section */}
                <aside>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BookOpen size={24} color="var(--text-muted)" /> Advice History
                    </h3>
                    <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                        {loading ? <Loader2 size={32} className="animate-spin" /> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {suggestions.map(s => (
                                    <div key={s.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', position: 'relative' }}>
                                        <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>" {s.advice} "</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Posted by: {s.expertName || 'System'}</span>
                                            <button onClick={() => handleDelete(s.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {suggestions.length === 0 && (
                                    <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>You haven't shared any advice yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default ExpertDashboard;
