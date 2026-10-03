'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination) return;

    async function fetchFlights() {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}&returnDate=${returnDate}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch flights');
        }

        setOffers(data.data.offers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [origin, destination, departureDate, returnDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-600">Searching flights via Duffel... ✈️️</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500 font-medium">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Available Flights ({origin} ➔ {destination})
        </h1>

        {offers.length === 0 ? (
          <p className="text-gray-600 bg-white p-6 rounded-xl shadow">No flights found for these dates.</p>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{offer.owner.name}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">Economy</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Total Amount: <span className="font-semibold text-gray-900">{offer.total_currency} {offer.total_amount}</span>
                  </p>
                </div>
                <button 
                  onClick={() => window.location.href = `/checkout?offerId=${offer.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition duration-200 shadow"
                >
                  Select Flight
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
