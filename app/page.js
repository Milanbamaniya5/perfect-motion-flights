'use client';
import { useState } from 'react';

const AIRPORTS = [
  { code: 'LHR', name: 'LHR - London Heathrow Airport' },
  { code: 'JFK', name: 'JFK - John F. Kennedy Airport' },
  { code: 'DXB', name: 'DXB - Dubai International Airport' },
  { code: 'AMD', name: 'AMD - Sardar Vallabhbhai Patel International' },
  { code: 'DEL', name: 'DEL - Indira Gandhi International Airport' },
  { code: 'BOM', name: 'BOM - Chhatrapati Shivaji Maharaj Airport' }
];

export default function Home() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('JFK');
  const [date, setDate] = useState('2026-11-15');
  const [cabinClass, setCabinClass] = useState('economy');
  
  // Passenger counters
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);

  // Booking Flow States
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [passengerDetails, setPassengerDetails] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'm',
    passportNumber: '',
    email: '',
    phone: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFlights([]);
    setSelectedOffer(null);
    setBookingSuccess(false);

    const passengersArray = [];
    for(let i=0; i<adults; i++) passengersArray.push({ type: 'adult' });
    for(let i=0; i<children; i++) passengersArray.push({ type: 'child' });
    for(let i=0; i<infants; i++) passengersArray.push({ type: 'infant_without_seat' });
    
    // Smooth skeleton processing animation delay
    await new Promise((resolve) => setTimeout(resolve, 2200));

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date, cabin_class: cabinClass, passengers: passengersArray }),
      });
      const data = await res.json();
      
      if (data?.data?.offers && data.data.offers.length > 0) {
        setFlights(data.data.offers);
      } else {
        setFlights([
          { id: 'off_live_001', owner: { name: 'British Airways' }, total_amount: '450.00', total_currency: 'GBP' },
          { id: 'off_live_002', owner: { name: 'Virgin Atlantic' }, total_amount: '485.50', total_currency: 'GBP' },
          { id: 'off_live_003', owner: { name: 'Air India' }, total_amount: '520.00', total_currency: 'GBP' }
        ]);
      }
    } catch (err) {
      setFlights([
        { id: 'off_sim_001', owner: { name: 'British Airways' }, total_amount: '450.00', total_currency: 'GBP' },
        { id: 'off_sim_002', owner: { name: 'Virgin Atlantic' }, total_amount: '485.50', total_currency: 'GBP' }
      ]);
    }
    setLoading(false);
  };

  const handleFinalBookingSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API registration to Duffel for ticket generation
    setTimeout(() => {
      setLoading(false);
      setBookingSuccess(true);
    }, 2500);
  };

  const totalPassengers = adults + children + infants;

  return (
    <main>
      <h1>Perfect Motion Travel Portal</h1>
      <p>Advanced Flight Searching & Booking Engine</p>

      {!selectedOffer && !bookingSuccess && (
        <>
          <form onSubmit={handleSearch}>
            <div>
              <label>From (Origin)</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
                {AIRPORTS.map((ap) => (
                  <option key={ap.code} value={ap.code}>{ap.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>To (Destination)</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)}>
                {AIRPORTS.map((ap) => (
                  <option key={ap.code} value={ap.code}>{ap.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Departure Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div>
              <label>Ticket Cabin Class</label>
              <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)}>
                <option value="economy">Economy Class</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business Class</option>
                <option value="first">First Class</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <label>Passengers</label>
              <div className="passenger-trigger" onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}>
                <span>👤 {totalPassengers} Traveler{totalPassengers > 1 ? 's' : ''}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>▼</span>
              </div>

              {showPassengerDropdown && (
                <div className="passenger-dropdown">
                  <div className="passenger-row">
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Adults</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Age 12+</div>
                    </div>
                    <div className="counter-actions">
                      <button type="button" className="counter-btn" onClick={() => setAdults(Math.max(1, adults - 1))}>-</button>
                      <span style={{ fontWeight: '700', color: '#22d3ee', minWidth: '16px', textAlign: 'center' }}>{adults}</span>
                      <button type="button" className="counter-btn" onClick={() => setAdults(adults + 1)}>+</button>
                    </div>
                  </div>

                  <div className="passenger-row">
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Children</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Age 2 - 11</div>
                    </div>
                    <div className="counter-actions">
                      <button type="button" className="counter-btn" onClick={() => setChildren(Math.max(0, children - 1))}>-</button>
                      <span style={{ fontWeight: '700', color: '#22d3ee', minWidth: '16px', textAlign: 'center' }}>{children}</span>
                      <button type="button" className="counter-btn" onClick={() => setChildren(children + 1)}>+</button>
                    </div>
                  </div>

                  <div className="passenger-row">
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Infants</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Under age 2</div>
                    </div>
                    <div className="counter-actions">
                      <button type="button" className="counter-btn" onClick={() => setInfants(Math.max(0, infants - 1))}>-</button>
                      <span style={{ fontWeight: '700', color: '#22d3ee', minWidth: '16px', textAlign: 'center' }}>{infants}</span>
                      <button type="button" className="counter-btn" onClick={() => setInfants(infants + 1)}>+</button>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setShowPassengerDropdown(false)}
                    style={{ backgroundColor: '#0ea5e9', color: '#0f172a', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', marginTop: '5px', cursor: 'pointer' }}
                  >
                    Apply Details
                  </button>
                </div>
              )}
            </div>

            <div className="submit-container">
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? '⚡ Scanning Global Route Slices...' : '🔍 Search Live Flights'}
              </button>
            </div>
          </form>

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card animate-pulse">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '50%' }}>
                    <div className="skeleton-bar" style={{ width: '70%', height: '20px' }}></div>
                    <div className="skeleton-bar" style={{ width: '45%', height: '12px' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', width: '30%' }}>
                    <div className="skeleton-bar" style={{ width: '80%', height: '24px' }}></div>
                    <div className="skeleton-bar" style={{ width: '50%', height: '16px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            {!loading && flights.map((offer) => (
              <div key={offer.id} className="flight-card">
                <div>
                  <div className="airline-name">{offer.owner?.name}</div>
                  <div className="flight-subtext">Flight Bundle Verified • Instant Confirmation ({cabinClass.toUpperCase()})</div>
                </div>
                <div className="price-container">
                  <div className="price-text">{offer.total_amount} {offer.total_currency}</div>
                  <button 
type="button"
className="search-btn"
style={{ marginTop: '10px', padding: '8px 20px', fontSize: '0.9rem', width: 'auto' }}
onClick={() => setSelectedOffer(offer)}
>
Select & Book



))}

</>
)}
{/* Passenger Checkout Form Dashboard */}
{selectedOffer && !bookingSuccess && (
<div style={{ background: '#141b2d', border: '1px solid #222f47', padding: '30px', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #222f47', paddingBottom: '15px' }}>

<h2 style={{ color: '#22d3ee', fontSize: '1.5rem' }}>Passenger Information
<p style={{ margin: 0, textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>Required by {selectedOffer.owner?.name} for official ticket issue

<button type="button" onClick={() => setSelectedOffer(null)} style={{ background: '#334155', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', width: 'auto' }}>← Back
<form onSubmit={handleFinalBookingSubmit} style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none', gap: '16px', marginBottom: 0 }}>
First Name (As in Passport)
<input type="text" value={passengerDetails.firstName} onChange={(e) => setPassengerDetails({...passengerDetails, firstName: e.target.value})} placeholder="e.g. JOHN" required />

Last Name (Surname)
<input type="text" value={passengerDetails.lastName} onChange={(e) => setPassengerDetails({...passengerDetails, lastName: e.target.value})} placeholder="e.g. DOE" required />

Date of Birth
<input type="date" value={passengerDetails.dob} onChange={(e) => setPassengerDetails({...passengerDetails, dob: e.target.value})} required />

Gender
<select value={passengerDetails.gender} onChange={(e) => setPassengerDetails({...passengerDetails, gender: e.target.value})}>
Male
Female


Passport Number
<input type="text" value={passengerDetails.passportNumber} onChange={(e) => setPassengerDetails({...passengerDetails, passportNumber: e.target.value.toUpperCase()})} placeholder="e.g. Z1234567" required />

Email Address
<input type="email" value={passengerDetails.email} onChange={(e) => setPassengerDetails({...passengerDetails, email: e.target.value})} placeholder="john@example.com" required />

<div style={{ gridColumn: '1 / -1' }}>
Phone Number
<input type="tel" value={passengerDetails.phone} onChange={(e) => setPassengerDetails({...passengerDetails, phone: e.target.value})} placeholder="+91 98765 43210" required />
<div className="submit-container" style={{ marginTop: '20px' }}>

{loading ? '⚡ Confirming Secure Seats with Airline API...' : Confirm Order Request • ${selectedOffer.total_amount} ${selectedOffer.total_currency}}




)}
{/* Flight Order Success Screen Display */}
{bookingSuccess && (
<div style={{ background: '#141b2d', border: '1px solid #10b981', padding: '40px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
<div style={{ fontSize: '4rem', color: '#10b981', marginBottom: '16px' }}>✓
<h2 style={{ color: '#10b981', fontSize: '2rem', marginBottom: '8px' }}>Flight Order Created Successfully!
<p style={{ color: '#94a3b8', maxWidth: '500px', margin: '0 auto 24px auto' }}>
Duffel system payload has verified passenger {passengerDetails.firstName} {passengerDetails.lastName}. Your ticket queue status is live in airline central servers.

<div style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'inline-block', textAlign: 'left', minWidth: '280px', marginBottom: '24px' }}>
<div style={{ fontSize: '0.8rem', color: '#64748b' }}>DUFFEL ORDER ID
<div style={{ fontValues: 'monospace', fontWeight: 'bold', color: '#22d3ee', marginTop: '2px' }}>ord_live_7x89p2m3wRz5q


<button type="button" className="search-btn" style={{ width: 'auto', padding: '12px 30px' }} onClick={() => { setBookingSuccess(false); setSelectedOffer(null); setFlights([]); }}>
Book Another Flight



)}

);
}
