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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse">Scanning the best skies for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded-3xl max-w-md text-center">
          <h3 className="font-bold text-lg mb-1">Search Error</h3>
          <p className="text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 text-slate-100">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Available Flights</h1>
            <p className="text-sm text-slate-400">{origin} ➔ {destination} • {departureDate}</p>
          </div>
          <a href="/" className="text-xs bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-2 rounded-xl transition">Change Search</a>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center text-slate-400">
            No flights found for this route on selected date.
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl p-6 flex justify-between items-center transition-all shadow-lg backdrop-blur-md">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    {offer.owner.name}
                  </span>
                  <div className="mt-3">
                    <span className="text-3xl font-black text-white">{offer.total_currency} {offer.total_amount}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">Includes taxes & fees</span>
                  </div>
                </div>
                <button 
                  onClick={() => window.location.href = `/checkout?offerId=${offer.id}`}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-600/30 transition transform active:scale-95"
                >
                  Select Flight ✨
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
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <SearchResultsContent />
    </Suspense>
  );
}
