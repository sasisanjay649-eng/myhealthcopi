import React from 'react';
import {
  Bot,
  User,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Key,
  Settings,
  AlertCircle
} from 'lucide-react';
import SourceCard from './SourceCard';

// Clean Markdown renderer for rich assistant answers
function FormattedMarkdown({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let currentList = [];
  let listKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul
          key={`list-${listKey++}`}
          style={{
            margin: '0.5rem 0 0.8rem 1.25rem',
            paddingLeft: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            color: 'var(--text-main)',
          }}
        >
          {currentList.map((item, idx) => (
            <li key={idx} style={{ lineHeight: 1.55 }}>
              {formatInlineText(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`h4-${idx}`}
          style={{
            color: 'var(--text-main)',
            fontSize: '1rem',
            fontWeight: 700,
            marginTop: idx === 0 ? '0' : '1.1rem',
            marginBottom: '0.4rem',
            letterSpacing: '0.02em',
          }}
        >
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${idx}`}
          style={{
            color: 'var(--text-main)',
            fontSize: '1.1rem',
            fontWeight: 800,
            marginTop: '1.2rem',
            marginBottom: '0.5rem',
          }}
        >
          {trimmed.replace(/^##\s+/, '')}
        </h3>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const itemText = trimmed.replace(/^[-*•]\s+/, '');
      currentList.push(itemText);
      return;
    }

    // Numbered lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      currentList.push(itemText);
      return;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          style={{
            borderLeft: '3px solid var(--accent-mint)',
            paddingLeft: '0.85rem',
            margin: '0.6rem 0',
            color: 'var(--text-muted)',
            fontStyle: 'italic',
            fontSize: '0.9rem',
          }}
        >
          {formatInlineText(trimmed.replace(/^>\s+/, ''))}
        </blockquote>
      );
      return;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${idx}`} style={{ height: '0.4rem' }} />);
      return;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p
        key={`p-${idx}`}
        style={{
          margin: '0 0 0.5rem 0',
          lineHeight: 1.6,
          color: 'var(--text-main)',
          fontSize: '0.92rem',
        }}
      >
        {formatInlineText(trimmed)}
      </p>
    );
  });

  flushList();
  return <div style={{ fontSize: '0.92rem' }}>{elements}</div>;
}

// Inline formatting: **bold** and `code`
function formatInlineText(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: '#fff', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            background: 'rgba(88, 224, 189, 0.12)',
            color: '#58e0bd',
            padding: '0.15rem 0.35rem',
            borderRadius: '4px',
            fontSize: '0.85em',
            fontFamily: 'monospace',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function ChatMessage({ message, onRetry, onOpenConfig }) {
  const isUser = message.role === 'user';
  const structured = message.structured_data;
  const isEmergency = message.safety_flags?.is_emergency || message.is_emergency;
  const isStreaming = message.isStreaming;
  const isError = message.isError || message.error;
  const errorDetail = message.errorDetail || message.error_data;

  // Render User Message
  if (isUser) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1.25rem',
          paddingLeft: '15%',
          gap: '0.75rem',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            background: 'var(--accent-mint-soft)',
            border: '1px solid var(--accent-mint-light)',
            borderRadius: '16px 16px 4px 16px',
            padding: '0.85rem 1.25rem',
            color: 'var(--text-main)',
            fontSize: '0.94rem',
            lineHeight: 1.5,
            boxShadow: 'var(--shadow-subtle)',
            maxWidth: '85%',
            wordBreak: 'break-word',
            fontWeight: 500,
          }}
        >
          {message.content}
        </div>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'var(--accent-mint-light)',
            border: '1px solid var(--accent-mint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}
        >
          <User size={18} color="var(--text-main)" />
        </div>
      </div>
    );
  }

  // Render Error Message (e.g. AI Provider Missing or Network Error)
  if (isError) {
    const isKeyRequired =
      errorDetail?.error_code === 'AI_API_KEY_REQUIRED' ||
      message.content?.includes('API key is required') ||
      message.content?.includes('No API key configured');

    return (
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.75rem',
          paddingRight: '5%',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'var(--accent-red-soft)',
            border: '1px solid var(--accent-red-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <AlertCircle size={20} color="#DC2626" />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem',
              borderRadius: '14px',
              border: '1px solid var(--accent-red-border)',
              background: 'var(--accent-red-soft)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Key size={18} color="#9B1C1C" />
              <span style={{ fontWeight: 700, color: '#9B1C1C', fontSize: '0.98rem' }}>
                {isKeyRequired ? 'AI Model Configuration Required' : 'Request Encountered an Error'}
              </span>
            </div>

            <p style={{ color: '#9B1C1C', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 0.85rem 0' }}>
              {message.content}
            </p>

            {errorDetail?.instructions && (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--accent-red-border)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9B1C1C', marginBottom: '4px' }}>
                  Next Steps:
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#771D1D', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {errorDetail.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {onOpenConfig && (
                <button
                  onClick={onOpenConfig}
                  className="btn-primary"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.45rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Settings size={14} /> Open AI Settings
                </button>
              )}

              {onRetry && (
                <button
                  onClick={() => onRetry(message.retryText || '')}
                  className="btn-outline"
                  style={{
                    fontSize: '0.82rem',
                    padding: '0.45rem 0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RotateCcw size={14} /> Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Assistant Message
  return (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.75rem',
        paddingRight: '5%',
      }}
    >
      {/* Bot Icon */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'var(--accent-mint-soft)',
          border: '1px solid var(--accent-mint-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: isStreaming
            ? '0 0 16px rgba(87, 201, 154, 0.4)'
            : 'var(--shadow-subtle)',
          transition: 'all 0.3s ease',
        }}
      >
        <Bot size={20} color="#2B8A62" />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Model Badge */}
        {message.model_name && !isStreaming && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                color: '#15573d',
                background: 'var(--accent-mint-soft)',
                border: '1px solid var(--accent-mint-light)',
                padding: '0.15rem 0.55rem',
                borderRadius: '6px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={11} color="#2B8A62" /> {message.model_name}
            </span>
          </div>
        )}

        {/* Emergency Alert Banner */}
        {isEmergency && (
          <div
            style={{
              background: 'var(--accent-red-soft)',
              border: '1px solid var(--accent-red-border)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              gap: '0.85rem',
              alignItems: 'flex-start',
              color: '#9B1C1C',
            }}
          >
            <ShieldAlert size={22} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#9B1C1C', marginBottom: '4px' }}>
                URGENT MEDICAL NOTICE
              </div>
              <div style={{ fontSize: '0.86rem', lineHeight: 1.5 }}>
                This guidance is for educational and coaching purposes and cannot replace emergency medical care.
                If you or someone nearby is experiencing acute chest pain, sudden numbness, difficulty breathing, or
                loss of consciousness, contact your local emergency service (911 / 112 / 999) immediately.
              </div>
            </div>
          </div>
        )}

        {/* Live Streaming Mode */}
        {isStreaming ? (
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.4rem',
              borderRadius: '16px',
              border: '1px solid var(--panel-border)',
              boxShadow: 'var(--shadow-card)',
              background: '#FFFFFF',
            }}
          >
            <FormattedMarkdown content={message.content} />
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '16px',
                background: 'var(--accent-mint)',
                marginLeft: '4px',
                verticalAlign: 'text-bottom',
                animation: 'blink-cursor 0.9s infinite',
                borderRadius: '2px',
              }}
            />
          </div>
        ) : structured && structured.summary ? (
          /* Structured Cards View */
          <div
            className="glass-panel"
            style={{
              padding: '1.4rem',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.1rem',
              border: '1px solid var(--panel-border)',
              boxShadow: 'var(--shadow-card)',
              background: '#FFFFFF',
            }}
          >
            {/* Summary */}
            {structured.summary && (
              <div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#2B8A62',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                  }}
                >
                  Core Health Synthesis
                </div>
                <p style={{ fontSize: '0.96rem', color: 'var(--text-main)', fontWeight: 600, lineHeight: 1.55, margin: 0 }}>
                  {structured.summary}
                </p>
              </div>
            )}

            {/* What Your Data Shows */}
            {structured.what_your_data_shows && (
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '12px',
                  padding: '0.9rem 1.1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#2563EB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                  }}
                >
                  What Your Personal Health Data Shows
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6, margin: 0 }}>
                  {structured.what_your_data_shows}
                </p>
              </div>
            )}

            {/* General Information / Context */}
            {structured.general_information && (
              <div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                  }}
                >
                  Evidence &amp; Clinical Context
                </div>
                <FormattedMarkdown content={structured.general_information} />
              </div>
            )}

            {/* Possible Next Steps */}
            {structured.possible_next_steps && structured.possible_next_steps.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#2B8A62',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '8px',
                  }}
                >
                  Actionable Steps &amp; Recommendations
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {structured.possible_next_steps.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '0.89rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.5,
                      }}
                    >
                      <CheckCircle2 size={16} color="#2B8A62" style={{ flexShrink: 0, marginTop: '3px' }} />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* When to Seek Professional Help */}
            {structured.when_to_seek_professional_help && (
              <div
                style={{
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  borderRadius: '12px',
                  padding: '0.9rem 1.1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#92400E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={14} color="#92400E" /> When to Consult a Healthcare Specialist
                </div>
                <p style={{ fontSize: '0.86rem', color: '#92400E', lineHeight: 1.55, margin: 0 }}>
                  {structured.when_to_seek_professional_help}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Freeform Markdown View */
          <div
            className="glass-panel"
            style={{
              padding: '1.25rem 1.4rem',
              borderRadius: '16px',
              border: '1px solid var(--panel-border)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <FormattedMarkdown content={message.content} />
          </div>
        )}

        {/* Verified Medical Evidence Sources */}
        {message.sources && message.sources.length > 0 && (
          <div style={{ marginTop: '0.25rem' }}>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <FileText size={12} /> Verified Evidence Sources
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {message.sources.map((src, idx) => (
                <SourceCard key={idx} source={src} compact={true} />
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer footer */}
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
          Educational wellness reference. VitaMind AI does not diagnose medical conditions or prescribe drug dosages.
        </div>
      </div>
    </div>
  );
}
