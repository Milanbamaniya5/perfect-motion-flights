'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const adults = searchParams.get('adults') || 1;
  const childAges = searchParams.getAll('childAge');

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination) return;

    async function fetchFlights() {
      setLoading(true);
      try {
        const childQueryParams = childAges.map(age => `childAge=${age}`).join('&');
        const queryString = childQueryParams ? `&${childQueryParams}` : '';
        
        const res = await fetch(`/api/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}&adults=${adults}${queryString}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to fetch flights');

        setOffers(data.data.offers || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [origin, destination, departureDate, adults]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-blue-600">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 font-semibold animate-pulse">Searching the best flights for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-3xl max-w-md text-center shadow-lg">
          <h3 className="font-bold text-lg mb-1">Search Error</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 text-gray-800">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Available Flights</h1>
            <p className="text-sm text-gray-500 mt-0.5">{origin} ➔ {destination} • Date: {departureDate}</p>
          </div>
          <a href="/" className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl transition">
            Modify Search
          </a>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white border border-gray-200 p-12 rounded-3xl text-center text-gray-500 shadow-sm">
            No flights found for this route. Try changing dates or airports.
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white hover:shadow-md border border-gray-200 rounded-3xl p-6 flex justify-between items-center transition-all">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    {offer.owner.name}
                  </span>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-gray-900">{offer.total_currency} {offer.total_amount}</span>
                    <span className="text-xs text-gray-400 block mt-0.5">Includes taxes & airline fees</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = `/checkout?offerId=${offer.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition transform active:scale-95"
                >
                  Book Now ✈️
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
    <Suspense fallback={<div className="min-h-screen bg-gray-100" />}>
      <SearchResultsContent />
    </Suspense>
  );
}
