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

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    if (departureDate < today) {
      setError('Departure date cannot be in the past.');
      return;
    }

    if (adults + childrenAges.length > 9) {
      setError('Total passengers cannot exceed 9 per booking.');
      return;
    }

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
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6">
      
      {/* Brand Header & Logo Area */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-2xl mb-4">
          <span className="text-3xl mr-2">🌍</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Trip Scanner <span className="text-blue-400">Hub</span>
          </h1>
        </div>
        <p className="text-gray-300 text-sm sm:text-base max-w-md mx-auto">
          Discover the best flights worldwide with instant booking & unbeatable prices. Your journey begins here. ✨
        </p>
      </div>

      {/* Search Card Box */}
      <div className="max-w-xl w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/30">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm font-semibold shadow-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-5">
          
          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">From (Origin Code)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🛫</span>
                <input 
                  type="text" 
                  value={origin} 
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())} 
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl uppercase font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition" 
                  placeholder="e.g. LHR"
                  required 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">To (Destination Code)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">🛬</span>
                <input 
                  type="text" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value.toUpperCase())} 
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl uppercase font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition" 
                  placeholder="e.g. AMD"
                  required 
                />
              </div>
            </div>
          </div>

          {/* Departure Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Departure Date</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">📅</span>
              <input 
                type="date" 
                min={today}
                value={departureDate} 
                onChange={(e) => setDepartureDate(e.target.value)} 
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition cursor-pointer" 
                required 
              />
            </div>
          </div>

          {/* Passenger Selectors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Adults (18+)</label>
              <select 
                value={adults} 
                onChange={(e) => handleAdultChange(e.target.value)} 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map(num => <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Children (0-17)</label>
              <select 
                value={childrenAges.length} 
                onChange={(e) => handleChildCountChange(e.target.value)} 
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition"
              >
                {Array.from({ length: Math.max(0, 10 - adults) }, (_, i) => (
                  <option key={i} value={i}>{i} Child{i !== 1 ? 'ren' : ''}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Children Ages */}
          {childrenAges.length > 0 && (
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-3 animate-fadeIn">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-900">Select Children Ages (0-17 years):</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {childrenAges.map((age, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-blue-100 shadow-sm">
                    <span className="text-xs font-semibold text-gray-700">Child {index + 1} Age:</span>
                    <select 
                      value={age} 
                      onChange={(e) => handleChildAgeChange(index, e.target.value)} 
                      className="p-1.5 border border-gray-200 rounded-lg bg-gray-50 font-medium text-sm text-gray-800 focus:outline-none"
                    >
                      {Array.from({ length: 18 }, (_, i) => (
                        <option key={i} value={i}>{i} yr{i !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Button */}
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 transition duration-200 text-lg mt-2 flex items-center justify-center space-x-2"
          >
            <span>Search Best Flights</span>
            <span>🚀</span>
          </button>
        </form>
      </div>

      {/* Footer tagline */}
      <footer className="mt-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Trip Scanner Hub. Powered by Advanced Flight Engine.
      </footer>
    </main>
  );
}
