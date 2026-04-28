import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { getReports, resolveReport } from '../services/api';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(null);

    useEffect(() => { fetchReports(); }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await getReports();
            setReports(res.data);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        }
        setLoading(false);
    };

    const handleResolve = async (id) => {
        setResolving(id);
        try {
            await resolveReport(id);
            fetchReports();
        } catch (err) {
            alert('Failed to resolve report.');
        }
        setResolving(null);
    };

    const pending = reports.filter(r => r.status === 'PENDING');
    const resolved = reports.filter(r => r.status !== 'PENDING');

    return (
        <div className="admin-theme">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>Moderation Center</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Review and resolve user-submitted reports</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={14} /> Total Reports</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{reports.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldAlert size={14} /> Pending</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>{pending.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={14} /> Resolved</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{resolved.length}</div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" color="#ef4444" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Pending */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={20} /> Pending ({pending.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pending.length === 0 ? (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <CheckCircle size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>Platform is clean! No open reports.</p>
                                </div>
                            ) : pending.map(r => (
                                <div key={r.id} className="glass-card animate-up" style={{ padding: '1.5rem', borderLeft: '3px solid #ef4444' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.9rem' }}>Report #{r.id}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Product #{r.productId}</span>
                                    </div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>"{r.reason}"</p>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button onClick={() => handleResolve(r.id)} disabled={resolving === r.id} className="btn" style={{ flex: 1, padding: '0.5rem', background: 'var(--primary)' }}>
                                            {resolving === r.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Resolve
                                        </button>
                                        <button className="btn" style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>
                                            <Trash2 size={14} /> Dismiss
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Resolved */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={20} /> Resolved ({resolved.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {resolved.length === 0 ? (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No resolved reports yet.</p>
                                </div>
                            ) : resolved.map(r => (
                                <div key={r.id} className="glass-card" style={{ padding: '1.25rem', opacity: 0.7, borderLeft: '3px solid var(--primary)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Report #{r.id}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <CheckCircle size={12} /> {r.status}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>"{r.reason}"</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
