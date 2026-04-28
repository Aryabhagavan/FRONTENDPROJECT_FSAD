import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Users, 
    BookOpen, 
    ShieldAlert, 
    LogOut,
    MessageSquare,
    ClipboardList
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const role = user?.roles?.[0]?.replace('ROLE_', '') || 'BUYER';

    const menuItems = {
        FARMER: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/farmer' },
            { icon: ClipboardList, label: 'My Listings', path: '/farmer/listings' },
            { icon: MessageSquare, label: 'Offers', path: '/farmer/offers' },
            { icon: BookOpen, label: 'Guidance', path: '/farmer/guidance' },
        ],
        BUYER: [
            { icon: ShoppingBag, label: 'Marketplace', path: '/buyer' },
            { icon: ClipboardList, label: 'My Offers', path: '/buyer/offers' },
            { icon: BookOpen, label: 'Schemes', path: '/buyer/schemes' },
        ],
        EXPERT: [
            { icon: LayoutDashboard, label: 'Portal', path: '/expert' },
            { icon: MessageSquare, label: 'Broadcast', path: '/expert/broadcast' },
        ],
        ADMIN: [
            { icon: LayoutDashboard, label: 'Panel', path: '/admin' },
            { icon: Users, label: 'Users', path: '/admin/users' },
            { icon: ShieldAlert, label: 'Reports', path: '/admin/reports' },
            { icon: BookOpen, label: 'Schemes', path: '/admin/schemes' },
        ]
    };

    const items = menuItems[role] || menuItems.BUYER;

    return (
        <aside className={`sidebar ${role.toLowerCase()}-theme`}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ 
                    fontSize: '1.5rem', 
                    background: 'linear-gradient(135deg, #34d399, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}> Nspire Farming </h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role === 'BUYER' ? 'PUBLIC' : role} Role</p>
            </div>

            <nav>
                {items.map((item, idx) => (
                    <NavLink 
                        key={idx} 
                        to={item.path} 
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                <div className="nav-item" onClick={logout} style={{ color: '#ef4444' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
