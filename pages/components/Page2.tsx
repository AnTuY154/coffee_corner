import React, { useState, useEffect } from 'react';
import Notification from './Notification';

interface Page2Props {
  onBack: () => void;
  selectedDrink: string | null;
}

type DrinkName = 'Bạc Xỉu' | 'Nâu Đá' | 'Espresso';
// Giá từng loại
const PRICES: Record<DrinkName, { M: number; L: number }> = {
  'Bạc Xỉu': { M: 20000, L: 25000 },
  'Nâu Đá': { M: 18000, L: 23000 },
  'Espresso': { M: 15000, L: 20000 },
};
// Ảnh từng loại
const DRINK_IMAGES: Record<DrinkName, string> = {
  'Bạc Xỉu': '/image/bacxiu.png',
  'Nâu Đá': '/image/nauda.png',
  'Espresso': '/image/espresso.png',
};

const Page2: React.FC<Page2Props> = ({ onBack, selectedDrink }) => {
  const drink: DrinkName = (selectedDrink as DrinkName) || 'Bạc Xỉu';
  const [size, setSize] = useState<'M' | 'L'>('M');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  // Thành phần mặc định từng loại
  const getDefaultIngredients = (drink: string, size: 'M' | 'L') => {
    if (drink === 'Bạc Xỉu') {
      return size === 'M'
        ? { condensedMilk: 10, robusta: 7, arabica: 3, freshMilk: 15 }
        : { condensedMilk: 20, robusta: 10, arabica: 6, freshMilk: 15 };
    }
    if (drink === 'Nâu Đá') {
      return size === 'M'
        ? { condensedMilk: 10, robusta: 10, arabica: 0, freshMilk: 0 }
        : { condensedMilk: 15, robusta: 15, arabica: 0, freshMilk: 0 };
    }
    if (drink === 'Espresso') {
      return size === 'M'
        ? { condensedMilk: 0, robusta: 8, arabica: 2, freshMilk: 0 }
        : { condensedMilk: 0, robusta: 12, arabica: 3, freshMilk: 0 };
    }
    return { condensedMilk: 0, robusta: 0, arabica: 0, freshMilk: 0 };
  };
  // State thành phần
  const [condensedMilk, setCondensedMilk] = useState(getDefaultIngredients(drink, 'M').condensedMilk);
  const [robusta, setRobusta] = useState(getDefaultIngredients(drink, 'M').robusta);
  const [arabica, setArabica] = useState(getDefaultIngredients(drink, 'M').arabica);
  const [freshMilk, setFreshMilk] = useState(getDefaultIngredients(drink, 'M').freshMilk);
  const [ice, setIce] = useState(3); // Thêm state cho Đá, mặc định 3
  const [price, setPrice] = useState(PRICES[drink][size]);
  const [loading, setLoading] = useState(false);
  const [showNoti, setShowNoti] = useState(false);
  const [notiMsg, setNotiMsg] = useState('');

  // Lấy tên từ localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('CoffeeCornerCustomerName');
    if (savedName) setName(savedName);
  }, []);

  // Cập nhật giá và thành phần khi đổi size hoặc loại đồ uống
  useEffect(() => {
    setPrice(PRICES[drink][size]);
    const def = getDefaultIngredients(drink, size);
    setCondensedMilk(def.condensedMilk);
    setRobusta(def.robusta);
    setArabica(def.arabica);
    setFreshMilk(def.freshMilk);
    setIce(3); // Reset đá về mặc định khi đổi size/drink
  }, [size, drink]);

  // Nếu là Bạc Xỉu, Nâu Đá, Espresso: khi robusta đổi thì arabica tự động đổi
  useEffect(() => {
    if (drink === 'Bạc Xỉu') {
      setArabica(size === 'M' ? 10 - robusta : 16 - robusta);
    } else if (drink === 'Nâu Đá') {
      setArabica(size === 'M' ? 12 - robusta : 18 - robusta);
    } else if (drink === 'Espresso') {
      setArabica(size === 'M' ? 10 - robusta : 15 - robusta);
    }
  }, [robusta, size, drink]);

  // Khi submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('CoffeeCornerCustomerName', name);
    try {
      const res = await fetch('/api/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          drink,
          size,
          price,
          condensedMilk,
          robusta,
          arabica,
          freshMilk,
          ice, // Thêm đá vào payload
          note, // Thêm note vào payload
        }),
        keepalive: true, // Đảm bảo gửi request khi tab bị đóng nhanh
      });
      if (res.ok) {
        setNotiMsg('Cảm ơn bạn ghé thăm ❤ \n Làm việc hăng say nhé ^^');
        setShowNoti(true);
      } else {
        setNotiMsg('Có lỗi khi gửi đơn hàng. Vui lòng thử lại!');
        setShowNoti(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm render Robusta
  const renderRobustaOptions = (options: number[], robusta: number, setRobusta: (val: number) => void) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ marginBottom: 4, fontWeight: 500 }}>Robusta:</div>
      {options.map(val => (
        <label key={val} style={{ marginRight: 16, fontWeight: 500 }}>
          <input type="radio" name="robusta" value={val} checked={robusta === val} onChange={() => setRobusta(val)} /> {val}g
        </label>
      ))}
    </div>
  );

  // Hàm render Arabica
  const renderArabicaInfo = (arabica: number, total: number) => (
    <div style={{ marginBottom: 18, opacity: 0.7 }}>
      <div style={{ marginBottom: 4, fontWeight: 500 }}>Arabica (tự động):</div>
      <span style={{ display: 'inline-block', minWidth: 60, fontWeight: 600, color: '#b6894c', fontSize: 16 }}>{arabica}g</span>
      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Tổng robusta + arabica = {total}g</div>
    </div>
  );
  // Render các thành phần phù hợp từng loại
  const renderIngredients = () => {
    if (drink === 'Bạc Xỉu') {
      return <>
        <div style={{ marginBottom: 18 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Sữa đặc:</div>
          {[10, 15, 20, 25].map(val => (
            <label key={val} style={{ marginRight: 16, fontWeight: 500 }}>
              <input type="radio" name="condensedMilk" value={val} checked={condensedMilk === val} onChange={() => setCondensedMilk(val)} /> {val}g
            </label>
          ))}
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Sữa tươi:</div>
          {[10, 15, 20, 25].map(val => (
            <label key={val} style={{ marginRight: 16, fontWeight: 500 }}>
              <input type="radio" name="freshMilk" value={val} checked={freshMilk === val} onChange={() => setFreshMilk(val)} /> {val}g
            </label>
          ))}
        </div>
      </>;
    }
    if (drink === 'Nâu Đá') {
      return <>
        <div style={{ marginBottom: 18 }}>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Sữa đặc:</div>
          {[10, 15, 20, 25].map(val => (
            <label key={val} style={{ marginRight: 16, fontWeight: 500 }}>
              <input type="radio" name="condensedMilk" value={val} checked={condensedMilk === val} onChange={() => setCondensedMilk(val)} /> {val}g
            </label>
          ))}
        </div>
      </>;
    }
    // Espresso không có sữa đặc, sữa tươi
    return null;
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
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, width: "100%", background: '#f7ede2', borderRadius: 20, boxShadow: '0 4px 24px rgba(182,137,76,0.10)', padding: 32, margin: '0 auto', position: 'relative', border: '1.5px solid #e3c9a5' }}>
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
          <path d="M12.5 15L8 10.5L12.5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <h2 style={{ textAlign: 'center', marginBottom: 16, fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>{drink}</h2>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <img src={DRINK_IMAGES[drink] || '/image/bacxiu.png'} alt={drink} style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 16, boxShadow: '0 2px 8px rgba(182,137,76,0.08)' }} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 22, textAlign: 'center', marginBottom: 16 }}>
        Giá: <span style={{ color: '#b6894c', fontWeight: 700 }}>{price.toLocaleString()}đ</span>
      </div>
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="HBLAB ID (Ex: TuanDTA)"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 17, background: '#faf8f6', marginBottom: 2, outline: 'none', transition: 'border 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}
          required
        />
      </div>
   
      <div style={{ marginBottom: 18 }}>
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Size:</div>
        <label style={{ marginRight: 16, fontWeight: 500 }}><input type="radio" name="size" value="M" checked={size === 'M'} onChange={() => setSize('M')} /> M</label>
        <label style={{ fontWeight: 500 }}><input type="radio" name="size" value="L" checked={size === 'L'} onChange={() => setSize('L')} /> L</label>
      </div>
      {/* Luôn luôn render Robusta và Arabica */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Robusta:</div>
        {(() => {
          let options: number[] = [];
          if (drink === 'Bạc Xỉu') options = size === 'M' ? [3, 5, 7] : [6, 8, 10];
          else if (drink === 'Nâu Đá') options = size === 'M' ? [8, 10, 12] : [12, 15, 18];
          else if (drink === 'Espresso') options = size === 'M' ? [6, 8, 10] : [10, 12, 14];
          return options.map(val => (
            <label key={val} style={{ marginRight: 16, fontWeight: 500 }}>
              <input type="radio" name="robusta" value={val} checked={robusta === val} onChange={() => setRobusta(val)} /> {val}g
            </label>
          ));
        })()}
      </div>
      <div style={{ marginBottom: 18, opacity: 0.7 }}>
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Arabica (tự động):</div>
        <span style={{ display: 'inline-block', minWidth: 60, fontWeight: 600, color: '#b6894c', fontSize: 16 }}>{arabica}g</span>
        <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
          Tổng robusta + arabica = {drink === 'Bạc Xỉu' ? (size === 'M' ? 10 : 16) : drink === 'Nâu Đá' ? (size === 'M' ? 12 : 18) : (size === 'M' ? 10 : 15)}g
        </div>
      </div>
      {/* Thêm thành phần Đá */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ marginBottom: 4, fontWeight: 500 }}>Đá (viên):</div>
        {[0, 2, 3, 4].map(val => (
          <label key={val} style={{ marginRight: 16, fontWeight: 500 }}>
            <input type="radio" name="ice" value={val} checked={ice === val} onChange={() => setIce(val)} /> {val}
          </label>
        ))}
      </div>
    
      {renderIngredients()}

      <div style={{ marginBottom: 20 }}>
        <textarea
          placeholder="Ghi chú (tuỳ chọn)"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={2}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid #e0e0e0', fontSize: 16, background: '#faf8f6', marginBottom: 2, outline: 'none', transition: 'border 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', resize: 'none' }}
        />
      </div>
      <button type="submit" style={{ width: '100%', padding: 14, borderRadius: 12, background: loading ? '#e0c9a5' : '#b6894c', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(182,137,76,0.10)', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
        onMouseOver={e => { if (!loading) e.currentTarget.style.background = '#a06d2c'; }}
        onMouseOut={e => { if (!loading) e.currentTarget.style.background = '#b6894c'; }}
        disabled={loading}
      >
        {loading ? 'Đang gửi...' : 'Order Now'}
      </button>
    </form>
    </>
  );
};

export default Page2; 