import React, { useState, useEffect } from 'react';
import { MessageCircle, Check, X, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { getFarmerProducts, getOffersByProduct, updateOfferStatus } from '../services/api';
import { useAuth } from '../AuthContext';

const FarmerOffers = () => {
    const { user } = useAuth();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);

    useEffect(() => { fetchAllOffers(); }, []);

    const fetchAllOffers = async () => {
        setLoading(true);
        try {
            const pRes = await getFarmerProducts(user.username);
            const allOffers = [];
            for (const p of pRes.data) {
                const oRes = await getOffersByProduct(p.id);
                allOffers.push(...oRes.data.map(o => ({ ...o, productName: p.name, productPrice: p.price })));
            }
            setOffers(allOffers);
        } catch (err) {
            console.error('Failed to fetch offers', err);
        }
        setLoading(false);
    };

    const handleStatus = async (id, status) => {
        setUpdating(id);
        try {
            await updateOfferStatus(id, status);
            fetchAllOffers();
        } catch (err) {
            alert('Failed to update offer status.');
        }
        setUpdating(null);
    };

    const statusIcon = { PENDING: <Clock size={14} />, ACCEPTED: <CheckCircle size={14} />, REJECTED: <XCircle size={14} /> };
    const statusColor = { PENDING: '#f59e0b', ACCEPTED: 'var(--primary)', REJECTED: '#ef4444' };

    const pending = offers.filter(o => o.status === 'PENDING');
    const resolved = offers.filter(o => o.status !== 'PENDING');

    return (
        <div className="farmer-theme">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>Negotiation Hub</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{pending.length} pending offer{pending.length !== 1 ? 's' : ''} awaiting your response</p>
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Pending Offers */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                            <Clock size={20} /> Pending ({pending.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pending.length === 0 ? (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <MessageCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                                    <p style={{ color: 'var(--text-muted)' }}>No pending offers right now.</p>
                                </div>
                            ) : pending.map(o => (
                                <div key={o.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid #f59e0b' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{o.offeredPrice}/kg</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Listed at ₹{o.productPrice}/kg</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{o.productName}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {o.quantity} kg</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={() => handleStatus(o.id, 'ACCEPTED')}
                                            disabled={updating === o.id}
                                            className="btn"
                                            style={{ flex: 1, background: 'var(--primary)', padding: '0.6rem' }}
                                        >
                                            {updating === o.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Accept
                                        </button>
                                        <button
                                            onClick={() => handleStatus(o.id, 'REJECTED')}
                                            disabled={updating === o.id}
                                            className="btn"
                                            style={{ flex: 1, background: '#ef4444', padding: '0.6rem' }}
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Resolved Offers */}
                    <section>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <CheckCircle size={20} /> History ({resolved.length})
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {resolved.length === 0 ? (
                                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--text-muted)' }}>No resolved offers yet.</p>
                                </div>
                            ) : resolved.map(o => (
                                <div key={o.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: `3px solid ${statusColor[o.status]}`, opacity: 0.8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>₹{o.offeredPrice}/kg</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.productName} · {o.quantity} kg</div>
                                        </div>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: statusColor[o.status], fontSize: '0.85rem', fontWeight: 600 }}>
                                            {statusIcon[o.status]} {o.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default FarmerOffers;
