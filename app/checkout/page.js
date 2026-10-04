'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

const countries = [
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', phoneLength: 10 },
  { code: 'IN', name: 'India', dialCode: '+91', phoneLength: 10 },
  { code: 'US', name: 'United States', dialCode: '+1', phoneLength: 10 },
  { code: 'CA', name: 'Canada', dialCode: '+1', phoneLength: 10 },
  { code: 'AU', name: 'Australia', dialCode: '+61', phoneLength: 9 },
  { code: 'DE', name: 'Germany', dialCode: '+49', phoneLength: 10 },
  { code: 'FR', name: 'France', dialCode: '+33', phoneLength: 9 },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', phoneLength: 9 },
  { code: 'SG', name: 'Singapore', dialCode: '+65', phoneLength: 8 },
  { code: 'JP', name: 'Japan', dialCode: '+81', phoneLength: 10 },
];

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
    phone_code: '+44',
    phone_number: '',
    passport_number: '',
    passport_expiry_date: '',
  });

  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  
  // Field-wise error states for red border styling
  const [errors, setErrors] = useState({
    given_name: false,
    family_name: false,
    born_on: false,
    email: false,
    phone_number: false,
    passport_number: false,
    passport_expiry_date: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'nationality') {
      const selectedCountry = countries.find(c => c.code === value);
      setFormData(prev => ({
        ...prev,
        nationality: value,
        phone_code: selectedCountry ? selectedCountry.dialCode : prev.phone_code
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for that specific field when user starts typing/selecting
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    let newErrors = {
      given_name: !formData.given_name.trim(),
      family_name: !formData.family_name.trim(),
      born_on: !formData.born_on,
      email: !formData.email.trim(),
      passport_number: !formData.passport_number.trim(),
      passport_expiry_date: !formData.passport_expiry_date,
    };

    // Phone validation
    const cleanPhone = formData.phone_number.trim();
    const activeCountry = countries.find(c => c.dialCode === formData.phone_code) || { phoneLength: 10 };
    const isNumeric = /^\d+$/.test(cleanPhone);
    const phoneInvalid = !isNumeric || cleanPhone.length !== activeCountry.phoneLength;

    newErrors.phone_number = phoneInvalid;

    setErrors(newErrors);

    // If any field has error, stop submission
    if (Object.values(newErrors).some(Boolean)) {
      setLoading(false);
      return;
    }

    const fullPhoneNumber = `${formData.phone_code}${cleanPhone}`;

    const payloadData = {
      given_name: formData.given_name,
      family_name: formData.family_name,
      gender: formData.gender,
      born_on: formData.born_on,
      nationality: formData.nationality,
      email: formData.email,
      phone_number: fullPhoneNumber,
      passport_number: formData.passport_number,
      passport_expiry_date: formData.passport_expiry_date,
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
      alert(err.message);
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
        
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Given Name</label>
              <input 
                type="text" 
                name="given_name" 
                placeholder="John" 
                value={formData.given_name} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg transition-all ${errors.given_name ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'}`} 
              />
              {errors.given_name && <span className="text-xs text-red-600 mt-1 block">Please enter given name</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
              <input 
                type="text" 
                name="family_name" 
                placeholder="Doe" 
                value={formData.family_name} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg transition-all ${errors.family_name ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'}`} 
              />
              {errors.family_name && <span className="text-xs text-red-600 mt-1 block">Please enter family name</span>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              {/* Modern styled calendar date input */}
              <input 
                type="date" 
                name="born_on" 
                value={formData.born_on} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg bg-white shadow-sm transition-all cursor-pointer ${errors.born_on ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'}`} 
              />
              {errors.born_on && <span className="text-xs text-red-600 mt-1 block">Please select date of birth</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
              <select name="phone_code" value={formData.phone_code} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                {countries.map((c) => (
                  <option key={c.code} value={c.dialCode}>{c.name} ({c.dialCode})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                {errors.phone_number && (
                  <span className="text-xs text-red-600 font-semibold animate-pulse">
                    Please enter correct number
                  </span>
                )}
              </div>
              <input 
                type="text" 
                name="phone_number" 
                placeholder="Enter phone number" 
                value={formData.phone_number} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg transition-all duration-200 ${
                  errors.phone_number ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'
                }`} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="john@example.com" 
              value={formData.email} 
              onChange={handleChange} 
              className={`w-full p-3 border rounded-lg transition-all ${errors.email ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'}`} 
            />
            {errors.email && <span className="text-xs text-red-600 mt-1 block">Please enter valid email</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
              <input 
                type="text" 
                name="passport_number" 
                placeholder="A1234567" 
                value={formData.passport_number} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg transition-all ${errors.passport_number ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'}`} 
              />
              {errors.passport_number && <span className="text-xs text-red-600 mt-1 block">Please enter passport number</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passport Expiry Date</label>
              {/* Modern styled calendar date input for expiry */}
              <input 
                type="date" 
                name="passport_expiry_date" 
                value={formData.passport_expiry_date} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg bg-white shadow-sm transition-all cursor-pointer ${errors.passport_expiry_date ? 'border-red-500 bg-red-50 ring-2 ring-red-200' : 'border-gray-300'}`} 
              />
              {errors.passport_expiry_date && <span className="text-xs text-red-600 mt-1 block">Please select expiry date</span>}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-xl mt-6 shadow transition-all">
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
