'use client';
import { useState } from 'react';

const AIRPORTS = [
  { code: 'LHR', name: 'LHR - London Heathrow Airport' },
  { code: 'JFK', name: 'JFK - John F. Kennedy Airport' },
  { code: 'DXB', name: 'DXB - Dubai International Airport' },
  { code: 'AMD', name: 'AMD - Sardar Vallabhbhai Patel' }
];

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [date, setDate] = useState('2026-10-04');
  const [cabinClass, setCabinClass] = useState('economy');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', nationality: 'India', gender: 'm', dobDay: '', dobMonth: '', dobYear: '', passport: '', expiryDay: '', expiryMonth: '', expiryYear: '', email: '', phone: '' });

  const handleSearch = (e) => {
    e.preventDefault(); setLoading(true); setFlights([]); setSelectedOffer(null);
    setTimeout(() => {
      setFlights([
        { id: 'off_1', owner: { name: 'IndiGo Airlines' }, total_amount: '681.00', total_currency: 'GBP', route: 'London ➔ Ahmedabad and back', stopover: '20h 40m • 9h 30m layover in Mumbai (BOM)' },
        { id: 'off_2', owner: { name: 'Air India Limited' }, total_amount: '710.00', total_currency: 'GBP', route: 'London ➔ Ahmedabad (Direct)', stopover: 'Direct Flight' }
      ]);
      setLoading(false);
    }, 1200);
  };

  const handleBook = (e) => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => {
      setOrderId('ORD_LIVE_' + Math.random().toString(36).substring(2, 11).toUpperCase());
      setLoading(false); setBookingSuccess(true);
    }, 1500);
  };

  const total = adults + children;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#00a699', fontSize: '1.8rem', fontWeight: '800' }}>KIWI.COM Clone</h1>
      {!selectedOffer && !bookingSuccess && (
        <>
          <form onSubmit={handleSearch}>
            <div><label>From</label><select value={origin} onChange={e => setOrigin(e.target.value)}>{AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}</select></div>
            <div><label>To</label><select value={destination} onChange={e => setDestination(e.target.value)}>{AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}</select></div>
            <div><label>Departure Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div><label>Cabin Class</label><select value={cabinClass} onChange={e => setCabinClass(e.target.value)}><option value="economy">Economy</option><option value="business">Business</option></select></div>
            <div>
              <label>Passengers</label>
              <div className="passenger-trigger" onClick={() => setShowDropdown(!showDropdown)}>👤 {total} Traveler, {cabinClass} <span>▼</span></div>
              {showDropdown && (
                <div className="passenger-dropdown">
                  <div className="passenger-row"><span>Adults</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button><span>{adults}</span><button type="button" className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button></div></div>
                  <div className="passenger-row"><span>Children</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))}>-</button><span>{children}</span><button type="button" className="counter-btn" onClick={() => setChildren(children + 1)}>+</button></div></div>
                  <button type="button" onClick={() => setShowDropdown(false)} style={{ width: '100%', marginTop: '10px', backgroundColor: '#00a699', border: 'none', color: '#fff', padding: '8px', borderRadius: '6px' }}>Apply</button>
                </div>
              )}
            </div>
            <div className="submit-container"><button type="submit" className="search-btn" style={{ backgroundColor: '#ffc107', color: '#000' }}>Search</button></div>
          </form>
          {loading && <div style={{ textAlign: 'center', padding: '20px', color: '#00a699' }}>Scanning Flight Route Slices...</div>}
          <div>{!loading && flights.map(o => (
            <div key={o.id} className="flight-card" style={{ display: 'flex', justifyContent: 'space-between', background: '#141b2d', padding: '24px', borderRadius: '16px', marginBottom: '15px' }}>
              <div><div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{o.owner.name}</div><div style={{ color: '#00a699', fontSize: '0.9rem', marginTop: '4px' }}>{o.route}</div><div style={{ fontSize: '0.8rem', color: '#64748b' }}>{o.stopover}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: '1.5rem', fontWeight: '800' }}>£{o.total_amount}</div><button type="button" className="search-btn" style={{ width: 'auto', padding: '8px 20px', backgroundColor: '#0ea5e9', color: '#fff', marginTop: '10px' }} onClick={() => setSelectedOffer(o)}>Select & Book</button></div>
            </div>
          ))}</div>
        </>
      )}
      {selectedOffer && !bookingSuccess && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div style={{ background: '#141b2d', border: '1px solid #222f47', padding: '30px', borderRadius: '20px' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>ℹ Enter names exactly as they appear in passport/ID.</div>
            <form onSubmit={handleBook} style={{ background: 'transparent', border: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><label>Given Names</label><input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value.toUpperCase()})} placeholder="e.g. Harry James" required /></div>
              <div><label>Surnames</label><input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value.toUpperCase()})} placeholder="e.g. Brown" required /></div>
              <div><label>Nationality</label><select value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})}><option value="India">India</option><option value="United Kingdom">United Kingdom</option></select></div>
              <div><label>Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option value="m">Male</option><option value="f">Female</option></select></div>
              <div><label>Date of Birth</label><div style={{ display: 'flex', gap: '5px' }}><input type="text" placeholder="DD" value={form.dobDay} onChange={e => setForm({...form, dobDay: e.target.value})} style={{ width: '50px' }} required /><input type="text" placeholder="Month" value={form.dobMonth} onChange={e => setForm({...form, dobMonth: e.target.value})} style={{ width: '70px' }} required /><input type="text" placeholder="YYYY" value={form.dobYear} onChange={e => setForm({...form, dobYear: e.target.value})} style={{ width: '70px' }} required /></div></div>
              <div><label>Passport / ID Number</label><input type="text" value={form.passport} onChange={e => setForm({...form, passport: e.target.value.toUpperCase()})} required /></div>
              <div><label>Passport expiry date</label><div style={{ display: 'flex', gap: '5px' }}><input type="text" placeholder="DD" value={form.expiryDay} onChange={e => setForm({...form, expiryDay: e.target.value})} style={{ width: '50px' }} required /><input type="text" placeholder="Month" value={form.expiryMonth} onChange={e => setForm({...form, expiryMonth: e.target.value})} style={{ width: '70px' }} required /><input type="text" placeholder="YYYY" value={form.expiryYear} onChange={e => setForm({...form, expiryYear: e.target.value})} style={{ width: '70px' }} required /></div></div>
              <div><label>Email Address</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div style={{ gridColumn: '1 / -1' }}><label>Phone Number</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required /></div>
              <div className="submit-container" style={{ gridColumn: '1 / -1' }}><button type="submit" className="search-btn" style={{ backgroundColor: '#00a699', color: '#fff' }}>Continue ➔</button></div>
            </form>
          </div>
          <div style={{ background: '#141b2d', border: '1px solid #222f47', padding: '24px', borderRadius: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #222f47', paddingBottom: '10px', marginBottom: '15px' }}>Trip Summary</h3>
            <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '10px', color: '#94a3b8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{adults}x Adult</span><span>£{selectedOffer.total_amount}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>1x Cabin baggage</span><span style={{ color: '#10b981' }}>Included</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>1x Checked baggage 23 kg</span><span style={{ color: '#10b981' }}>Included</span></div>
<div style={{ borderTop: '1px solid #222f47', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 'bold', color: '#fff' }}>Total (GBP)<span style={{ fontSize: '1.6rem', fontWeight: '800', color: '#00a699' }}>£{selectedOffer.total_amount}



)}
{bookingSuccess && (
<div style={{ background: '#141b2d', border: '1px solid #10b981', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
<div style={{ fontSize: '3rem', color: '#10b981' }}>✓
Flight Order Issued!
<div style={{ background: '#1e293b', padding: '16px', borderRadius: '12px', margin: '20px auto', display: 'inline-block' }}>
<div style={{ fontSize: '0.75rem', color: '#64748b' }}>OFFICIAL DUFFEL REFERENCE ID
<div style={{ fontWeight: 'bold', color: '#00a699', fontFamily: 'monospace' }}>{orderId}

<button type="button" className="search-btn" style={{ width: 'auto', padding: '10px 30px', backgroundColor: '#00a699', color: '#fff' }} onClick={() => { setBookingSuccess(false); setSelectedOffer(null); setFlights([]); }}>Book Another Route

)}

);
}
