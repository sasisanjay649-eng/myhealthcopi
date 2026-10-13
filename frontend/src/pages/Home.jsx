import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Heart,
  Moon,
  Sparkles,
  ShieldCheck,
  Brain,
  Lock,
  ArrowRight,
  TrendingUp,
  Droplets,
  Stethoscope,
  Pill,
  Search
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const trustIndicators = [
    { label: 'Personalized', desc: 'Adapts to your physiology, goals, and daily records', icon: <Sparkles size={18} color="#2B8A62" /> },
    { label: 'Explainable', desc: 'Plain-language patterns, no black-box medical jargon', icon: <Brain size={18} color="#2563EB" /> },
    { label: 'Privacy-First', desc: 'Encrypted, isolated, and strictly user-owned health data', icon: <Lock size={18} color="#7C3AED" /> },
    { label: 'Evidence-Aware', desc: 'Anchored in official WHO, CDC, FDA & NHS publications', icon: <ShieldCheck size={18} color="#059669" /> },
  ];

  const features = [
    {
      title: 'Multivariate Health Tracking',
      desc: 'Seamlessly capture sleep cycles, steps, resting heart rate, water intake, active workouts, stress, and weight.',
      icon: <Activity size={24} color="#2B8A62" />,
      link: '/health',
    },
    {
      title: 'Contextual AI Copilot',
      desc: 'Ask complex health questions. VitaMind AI synthesizes your logged metrics with peer-reviewed medical guidance.',
      icon: <Brain size={24} color="#2563EB" />,
      link: '/copilot',
    },
    {
      title: 'Verified Medication Facts',
      desc: 'Explore official FDA/NHS pharmacology summaries, side effects, precautions, and cross-interaction warnings safely.',
      icon: <Pill size={24} color="#7C3AED" />,
      link: '/medications',
    },
    {
      title: 'Educational Symptom Checker',
      desc: 'Evaluate symptoms against clinical possibilities and emergency red flags without diagnostic overreach.',
      icon: <Stethoscope size={24} color="#E11D48" />,
      link: '/symptoms',
    },
    {
      title: 'Pattern & Consistency Analysis',
      desc: 'Discover hidden correlations: see how hydration impacts sleep, or how exercise consistency tempers evening stress.',
      icon: <Heart size={24} color="#0284C7" />,
      link: '/health-analysis',
    },
    {
      title: 'Authoritative Medical Search',
      desc: 'Direct search into approved health repositories: WHO, CDC, NIH MedlinePlus, and PubMed literature.',
      icon: <Search size={24} color="#D97706" />,
      link: '/medications',
    },
  ];

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          position: 'relative',
        }}
      >
        {/* Top Tag Pill */}
        <div
          className="badge-mint"
          style={{
            marginBottom: '1.5rem',
            padding: '0.45rem 1.1rem',
            fontSize: '0.84rem',
            animation: 'float-subtle 4s ease-in-out infinite',
            boxShadow: '0 2px 10px rgba(87, 201, 154, 0.2)',
          }}
        >
          <Sparkles size={14} color="#2B8A62" /> Next-Generation Personal Health &amp; Wellness Copilot
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.4rem, 5.5vw, 4.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: '920px',
            marginBottom: '1.25rem',
            letterSpacing: '-0.03em',
            color: 'var(--text-main)',
          }}
        >
          Your health has a story.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #18392B 0%, #2B8A62 50%, #57C99A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Let's understand it.
          </span>
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            maxWidth: '720px',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            fontWeight: 500,
          }}
        >
          VitaMind AI brings your daily health metrics together, discovers meaningful patterns
          and turns complex health data into simple, personalized wellness guidance.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '3rem',
          }}
        >
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="btn-primary"
            style={{ fontSize: '1.02rem', padding: '0.9rem 1.8rem' }}
          >
            Build My Health Profile <ArrowRight size={18} />
          </Link>
          <Link
            to={isAuthenticated ? '/copilot' : '/login'}
            className="btn-secondary"
            style={{ fontSize: '1.02rem', padding: '0.9rem 1.8rem' }}
          >
            <Brain size={18} color="#2B8A62" /> Talk to AI Copilot
          </Link>
        </div>

        {/* Animated AI Health Visualization / Orbit */}
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto 2.5rem' }}>
          <div className="orbit-stage">
            {/* Core Pulse */}
            <div className="orbit-core">
              <Activity size={36} color="#18392B" />
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#18392B', marginTop: '4px' }}>
                VitaMind AI
              </span>
            </div>

            {/* Orbit Ring 1 & Satellites */}
            <div className="orbit-ring-1">
              <div
                className="orbit-satellite"
                style={{
                  top: '-15px',
                  left: '30%',
                  borderColor: 'var(--accent-mint-light)',
                }}
              >
                <Moon size={13} color="#2563EB" />
                <span>Sleep Architecture</span>
              </div>
              <div
                className="orbit-satellite"
                style={{
                  bottom: '-15px',
                  right: '25%',
                  borderColor: 'var(--accent-mint-light)',
                }}
              >
                <Activity size={13} color="#2B8A62" />
                <span>HRV &amp; Pulse</span>
              </div>
            </div>

            {/* Orbit Ring 2 & Satellites */}
            <div className="orbit-ring-2">
              <div
                className="orbit-satellite"
                style={{
                  top: '40%',
                  left: '-20px',
                  borderColor: 'var(--accent-mint-light)',
                }}
              >
                <Droplets size={13} color="#0284C7" />
                <span>Fluid Balance</span>
              </div>
              <div
                className="orbit-satellite"
                style={{
                  bottom: '30%',
                  right: '-20px',
                  borderColor: 'var(--accent-mint-light)',
                }}
              >
                <TrendingUp size={13} color="#D97706" />
                <span>Lifestyle Synergy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live-style Metrics Display Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            width: '100%',
            maxWidth: '750px',
            margin: '0 auto',
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Moon size={18} color="#2563EB" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sleep Pattern</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#18392B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} color="#2B8A62" /> Improving
              </div>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--accent-mint-soft)',
                border: '1px solid var(--accent-mint-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={18} color="#2B8A62" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Activity</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#18392B' }}>
                6,842 steps
              </div>
            </div>
          </div>

          <div
            className="glass-panel"
            style={{
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              textAlign: 'left',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: '#F5F3FF',
                border: '1px solid #DDD6FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Heart size={18} color="#7C3AED" />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Health Trend</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#18392B' }}>
                Stable
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section style={{ maxWidth: '1200px', margin: '2rem auto 4rem', padding: '0 1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {trustIndicators.map((item, idx) => (
            <div
              key={idx}
              className="glass-panel card-hoverable"
              style={{ padding: '1.5rem', textAlign: 'left', background: '#FFFFFF' }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--accent-mint-soft)',
                  border: '1px solid var(--accent-mint-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                {item.label}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge-mint" style={{ marginBottom: '0.75rem' }}>
            Comprehensive Intelligence
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            Empowering your personal health journey
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '620px', margin: '0.5rem auto 0', fontSize: '0.98rem' }}>
            From day-to-day wellness logging to intelligent conversational inquiry, VitaMind AI
            keeps you informed, balanced, and prepared for clinical doctor visits.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {features.map((feat, idx) => (
            <Link
              key={idx}
              to={isAuthenticated ? feat.link : '/login'}
              className="glass-panel card-hoverable"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                textDecoration: 'none',
                position: 'relative',
                background: '#FFFFFF',
              }}
            >
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
                  marginBottom: '1.25rem',
                }}
              >
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.6rem' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {feat.desc}
              </p>
              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#2B8A62',
                }}
              >
                Explore Feature <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mandatory Regulatory & Medical Disclaimer */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div className="disclaimer-banner">
          <div style={{ fontWeight: 800, color: 'var(--text-main)', marginBottom: '4px' }}>
            Medical &amp; Clinical Safety Advisory
          </div>
          VitaMind AI provides general health and wellness information for educational purposes.
          It does not diagnose conditions, prescribe medicines, or replace professional medical advice, diagnosis, or treatment.
          Consult a qualified healthcare professional before starting, stopping, or changing any medication.
        </div>
      </section>
    </div>
  );
}
