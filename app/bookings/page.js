'use client';

import { useEffect, useState } from 'react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Local storage ya state se saved bookings load karna
    const savedBookings = JSON.parse(localStorage.getItem('my_flight_bookings') || '[]');
    setBookings(savedBookings);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Flight Bookings 🎫</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-600">
            <p className="mb-4">Aapne abhi tak koi flight book nahi ki hai.</p>
            <a href="/" className="inline-block bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow">
              Search Flights
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">Booking Reference: {booking.booking_reference}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">Confirmed</span>
                  </div>
                  <p className="text-sm text-gray-600">Order ID: <span className="font-mono text-gray-800">{booking.id}</span></p>
                  <p className="text-sm text-gray-600">Total Paid: <span className="font-semibold text-gray-900">{booking.total_currency} {booking.total_amount}</span></p>
                </div>
                <button 
                  onClick={() => alert(`Details for Booking: ${booking.booking_reference}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition text-sm"
                >
                  View E-Ticket
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
