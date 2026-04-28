import React, { useEffect, useState } from 'react';
import { getProducts, buyProduct, deleteProduct } from '../services/api';
import { Package, User, ShoppingBag, Trash2, ShoppingCart } from 'lucide-react';

const ProductList = ({ refreshTrigger, role, onActionSuccess }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data);
      setError(null);
    } catch (err) {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (id, quantityAvailable) => {
      if (quantityAvailable < 1) return alert("Sold out!");
      try {
          await buyProduct(id, 1);
          if (onActionSuccess) onActionSuccess();
          alert("Purchase successful! -1 Unit");
      } catch (err) {
          alert("Failed to buy product.");
      }
  };

  const handleDelete = async (id) => {
      if (!window.confirm("Are you sure you want to delete this listing?")) return;
      try {
          await deleteProduct(id);
          if (onActionSuccess) onActionSuccess();
      } catch (err) {
          alert("Failed to delete.");
      }
  };

  if (loading) return <div className="empty-state">Loading marketplace data...</div>;
  if (error) return <div className="empty-state" style={{color: '#ef4444'}}>{error}</div>;

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <Package size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
        <h3>No Products Available</h3>
        <p>Marketplace is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((p, index) => (
        <div key={p.id || index} className="glass-panel product-card" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="product-card-header">
            <h3 className="product-name">{p.name}</h3>
            <span className="product-price">₹{p.price}</span>
          </div>
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="product-meta"><User size={16} /><span>{p.farmerName}</span></div>
            <div className="product-meta"><ShoppingBag size={16} /><span>{p.quantity} units available</span></div>
            
            {/* Dynamic Controls based on Role */}
            <div style={{ marginTop: '1rem' }}>
                {role === 'PUBLIC' && (
                    <button 
                       onClick={() => handleBuy(p.id, p.quantity)}
                       className="btn" 
                       style={{ background: 'var(--accent)', padding: '0.5rem' }}
                       disabled={p.quantity < 1}
                    >
                        <ShoppingCart size={18} /> {p.quantity < 1 ? 'Sold Out' : 'Buy Now'}
                    </button>
                )}
                
                {role === 'ADMIN' && (
                    <button 
                       onClick={() => handleDelete(p.id)}
                       className="btn" 
                       style={{ background: '#ef4444', padding: '0.5rem' }}
                    >
                        <Trash2 size={18} /> Delete Listing
                    </button>
                )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductList;
