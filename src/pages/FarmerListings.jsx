import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Loader2, Tag, Scale } from 'lucide-react';
import { getFarmerProducts, addProduct, deleteProduct } from '../services/api';
import { useAuth } from '../AuthContext';

const FarmerListings = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', category: 'GRAINS' });

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await getFarmerProducts(user.username);
            setProducts(res.data);
        } catch (err) {
            console.error('Failed to fetch listings', err);
        }
        setLoading(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addProduct({
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                quantity: parseInt(newProduct.quantity, 10),
                category: newProduct.category,
                farmerName: user.username
            });
            setNewProduct({ name: '', price: '', quantity: '', category: 'GRAINS' });
            setShowForm(false);
            fetchProducts();
        } catch (err) {
            alert('Failed to add product. Please try again.');
        }
        setSubmitting(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Remove this listing from the marketplace?')) {
            await deleteProduct(id);
            fetchProducts();
        }
    };

    const categoryEmoji = { GRAINS: '🌾', FRUITS: '🍎', VEGETABLES: '🥦', SPICES: '🌶️' };

    return (
        <div className="farmer-theme">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ marginBottom: '0.25rem' }}>My Crop Listings</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{products.length} active listings on the marketplace</p>
                </div>
                <button className="btn" onClick={() => setShowForm(true)}>
                    <Plus size={18} /> New Harvest
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" color="var(--primary)" />
                </div>
            ) : products.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <Package size={64} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No listings yet</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Add your first harvest to start selling!</p>
                    <button className="btn" onClick={() => setShowForm(true)}><Plus size={18} /> Add First Listing</button>
                </div>
            ) : (
                <div className="market-grid">
                    {products.map(p => (
                        <div key={p.id} className="glass-card crop-card">
                            <div className="crop-image" style={{ display: 'grid', placeItems: 'center', fontSize: '3.5rem' }}>
                                {categoryEmoji[p.category] || '🌿'}
                            </div>
                            <div className="crop-details">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Tag size={10} /> {p.category}
                                    </span>
                                    <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                                <h3 style={{ margin: '0.75rem 0 0.5rem' }}>{p.name}</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>₹{p.price}/kg</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Scale size={13} /> {p.quantity} kg
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
                    <div className="glass-card animate-up" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>List New Harvest</h2>
                        <form onSubmit={handleAdd}>
                            <div className="form-group">
                                <label>Crop / Product Name</label>
                                <input className="form-input" required value={newProduct.name} placeholder="e.g. Organic Basmati Rice" onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Price (₹/kg)</label>
                                    <input type="number" step="0.01" min="0" className="form-input" required value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Quantity (kg)</label>
                                    <input type="number" min="1" className="form-input" required value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                                    <option value="GRAINS">🌾 Grains</option>
                                    <option value="FRUITS">🍎 Fruits</option>
                                    <option value="VEGETABLES">🥦 Vegetables</option>
                                    <option value="SPICES">🌶️ Spices</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn" style={{ flex: 1, background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ flex: 2 }} disabled={submitting}>
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    {submitting ? 'Listing...' : 'Confirm Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FarmerListings;
