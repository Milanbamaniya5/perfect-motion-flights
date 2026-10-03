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
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [maxStops, setMaxStops] = useState('all');
  const [sortBy, setSortBy] = useState('price');

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

        const flightOffers = data.data.offers || [];
        setOffers(flightOffers);
        setFilteredOffers(flightOffers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, [origin, destination, departureDate, returnDate]);

  // Handle Filtering & Sorting logic
  useEffect(() => {
    let result = [...offers];

    // Stops Filter
    if (maxStops !== 'all') {
      result = result.filter(offer => {
        const stops = offer.slices[0].segments.length - 1;
        return stops <= parseInt(maxStops);
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'price') {
        return parseFloat(a.total_amount) - parseFloat(b.total_amount);
      }
      return 0;
    });

    setFilteredOffers(result);
  }, [maxStops, sortBy, offers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-gray-600">Loading flights and applying filters... ✈️</div>
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
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Filters Sidebar */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit space-y-6">
          <h2 className="text-lg font-bold text-gray-800">Filters</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stops</label>
            <select 
              value={maxStops} 
              onChange={(e) => setMaxStops(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"
            >
              <option value="all">All Flights</option>
              <option value="0">Direct Only</option>
              <option value="1">Up to 1 Stop</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full p-2.5 border rounded-lg text-sm bg-gray-50"
            >
              <option value="price">Lowest Price</option>
            </select>
          </div>
        </div>

        {/* Flight Offers List */}
        <div className="md:col-span-3 space-y-4">
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Flights from {origin} to {destination} ({filteredOffers.length} found)
          </h1>

          {filteredOffers.length === 0 ? (
            <p className="text-gray-600 bg-white p-6 rounded-xl shadow">No flights match your filters.</p>
          ) : (
            filteredOffers.map((offer) => (
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
            ))
          )}
        </div>

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
