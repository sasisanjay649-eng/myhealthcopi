import React from 'react';
import { ExternalLink, ShieldCheck, Calendar, BookOpen } from 'lucide-react';

export default function SourceCard({ source, compact = false }) {
  if (!source) return null;

  if (compact) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '999px',
          background: '#FFFFFF',
          border: '1px solid var(--panel-border)',
          fontSize: '0.74rem',
          fontWeight: 600,
          color: 'var(--text-main)',
          textDecoration: 'none',
          boxShadow: 'var(--shadow-subtle)',
          transition: 'all 0.2s ease',
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
        <ShieldCheck size={12} color="#2B8A62" />
        <span>{source.source_name || 'Medical Source'}</span>
        <ExternalLink size={10} color="var(--text-muted)" />
      </a>
    );
  }

  return (
    <div
      className="glass-panel card-hoverable"
      style={{
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        background: '#FFFFFF',
        border: '1px solid var(--panel-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#15573d',
            background: 'var(--accent-mint-soft)',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid var(--accent-mint-light)',
          }}
        >
          <ShieldCheck size={13} color="#2B8A62" />
          {source.source_name}
        </span>

        {source.date && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Calendar size={12} /> {source.date}
          </span>
        )}
      </div>

      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35 }}>
        {source.title}
      </h4>

      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
        {source.short_description || source.snippet}
      </p>

      <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            color: '#2563EB',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <span>View Official Guideline</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
