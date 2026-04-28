import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Trash2, 
    MessageCircle, 
    Check, 
    X, 
    Megaphone,
    TrendingUp,
    Package
} from 'lucide-react';
import { 
    getFarmerProducts, 
    addProduct, 
    deleteProduct, 
    getOffersByProduct, 
    updateOfferStatus,
    getSuggestions 
} from '../services/api';
import { useAuth } from '../AuthContext';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', category: 'GRAINS' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, sRes] = await Promise.all([
                getFarmerProducts(user.username),
                getSuggestions()
            ]);
            setProducts(pRes.data);
            setSuggestions(sRes.data);
            
            // Fetch offers for all products
            const allOffers = [];
            for (const p of pRes.data) {
                const oRes = await getOffersByProduct(p.id);
                allOffers.push(...oRes.data);
            }
            setOffers(allOffers);
        } catch (err) {
            console.error("Fetch failed", err);
        }
        setLoading(false);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await addProduct({ ...newProduct, farmerName: user.username });
            setNewProduct({ name: '', price: '', quantity: '', category: 'GRAINS' });
            setShowAddForm(false);
            fetchData();
        } catch (err) {
            alert("Failed to add product");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this listing?")) {
            await deleteProduct(id);
            fetchData();
        }
    };

    const handleOfferStatus = async (id, status) => {
        await updateOfferStatus(id, status);
        fetchData();
    };

    return (
        <div className="farmer-theme">
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={16} /> Total Listings
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{products.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageCircle size={16} /> Pending Offers
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {offers.filter(o => o.status === 'PENDING').length}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={16} /> Expert Guidance
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{suggestions.length}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Main Section */}
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3>My Crop Listings</h3>
                        <button className="btn" onClick={() => setShowAddForm(true)}><Plus size={18} /> New Harvest</button>
                    </div>

                    <div className="market-grid">
                        {products.map(p => (
                            <div key={p.id} className="glass-card crop-card">
                                <div className="crop-image" style={{ display: 'grid', placeItems: 'center', fontSize: '3rem' }}>🌾</div>
                                <div className="crop-details">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <h4 className="badge badge-primary">{p.category}</h4>
                                        <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <h3 style={{ marginTop: '0.5rem' }}>{p.name}</h3>
                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{p.price}/kg</span>
                                        <span style={{ color: 'var(--text-muted)' }}>Qty: {p.quantity}kg</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sidebar Section */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Offers Section */}
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageCircle size={20} color="var(--accent)" /> Negotiation Hub
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {offers.filter(o => o.status === 'PENDING').map(o => (
                                <div key={o.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                    <div style={{ fontWeight: 700 }}>₹{o.offeredPrice}/kg</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Buyer ID: {o.buyerId} | Qty: {o.quantity}kg</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                        <button onClick={() => handleOfferStatus(o.id, 'ACCEPTED')} className="btn" style={{ padding: '0.4rem', flex: 1, background: 'var(--primary)' }}>
                                            <Check size={16} /> Accept
                                        </button>
                                        <button onClick={() => handleOfferStatus(o.id, 'REJECTED')} className="btn" style={{ padding: '0.4rem', flex: 1, background: '#ef4444' }}>
                                            <X size={16} /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {offers.filter(o => o.status === 'PENDING').length === 0 && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending offers.</p>
                            )}
                        </div>
                    </div>

                    {/* Suggestions Section */}
                    <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Megaphone size={20} color="var(--primary)" /> Expert Advice
                        </h3>
                        {suggestions.map((s, idx) => (
                            <div key={idx} style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                " {s.advice} "
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {/* Modal for adding product */}
            {showAddForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
                    <div className="glass-card animate-up" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>List New Harvest</h2>
                        <form onSubmit={handleAddProduct}>
                            <div className="form-group">
                                <label>Crop Name</label>
                                <input className="form-input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Price (₹/kg)</label>
                                    <input type="number" className="form-input" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Quantity (kg)</label>
                                    <input type="number" className="form-input" required value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                    <option value="GRAINS">Grains</option>
                                    <option value="FRUITS">Fruits</option>
                                    <option value="VEGETABLES">Vegetables</option>
                                    <option value="SPICES">Spices</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowAddForm(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 2 }}>Confirm Listing</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
