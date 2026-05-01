import axios from 'axios';

// In production (Vercel), set VITE_API_BASE_URL to your Railway backend URL
// e.g.  https://agriconnect-backend.up.railway.app/api
// In local dev this falls back to /api which Vite proxies to localhost:2026
const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

const api = axios.create({
    baseURL: API_URL,
});

// Automatically add JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = (data) => api.post('/auth/signin', data);
export const register = (data) => api.post('/auth/signup', data);

// Products
export const getProducts = () => api.get('/products');
export const getFarmerProducts = (name) => api.get(`/products/farmer/${name}`);
export const getProductsByCategory = (cat) => api.get(`/products/category/${cat}`);
export const addProduct = (data) => api.post('/products', data);
export const buyProduct = (id, quantity) => api.post(`/products/${id}/buy?quantity=${quantity}`);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Offers
export const createOffer = (data) => api.post('/offers', data);
export const getOffersByProduct = (productId) => api.get(`/offers/product/${productId}`);
export const getOffersByBuyer = (buyerId) => api.get(`/offers/buyer/${buyerId}`);
export const updateOfferStatus = (id, status) => api.put(`/offers/${id}/status?status=${status}`);

// Suggestions
export const getSuggestions = () => api.get('/suggestions');
export const postSuggestion = (data) => api.post('/suggestions', data);
export const deleteSuggestion = (id) => api.delete(`/suggestions/${id}`);

// Schemes
export const getSchemes = () => api.get('/schemes');
export const addScheme = (data) => api.post('/schemes', data);
export const deleteScheme = (id) => api.delete(`/schemes/${id}`);

// Admin
export const getPendingAdmins = () => api.get('/admin/pending');
export const approveUser = (id) => api.put(`/admin/approve/${id}`);
export const getAllUsers = () => api.get('/admin/users');
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// Reports
export const createReport = (data) => api.post('/reports', data);
export const getReports = () => api.get('/reports');
export const resolveReport = (id) => api.put(`/reports/${id}/resolve`);

export default api;
