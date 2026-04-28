import React, { useState, useEffect } from 'react';
import { 
    Users, 
    ShieldAlert, 
    CheckCircle, 
    Trash2, 
    AlertTriangle,
    Clock,
    UserPlus,
    Loader2
} from 'lucide-react';
import { 
    getPendingAdmins, 
    approveUser, 
    getReports, 
    resolveReport, 
    getAllUsers,
} from '../services/api';
import { useAuth } from '../AuthContext';

const AdminPanel = () => {
    const { user } = useAuth();
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [pRes, rRes, uRes] = await Promise.all([
                getPendingAdmins(),
                getReports(),
                getAllUsers()
            ]);
            setPendingAdmins(pRes.data);
            setReports(rRes.data);
            setUsers(uRes.data);
        } catch (err) {
            console.error("Admin fetch failed", err);
        }
        setLoading(false);
    };

    const handleApprove = async (id) => {
        await approveUser(id);
        fetchAdminData();
        alert("Admin approved successfully!");
    };

    const handleResolve = async (id) => {
        await resolveReport(id);
        fetchAdminData();
        alert("Report resolved.");
    };

    return (
        <div className="admin-theme">
            {/* Admin Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} /> Total Platform Users
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>{users.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserPlus size={16} /> Pending Approvals
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{pendingAdmins.length}</div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldAlert size={16} /> Open Reports
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444' }}>
                        {reports.filter(r => r.status === 'PENDING').length}
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} /> Security Status
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>SECURE</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                {/* Pending Admins Section */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Clock size={24} color="var(--accent)" />
                        <h3>Pending Admin Approvals</h3>
                    </div>
                    <div className="glass-card" style={{ padding: '0.5rem' }}>
                        {pendingAdmins.length === 0 ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No pending admin requests.</p>
                        ) : (
                            <div style={{ width: '100%' }}>
                                {pendingAdmins.map(pa => (
                                    <div key={pa.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{pa.username}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{pa.email}</div>
                                        </div>
                                        <button onClick={() => handleApprove(pa.id)} className="btn" style={{ padding: '0.6rem 1.2rem', background: 'var(--accent)' }}>
                                            <CheckCircle size={16} /> Approve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Moderation Section */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <AlertTriangle size={24} color="#ef4444" />
                        <h3>Moderation & Report Center</h3>
                    </div>
                    <div className="glass-card" style={{ padding: '0.5rem' }}>
                        {reports.filter(r => r.status === 'PENDING').length === 0 ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Platform is clean! No open reports.</p>
                        ) : (
                            <div>
                                {reports.filter(r => r.status === 'PENDING').map(r => (
                                    <div key={r.id} style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontWeight: 700, color: '#ef4444' }}>Report ID: #{r.id}</span>
                                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>PENDING</span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>" {r.reason} "</div>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <button onClick={() => handleResolve(r.id)} className="btn" style={{ padding: '0.5rem 1rem', flex: 1, background: 'var(--primary)' }}>
                                                <CheckCircle size={16} /> Resolve
                                            </button>
                                            <button className="btn" style={{ padding: '0.5rem 1rem', flex: 1, background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>
                                                <Trash2 size={16} /> Delete Listing
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminPanel;
