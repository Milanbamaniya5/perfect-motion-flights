'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];

  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState(today);
  const [adults, setAdults] = useState(1);
  const [childrenAges, setChildrenAges] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChildCountChange = (count) => {
    const num = parseInt(count) || 0;
    if (adults + num > 9) {
      setError('Total passengers cannot exceed 9 per booking.');
      return;
    }
    setError('');
    const newAges = Array(num).fill(5); // Default age 5
    setChildrenAges(newAges);
  };

  const handleChildAgeChange = (index, age) => {
    const updated = [...childrenAges];
    updated[index] = parseInt(age);
    setChildrenAges(updated);
  };

  const handleAdultChange = (val) => {
    const newAdults = parseInt(val);
    if (newAdults + childrenAges.length > 9) {
      setError('Total passengers cannot exceed 9 per booking.');
      return;
    }
    setError('');
    setAdults(newAdults);
  };

  // 👇 HANDLE SEARCH FUNCTION YAHAN COMPONENT KE ANDAR PASTE HOTA HAI
  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    // 1. Departure date validation (Past date check)
    if (departureDate < today) {
      setError('Departure date cannot be in the past.');
      return;
    }

    // 2. Total passengers check (Duffel max 9 limit)
    if (adults + childrenAges.length > 9) {
      setError('Total passengers cannot exceed 9 per booking.');
      return;
    }

    // 3. Children age range check
    for (let i = 0; i < childrenAges.length; i++) {
      if (childrenAges[i] < 0 || childrenAges[i] > 17) {
        setError(`Child ${i + 1} age must be between 0 and 17 years.`);
        return;
      }
    }

    const childParams = childrenAges.map(age => `childAge=${age}`).join('&');
    const queryString = childParams ? `&${childParams}` : '';
    router.push(`/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}&adults=${adults}${queryString}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Duffel Flight Booking ✈️
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From (Origin)</label>
              <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} className="w-full p-3 border rounded-lg uppercase" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (Destination)</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} className="w-full p-3 border rounded-lg uppercase" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
            <input 
              type="date" 
              min={today}
              value={departureDate} 
              onChange={(e) => setDepartureDate(e.target.value)} 
              className="w-full p-3 border rounded-lg bg-white cursor-pointer" 
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adults (18+)</label>
              <select value={adults} onChange={(e) => handleAdultChange(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                {Array.from({ length: 9 }, (_, i) => i + 1).map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Children (0-17)</label>
              <select value={childrenAges.length} onChange={(e) => handleChildCountChange(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                {Array.from({ length: Math.max(0, 10 - adults) }, (_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
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
