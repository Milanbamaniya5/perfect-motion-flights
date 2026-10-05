'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const adults = searchParams.get('adults') || 1;

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!origin || !destination) return;

    async function fetchFlights() {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}&adults=${adults}`);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Searching flights... ✈</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Flights</h1>
        {offers.length === 0 ? (
          <p className="bg-white p-6 rounded-xl shadow">No flights found.</p>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-lg">{offer.owner.name}</h2>
                  <p className="text-sm text-gray-600">Amount: {offer.total_currency} {offer.total_amount}</p>
                </div>
                <button 
                  onClick={() => window.location.href = `/checkout?offerId=${offer.id}`}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700"
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
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
