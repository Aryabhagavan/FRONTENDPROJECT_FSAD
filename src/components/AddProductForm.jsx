import React, { useState } from 'react';
import { addProduct } from '../services/api';
import { PlusCircle, Loader2 } from 'lucide-react';

const AddProductForm = ({ onProductAdded }) => {
  const [product, setProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    farmerName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addProduct({
        ...product,
        price: parseFloat(product.price),
        quantity: parseInt(product.quantity, 10)
      });
      setProduct({ name: '', price: '', quantity: '', farmerName: '' });
      if (onProductAdded) onProductAdded();
    } catch (err) {
      console.error(err);
      setError("Failed to add product. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{error}</div>}
      
      <div className="form-group">
        <label htmlFor="farmerName">Farmer Name</label>
        <input 
          type="text" 
          id="farmerName"
          name="farmerName" 
          className="form-control"
          value={product.farmerName} 
          onChange={handleChange} 
          placeholder="e.g. John Doe"
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">Crop / Product Name</label>
        <input 
          type="text" 
          id="name"
          name="name" 
          className="form-control"
          value={product.name} 
          onChange={handleChange} 
          placeholder="e.g. Organic Wheat"
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price (₹ / unit)</label>
        <input 
          type="number" 
          id="price"
          name="price" 
          className="form-control"
          value={product.price} 
          onChange={handleChange} 
          placeholder="0.00"
          step="0.01"
          min="0"
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="quantity">Quantity Available</label>
        <input 
          type="number" 
          id="quantity"
          name="quantity" 
          className="form-control"
          value={product.quantity} 
          onChange={handleChange} 
          placeholder="0"
          min="1"
          required 
        />
      </div>

      <button type="submit" className="btn" disabled={loading}>
        {loading ? <Loader2 size={20} className="animate-spin" /> : <PlusCircle size={20} />}
        {loading ? 'Adding...' : 'Add to Marketplace'}
      </button>
    </form>
  );
};

export default AddProductForm;
