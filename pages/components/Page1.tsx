import React from 'react';

interface Page1Props {
  onNext: (drink: string) => void;
  onFeedback: () => void;
}

const coffeeList = [
  { name: 'Espresso', img: '/image/espresso.png' },
  { name: 'Bạc Xỉu', img: '/image/bacxiu.png' },
  { name: 'Nâu Đá', img: '/image/nauda.png' },
  { name: 'Matcha Latte', img: '/image/matcha.png' },
];

const Page1: React.FC<Page1Props> = ({ onNext, onFeedback }) => {
  return (
    <main
      style={{
        maxWidth: 400,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Nút Feedback góc trái */}
      <button
        type="button"
        onClick={onFeedback}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 14,
          background: '#fff7ec',
          border: '2px solid #b6894c',
          color: '#b6894c',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(182,137,76,0.12)',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s, border 0.2s',
          zIndex: 10,
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
        aria-label="Gửi góp ý"
      >
        Feedback
      </button>

      <img
        src="/image/logo.png"
        alt="logo"
        style={{ width: 120, height: 120, objectFit: 'cover', marginBottom: 16 }}
      />
      <h1
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: '#7c5c45',
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
        It&apos;s <span style={{ color: '#b08968' }}>Great Day</span> for Coffee
      </h1>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {coffeeList.map(({ name, img }) => (
          <li
            key={name}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: '1px solid #eee',
              width: '100%',
              cursor: 'pointer',
              opacity: 1,
            }}
            onClick={() => onNext(name)}
          >
            <img
              src={img}
              alt={name}
              style={{
                width: 40,
                height: 40,
                marginRight: 20,
                objectFit: 'cover',
              }}
            />
            <span style={{ flex: 1, fontSize: 20, color: '#7c5c45' }}>{name}</span>
            <span style={{ color: '#b08968', fontSize: 24, fontWeight: 700 }}>&#8250;</span>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Page1; 