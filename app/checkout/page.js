'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { Suspense } from 'react';

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

// Smooth Mobile Scroll Wheel Picker Component
function ScrollWheelPicker({ label, value, onChange, type = 'dob' }) {
  const currentYear = new Date().getFullYear();
  const years = type === 'dob' 
    ? Array.from({ length: 90 }, (_, i) => currentYear - 10 - i) // 1936 to 2016
    : Array.from({ length: 15 }, (_, i) => currentYear + i);     // 2026 to 2040

  const months = [
    { value: '01', name: 'Jan' }, { value: '02', name: 'Feb' }, { value: '03', name: 'Mar' },
    { value: '04', name: 'Apr' }, { value: '05', name: 'May' }, { value: '06', name: 'Jun' },
    { value: '07', name: 'Jul' }, { value: '08', name: 'Aug' }, { value: '09', name: 'Sep' },
    { value: '10', name: 'Oct' }, { value: '11', name: 'Nov' }, { value: '12', name: 'Dec' }
  ];

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  // Parse current value (YYYY-MM-DD)
  const parts = value ? value.split('-') : [type === 'dob' ? '1995' : String(currentYear), '01', '01'];
  const [year, month, day] = parts;

  const handleUpdate = (newYear, newMonth, newDay) => {
    onChange(`${newYear}-${newMonth}-${newDay}`);
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 shadow-inner">
        
        {/* Day Picker */}
        <div className="h-28 overflow-y-auto snap-y snap-mandatory scrollbar-none rounded-lg bg-white border border-gray-100 shadow-sm text-center py-2">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Day</div>
          {days.map((d) => (
            <div 
              key={d} 
              onClick={() => handleUpdate(year, month, d)}
              className={`py-1.5 cursor-pointer snap-center text-sm transition-all ${day === d ? 'bg-blue-600 text-white font-bold rounded-md mx-1 shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Month Picker */}
        <div className="h-28 overflow-y-auto snap-y snap-mandatory scrollbar-none rounded-lg bg-white border border-gray-100 shadow-sm text-center py-2">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Month</div>
          {months.map((m) => (
            <div 
              key={m.value} 
              onClick={() => handleUpdate(year, m.value, day)}
              className={`py-1.5 cursor-pointer snap-center text-sm transition-all ${month === m.value ? 'bg-blue-600 text-white font-bold rounded-md mx-1 shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {m.name}
            </div>
          ))}
        </div>

        {/* Year Picker */}
        <div className="h-28 overflow-y-auto snap-y snap-mandatory scrollbar-none rounded-lg bg-white border border-gray-100 shadow-sm text-center py-2">
          <div className="text-xs text-gray-400 uppercase font-semibold mb-1">Year</div>
          {years.map((y) => (
            <div 
              key={y} 
              onClick={() => handleUpdate(String(y), month, day)}
              className={`py-1.5 cursor-pointer snap-center text-sm transition-all ${year === String(y) ? 'bg-blue-600 text-white font-bold rounded-md mx-1 shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {y}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get('offerId');

  const [formData, setFormData] = useState({
    given_name: '',
    family_name: '',
    gender: 'm',
    born_on: '1995-06-15',
    nationality: 'GB',
    email: '',
    phone_code: '+44',
    phone_number: '',
    passport_number: '',
    passport_expiry_date: '2030-12-31',
  });

  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [phoneError, setPhoneError] = useState(false);

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
      setPhoneError(false);
    }
  };

  const handleDateChange = (field, newDate) => {
    setFormData(prev => ({ ...prev, [field]: newDate }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError(null);
    setPhoneError(false);

    const cleanPhone = formData.phone_number.trim();
    const activeCountry = countries.find(c => c.dialCode === formData.phone_code) || { phoneLength: 10, name: 'Selected Country' };

    const isNumeric = /^\d+$/.test(cleanPhone);
    if (!isNumeric || cleanPhone.length !== activeCountry.phoneLength) {
      setPhoneError(true); // Sirf phone field red hoga aur unique error message bagal mein aayega
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
        {generalError && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">{generalError}</div>}
        
        <form onSubmit={handleBooking} className="space-y-5">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg">
                <option value="m">Male</option>
                <option value="f">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
              <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full p-3 border rounded-lg" required>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Smooth Mobile Scroll Wheel for Date of Birth */}
          <ScrollWheelPicker 
            label="Date of Birth" 
            value={formData.born_on} 
            onChange={(val) => handleDateChange('born_on', val)} 
            type="dob"
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country Code</label>
              <select name="phone_code" value={formData.phone_code} onChange={handleChange} className="w-full p-3 border rounded-lg">
                {countries.map((c) => (
                  <option key={c.code} value={c.dialCode}>{c.name} ({c.dialCode})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                {phoneError && (
                  <span className="text-xs text-red-600 font-bold animate-bounce">
                    ⚠ Please enter correct number
                  </span>
                )}
              </div>
              <input 
                type="text" 
                name="phone_number" 
                placeholder="e.g. 9876543210" 
                value={formData.phone_number} 
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg transition-all duration-200 ${
                  phoneError ? 'border-red-500 bg-red-50 ring-2 ring-red-300' : 'border-gray-300'
                }`} 
                required 
              />
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
          </div>

          {/* Smooth Mobile Scroll Wheel for Passport Expiry Date */}
          <ScrollWheelPicker 
            label="Passport Expiry Date" 
            value={formData.passport_expiry_date} 
            onChange={(val) => handleDateChange('passport_expiry_date', val)} 
            type="expiry"
          />

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
