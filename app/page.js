'use client';
import { useState } from 'react';

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [date, setDate] = useState('2026-11-15');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date }),
      });
      const data = await res.json();
      if (data?.data?.offers) {
        setFlights(data.data.offers);
      } else {
        alert('No flights found. Make sure you use LHR to JFK for sandbox test mode.');
      }
    } catch (err) {
      alert('Search failed');
    }
    setLoading(false);
  };

  return (
    <main>
      <h1>Perfect Motion Duffel Booking</h1>
      <p>Live Flight Portal with Smooth Pure CSS Layout</p>

      {/* Search Panel */}
      <form onSubmit={handleSearch}>
        <div>
          <label>From</label>
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} required />
        </div>
        <div>
          <label>To</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} required />
        </div>
        <div>
          <label>Departure</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div style={{ minWidth: '100%', marginTop: '10px' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Searching Flights...' : 'Search Flights'}
          </button>
        </div>
      </form>

      {/* Results Panel */}
      <div style={{ marginTop: '20px' }}>
        {flights.map((offer) => (
          <div key={offer.id} className="flight-card">
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#f8fafc' }}>{offer.owner?.name || 'Airline Offer'}</h3>
              <p style={{ margin: 0, textAlign: 'left', fontSize: '0.85rem', color: '#94a3b8' }}>
                Offer ID: {offer.id.substring(0, 16)}...
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="price-text">{offer.total_amount} {offer.total_currency}</div>
              <button 
                onClick={() => alert(`Booking flow triggered for ${offer.id}`)} 
                style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.8rem', backgroundColor: '#334155', color: '#fff' }}
              >
                Select
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
