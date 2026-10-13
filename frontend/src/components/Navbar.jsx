import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Heart,
  Sparkles,
  Pill,
  Stethoscope,
  User,
  LogOut,
  Menu,
  X,
  BarChart3,
  Database,
  Utensils
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: <Sparkles size={16} /> },
    { label: 'Dashboard', path: '/dashboard', icon: <BarChart3 size={16} />, authOnly: true },
    { label: 'Health Data', path: '/health', icon: <Database size={16} />, authOnly: true },
    { label: 'Health Analysis', path: '/health-analysis', icon: <Heart size={16} />, authOnly: true },
    { label: 'AI Copilot', path: '/copilot', icon: <Activity size={16} />, authOnly: true },
    { label: 'Medications', path: '/medications', icon: <Pill size={16} /> },
    { label: 'Nutrition', path: '/nutrition', icon: <Utensils size={16} />, authOnly: true },
    { label: 'Symptoms', path: '/symptoms', icon: <Stethoscope size={16} /> },
  ];

  const visibleLinks = navLinks.filter((item) => !item.authOnly || isAuthenticated);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#FFFFFF',
        borderBottom: '1px solid var(--panel-border)',
        boxShadow: '0 2px 10px rgba(24, 57, 43, 0.04)',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--accent-mint-soft)',
              border: '1px solid var(--accent-mint-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(87, 201, 154, 0.2)',
            }}
          >
            <Activity size={22} color="#18392B" />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-main)',
                lineHeight: 1.1,
              }}
            >
              VitaMind <span style={{ color: '#2B8A62' }}>AI</span>
            </div>
            <div
              style={{
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              Personal Health Copilot
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            gap: '0.35rem',
            alignItems: 'center',
          }}
          className="desktop-nav"
        >
          {visibleLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: active ? 700 : 600,
                  color: active ? '#18392B' : 'var(--text-muted)',
                  background: active ? 'var(--accent-mint-soft)' : 'transparent',
                  border: active ? '1px solid var(--accent-mint-light)' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#18392B';
                    e.currentTarget.style.background = '#F3FAF5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ color: active ? '#2B8A62' : 'inherit' }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA / Auth controls */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '0.75rem',
          }}
          className="desktop-auth"
        >
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid var(--panel-border)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  boxShadow: '0 1px 3px rgba(24, 57, 43, 0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-mint)';
                  e.currentTarget.style.background = 'var(--accent-mint-soft)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--panel-border)';
                  e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--accent-mint-soft)',
                    border: '1px solid var(--accent-mint-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={14} color="#2B8A62" />
                </div>
                <span>{user?.name?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="btn-outline"
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                }}
                title="Logout"
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
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link
                to="/login"
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  padding: '0.5rem 0.9rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-mint-soft)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', fontSize: '0.88rem' }}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'flex',
            background: 'var(--accent-mint-soft)',
            border: '1px solid var(--accent-mint-light)',
            borderRadius: '10px',
            color: '#18392B',
            cursor: 'pointer',
            padding: '6px',
          }}
          className="mobile-toggle"
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1rem 1.5rem 1.5rem',
            background: '#FFFFFF',
            borderBottom: '2px solid var(--accent-mint-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            boxShadow: '0 10px 25px rgba(24, 57, 43, 0.08)',
          }}
        >
          {visibleLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  color: active ? '#18392B' : 'var(--text-muted)',
                  background: active ? 'var(--accent-mint-soft)' : 'transparent',
                  border: active ? '1px solid var(--accent-mint-light)' : '1px solid transparent',
                  fontWeight: active ? 700 : 600,
                }}
              >
                <span style={{ color: active ? '#2B8A62' : 'inherit' }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div
            style={{
              borderTop: '1px solid var(--panel-border)',
              marginTop: '0.5rem',
              paddingTop: '0.75rem',
            }}
          >
            {isAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    borderRadius: '10px',
                    background: 'var(--accent-mint-soft)',
                  }}
                >
                  <User size={18} color="#2B8A62" />
                  <span>My Profile ({user?.name})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive media style injection for desktop visibility */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-auth { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}
