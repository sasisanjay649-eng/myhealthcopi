import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Activity,
  HeartPulse,
  Bot,
  Pill,
  Stethoscope,
  UserCheck,
  LogOut,
  Utensils
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} /> },
    { label: 'Health Data', path: '/health', icon: <Activity size={19} /> },
    { label: 'Health Analysis', path: '/health-analysis', icon: <HeartPulse size={19} /> },
    { label: 'AI Copilot', path: '/copilot', icon: <Bot size={19} /> },
    { label: 'Medications', path: '/medications', icon: <Pill size={19} /> },
    { label: 'Nutrition & Diet', path: '/nutrition', icon: <Utensils size={19} /> },
    { label: 'Symptoms', path: '/symptoms', icon: <Stethoscope size={19} /> },
    { label: 'Profile', path: '/profile', icon: <UserCheck size={19} /> },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="app-sidebar"
        style={{
          width: '260px',
          background: '#FFFFFF',
          borderRight: '1px solid var(--panel-border)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1rem',
          minHeight: 'calc(100vh - 66px)',
          position: 'sticky',
          top: '66px',
          boxShadow: '1px 0 10px rgba(24, 57, 43, 0.02)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div
            style={{
              padding: '0.5rem 0.85rem 0.85rem',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Health Navigation
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.7rem 1rem',
                borderRadius: '12px',
                fontSize: '0.92rem',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#18392B' : 'var(--text-muted)',
                background: isActive ? 'var(--accent-mint-soft)' : 'transparent',
                border: isActive ? '1px solid var(--accent-mint-light)' : '1px solid transparent',
                boxShadow: isActive ? '0 2px 8px rgba(87, 201, 154, 0.15)' : 'none',
                transition: 'all 0.2s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={{ color: isActive ? '#2B8A62' : 'inherit' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Mini Profile & Logout */}
        <div
          style={{
            borderTop: '1px solid var(--panel-border)',
            paddingTop: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--panel-border)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--accent-mint)',
                color: '#18392B',
                fontWeight: 800,
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(87, 201, 154, 0.3)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'V'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.name || 'VitaMind Member'}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {user?.email || 'Logged In'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-outline"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem', padding: '0.6rem' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#DC2626';
              e.currentTarget.style.borderColor = '#FCA5A5';
              e.currentTarget.style.background = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--panel-border)';
              e.currentTarget.style.background = '#FFFFFF';
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="mobile-bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          background: '#FFFFFF',
          borderTop: '1px solid var(--panel-border)',
          display: 'none',
          justifyContent: 'space-around',
          padding: '0.5rem 0.25rem',
          boxShadow: '0 -2px 10px rgba(24, 57, 43, 0.05)',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              color: isActive ? '#2B8A62' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: isActive ? 700 : 600,
              padding: '0.25rem 0.4rem',
              textDecoration: 'none',
            })}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 900px) {
          .app-sidebar { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
