'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];

  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('DXB');
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg">✈️</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Trip Scanner <span className="text-indigo-600">Hub</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline text-sm text-slate-500 font-medium">
              <span className="text-emerald-500 mr-1">🛡️</span> Powered by Duffel
            </span>
          </div>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">Compare & Book Cheap Flights Worldwide</h1>
          <p className="text-indigo-100 text-base sm:text-lg">Discover the best destinations with real-time live availability.</p>
        </div>

        {/* Search Card Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 text-slate-800">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-4 text-sm font-semibold shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Origin */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 bg-slate-50">
                  <span className="text-slate-400 mr-2">🛫</span>
                  <input 
                    type="text" 
                    id="origin" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())} 
                    placeholder="e.g., LHR" 
                    required 
                    className="w-full bg-transparent outline-none text-sm font-semibold uppercase text-slate-800" 
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 bg-slate-50">
                  <span className="text-slate-400 mr-2">🛬</span>
                  <input 
                    type="text" 
                    id="destination" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value.toUpperCase())} 
                    placeholder="e.g., DXB" 
                    required 
                    className="w-full bg-transparent outline-none text-sm font-semibold uppercase text-slate-800" 
                  />
                </div>
              </div>

              {/* Departure Date */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Departure</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 bg-slate-50">
                  <span className="text-slate-400 mr-2">📅</span>
                  <input 
                    type="date" 
                    min={today}
                    value={departureDate} 
                    onChange={(e) => setDepartureDate(e.target.value)} 
                    required 
                    className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800 cursor-pointer" 
                  />
                </div>
              </div>

            </div>

            {/* Passenger Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Adults (18+)</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 bg-slate-50">
                  <span className="text-slate-400 mr-2">👤</span>
                  <select 
                    value={adults} 
                    onChange={(e) => handleAdultChange(e.target.value)} 
                    className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800"
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Children (0-17)</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 bg-slate-50">
                  <span className="text-slate-400 mr-2">👶</span>
                  <select 
                    value={childrenAges.length} 
                    onChange={(e) => handleChildCountChange(e.target.value)} 
                    className="w-full bg-transparent outline-none text-sm font-semibold text-slate-800"
                  >
                    {Array.from({ length: Math.max(0, 10 - adults) }, (_, i) => (
                      <option key={i} value={i}>{i} Child{i !== 1 ? 'ren' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic Children Ages Sub-section */}
            {childrenAges.length > 0 && (
              <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider">Select Children Ages (0-17 years):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {childrenAges.map((age, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-indigo-100 shadow-sm">
                      <span className="text-xs font-semibold text-slate-700">Child {index + 1} Age:</span>
                      <select 
                        value={age} 
                        onChange={(e) => handleChildAgeChange(index, e.target.value)} 
                        className="p-1 border border-slate-200 rounded-md bg-slate-50 font-medium text-xs text-slate-800 outline-none"
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

            <div className="pt-3 flex justify-end">
              <button 
                type="submit" 
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition duration-200 flex items-center justify-center space-x-2"
              >
                <span>🔍</span>
                <span>Search Flights</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} Trip Scanner Hub. Built for seamless flight exploration with Duffel API.</p>
      </footer>

    </div>
  );
}
