import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '420px',
        width: 'calc(100% - 48px)',
      }}
    >
      {toasts.map((toast) => {
        let borderColor = '#DFEAE2';
        let icon = <Info size={20} color="#57C99A" />;
        let bg = '#FFFFFF';
        let textColor = '#18392B';

        if (toast.type === 'success') {
          borderColor = '#A8E6C1';
          icon = <CheckCircle2 size={20} color="#2B8A62" />;
          bg = '#F3FAF5';
          textColor = '#18392B';
        } else if (toast.type === 'error') {
          borderColor = '#F8B4B4';
          icon = <AlertCircle size={20} color="#E02424" />;
          bg = '#FDF2F2';
          textColor = '#9B1C1C';
        } else if (toast.type === 'warning') {
          borderColor = '#FDE68A';
          icon = <AlertTriangle size={20} color="#D97706" />;
          bg = '#FFFBEB';
          textColor = '#92400E';
        }

        return (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: bg,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 8px 24px rgba(24, 57, 43, 0.1)',
              color: textColor,
              fontSize: '0.9rem',
              fontWeight: 500,
              animation: 'float-subtle 0.3s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              {icon}
              <span style={{ lineHeight: 1.4 }}>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#718579',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
