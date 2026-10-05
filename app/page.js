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
    const newAges = Array(num).fill(5);
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Top Navbar Header (Skyscanner/Trip.com Style) */}
      <header className="w-full border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href='/'}>
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 text-white text-xl">
              ✈️
            </div>
            <div>
              <span className="text-xl font-black tracking-wider text-white">TRIPSCANNER</span>
              <span className="text-xl font-light text-blue-400 ml-1">HUB</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <span className="hover:text-blue-400 transition cursor-pointer">Explore</span>
            <span className="hover:text-blue-400 transition cursor-pointer">Flights</span>
            <span className="hover:text-blue-400 transition cursor-pointer">Support</span>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 flex-grow flex flex-col items-center justify-center">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center max-w-3xl mx-auto mb-10 z-10">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>✨ Smart Flight Search Engine</span>
          </div>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
            Where do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">explore next?</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-normal">
            Compare live prices across airlines and book your journey in seconds with absolute confidence.
          </p>
        </div>

        {/* Main Floating Search Box Widget */}
        <div className="w-full max-w-4xl bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 z-10">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6 text-sm font-medium flex items-center space-x-3">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Route Grid: Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <span>From (Origin)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-lg">🛫</span>
                  <input 
                    type="text" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-950/80 border border-slate-700 rounded-2xl uppercase font-bold text-white tracking-wide focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition" 
                    placeholder="e.g. LHR"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <span>To (Destination)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-lg">🛬</span>
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value.toUpperCase())} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-950/80 border border-slate-700 rounded-2xl uppercase font-bold text-white tracking-wide focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition" 
                    placeholder="e.g. AMD"
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Date & Passenger Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Departure Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Departure Date</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">📅</span>
                  <input 
                    type="date" 
                    min={today}
                    value={departureDate} 
                    onChange={(e) => setDepartureDate(e.target.value)} 
                    className="w-full pl-12 pr-4 py-4 bg-slate-950/80 border border-slate-700 rounded-2xl font-semibold text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition cursor-pointer" 
                    required 
                  />
                </div>
              </div>

              {/* Adults Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Adults (18+)</label>
                <select 
                  value={adults} 
                  onChange={(e) => handleAdultChange(e.target.value)} 
                  className="w-full px-4 py-4 bg-slate-950/80 border border-slate-700 rounded-2xl font-semibold text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition cursor-pointer"
                >
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num} className="bg-slate-900 text-white">{num} Adult{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Children Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Children (0-17)</label>
                <select 
                  value={childrenAges.length} 
                  onChange={(e) => handleChildCountChange(e.target.value)} 
                  className="w-full px-4 py-4 bg-slate-950/80 border border-slate-700 rounded-2xl font-semibold text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition cursor-pointer"
                >
                  {Array.from({ length: Math.max(0, 10 - adults) }, (_, i) => (
                    <option key={i} value={i} className="bg-slate-900 text-white">{i} Child{i !== 1 ? 'ren' : ''}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Dynamic Children Ages Sub-card */}
            {childrenAges.length > 0 && (
              <div className="p-5 bg-blue-950/40 border border-blue-500/30 rounded-2xl space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">Select Children Ages (0-17 years):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {childrenAges.map((age, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-700 shadow-sm">
                      <span className="text-xs font-medium text-slate-300">Child {index + 1} Age:</span>
                      <select 
                        value={age} 
                        onChange={(e) => handleChildAgeChange(index, e.target.value)} 
                        className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-semibold text-sm text-white focus:outline-none cursor-pointer"
                      >
                        {Array.from({ length: 18 }, (_, i) => (
                          <option key={i} value={i}>{i} yr{i !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
