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
        alert('No flights found or check API token');
      }
    } catch (err) {
      alert('Search failed');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-2 text-cyan-400">
          Perfect Motion Duffel Booking
        </h1>
        <p className="text-center text-slate-400 mb-8">Search real-time flights via Duffel API</p>

        <form onSubmit={handleSearch} className="bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap gap-4 items-end mb-8 border border-slate-700">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">From</label>
            <input 
              type="text" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value.toUpperCase())}
              className="w-full bg-slate-700 border border-slate-600 p-2.5 rounded-xl text-white font-bold"
              required 
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">To</label>
            <input 
              type="text" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              className="w-full bg-slate-700 border border-slate-600 p-2.5 rounded-xl text-white font-bold"
              required 
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs uppercase font-semibold text-slate-400 mb-1">Departure</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 p-2.5 rounded-xl text-white font-bold"
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition shadow-lg w-full sm:w-auto"
          >
            {loading ? 'Searching Flights...' : 'Search'}
          </button>
        </form>

        <div className="space-y-4">
          {flights.map((offer) => (
            <div key={offer.id} className="bg-slate-800 border border-slate-700 p-5 rounded-2xl flex justify-between items-center hover:border-cyan-500 transition">
              <div>
                <h3 className="text-xl font-bold text-slate-100">{offer.owner?.name || 'Airline'}</h3>
                <p className="text-sm text-slate-400 mt-1">Offer ID: {offer.id.substring(0, 16)}...</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-cyan-400">{offer.total_amount} {offer.total_currency}</p>
                <button onClick={() => alert(`Booking flow triggered for ${offer.id}`)} className="mt-2 bg-slate-700 hover:bg-slate-600 text-xs text-white font-medium px-4 py-2 rounded-lg transition">
                  Select Offer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
