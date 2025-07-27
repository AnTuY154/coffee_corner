import React from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        background: '#f7ede2',
        borderRadius: 20,
        boxShadow: '0 4px 24px rgba(182,137,76,0.15)',
        padding: '36px 32px 28px 32px',
        minWidth: 320,
        maxWidth: '90vw',
        textAlign: 'center',
        border: '1.5px solid #e3c9a5',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#7c5c45', marginBottom: 18, lineHeight: 1.4 }}>{message}</div>
        <button
          onClick={onClose}
          style={{
            marginTop: 8,
            padding: '10px 32px',
            borderRadius: 12,
            background: '#b6894c',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(182,137,76,0.10)',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#a06d2c')}
          onMouseOut={e => (e.currentTarget.style.background = '#b6894c')}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Notification; 