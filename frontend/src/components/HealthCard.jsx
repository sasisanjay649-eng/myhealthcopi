import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function HealthCard({
  title,
  value,
  unit = '',
  icon,
  trend = 'stable',
  trendText = '',
  targetText = '',
  color = 'mint', // mint, blue, purple, amber, rose
  onClick = null,
}) {
  const colorMap = {
    mint: {
      accent: '#2B8A62',
      soft: 'var(--accent-mint-soft)',
      border: 'var(--accent-mint-light)',
      glow: 'rgba(87, 201, 154, 0.15)',
    },
    blue: {
      accent: '#2563EB',
      soft: '#EFF6FF',
      border: '#BFDBFE',
      glow: 'rgba(59, 130, 246, 0.1)',
    },
    purple: {
      accent: '#7C3AED',
      soft: '#F5F3FF',
      border: '#DDD6FE',
      glow: 'rgba(124, 58, 237, 0.1)',
    },
    amber: {
      accent: '#D97706',
      soft: '#FEF3C7',
      border: '#FDE68A',
      glow: 'rgba(217, 119, 6, 0.1)',
    },
    rose: {
      accent: '#E11D48',
      soft: '#FFE4E6',
      border: '#FECDD3',
      glow: 'rgba(225, 29, 72, 0.1)',
    },
  };

  const scheme = colorMap[color] || colorMap.mint;

  let TrendIcon = Minus;
  let trendColor = 'var(--text-muted)';
  if (trend === 'up' || trend === 'improving') {
    TrendIcon = TrendingUp;
    trendColor = '#2B8A62';
  } else if (trend === 'down' || trend === 'declining') {
    TrendIcon = TrendingDown;
    trendColor = '#E11D48';
  }

  return (
    <div
      className="glass-panel card-hoverable"
      onClick={onClick}
      style={{
        padding: '1.25rem 1.5rem',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid var(--panel-border)`,
      }}
    >
      {/* Decorative top right corner subtle tint */}
      <div
        style={{
          position: 'absolute',
          top: '-25px',
          right: '-25px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: scheme.glow,
          filter: 'blur(25px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: scheme.soft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: scheme.accent,
            border: `1px solid ${scheme.border}`,
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.65rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.9rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
        {trendText && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: trendColor, fontWeight: 700 }}>
            <TrendIcon size={14} />
            <span>{trendText}</span>
          </div>
        )}
        {targetText && (
          <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 500 }}>
            {targetText}
          </span>
        )}
      </div>
    </div>
  );
}
