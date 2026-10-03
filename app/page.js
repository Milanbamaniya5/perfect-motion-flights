'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState('2026-10-04');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Perfect Motion Flights ✈️
        </h1>
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From (Origin Code)</label>
            <input 
              type="text" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)} 
              className="w-full p-3 border rounded-lg"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To (Destination Code)</label>
            <input 
              type="text" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
              className="w-full p-3 border rounded-lg"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <input 
              type="date" 
              value={departureDate} 
              onChange={(e) => setDepartureDate(e.target.value)} 
              className="w-full p-3 border rounded-lg"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold p-3 rounded-xl shadow mt-2"
          >
            Search Flights
          </button>
        </form>
      </div>
    </main>
  );
}
