import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Filter, 
    DollarSign, 
    ShoppingBag, 
    ShieldAlert, 
    MessageCircle,
    Loader2
} from 'lucide-react';
import { 
    getProducts, 
    getProductsByCategory, 
    createOffer, 
    getOffersByBuyer, 
    createReport 
} from '../services/api';
import { useAuth } from '../AuthContext';

const BuyerMarketplace = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [myOffers, setMyOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [showOfferModal, setShowOfferModal] = useState(null);
    const [offerData, setOfferData] = useState({ offeredPrice: '', quantity: '' });

    useEffect(() => {
        fetchProducts();
        fetchMyOffers();
    }, [selectedCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = selectedCategory === 'ALL' 
                ? await getProducts() 
                : await getProductsByCategory(selectedCategory);
            setProducts(res.data);
        } catch (err) {
            console.error("Fetch failed", err);
        }
        setLoading(false);
    };

    const fetchMyOffers = async () => {
        try {
            const res = await getOffersByBuyer(user.id);
            setMyOffers(res.data);
        } catch (err) {
            console.error("Offers fetch failed", err);
        }
    };

    const handlePlaceOffer = async (e) => {
        e.preventDefault();
        try {
            await createOffer({
                ...offerData,
                productId: showOfferModal.id,
                buyerId: user.id,
                status: 'PENDING'
            });
            setShowOfferModal(null);
            setOfferData({ offeredPrice: '', quantity: '' });
            fetchMyOffers();
            alert("Offer sent successfully!");
        } catch (err) {
            alert("Failed to send offer");
        }
    };

    const handleReport = async (productId) => {
        const reason = window.prompt("Reason for reporting this product?");
        if (reason) {
            await createReport({ productId, reporterId: user.id, reason, status: 'PENDING' });
            alert("Report submitted for moderation.");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="buyer-theme">
            {/* Header & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, maxWidth: '600px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Search fresh crops..." 
                            style={{ paddingLeft: '3rem', marginTop: 0 }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="form-input" 
                        style={{ width: '180px', marginTop: 0 }}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        <option value="GRAINS">Grains</option>
                        <option value="FRUITS">Fruits</option>
                        <option value="VEGETABLES">Vegetables</option>
                        <option value="SPICES">Spices</option>
                    </select>
                </div>

                <div className="glass-card" style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <MessageCircle size={18} color="var(--accent)" />
                    <span>My Offers: <strong style={{ color: 'var(--accent)' }}>{myOffers.length}</strong></span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Marketplace Feed */}
                <section>
                    {loading ? (
                        <div style={{ display: 'grid', placeItems: 'center', height: '400px' }}><Loader2 size={48} className="animate-spin" /></div>
                    ) : (
                        <div className="market-grid">
                            {filteredProducts.map(p => (
                                <div key={p.id} className="glass-card crop-card animate-up">
                                    <div className="crop-image" style={{ display: 'grid', placeItems: 'center', fontSize: '3rem' }}>🍃</div>
                                    <div className="crop-details">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span className="badge badge-primary" style={{ background: 'var(--accent-glow)', color: '#93c5fd', borderColor: 'var(--accent)' }}>{p.category}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farmer: {p.farmerName}</span>
                                        </div>
                                        <h3 style={{ marginTop: '0.75rem' }}>{p.name}</h3>
                                        <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{p.price}/kg</span>
                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{p.quantity}kg available</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setShowOfferModal(p)} className="btn" style={{ flex: 1 }}>
                                                <DollarSign size={16} /> Negotiate
                                            </button>
                                            <button onClick={() => handleReport(p.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.8rem', borderRadius: '10px', color: '#ef4444', cursor: 'pointer' }}>
                                                <ShieldAlert size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Offer History Sidebar */}
                <aside>
                    <div className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ShoppingBag size={20} color="var(--accent)" /> Order History
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myOffers.map(o => (
                                <div key={o.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', borderLeft: '3px solid' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 700 }}>₹{o.offeredPrice}/kg</span>
                                        <span className={`badge`} style={{ 
                                            background: o.status === 'ACCEPTED' ? 'var(--primary-glow)' : o.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.1)',
                                            color: o.status === 'ACCEPTED' ? 'var(--primary)' : o.status === 'REJECTED' ? '#ef4444' : 'var(--text-muted)'
                                        }}>
                                            {o.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity: {o.quantity}kg</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* Negotiation Modal */}
            {showOfferModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
                    <div className="glass-card animate-up" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '0.5rem' }}>Place Your Offer</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>Making an offer for <strong>{showOfferModal.name}</strong> at listed price ₹{showOfferModal.price}/kg.</p>
                        
                        <form onSubmit={handlePlaceOffer}>
                            <div className="form-group">
                                <label>Your Price (₹ per kg)</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    required 
                                    value={offerData.offeredPrice} 
                                    onChange={e => setOfferData({...offerData, offeredPrice: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity (kg)</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    required 
                                    max={showOfferModal.quantity}
                                    value={offerData.quantity} 
                                    onChange={e => setOfferData({...offerData, quantity: e.target.value})} 
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowOfferModal(null)}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 2 }}>Submit Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerMarketplace;
