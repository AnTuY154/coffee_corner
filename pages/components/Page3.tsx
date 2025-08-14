import React, { useEffect, useState } from 'react';
import Notification from './Notification';

interface Page3Props {
  onBack: () => void;
}

const Page3: React.FC<Page3Props> = ({ onBack }) => {
  const [name, setName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNoti, setShowNoti] = useState(false);
  const [notiMsg, setNotiMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setNotiMsg('Vui lòng nhập nội dung góp ý.');
      setShowNoti(true);
      return;
    }
    setLoading(true);
    try {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, feedback }),
      });

      setNotiMsg('Cảm ơn bạn đã feedback ❤');
      setShowNoti(true);
      setFeedback('');

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showNoti && (
        <Notification
          message={notiMsg}
          onClose={() => {
            setShowNoti(false);
            if (notiMsg.startsWith('Cảm ơn')) onBack();
          }}
        />
      )}
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, width: '100%', background: '#f7ede2', borderRadius: 20, boxShadow: '0 4px 24px rgba(182,137,76,0.10)', padding: 32, margin: '0 auto', position: 'relative', border: '1.5px solid #e3c9a5' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            position: 'absolute',
            left: 24,
            top: 24,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#fff7ec',
            border: '2px solid #b6894c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(182,137,76,0.10)',
            color: '#b6894c',
            fontSize: 22,
            cursor: 'pointer',
            transition: 'background 0.2s, color 0.2s, border 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#f5e9da';
            e.currentTarget.style.color = '#a06d2c';
            e.currentTarget.style.border = '2px solid #a06d2c';
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#fff7ec';
            e.currentTarget.style.color = '#b6894c';
            e.currentTarget.style.border = '2px solid #b6894c';
          }}
          aria-label="Quay lại"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 15L8 10.5L12.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h2 style={{ textAlign: 'center', marginBottom: 16, fontWeight: 700, fontSize: 26, letterSpacing: 0.5 }}>Feedback</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#7c5c45' }}>Tên (nếu muốn)</label>
          <input
            type="text"
            placeholder="Tên của bạn"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 16, background: '#faf8f6', outline: 'none', transition: 'border 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <textarea
            placeholder="cảm ơn bạn đã feedback chúng mình sẽ sớm cải thiện....."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 16, background: '#faf8f6', outline: 'none', transition: 'border 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', resize: 'vertical' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: 14, borderRadius: 12, background: loading ? '#e0c9a5' : '#b6894c', color: '#fff', fontWeight: 700, fontSize: 18, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(182,137,76,0.10)', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
          onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#a06d2c'; }}
          onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#b6894c'; }}
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>
    </>
  );
};

export default Page3; 