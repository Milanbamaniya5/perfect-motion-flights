'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];

  const [tripType, setTripType] = useState('oneway');
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState(today);
  const [adults, setAdults] = useState(1);
  const [childrenAges, setChildrenAges] = useState([]);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
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
    <main className="min-h-screen bg-gradient-to-b from-blue-700 via-indigo-800 to-slate-900 flex flex-col items-center justify-start p-6 text-slate-800">
      
      <div className="text-center mt-12 mb-8 text-white">
        <h1 className="text-4xl font-black tracking-tight mb-2">Your next take-off awaits</h1>
        <p className="text-sm text-blue-200">Search flights worldwide with Trip Scanner Hub ✈️</p>
      </div>

      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl p-6 md:p-8 relative">
        
        <div className="flex items-center space-x-8 border-b border-gray-100 pb-4 mb-6">
          <div className="flex items-center space-x-2 text-blue-600 font-bold border-b-2 border-blue-600 pb-2 cursor-pointer">
            <span className="text-xl">✈️</span>
            <span>Flights</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl mb-6 text-sm font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-6">
          
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm font-medium text-gray-600">
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tripType" 
                  checked={tripType === 'return'} 
                  onChange={() => setTripType('return')} 
                  className="text-blue-600 focus:ring-blue-500" 
                />
                <span>Return</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="tripType" 
                  checked={tripType === 'oneway'} 
                  onChange={() => setTripType('oneway')} 
                  className="text-blue-600 focus:ring-blue-500" 
                />
                <span>One-way</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-200">
            
            <div className="bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-500 transition">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Leaving from</label>
              <input 
                type="text" 
                value={origin} 
                onChange={(e) => setOrigin(e.target.value.toUpperCase())} 
                className="w-full font-bold text-gray-800 uppercase outline-none bg-transparent" 
                required 
              />
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-500 transition">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Going to</label>
              <input 
                type="text" 
                value={destination} 
                onChange={(e) => setDestination(e.target.value.toUpperCase())} 
                className="w-full font-bold text-gray-800 uppercase outline-none bg-transparent" 
                required 
              />
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-500 transition flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Departure</label>
                <input 
                  type="date" 
                  min={today}
                  value={departureDate} 
                  onChange={(e) => setDepartureDate(e.target.value)} 
                  className="font-bold text-gray-800 outline-none bg-transparent cursor-pointer text-sm" 
                  required 
                />
              </div>
            </div>

            <div className="relative">
              <div 
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-500 transition cursor-pointer h-full flex flex-col justify-center"
              >
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Passengers & Cabin</label>
                <div className="font-bold text-gray-800 text-sm truncate">
                  {adults + childrenAges.length} Passenger{adults + childrenAges.length > 1 ? 's' : ''}, Economy
                </div>
              </div>

              {showPassengerDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 z-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Adults</p>
                      <p className="text-xs text-gray-400">18 years+</p>
                    </div>
                    <select 
                      value={adults} 
                      onChange={(e) => handleAdultChange(e.target.value)} 
                      className="p-2 border rounded-xl font-bold bg-gray-50 outline-none"
                    >
                      {Array.from({ length: 9 }, (_, i) => i + 1).map(num => <option key={num} value={num}>{num}</option>)}
                    </select>
                  </div>

                  <div className="flex justify-between items-center border-t pt-3">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">Children</p>
                      <p className="text-xs text-gray-400">0 - 17 years</p>
                    </div>
                    <select 
                      value={childrenAges.length} 
                      onChange={(e) => handleChildCountChange(e.target.value)} 
                      className="p-2 border rounded-xl font-bold bg-gray-50 outline-none"
                    >
                      {Array.from({ length: Math.max(0, 10 - adults) }, (_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  {childrenAges.length > 0 && (
                    <div className="space-y-2 border-t pt-3">
                      <p className="text-xs font-bold text-blue-600 uppercase">Child Ages:</p>
                      {childrenAges.map((age, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span>Child {idx + 1} age:</span>
                          <select 
                            value={age} 
                            onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                            className="p-1.5 border rounded-lg bg-gray-50 font-bold"
                          >
                            {Array.from({ length: 18 }, (_, i) => <option key={i} value={i}>{i} yrs</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    type="button" 
                    onClick={() => setShowPassengerDropdown(false)}
                    className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-sm shadow"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-blue-600/30 transition transform active:scale-95 flex items-center space-x-2 text-base"
            >
              <span>🔍</span>
              <span>Search Flights</span>
            </button>
          </div>

        </form>
      </div>

    </main>
  );
}
