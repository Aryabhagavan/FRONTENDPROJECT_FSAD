import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, Loader2, Search, UserCheck, UserX } from 'lucide-react';
import { getAllUsers, approveUser } from '../services/api';
import api from '../services/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('ALL');

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getAllUsers();
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Permanently delete this user and all their data?')) {
            try {
                await api.delete(`/admin/users/${id}`);
                fetchUsers();
            } catch (err) {
                alert('Failed to delete user.');
            }
        }
    };

    const handleApprove = async (id) => {
        try {
            await approveUser(id);
            fetchUsers();
        } catch (err) {
            alert('Failed to approve user.');
        }
    };

    const roleColor = { FARMER: 'var(--primary)', BUYER: 'var(--accent)', ADMIN: '#ef4444', EXPERT: '#8b5cf6' };
    const roleBg = { FARMER: 'var(--primary-glow)', BUYER: 'var(--accent-glow)', ADMIN: 'rgba(239,68,68,0.1)', EXPERT: 'rgba(139,92,246,0.1)' };

    const filtered = users.filter(u => {
        const matchSearch = u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'ALL' || u.role === filter;
        return matchSearch && matchFilter;
    });

    return (
        <div className="admin-theme">
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.25rem' }}>User Management</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{users.length} registered users on the platform</p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="form-input" placeholder="Search by name or email..." style={{ paddingLeft: '2.75rem', marginTop: 0 }} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="form-input" style={{ width: '160px', marginTop: 0 }} value={filter} onChange={e => setFilter(e.target.value)}>
                    <option value="ALL">All Roles</option>
                    <option value="FARMER">Farmers</option>
                    <option value="BUYER">Buyers</option>
                    <option value="EXPERT">Experts</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            {loading ? (
                <div style={{ display: 'grid', placeItems: 'center', height: '300px' }}>
                    <Loader2 size={48} className="animate-spin" color="#ef4444" />
                </div>
            ) : (
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: roleBg[u.role] || 'rgba(255,255,255,0.1)', display: 'grid', placeItems: 'center' }}>
                                                <Shield size={16} color={roleColor[u.role] || 'var(--text-muted)'} />
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{u.username}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.email}</td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', background: roleBg[u.role] || 'rgba(255,255,255,0.1)', color: roleColor[u.role] || 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        {u.approved ? (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem' }}><UserCheck size={14} /> Active</span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontSize: '0.85rem' }}><UserX size={14} /> Pending</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {!u.approved && (
                                                <button onClick={() => handleApprove(u.id)} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: 'var(--primary)' }}>
                                                    Approve
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(u.id)} style={{ background: 'rgba(239,68,68,0.1)', border: 'none', color: '#ef4444', padding: '0.4rem 0.6rem', borderRadius: '8px', cursor: 'pointer' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Users size={48} style={{ margin: '0 auto 1rem' }} />
                            <p>No users match your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
