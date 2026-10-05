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
    router.push(`/search?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&departureDate=${departureDate}&adults=${adults}${queryString}`);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', color: '#1e293b', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
      
      {/* Navbar */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: '#4f46e5', color: '#ffffff', padding: '8px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
              ✈️️
            </div>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
              Trip Scanner <span style={{ color: '#4f46e5' }}>Hub</span>
            </span>
          </div>
          <div>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
              🛡️ Powered by Duffel
            </span>
          </div>
        </div>
      </header>

      {/* Hero / Search Section with White Background Card */}
      <section style={{ background: 'linear-gradient(to right, #4338ca, #4f46e5, #6366f1)', color: '#ffffff', padding: '48px 16px', flexGrow: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', letterSpacing: '-0.025em' }}>Compare & Book Cheap Flights Worldwide</h1>
          <p style={{ color: '#eef2ff', fontSize: '16px' }}>Discover the best destinations with real-time live availability.</p>
        </div>

        {/* Clean White Search Card Box */}
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '32px', color: '#1e293b' }}>
          
          {error && (
            <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Origin, Destination, Date Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              
              {/* From */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>From (Origin)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#f8fafc' }}>
                  <span style={{ marginRight: '8px' }}>🛫</span>
                  <input 
                    type="text" 
                    value={origin} 
                    onChange={(e) => setOrigin(e.target.value.toUpperCase())} 
                    placeholder="e.g., LHR" 
                    required 
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', color: '#1e293b' }} 
                  />
                </div>
              </div>

              {/* To */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>To (Destination)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#f8fafc' }}>
                  <span style={{ marginRight: '8px' }}>🛬</span>
                  <input 
                    type="text" 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value.toUpperCase())} 
                    placeholder="e.g., DXB" 
                    required 
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', color: '#1e293b' }} 
                  />
                </div>
              </div>

              {/* Departure */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Departure Date</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#f8fafc' }}>
                  <span style={{ marginRight: '8px' }}>📅</span>
                  <input 
                    type="date" 
                    min={today}
                    value={departureDate} 
                    onChange={(e) => setDepartureDate(e.target.value)} 
                    required 
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1e293b', cursor: 'pointer' }} 
                  />
                </div>
              </div>

            </div>

            {/* Passengers Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Adults (18+)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#f8fafc' }}>
                  <span style={{ marginRight: '8px' }}>👤</span>
                  <select 
                    value={adults} 
                    onChange={(e) => handleAdultChange(e.target.value)} 
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}
                  >
                    {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Children (0-17)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', backgroundColor: '#f8fafc' }}>
                  <span style={{ marginRight: '8px' }}>👶</span>
                  <select 
                    value={childrenAges.length} 
                    onChange={(e) => handleChildCountChange(e.target.value)} 
                    style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1e293b' }}
                  >
                    {Array.from({ length: Math.max(0, 10 - adults) }, (_, i) => (
                      <option key={i} value={i}>{i} Child{i !== 1 ? 'ren' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Children Ages Container */}
            {childrenAges.length > 0 && (
              <div style={{ padding: '16px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#312e81', textTransform: 'uppercase' }}>Select Children Ages (0-17 years):</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {childrenAges.map((age, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', backgroundColor: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Child {index + 1} Age:</span>
                      <select 
                        value={age} 
                        onChange={(e) => handleChildAgeChange(index, e.target.value)} 
                        style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#f8fafc', fontSize: '13px', fontWeight: '600' }}
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

            {/* Search Submit Button */}
            <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                style={{ width: '100%', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 'bold', padding: '14px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '16px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)', transition: 'background 0.2s' }}
              >
                🔍 Search Flights
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 0', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
        <p>&copy; {new Date().getFullYear()} Trip Scanner Hub. Built for seamless flight exploration with Duffel API.</p>
      </footer>

    </div>
  );
}
