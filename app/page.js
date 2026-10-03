'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState('2026-10-04');
  const [returnDate, setReturnDate] = useState('2026-11-29');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}&returnDate=${returnDate}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Perfect Motion Flights ✈️
        </h1>
        <p className="text-gray-500 text-center mb-6">Search and book flights powered by Duffel API</p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From (Origin Code)</label>
              <input 
                type="text" 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="e.g. LHR"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (Destination Code)</label>
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                placeholder="e.g. AMD"
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
              <input 
                type="date" 
                value={departureDate} 
                onChange={(e) => setDepartureDate(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
              <input 
                type="date" 
                value={returnDate} 
                onChange={(e) => setReturnDate(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-xl transition duration-200 mt-4 shadow-md cursor-pointer"
          >
            Search Flights
          </button>
        </form>
      </div>
    </main>
  );
}
