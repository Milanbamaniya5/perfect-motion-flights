'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

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

  const [passengersData, setPassengersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!offerId) return;
    async function getOffer() {
      try {
        const res = await fetch(`/api/orders?offerId=${offerId}`);
        const data = await res.json();
        if (data.offer) {
          const initial = data.offer.passengers.map(p => ({
            id: p.id,
            type: p.type,
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
          }));
          setPassengersData(initial);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    getOffer();
  }, [offerId]);

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengersData];
    updated[index][field] = value;
    if (field === 'nationality') {
      const c = countries.find(x => x.code === value);
      if (c) updated[index].phone_code = c.dialCode;
    }
    setPassengersData(updated);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    let newErrors = {};
    let hasError = false;

    passengersData.forEach((p, idx) => {
      // 1. Validate Age (Adult >= 18, Child 0-17)
      if (p.born_on) {
        const birthDate = new Date(p.born_on);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (p.type === 'adult' && age < 18) {
          newErrors[`dob_${idx}`] = 'Adult passenger must be 18 years or older.';
          hasError = true;
        }
        if (p.type === 'child' && (age < 0 || age > 17)) {
          newErrors[`dob_${idx}`] = 'Child passenger must be between 0 and 17 years old.';
          hasError = true;
        }
      } else {
        newErrors[`dob_${idx}`] = 'Date of birth is required.';
        hasError = true;
      }

      // 2. Validate Passport Expiry (6+ months)
      if (p.passport_expiry_date) {
        const expiryDate = new Date(p.passport_expiry_date);
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);
        if (expiryDate < sixMonthsFromNow) {
          newErrors[`expiry_${idx}`] = 'Must be valid for 6+ months.';
          hasError = true;
        }
      } else {
        newErrors[`expiry_${idx}`] = 'Expiry date is required.';
        hasError = true;
      }

      // 3. Validate Phone Number length (UK allows leading zero 11 digits, others standard)
      const cleanPhone = p.phone_number.trim();
      const activeCountry = countries.find(c => c.dialCode === p.phone_code) || { phoneLength: 10 };
      let targetLength = activeCountry.phoneLength;
      if (p.phone_code === '+44' && cleanPhone.startsWith('0')) {
        targetLength = 11;
      }

      if (!/^\d+$/.test(cleanPhone) || cleanPhone.length !== targetLength) {
        newErrors[`phone_${idx}`] = 'Please enter correct number';
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    const formattedPassengers = passengersData.map(p => {
      let cleanPhone = p.phone_number.trim();
      let formattedPhone = cleanPhone;
      if (p.phone_code === '+44' && cleanPhone.startsWith('0') && cleanPhone.length === 11) {
        formattedPhone = cleanPhone.substring(1);
      }

      return {
        id: p.id,
        given_name: p.given_name,
        family_name: p.family_name,
        gender: p.gender,
        born_on: p.born_on,
        title: p.gender === 'm' ? 'mr' : 'ms',
        email: p.email,
        phone_number: `${p.phone_code}${formattedPhone}`,
        identity_documents: [{
          type: 'passport',
          number: p.passport_number,
          unique_identifier: p.passport_number,
          expires_on: p.passport_expiry_date,
          issuing_country_code: p.nationality || 'GB',
        }]
      };
    });

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, passengers: formattedPassengers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      setOrderResult(data.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading passenger form...</div>;

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Passenger Details ({passengersData.length} Passengers)</h1>
        
        <form onSubmit={handleBooking} className="space-y-6">
          {passengersData.map((p, index) => (
            <div key={p.id} className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50/50">
              <h3 className="font-bold text-gray-700 capitalize">
                Passenger {index + 1} ({p.type.toUpperCase()})
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Given Name</label>
                  <input type="text" value={p.given_name} onChange={(e) => handlePassengerChange(index, 'given_name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
                  <input type="text" value={p.family_name} onChange={(e) => handlePassengerChange(index, 'family_name', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    {errors[`dob_${index}`] && <span style={{ color: 'red' }} className="text-xs font-bold">{errors[`dob_${index}`]}</span>}
                  </div>
                  <input 
                    type="date" 
                    max={new Date().toISOString().split('T')[0]}
                    value={p.born_on} 
                    onChange={(e) => handlePassengerChange(index, 'born_on', e.target.value)} 
                    style={errors[`dob_${index}`] ? { borderColor: 'red', borderWidth: '2px' } : {}}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none cursor-pointer" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select value={p.gender} onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none">
                    <option value="m">Male</option>
                    <option value="f">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <select value={p.nationality} onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none" required>
                  {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <select value={p.phone_code} onChange={(e) => handlePassengerChange(index, 'phone_code', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none">
                    {countries.map((c) => <option key={c.code} value={c.dialCode}>{c.dialCode}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    {errors[`phone_${index}`] && <span style={{ color: 'red' }} className="text-xs font-bold">Please enter correct number</span>}
                  </div>
                  <input 
                    type="text" 
                    value={p.phone_number} 
                    onChange={(e) => handlePassengerChange(index, 'phone_number', e.target.value)} 
                    style={errors[`phone_${index}`] ? { borderColor: 'red', borderWidth: '2px' } : {}}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none" 
                    placeholder="Enter phone number"
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={p.email} onChange={(e) => handlePassengerChange(index, 'email', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passport Number</label>
                  <input type="text" value={p.passport_number} onChange={(e) => handlePassengerChange(index, 'passport_number', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none" required />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">Passport Expiry</label>
                    {errors[`expiry_${index}`] && <span style={{ color: 'red' }} className="text-xs font-bold">Must be 6+ months valid</span>}
                  </div>
                  <input 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    value={p.passport_expiry_date} 
                    onChange={(e) => handlePassengerChange(index, 'passport_expiry_date', e.target.value)} 
                    style={errors[`expiry_${index}`] ? { borderColor: 'red', borderWidth: '2px' } : {}}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none cursor-pointer" 
                    required 
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-xl shadow transition">
            {submitting ? 'Processing Booking...' : 'Complete Booking'}
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
