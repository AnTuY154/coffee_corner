import React from 'react';

interface Page1Props {
  onNext: (drink: string) => void;
}

const coffeeList = [
  { name: 'Espresso', img: '/image/espresso.png' },
  { name: 'Bạc Xỉu', img: '/image/bacxiu.png' },
  { name: 'Nâu Đá', img: '/image/nauda.png' },
];

const Page1: React.FC<Page1Props> = ({ onNext }) => {
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