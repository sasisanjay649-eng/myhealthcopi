import React, { useState } from 'react';
import {
  Pill,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ShieldCheck,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MedicationCard({ medication }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleAskCopilot = () => {
    navigate('/copilot', {
      state: { initialQuery: `What does ${medication.name} generally do, and what precautions should I be aware of?` }
    });
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.4rem',
        borderRadius: '16px',
        border: '1px solid #DFEAE2',
        background: '#FFFFFF',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9rem',
        transition: 'all 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#E8F7EE',
              border: '1px solid #A8E6C1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Pill size={22} color="#2B8A62" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#18392B' }}>
              {medication.name}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#718579' }}>
              {medication.generic_name && (
                <span>Generic: {medication.generic_name} • </span>
              )}
              <span style={{ color: '#2B8A62', fontWeight: 600 }}>{medication.class_name || 'Therapeutic Agent'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleAskCopilot}
          className="btn-outline"
          style={{
            fontSize: '0.78rem',
            padding: '0.4rem 0.75rem',
            gap: '4px',
            borderColor: '#DFEAE2',
            color: '#2B8A62',
          }}
          title="Ask AI Copilot about this medication"
        >
          <MessageSquare size={13} /> Ask AI
        </button>
      </div>

      {/* General Uses */}
      <div
        style={{
          background: '#F3FAF5',
          border: '1px solid #DFEAE2',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
        }}
      >
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#2B8A62',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: '4px',
          }}
        >
          General Uses &amp; Educational Purpose
        </div>
        <p style={{ fontSize: '0.88rem', color: '#18392B', lineHeight: 1.5 }}>
          {medication.general_uses}
        </p>
      </div>

      {/* Expandable Sections: Side Effects, Precautions, Safety */}
      {expanded ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Side Effects */}
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#718579',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '4px',
              }}
            >
              Common Side Effects
            </div>
            <p style={{ fontSize: '0.86rem', color: '#18392B', lineHeight: 1.5 }}>
              {medication.common_side_effects}
            </p>
          </div>

          {/* Precautions */}
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#D97706',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertTriangle size={14} /> Precautions &amp; Interactions
            </div>
            <p style={{ fontSize: '0.85rem', color: '#92400E', lineHeight: 1.5, marginBottom: '6px' }}>
              {medication.precautions}
            </p>
            {medication.interaction_warnings && (
              <p style={{ fontSize: '0.82rem', color: '#B45309', lineHeight: 1.45 }}>
                <strong>Interactions:</strong> {medication.interaction_warnings}
              </p>
            )}
          </div>

          {/* Safety Notice */}
          <div
            style={{
              fontSize: '0.82rem',
              color: '#718579',
              borderLeft: '3px solid #57C99A',
              paddingLeft: '0.75rem',
              lineHeight: 1.45,
            }}
          >
            {medication.safety_info}
          </div>

          {/* Sources */}
          {medication.trusted_sources && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#718579' }}>
              <ShieldCheck size={14} color="#2B8A62" />
              <span>Verified sources: {medication.trusted_sources}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Toggle Expand / Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#718579',
          fontSize: '0.82rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          cursor: 'pointer',
          padding: '0.4rem',
          marginTop: '0.2rem',
        }}
      >
        <span>{expanded ? 'Show Less' : 'View Safety, Precautions & Side Effects'}</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Mandatory Prescription Disclaimer */}
      <div
        style={{
          fontSize: '0.74rem',
          color: '#718579',
          borderTop: '1px solid #DFEAE2',
          paddingTop: '0.6rem',
          lineHeight: 1.4,
        }}
      >
        VitaMind AI does NOT prescribe medicines or determine dosages. Confirm with a qualified doctor or pharmacist.
      </div>
    </div>
  );
}
