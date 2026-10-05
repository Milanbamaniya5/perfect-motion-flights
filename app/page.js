'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState('2026-10-04');
  const [adults, setAdults] = useState(1);
  const [childrenAges, setChildrenAges] = useState([]);
  const router = useRouter();

  const handleChildCountChange = (count) => {
    const num = parseInt(count) || 0;
    const newAges = Array(num).fill(5); // Default age 5
    setChildrenAges(newAges);
  };

  const handleChildAgeChange = (index, age) => {
    const updated = [...childrenAges];
    updated[index] = parseInt(age);
    setChildrenAges(updated);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const childParams = childrenAges.map(age => `childAge=${age}`).join('&');
    router.push(`/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}&adults=${adults}&${childParams}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Duffel Flight Booking ✈️
        </h1>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From (Origin)</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full p-3 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (Destination)</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full p-3 border rounded-lg" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} className="w-full p-3 border rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults (18+)</label>
              <select value={adults} onChange={(e) => setAdults(parseInt(e.target.value))} className="w-full p-3 border rounded-lg">
                {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children (0-17)</label>
              <select value={childrenAges.length} onChange={(e) => handleChildCountChange(e.target.value)} className="w-full p-3 border rounded-lg">
                {[0, 1, 2, 3, 4].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
          </div>

          {childrenAges.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Select Children Ages (0-17):</label>
              <div className="grid grid-cols-2 gap-3">
                {childrenAges.map((age, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Child {index + 1}:</span>
                    <select 
                      value={age} 
                      onChange={(e) => handleChildAgeChange(index, e.target.value)} 
                      className="p-2 border rounded-lg bg-white"
                    >
                      {Array.from({ length: 18 }, (_, i) => (
                        <option key={i} value={i}>{i} years</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-xl shadow mt-2">
            Search Flights
          </button>
        </form>
      </div>
    </main>
  );
}
