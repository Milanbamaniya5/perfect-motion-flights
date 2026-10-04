'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

// Country codes mapping for auto-formatting phone number
const countryCodes = {
  GB: '+44',
  IN: '+91',
  US: '+1',
  CA: '+1',
  AU: '+61',
  DE: '+49',
  FR: '+33',
};

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

    // Auto-format phone number with correct country code if not already included
    let formattedPhone = formData.phone_number.trim();
    const prefix = countryCodes[formData.nationality] || '+44';
    
    if (!formattedPhone.startsWith('+')) {
      // Remove leading zero if user typed it (e.g., 07849 -> 7849)
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      formattedPhone = `${prefix}${formattedPhone}`;
    }

    const payloadData = {
      ...formData,
      phone_number: formattedPhone,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          passengers: [payloadData],
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
          <p className="text-gray-600 mb-4">PNR Reference: {orderResult.booking_reference}</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Given Name</label>
              <input type="text" name="given_name" placeholder="John" value={formData.given_name} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
              <input type="text" name="family_name" placeholder="Doe" value={formData.family_name} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" name="born_on" value={formData.born_on} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg">
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-3 border rounded-lg">
                <option value="GB">United Kingdom (+44)</option>
                <option value="IN">India (+91)</option>
                <option value="US">United States (+1)</option>
                <option value="CA">Canada (+1)</option>
                <option value="AU">Australia (+61)</option>
                <option value="DE">Germany (+49)</option>
                <option value="FR">France (+33)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" name="phone_number" placeholder="7849606000" value={formData.phone_number} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
              <input type="text" name="passport_number" placeholder="A1234567" value={formData.passport_number} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
              <input type="date" name="passport_expiry_date" value={formData.passport_expiry_date} onChange={handleChange} className="w-full p-3 border rounded-lg" required />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-xl mt-6 shadow">
            {loading ? 'Processing Booking...' : 'Complete Booking'}
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
