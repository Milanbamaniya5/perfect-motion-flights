'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get('offerId');

  const [formData, setFormData] = useState({
    given_name: '',
    family_name: '',
    gender: 'm',
    born_on: '',
    nationality: 'GB',
    email: '',
    phone_number: '',
    passport_number: '',
    passport_expiry_date: '',
  });

  const [selectedBaggage, setSelectedBaggage] = useState('none');
  const [selectedSeat, setSelectedSeat] = useState('none');
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          passengers: [formData],
          services: [
            ...(selectedBaggage !== 'none' ? [{ id: selectedBaggage, quantity: 1 }] : []),
            ...(selectedSeat !== 'none' ? [{ id: selectedSeat, quantity: 1 }] : []),
          ]
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      setOrderResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-green-500 text-5xl mb-4">✔️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-4">Your test booking with baggage/seats was successful.</p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm space-y-1 mb-6">
            <p><span className="font-semibold">Booking Reference (PNR):</span> {orderResult.booking_reference}</p>
            <p><span className="font-semibold">Order ID:</span> {orderResult.id}</p>
          </div>
          <a href="/" className="inline-block w-full bg-blue-600 text-white font-medium py-3 rounded-xl">Book Another Flight</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Passenger Details & Extras</h1>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}

        <form onSubmit={handleBooking} className="space-y-6">
          
          {/* Passenger Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">1. Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Given Name</label>
                <input type="text" name="given_name" value={formData.given_name} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm" placeholder="Harry" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                <input type="text" name="family_name" value={formData.family_name} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm" placeholder="Brown" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" name="born_on" value={formData.born_on} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm">
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm" placeholder="harry@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm" placeholder="+447000000000" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
                <input type="date" name="passport_expiry_date" value={formData.passport_expiry_date} onChange={handleChange} className="w-full p-3 border rounded-lg text-sm" required />
              </div>
            </div>
          </div>

          {/* Ancillaries / Extras Section */}
          <div className="space-y-4 pt-4 border-t">
            <h2 className="text-lg font-semibold text-gray-700">2. Extras (Baggage & Seats)</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Extra Baggage Option</label>
              <select 
                value={selectedBaggage} 
                onChange={(e) => setSelectedBaggage(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm bg-gray-50"
              >
                <option value="none">No Extra Baggage (Standard Included)</option>
                <option value="bag_extra_23kg">Extra 23kg Checked Bag</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Selection</label>
              <select 
                value={selectedSeat} 
                onChange={(e) => setSelectedSeat(e.target.value)}
                className="w-full p-3 border rounded-lg text-sm bg-gray-50"
              >
                <option value="none">Standard Random Seat (Free)</option>
                <option value="seat_window">Window Seat Preference</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-xl transition duration-200 shadow-md"
          >
            {loading ? 'Processing Booking...' : 'Complete Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
