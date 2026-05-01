import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../AuthContext';
import { Loader2 } from 'lucide-react';

const DashboardLayout = () => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
                        Overview & <span style={{ color: 'var(--text-main)' }}>Management</span>
                    </h2>
                </header>
                <div className="animate-up">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
