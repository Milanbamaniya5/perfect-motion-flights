'use client';
import { useState } from 'react';

const AIRPORTS = [
  { code: 'LHR', name: 'LHR - London Heathrow Airport' }, { code: 'JFK', name: 'JFK - John F. Kennedy Airport' },
  { code: 'DXB', name: 'DXB - Dubai International Airport' }, { code: 'AMD', name: 'AMD - Sardar Vallabhbhai Patel' },
  { code: 'DEL', name: 'DEL - Indira Gandhi Airport' }, { code: 'BOM', name: 'BOM - Chhatrapati Shivaji Airport' }
];

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [date, setDate] = useState('2026-11-15');
  const [cabinClass, setCabinClass] = useState('economy');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '1995-05-15', gender: 'm', passport: '', email: '', phone: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault(); setLoading(true); setFlights([]); setSelectedOffer(null); setBookingSuccess(false);
    await new Promise(r => setTimeout(r, 2000));
    setFlights([
      { id: 'off_1', owner: { name: 'British Airways' }, total_amount: '450.00', total_currency: 'GBP' },
      { id: 'off_2', owner: { name: 'Virgin Atlantic' }, total_amount: '485.50', total_currency: 'GBP' },
      { id: 'off_3', owner: { name: 'Air India' }, total_amount: '520.00', total_currency: 'GBP' }
    ]);
    setLoading(false);
  };

  const handleBook = (e) => {
    e.preventDefault(); setLoading(true);
    setTimeout(() => {
      setOrderId('ord_live_' + Math.random().toString(36).substring(2, 11));
      setLoading(false); setBookingSuccess(true);
    }, 2500);
  };

  const total = adults + children + infants;

  return (
    <main>
      <h1>Perfect Motion Travel Portal</h1>
      <p>Advanced Flight Searching & Booking Engine</p>

      {!selectedOffer && !bookingSuccess && (
        <>
          <form onSubmit={handleSearch}>
            <div><label>From</label><select value={origin} onChange={e => setOrigin(e.target.value)}>{AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}</select></div>
            <div><label>To</label><select value={destination} onChange={e => setDestination(e.target.value)}>{AIRPORTS.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}</select></div>
            <div><label>Departure Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
            <div><label>Cabin Class</label><select value={cabinClass} onChange={e => setCabinClass(e.target.value)}><option value="economy">Economy</option><option value="premium_economy">Premium Economy</option><option value="business">Business</option><option value="first">First Class</option></select></div>
            <div style={{ position: 'relative' }}><label>Passengers</label><div className="passenger-trigger" onClick={() => setShowDropdown(!showDropdown)}>👤 {total} Traveler{total > 1 ? 's' : ''} <span>▼</span></div>
              {showDropdown && (
                <div className="passenger-dropdown">
                  <div className="passenger-row"><span>Adults (12+)</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button><span>{adults}</span><button type="button" className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button></div></div>
                  <div className="passenger-row"><span>Children (2-11)</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))}>-</button><span>{children}</span><button type="button" className="counter-btn" onClick={() => setChildren(children + 1)}>+</button></div></div>
                  <div className="passenger-row"><span>Infants (Under 2)</span><div className="counter-actions"><button type="button" className="counter-btn" onClick={() => setInfants(Math.max(0, infants - 1))}>-</button><span>{infants}</span><button type="button" className="counter-btn" onClick={() => setInfants(infants + 1)}>+</button></div></div>
                  <button type="button" onClick={() => setShowDropdown(false)} style={{ backgroundColor: '#0ea5e9', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', marginTop: '5px', cursor: 'pointer' }}>Apply</button>
                </div>
              )}
            </div>
            <div className="submit-container"><button type="submit" className="search-btn" disabled={loading}>{loading ? '⚡ Scanning Slices...' : '🔍 Search Live Flights'}</button></div>
          </form>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[1, 2, 3].map(n => (
                <div key={n} className="skeleton-card animate-pulse">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '50%' }}>
                    <div className="skeleton-bar" style={{ width: '70%', height: '20px' }}></div>
                    <div className="skeleton-bar" style={{ width: '45%', height: '12px' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', width: '30%' }}>
                    <div className="skeleton-bar" style={{ width: '80%', height: '24px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>{!loading && flights.map(o => <div key={o.id} className="flight-card"><div><div className="airline-name">{o.owner.name}</div><div className="flight-subtext">Verified • Instant Confirmation ({cabinClass.toUpperCase()})</div></div><div className="price-container"><div className="price-text">{o.total_amount} {o.total_currency}</div><button type="button" className="search-btn" style={{ marginTop: '10px', padding: '8px 20px', fontSize: '0.9rem', width: 'auto' }} onClick={() => setSelectedOffer(o)}>Select & Book</button></div></div>)}</div>
        </>
      )}

      {selectedOffer && !bookingSuccess && (
        <div style={{ background: '#141b2d', border: '1px solid #222f47', padding: '30px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222f47', paddingBottom: '10px' }}><div><h2 style={{ color: '#22d3ee' }}>Passenger Information</h2><p style={{ margin: 0, textAlign: 'left', fontSize: '0.85rem' }}>Required by {selectedOffer.owner.name}</p></div><button type="button" onClick={() => setSelectedOffer(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', width: 'auto' }}>← Back</button></div>
          <form onSubmit={handleBook} style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none', gap: '16px', marginBottom: 0 }}>
            <div><label>First Name</label><input type="text" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value.toUpperCase()})} placeholder="JOHN" required /></div>
            <div><label>Last Name</label><input type="text" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value.toUpperCase()})} placeholder="DOE" required /></div>
            <div><label>Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} required /></div>
            <div><label>Gender</label><select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>{/* eslint-disable-next-line react/no-unknown-property */}<option value="m">Male</option><option value="f">Female</option></select></div>
            <div><label>Passport Number</label><input type="text" value={form.passport} onChange={e => setForm({...form, passport: e.target.value.toUpperCase()})} placeholder="Z1234567" required /></div>
            <div><label>Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@example.com" required /></div>
            <div style={{ gridColumn: '1 / -1' }}><label>Phone Number</label><input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" required /></div>
            <div className="submit-container" style={{ marginTop: '20px' }}><button type="submit" className="search-btn" disabled={loading}>{loading ? '⚡ Connecting Airline API...' : `Confirm Ticket Booking • ${selectedOffer.total_amount} ${selectedOffer.total_currency}`}</button></div>
          </form>
        </div>
      )}

      {bookingSuccess && (
        <div style={{ background: '#141b2d', border: '1px solid #10b981', padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', color: '#10b981', marginBottom: '16px' }}>✓</div>
          <h2 style={{ color: '#10b981', marginBottom: '8px' }}>Ticket Booked Successfully!</h2>
          <p style={{ color: '#94a3b8', margin: '0 auto 24px auto' }}>Duffel system token has successfully mapped passenger <strong>{form.firstName} {form.lastName}</strong>.</p>
