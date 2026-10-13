import React from 'react';
import { Sparkles, Moon, Activity, Droplets, Brain, ArrowUpRight } from 'lucide-react';

export default function AIInsight({
  title,
  content,
  category = 'general',
  scoreImpact = null,
  createdAt = null,
}) {
  const getCategoryConfig = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'sleep':
        return {
          icon: <Moon size={16} color="#2563EB" />,
          label: 'Sleep Rhythm',
          color: '#2563EB',
          bg: '#EFF6FF',
          border: '#BFDBFE',
        };
      case 'activity':
        return {
          icon: <Activity size={16} color="#2B8A62" />,
          label: 'Movement & Cardio',
          color: '#2B8A62',
          bg: 'var(--accent-mint-soft)',
          border: 'var(--accent-mint-light)',
        };
      case 'hydration':
        return {
          icon: <Droplets size={16} color="#0284C7" />,
          label: 'Hydration Balance',
          color: '#0284C7',
          bg: '#F0F9FF',
          border: '#BAE6FD',
        };
      case 'stress':
        return {
          icon: <Brain size={16} color="#7C3AED" />,
          label: 'Stress & Autonomics',
          color: '#7C3AED',
          bg: '#F5F3FF',
          border: '#DDD6FE',
        };
      default:
        return {
          icon: <Sparkles size={16} color="#2B8A62" />,
          label: 'AI Observation',
          color: '#2B8A62',
          bg: 'var(--accent-mint-soft)',
          border: 'var(--accent-mint-light)',
        };
    }
  };

  const config = getCategoryConfig(category);

  return (
    <div
      className="glass-panel card-hoverable"
      style={{
        padding: '1.25rem 1.4rem',
        borderLeft: `4px solid ${config.color}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.2rem 0.65rem',
            borderRadius: '999px',
            background: config.bg,
            border: `1px solid ${config.border}`,
            fontSize: '0.74rem',
            fontWeight: 700,
            color: config.color,
          }}
        >
          {config.icon}
          <span>{config.label}</span>
        </div>

        {scoreImpact && (
          <span
            style={{
              fontSize: '0.75rem',
              color: '#2B8A62',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <ArrowUpRight size={13} /> +{scoreImpact} pts wellness
          </span>
        )}
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
        {title}
      </h4>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
        {content}
      </p>
    </div>
  );
}
