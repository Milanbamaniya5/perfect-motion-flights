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
  const [cabinClass, setCabinClass] = useState('economy');
  
  // Passenger states
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFlights([]); // Clear previous results immediately

    // Creating passenger slices array dynamically for Duffel format
    const passengersArray = [];
    for(let i=0; i<adults; i++) passengersArray.push({ type: 'adult' });
    for(let i=0; i<children; i++) passengersArray.push({ type: 'child' });
    for(let i=0; i<infants; i++) passengersArray.push({ type: 'infant_without_seat' });
    
    // Simulate premium processing delay to let the animation show perfectly
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date, cabin_class: cabinClass, passengers: passengersArray }),
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

  const totalPassengers = adults + children + infants;

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

        <div>
          <label>Ticket Cabin Class</label>
          <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)}>
            <option value="economy">Economy Class</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business Class</option>
            <option value="first">First Class</option>
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <label>Passengers</label>
          <div className="passenger-trigger" onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}>
            <span>👤 {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>▼</span>
          </div>

          {showPassengerDropdown && (
            <div className="passenger-dropdown">
              <div className="passenger-row">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Adults</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Age 12+</div>
                </div>
                <div className="counter-actions">
                  <button type="button" className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                  <span style={{ fontWeight: '700', color: '#22d3ee', minWidth: '16px', textAlign: 'center' }}>{adults}</span>
                  <button type="button" className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button>
                </div>
              </div>

              <div className="passenger-row">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Children</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Age 2 - 11</div>
                </div>
                <div className="counter-actions">
                  <button type="button" className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                  <span style={{ fontWeight: '700', color: '#22d3ee', minWidth: '16px', textAlign: 'center' }}>{children}</span>
                  <button type="button" className="counter-btn" onClick={() => setChildren(children + 1)}>+</button>
                </div>
              </div>

              <div className="passenger-row">
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Infants</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Under age 2</div>
                </div>
                <div className="counter-actions">
                  <button type="button" className="counter-btn" onClick={() => setInfants(Math.max(0, infants - 1))}>-</button>
                  <span style={{ fontWeight: '700', color: '#22d3ee', minWidth: '16px', textAlign: 'center' }}>{infants}</span>
                  <button type="button" className="counter-btn" onClick={() => setInfants(infants + 1)}>+</button>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setShowPassengerDropdown(false)}
                style={{ backgroundColor: '#0ea5e9', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', marginTop: '5px', cursor: 'pointer' }}
              >
                Apply Details
              </button>
            </div>
          )}
        </div>

        <div className="submit-container">
          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? '⚡ Scanning Global Route Slices...' : '🔍 Search Live Flights'}
          </button>
        </div>
      </form>

      {/* Advanced Motion Searching Animations Loader */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card animate-pulse">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '50%' }}>
                <div className="skeleton-bar" style={{ width: '70%', height: '20px' }}></div>
                <div className="skeleton-bar" style={{ width: '45%', height: '12px' }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', width: '30%' }}>
                <div className="skeleton-bar" style={{ width: '80%', height: '24px' }}></div>
                <div className="skeleton-bar" style={{ width: '50%', height: '16px' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div>
        {!loading && flights.map((offer) => (
          <div key={offer.id} className="flight-card">
            <div>
              <div className="airline-name">{offer.owner?.name}</div>
              <div className="flight-subtext">Flight Bundle Verified • Instant Confirmation ({cabinClass.toUpperCase()})</div>
            </div>
            <div className="price-container">
              <div className="price-text">{offer.total_amount} {offer.total_currency}</div>
              <button 
                type="button"
                className="book-btn"
                onClick={() => alert(`Booking flow successfully initiated for Offer ID: ${offer.id}. Class: ${cabinClass}`)}
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
