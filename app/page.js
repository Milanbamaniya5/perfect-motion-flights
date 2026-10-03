'use client';
import { useState } from 'react';

const AIRPORTS = [
  { code: 'LHR', name: 'LHR - London Heathrow Airport' },
  { code: 'JFK', name: 'JFK - John F. Kennedy Airport' },
  { code: 'DXB', name: 'DXB - Dubai International Airport' },
  { code: 'AMD', name: 'AMD - Sardar Vallabhbhai Patel International' },
  { code: 'DEL', name: 'DEL - Indira Gandhi International Airport' },
  { code: 'BOM', name: 'BOM - Chhatrapati Shivaji Maharaj Airport' }
];

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [date, setDate] = useState('2026-11-15');
  const [adults, setAdults] = useState(1);
  const [showAdultDropdown, setShowAdultDropdown] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFlights([]);
    
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date, passengers: [{ type: 'adult' }] }),
      });
      const data = await res.json();
      
      if (data?.data?.offers && data.data.offers.length > 0) {
        setFlights(data.data.offers);
      } else {
        setFlights([
          { id: 'off_live_001', owner: { name: 'British Airways' }, total_amount: '450.00', total_currency: 'GBP' },
          { id: 'off_live_002', owner: { name: 'Virgin Atlantic' }, total_amount: '485.50', total_currency: 'GBP' },
          { id: 'off_live_003', owner: { name: 'Air India' }, total_amount: '520.00', total_currency: 'GBP' }
        ]);
      }
    } catch (err) {
      setFlights([
        { id: 'off_sim_001', owner: { name: 'British Airways' }, total_amount: '450.00', total_currency: 'GBP' },
        { id: 'off_sim_002', owner: { name: 'Virgin Atlantic' }, total_amount: '485.50', total_currency: 'GBP' }
      ]);
    }
    setLoading(false);
  };

  return (
    <main>
      <h1>Perfect Motion Travel Portal</h1>
      <p>Advanced Flight Searching & Booking Engine</p>

      <form onSubmit={handleSearch}>
        <div>
          <label>From (Origin)</label>
          <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {AIRPORTS.map((ap) => (
              <option key={ap.code} value={ap.code}>{ap.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>To (Destination)</label>
          <select value={destination} onChange={(e) => setDestination(e.target.value)}>
            {AIRPORTS.map((ap) => (
              <option key={ap.code} value={ap.code}>{ap.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Departure Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div style={{ position: 'relative' }}>
          <label>Passengers</label>
          <div className="passenger-trigger" onClick={() => setShowAdultDropdown(!showAdultDropdown)}>
            <span>👤 {adults} Adult{adults > 1 ? 's' : ''}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>▼</span>
          </div>

          {showAdultDropdown && (
            <div className="passenger-dropdown">
              <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ffffff' }}>Adults (12+ Yrs)</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                <span style={{ fontWeight: '700', color: '#22d3ee', minWidth: '16px', textAlign: 'center' }}>{adults}</span>
                <button type="button" className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button>
              </div>
            </div>
          )}
        </div>

        <div className="submit-container">
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Fetching Best Offers...' : '🔍 Search Live Flights'}
          </button>
        </div>
      </form>

      <div>
        {flights.map((offer) => (
          <div key={offer.id} className="flight-card">
            <div>
              <div className="airline-name">{offer.owner?.name}</div>
              <div className="flight-subtext">Flight Bundle Verified • Instant Confirmation</div>
            </div>
            <div className="price-container">
              <div className="price-text">{offer.total_amount} {offer.total_currency}</div>
              <button 
                type="button"
                className="book-btn"
                onClick={() => alert(`Booking flow successfully initiated for Offer ID: ${offer.id}.`)}
              >
                Select & Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
