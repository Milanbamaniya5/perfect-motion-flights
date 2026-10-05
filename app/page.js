'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState(today);
  const [adults, setAdults] = useState(1);
  const [childrenAges, setChildrenAges] = useState([]);
  const [error, setError] = useState('');

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
    router.push(`/search?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&departureDate=${departureDate}&adults=${adults}${queryString}`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      margin: 0,
      padding: 0
    }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <span style={{ fontSize: '22px' }}>✈️</span>
          <div>
            <div style={{ fontWeight: '800', fontSize: '16px', color: '#38bdf8' }}>
              TRIPSCANNER <span style={{ color: '#ffffff', fontWeight: '300' }}>HUB</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>tripscannerhub.co.uk</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="https://revolut.me/a_bariya30"
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              border: '1px solid #f59e0b',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ☕ Support
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '750px', width: '100%', margin: '0 auto', padding: '24px 14px', boxSizing: 'border-box', flex: 1 }}>
        
        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a, #0369a1)',
          padding: '24px 18px',
          borderRadius: '14px',
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid #334155'
        }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0', color: '#ffffff' }}>
            Smart Global Flight Scanner 🌍
          </h1>
          <p style={{ color: '#bae6fd', fontSize: '13px', margin: '0' }}>
            Compare live prices across airlines and book your journey instantly with real-time passenger verification.
          </p>
        </div>

        {/* Search Widget Box */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '14px',
          padding: '20px 18px',
          border: '1px solid #334155',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8', marginBottom: '16px', marginTop: 0 }}>
            🔍 Search Available Flights
          </h2>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#f87171',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              fontWeight: '700'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  From (Origin Code)
                </label>
                <input 
                  type="text" 
                  value={origin} 
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box',
                    fontWeight: '700'
                  }} 
                  placeholder="e.g. LHR"
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  To (Destination Code)
                </label>
                <input 
                  type="text" 
                  value={destination} 
                  onChange={(e) => setDestination(e.target.value.toUpperCase())} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    boxSizing: 'border-box',
                    fontWeight: '700'
                  }} 
                  placeholder="e.g. AMD"
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                Departure Date
              </label>
              <input 
                type="date" 
                min={today}
                value={departureDate} 
                onChange={(e) => setDepartureDate(e.target.value)} 
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#f8fafc',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  fontWeight: '700'
                }} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  Adults (18+)
                </label>
                <select 
                  value={adults} 
                  onChange={(e) => handleAdultChange(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontWeight: '700'
                  }}
                >
                  {Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '6px' }}>
                  Children (0-17)
                </label>
                <select 
                  value={childrenAges.length} 
                  onChange={(e) => handleChildCountChange(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#f8fafc',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontWeight: '700'
                  }}
                >
                  {Array.from({ length: Math.max(0, 10 - adults) }, (_, i) => (
                    <option key={i} value={i}>{i} Child{i !== 1 ? 'ren' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {childrenAges.length > 0 && (
              <div style={{
                backgroundColor: '#0f172a',
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#38bdf8', marginBottom: '10px' }}>
                  Select Children Ages (0-17 years):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {childrenAges.map((age, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', padding: '8px 10px', borderRadius: '6px', border: '1px solid #475569' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>Child {index + 1}:</span>
                      <select 
                        value={age} 
                        onChange={(e) => handleChildAgeChange(index, e.target.value)} 
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #475569',
                          borderRadius: '4px',
                          backgroundColor: '#0f172a',
                          color: '#f8fafc',
                          fontSize: '13px',
                          fontWeight: '700'
                        }}
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

            <button 
              type="submit" 
              style={{
                width: '100%',
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '15px',
                cursor: 'pointer',
                marginTop: '6px',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              Search Flights 🚀
            </button>
          </form>
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#0b1120',
        borderTop: '1px solid #1e293b',
        padding: '24px 16px',
        textAlign: 'center',
        marginTop: '32px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '11px', color: '#64748b', lineHeight: '1.5' }}>
          © {new Date().getFullYear()} tripscannerhub.co.uk. Real-time Flight Scanner & Booking Platform.
          <br />
          Powered by Duffel API & Next.js.
        </div>
      </footer>
    </div>
  );
}
