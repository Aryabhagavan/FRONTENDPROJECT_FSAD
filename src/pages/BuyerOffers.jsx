import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, CheckCircle, XCircle, Loader2, PackageOpen } from 'lucide-react';
import { getOffersByBuyer } from '../services/api';
import { useAuth } from '../AuthContext';

const BuyerOffers = () => {
    const { user } = useAuth();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            try {
                const res = await getOffersByBuyer(user.id);
                setOffers(res.data);
            } catch (err) {
                console.error('Failed to fetch offers', err);
            }
            setLoading(false);
        };
        fetchOffers();
    }, []);

    const statusConfig = {
        PENDING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: <Clock size={16} />,        label: 'Pending'  },
        ACCEPTED: { color: 'var(--primary)', bg: 'var(--primary-glow)', icon: <CheckCircle size={16} />, label: 'Accepted' },
        REJECTED: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: <XCircle size={16} />,      label: 'Rejected' },
    };

    const pending  = offers.filter(o => o.status === 'PENDING');
    const accepted = offers.filter(o => o.status === 'ACCEPTED');
    const rejected = offers.filter(o => o.status === 'REJECTED');

    return (
        <div className="buyer-theme">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>My Offers</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track all your price negotiations in one place</p>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Pending',  count: pending.length,  color: '#f59e0b' },
                    { label: 'Accepted', count: accepted.length, color: 'var(--primary)' },
                    { label: 'Rejected', count: rejected.length, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{s.label}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--accent)" />
                </div>
            ) : offers.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <PackageOpen size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No offers yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Go to the Marketplace and start negotiating!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {offers.map(o => {
                        const cfg = statusConfig[o.status] || statusConfig.PENDING;
                        return (
                            <div key={o.id} className="glass-card animate-up" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${cfg.color}` }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <ShoppingBag size={18} color={cfg.color} />
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{o.offeredPrice}/kg</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Quantity: {o.quantity} kg &nbsp;·&nbsp; Product ID: #{o.productId}
                                    </div>
                                </div>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', borderRadius: '20px', background: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: '0.85rem' }}>
                                    {cfg.icon} {cfg.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BuyerOffers;
