import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealthTrends } from '../services/api';
import Loading from '../components/Loading';
import AIInsight from '../components/AIInsight';
import {
  Heart,
  Moon,
  Activity,
  Droplets,
  Flame,
  Brain,
  Scale,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export default function HealthAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getHealthTrends();
      setData(res);
    } catch (err) {
      console.error('Error fetching health analysis:', err);
      setError(err.message || 'Failed to analyze health data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) {
    return <Loading text="Computing deep lifestyle patterns and metrics..." fullPage={true} />;
  }

  if (error && !data) {
    return <Loading isError={true} errorText={error} onRetry={fetchAnalysis} fullPage={true} />;
  }

  const patterns = data?.patterns || {};
  const summary = data?.summary || {};
  const wellnessScore = data?.wellness_score || 82;
  const isDemo = data?.is_demo_data;

  const handleDiscussPatterns = () => {
    navigate('/copilot', {
      state: {
        initialQuery: 'What health patterns do you notice in my recent data, and what can I improve?'
      }
    });
  };

  const patternCards = [
    {
      title: 'Sleep Pattern',
      desc: patterns.sleep_pattern || 'Your sleep duration is steady and supportive of cognitive recovery.',
      value: `${summary.sleep_avg || 7.4} hrs/night`,
      icon: <Moon size={22} color="#2563EB" />,
      color: '#2563EB',
      target: 'Target: 7-9h',
    },
    {
      title: 'Activity Pattern',
      desc: patterns.activity_pattern || 'Activity consistency meets cardiovascular baselines.',
      value: `${(summary.steps_avg || 7800).toLocaleString()} steps/day`,
      icon: <Activity size={22} color="#2B8A62" />,
      color: '#2B8A62',
      target: 'Goal: 8,000+ steps',
    },
    {
      title: 'Hydration Pattern',
      desc: patterns.hydration_pattern || 'Daily water intake is stable across logged weekdays.',
      value: `${summary.water_avg || 2.4} L/day`,
      icon: <Droplets size={22} color="#0284C7" />,
      color: '#0284C7',
      target: 'Target: 2.2-3.0L',
    },
    {
      title: 'Exercise Consistency',
      desc: patterns.exercise_consistency || 'Active workouts maintain healthy aerobic conditioning.',
      value: `${summary.exercise_avg || 35} mins/session`,
      icon: <Flame size={22} color="#D97706" />,
      color: '#D97706',
      target: 'Target: 30+ mins',
    },
    {
      title: 'Stress Trend',
      desc: patterns.stress_trend || 'Self-reported stress is generally manageable with restorative evenings.',
      value: `${summary.stress_avg || 3.8} / 10`,
      icon: <Brain size={22} color="#7C3AED" />,
      color: '#7C3AED',
      target: 'Optimum: < 4',
    },
    {
      title: 'Heart-Rate Trend',
      desc: patterns.heart_rate_trend || 'Resting heart rate is within standard physiological bounds (60-100 bpm).',
      value: `${summary.heart_rate_avg || 71} bpm`,
      icon: <Heart size={22} color="#E11D48" />,
      color: '#E11D48',
      target: 'Normal: 60-100 bpm',
    },
    {
      title: 'Weight Trajectory',
      desc: patterns.weight_trend || 'Body mass remains stable with minimal variance.',
      value: `${summary.weight_latest || 69.6} kg`,
      icon: <Scale size={22} color="#2B8A62" />,
      color: '#2B8A62',
      target: 'Stable Baseline',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          borderLeft: '4px solid var(--accent-mint)',
          background: '#FFFFFF',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge-blue">Pattern Intelligence</span>
            {isDemo && <span className="badge-demo">Demo Data</span>}
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Comprehensive Health Analysis
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px' }}>
            Discover multi-day patterns, lifestyle synergies, and personalized recommendations
            phrased educationally without clinical diagnosis.
          </p>
        </div>

        <button
          onClick={handleDiscussPatterns}
          className="btn-primary"
          style={{ fontSize: '0.92rem', padding: '0.8rem 1.4rem' }}
        >
          <MessageSquare size={16} /> Discuss with AI Copilot
        </button>
      </div>

      {/* Wellness Index Summary Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center',
          background: '#FFFFFF',
        }}
      >
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Composite Index
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', margin: '0.5rem 0' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '3.4rem', fontWeight: 800, color: '#2B8A62', lineHeight: 1 }}>
              {wellnessScore}
            </span>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2B8A62', fontWeight: 700, fontSize: '0.92rem' }}>
            <TrendingUp size={16} /> Trajectory: Healthy Lifestyle Balance
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
            This score synthesizes sleep quality, activity volume, fluid intake, and stress recovery.
            It is a personal lifestyle guide, not a medical diagnostic index.
          </p>
        </div>

        {/* Pillars progress breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[
            { label: 'Sleep Quality (7-9h optimal)', pct: Math.min(100, Math.round((summary.sleep_avg / 8) * 100)), color: '#2563EB' },
            { label: 'Movement & Steps (8k target)', pct: Math.min(100, Math.round((summary.steps_avg / 8000) * 100)), color: '#2B8A62' },
            { label: 'Hydration Target (2.5L)', pct: Math.min(100, Math.round((summary.water_avg / 2.5) * 100)), color: '#0284C7' },
            { label: 'Exercise Consistency (30m+)', pct: Math.min(100, Math.round((summary.exercise_avg / 30) * 100)), color: '#D97706' },
            { label: 'Stress Management (Low is better)', pct: Math.max(20, Math.round((1 - summary.stress_avg / 10) * 100)), color: '#7C3AED' },
          ].map((pillar, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>{pillar.label}</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{pillar.pct}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--panel-border)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${pillar.pct}%`,
                    background: pillar.color,
                    borderRadius: '999px',
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Breakdown Grid */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          Biometric &amp; Lifestyle Patterns
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {patternCards.map((p, idx) => (
            <div
              key={idx}
              className="glass-panel card-hoverable"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                borderLeft: `4px solid ${p.color}`,
                background: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                    {p.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {p.title}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: p.color, fontWeight: 700 }}>
                      {p.value}
                    </span>
                  </div>
                </div>

                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {p.target}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Pattern Insights List */}
      {data?.insights && data.insights.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#2B8A62" /> Generated Observational Guidance
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
            }}
          >
            {data.insights.map((ins, idx) => (
              <AIInsight
                key={idx}
                title={ins.title}
                content={ins.content}
                category={ins.category}
                scoreImpact={ins.score_impact}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regulatory & Safety Disclaimer */}
      <div className="disclaimer-banner">
        <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          Clinical Disclaimer
        </div>
        VitaMind AI provides general health and wellness information for educational purposes.
        It does not diagnose conditions, prescribe medicines, or replace professional medical advice, diagnosis, or treatment.
        Consult a qualified healthcare professional before starting, stopping, or changing any medication.
      </div>
    </div>
  );
}
