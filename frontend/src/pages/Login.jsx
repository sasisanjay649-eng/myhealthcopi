import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { registerUser } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo.wellness@vitamind.ai');
    setPassword('VitaMind2026!');
    setErrorMsg('');

    try {
      setIsSubmitting(true);
      // Attempt login, if not registered register demo
      try {
        await login({ email: 'demo.wellness@vitamind.ai', password: 'VitaMind2026!' });
      } catch (loginErr) {
        // Auto register demo user
        await registerUser({
          name: 'Alex Rivera',
          email: 'demo.wellness@vitamind.ai',
          password: 'VitaMind2026!',
          age: 28,
          gender: 'Non-binary',
          height: 176,
          weight: 69.6,
          health_goal: 'Optimize restorative sleep and lower evening stress',
          activity_level: 'Moderately Active',
          allergies: 'Seasonal pollen',
          current_medications: 'None'
        });
        await login({ email: 'demo.wellness@vitamind.ai', password: 'VitaMind2026!' });
      }
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Demo login error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatedGoogle = async () => {
    try {
      setIsSubmitting(true);
      await handleGoogleLogin({
        email: 'alex.rivera.google@vitamind.ai',
        name: 'Alex Rivera (Google)',
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Google authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem',
          position: 'relative',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--accent-mint-soft)',
              border: '1px solid var(--accent-mint-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Activity size={26} color="#2B8A62" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Welcome Back
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Access your secure personal wellness dashboard
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'var(--accent-red-soft)',
              border: '1px solid var(--accent-red-border)',
              color: '#9B1C1C',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              fontSize: '0.86rem',
              marginBottom: '1.5rem',
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="email"
                required
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to VitaMind AI'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div style={{ margin: '1.5rem 0 1rem' }}>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="btn-secondary"
            style={{ width: '100%', fontSize: '0.88rem', padding: '0.75rem', borderColor: 'var(--accent-mint-light)' }}
          >
            <Sparkles size={16} color="#2B8A62" /> Instant Demo Account Access
          </button>
        </div>

        {/* Google OAuth Option */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={handleSimulatedGoogle}
            disabled={isSubmitting}
            className="btn-outline"
            style={{ width: '100%', fontSize: '0.88rem', padding: '0.75rem' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2B8A62', fontWeight: 700, textDecoration: 'underline' }}>
            Create one here &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
