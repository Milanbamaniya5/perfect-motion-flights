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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

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
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed! 🎉</h2>
          <p className="text-gray-600 mb-4">PNR: {orderResult.booking_reference}</p>
          <a href="/" className="inline-block w-full bg-blue-600 text-white font-medium py-3 rounded-xl">Book Another</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Passenger Details</h1>
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">{error}</div>}
        
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="given_name" placeholder="Given Name" value={formData.given_name} onChange={handleChange} className="p-3 border rounded-lg" required />
            <input type="text" name="family_name" placeholder="Family Name" value={formData.family_name} onChange={handleChange} className="p-3 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="born_on" value={formData.born_on} onChange={handleChange} className="p-3 border rounded-lg" required />
            <select name="gender" value={formData.gender} onChange={handleChange} className="p-3 border rounded-lg">
              <option value="m">Male</option>
              <option value="f">Female</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="p-3 border rounded-lg" required />
            <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} className="p-3 border rounded-lg" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="passport_number" placeholder="Passport Number" value={formData.passport_number} onChange={handleChange} className="p-3 border rounded-lg" required />
            <input type="date" name="passport_expiry_date" placeholder="Expiry Date" value={formData.passport_expiry_date} onChange={handleChange} className="p-3 border rounded-lg" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-semibold p-4 rounded-xl mt-6">
            {loading ? 'Processing...' : 'Complete Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
