import React from 'react';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';

export default function Loading({
  text = 'Analyzing health metrics...',
  isError = false,
  errorText = '',
  onRetry = null,
  fullPage = false,
}) {
  if (isError) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '2rem auto',
          background: '#FFF8F8',
          border: '1px solid #F8B4B4',
          borderRadius: '16px',
        }}
      >
        <AlertCircle size={44} color="#E02424" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#9B1C1C', fontWeight: 600 }}>
          Unable to Load Data
        </h3>
        <p style={{ color: '#771D1D', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {errorText || 'A temporary connectivity issue occurred while communicating with the health service.'}
        </p>
        {onRetry && (
          <button onClick={onRetry} className="btn-primary" style={{ margin: '0 auto' }}>
            <RefreshCw size={16} /> Try Again
          </button>
        )}
      </div>
    );
  }

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '3px solid #DFEAE2',
          borderTopColor: '#57C99A',
          animation: 'orbit-cw 1s linear infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
        }}
      >
        <Activity size={22} color="#2B8A62" />
      </div>
      <p style={{ color: '#718579', fontSize: '0.92rem', fontWeight: 500 }}>{text}</p>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
}
