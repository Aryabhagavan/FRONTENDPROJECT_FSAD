import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Loader2, Tag, Save } from 'lucide-react';
import { getSchemes, addScheme, deleteScheme } from '../services/api';

const AdminSchemes = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newScheme, setNewScheme] = useState({ name: '', description: '', category: 'SUBSIDY', eligibility: '', link: '' });

    useEffect(() => { fetchSchemes(); }, []);

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

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addScheme(newScheme);
            setNewScheme({ name: '', description: '', category: 'SUBSIDY', eligibility: '', link: '' });
            setShowForm(false);
            fetchSchemes();
        } catch (err) {
            alert('Failed to add scheme.');
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Remove this scheme from the platform?')) {
            await deleteScheme(id);
            fetchSchemes();
        }
    };

    const categoryColor = { LOAN: '#3b82f6', SUBSIDY: 'var(--primary)', INSURANCE: '#8b5cf6', TRAINING: '#f59e0b' };

    return (
        <div className="admin-theme">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.25rem' }}>Scheme Management</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{schemes.length} active government schemes</p>
                </div>
                <button className="btn" onClick={() => setShowForm(true)} style={{ background: 'var(--accent)' }}>
                    <Plus size={18} /> Add Scheme
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" />
                </div>
            ) : schemes.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <BookOpen size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No schemes yet</h3>
                    <button className="btn" onClick={() => setShowForm(true)} style={{ marginTop: '1rem' }}><Plus size={18} /> Add First Scheme</button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {schemes.map(s => (
                        <div key={s.id} className="glass-card animate-up" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', background: `${categoryColor[s.category] || '#6b7280'}22`, color: categoryColor[s.category] || '#6b7280', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Tag size={10} /> {s.category || 'GENERAL'}
                                    </span>
                                    <h4 style={{ fontWeight: 700 }}>{s.name}</h4>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{s.description}</p>
                                {s.eligibility && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}><strong>Eligibility:</strong> {s.eligibility}</p>}
                            </div>
                            <button onClick={() => handleDelete(s.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', marginLeft: '1rem', flexShrink: 0 }}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Scheme Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
                    <div className="glass-card animate-up" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>Add Government Scheme</h2>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Scheme Name</label>
                                <input className="form-input" required value={newScheme.name} placeholder="e.g. PM-KISAN Subsidy 2024" onChange={e => setNewScheme({ ...newScheme, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea className="form-input" required rows={3} value={newScheme.description} placeholder="Describe the benefits and purpose..." onChange={e => setNewScheme({ ...newScheme, description: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select className="form-input" value={newScheme.category} onChange={e => setNewScheme({ ...newScheme, category: e.target.value })}>
                                        <option value="SUBSIDY">Subsidy</option>
                                        <option value="LOAN">Loan</option>
                                        <option value="INSURANCE">Insurance</option>
                                        <option value="TRAINING">Training</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Link (optional)</label>
                                    <input className="form-input" type="url" value={newScheme.link} placeholder="https://..." onChange={e => setNewScheme({ ...newScheme, link: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Eligibility Criteria</label>
                                <input className="form-input" value={newScheme.eligibility} placeholder="e.g. All small and marginal farmers" onChange={e => setNewScheme({ ...newScheme, eligibility: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 2 }} disabled={submitting}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {submitting ? 'Publishing...' : 'Publish Scheme'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSchemes;
