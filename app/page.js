'use client';
import { useState } from 'react';

const AIRPORTS = [
  { code: 'LHR', name: 'LHR - London Heathrow Airport' },
  { code: 'JFK', name: 'JFK - John F. Kennedy Airport' },
  { code: 'DXB', name: 'DXB - Dubai International Airport' },
  { code: 'AMD', name: 'AMD - Sardar Vallabhbhai Patel' }
];

const COUNTRIES = ['United Kingdom', 'India', 'United States', 'United Arab Emirates', 'Canada'];

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [date, setDate] = useState('2026-10-04');
  const [cabinClass, setCabinClass] = useState('economy');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Checkout States
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', nationality: 'India', gender: 'm', dobDay: '', dobMonth: '', dobYear: '', passport: '', expiryDay: '', expiryMonth: '', expiryYear: '', email: '', phone: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleSearch = (e) => {
    e.preventDefault(); setLoading(true); setFlights([]); setSelectedOffer(null); setBookingSuccess(false);
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
    }, 2000);
  };

  const total = adults + children + infants;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#00a699', fontSize: '1.8rem', fontWeight: '800' }}>KIWI.COM Clone</h1>
      
      {/* STEP-BY-STEP PROGRESS NAVIGATION HEADER BAR */}
      {selectedOffer && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', margin: '20px 0 40px 0', borderBottom: '1px solid #222f47', paddingBottom: '15px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>
          <span>1. Search</span>
          <span style={{ color: '#00a699', borderBottom: '2px solid #00a699', paddingBottom: '13px' }}>2. Passenger details</span>
          <span>3. Booking option</span>
          <span>4. Baggage</span>
          <span>5. Ticket fare</span>
        </div>
      )}

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
                  <div className="passenger-row"><span>Adults 18+</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button><span>{adults}</span><button type="button" className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button></div></div>
                  <div className="passenger-row"><span>Children 0-17</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))}>-</button><span>{children}</span><button type="button" className="counter-btn" onClick={() => setChildren(children + 1)}>+</button></div></div>
                  <div className="passenger-row"><span>Infants under 2</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setInfants(Math.max(0, infants - 1))}>-</button><span>{infants}</span><button type="button" className="counter-btn" onClick={() => setInfants(infants + 1)}>+</button></div></div>
                  <button type="button" onClick={() => setShowDropdown(false)} style={{ width: '100%', marginTop: '10px', backgroundColor: '#00a699', border: 'none', color: '#fff', padding: '10px', borderRadius: '8px', fontWeight: 'bold' }}>Apply</button>
                </div>
              )}
            </div>
            <div className="submit-container"><button type="submit" className="search-btn" style={{ backgroundColor: '#ffc107', color: '#000' }}>Search</button></div>
          </form>

          {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#00a699', fontWeight: 'bold' }}>Scanning Live Flight Routes Slices...</div>}
          <div>
            {!loading && flights.map(o => (
              <div key={o.id} className="flight-card" style={{ display: 'flex', justifyContent: 'space-between', background: '#141b2d', padding: '24px', borderRadius: '16px', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{o.owner.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#00a699', fontWeight: 'bold', marginTop: '4px' }}>{o.route}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{o.stopover}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#fff' }}>£{o.total_amount}</div>
                  <button type="button" className="search-btn" style={{ width: 'auto', padding: '10px 24px', backgroundColor: '#0ea5e9', color: '#fff', marginTop: '10px' }} onClick={() => setSelectedOffer(o)}>Select & Book</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 🔵 KIWI SPLIT SCREEN LAYOUT (INSURANCE REMOVED AS REQUESTED) */}
      {selectedOffer && !bookingSuccess && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: COMPLETELY DETAILED PASSENGER CHECKOUT MODULE */}
          <div style={{ background: '#141b2d', border: '1px solid #222f47', padding: '30px', borderRadius: '20px' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '15px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '25px' }}>
              ℹ To avoid boarding complications, enter all names and surnames exactly as they appear in your passport/ID.
            </div>

            <form onSubmit={handleBook} style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div><label>Given Names</label><input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value.toUpperCase()})} placeholder="e.g. Harry James" required /></div>
              <div><label>Surnames</label><input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value.toUpperCase()})} placeholder="e.g. Brown" required /></div>
              
              <div>
                <label>Nationality</label>
                <select value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label>Gender</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
              </div>

              {/* Mapped Multi-Box Date of Birth from kiwi structure */}
              <div>
                <label>Date of Birth</label>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                  <input type="text" value={form.dobDay} onChange={e => setForm({...form, dobDay: e.target.value})} placeholder="DD" style={{ width: '60px' }} required />
                  <input type="text" value={form.dobMonth} onChange={e => setForm({...form, dobMonth: e.target.value})} placeholder="Month" style={{ width: '80px' }} required />
                  <input type="text" value={form.dobYear} onChange={e => setForm({...form, dobYear: e.target.value})} placeholder="YYYY" style={{ width: '80px' }} required />
                </div>
              </div>

