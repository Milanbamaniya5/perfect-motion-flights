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
  
  const [phoneError, setPhoneError] = useState(false);
  const [passportExpiryError, setPassportExpiryError] = useState(false);
  const [generalError, setGeneralError] = useState('');

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

    if (name === 'phone_number') {
      const activeCountry = countries.find(c => c.dialCode === formData.phone_code) || { phoneLength: 10 };
      if (/^\d*$/.test(value) && value.trim().length === activeCountry.phoneLength) {
        setPhoneError(false);
      }
    }

    if (name === 'passport_expiry_date') {
      if (value) {
        const expiryDate = new Date(value);
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);

        if (expiryDate >= sixMonthsFromNow) {
          setPassportExpiryError(false);
        }
      }
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    setPhoneError(false);
    setPassportExpiryError(false);

    let hasError = false;

    const cleanPhone = formData.phone_number.trim();
    const activeCountry = countries.find(c => c.dialCode === formData.phone_code) || { phoneLength: 10 };
    const isNumeric = /^\d+$/.test(cleanPhone);
    
    if (!isNumeric || cleanPhone.length !== activeCountry.phoneLength) {
      setPhoneError(true);
      hasError = true;
    }

    if (formData.passport_expiry_date) {
      const expiryDate = new Date(formData.passport_expiry_date);
      const today = new Date();
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(today.getMonth() + 6);

      if (expiryDate < sixMonthsFromNow) {
        setPassportExpiryError(true);
        hasError = true;
      }
    } else {
      setPassportExpiryError(true);
      hasError = true;
    }

    if (hasError) {
      setGeneralError('Please correct the highlighted fields before proceeding.');
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
      setGeneralError(err.message);
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
        
        {generalError && (
          <div style={{ color: 'red', backgroundColor: '#fee2e2', borderColor: '#f87171' }} className="p-4 rounded-xl mb-6 text-sm font-semibold border">
            {generalError}
          </div>
        )}
        
        <form onSubmit={handleBooking} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Given Name</label>
              <input type="text" name="given_name" placeholder="John" value={formData.given_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
              <input type="text" name="family_name" placeholder="Doe" value={formData.family_name} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" name="born_on" value={formData.born_on} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none cursor-pointer" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none">
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
            <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none" required>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
              <select name="phone_code" value={formData.phone_code} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none">
                {countries.map((c) => (
                  <option key={c.code} value={c.dialCode}>{c.name} ({c.dialCode})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                {phoneError && (
                  <span style={{ color: 'red' }} className="text-xs font-bold">
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
                style={phoneError ? { borderColor: 'red', backgroundColor: '#fff5f5', borderWidth: '2px' } : {}}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
              <input type="text" name="passport_number" placeholder="A1234567" value={formData.passport_number} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg outline-none" required />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Passport Expiry Date</label>
                {passportExpiryError && (
                  <span style={{ color: 'red' }} className="text-xs font-bold">
                    Must be valid for 6+ months
                  </span>
                )}
              </div>
              <input 
                type="date" 
                name="passport_expiry_date" 
                value={formData.passport_expiry_date} 
                onChange={handleChange} 
                style={passportExpiryError ? { borderColor: 'red', backgroundColor: '#fff5f5', borderWidth: '2px' } : {}}
                className="w-full p-3 border border-gray-300 rounded-lg outline-none cursor-pointer" 
                required 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-xl mt-6 shadow transition">
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
