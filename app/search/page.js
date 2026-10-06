'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function money(amount, currency) {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(Number(amount));
  } catch {
    return `${currency || 'GBP'} ${amount}`;
  }
}

function time(value) {
  if (!value) return '—';

  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function date(value) {
  if (!value) return '';

  return new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function mins(a, b) {
  if (!a || !b) return 0;

  return Math.max(
    0,
    Math.round(
      (new Date(b).getTime() - new Date(a).getTime()) / 60000
    )
  );
}

function durationText(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function getFlightDetails(offer) {
  const segments =
    offer?.slices?.flatMap((slice) => slice.segments || []) || [];

  const duration = segments.reduce(
    (total, segment) =>
      total + mins(segment.departing_at, segment.arriving_at),
    0
  );

  const stops = Math.max(0, segments.length - 1);

  return {
    segments,
    duration,
    stops,
  };
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sort, setSort] = useState('best');
  const [stopsFilter, setStopsFilter] = useState('all');
  const [airlineFilter, setAirlineFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');

  // ------------------------------------
  // TOTAL PASSENGERS
  // ------------------------------------

  const adults = Math.max(
    1,
    Number(searchParams.get('adults') || 1)
  );

  const children = searchParams
    .getAll('childAge')
    .filter((age) => age !== '');

  const passengerCount =
    adults + children.length;

  // ------------------------------------
  // SEARCH FLIGHTS
  // ------------------------------------

  useEffect(() => {
    async function searchFlights() {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();

        const keys = [
          'origin',
          'destination',
          'departureDate',
          'returnDate',
          'tripType',
          'adults',
          'cabin',
        ];

        keys.forEach((key) => {
          const value = searchParams.get(key);

          if (value) {
            params.set(key, value);
          }
        });

        // Send ALL child ages
        searchParams.getAll('childAge').forEach((age) => {
          if (age !== '') {
            params.append('childAge', age);
          }
        });

        const response = await fetch(
          `/api/search?${params.toString()}`,
          {
            cache: 'no-store',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Unable to search flights'
          );
        }

        setOffers(data.offers || []);
      } catch (err) {
        setError(
          err.message || 'Unable to search flights'
        );
      } finally {
        setLoading(false);
      }
    }

    if (
      searchParams.get('origin') &&
      searchParams.get('destination')
    ) {
      searchFlights();
    } else {
      setLoading(false);
      setError('Missing flight search details.');
    }
  }, [searchParams]);

  // ------------------------------------
  // AIRLINES
  // ------------------------------------

  const airlines = [
    ...new Set(
      offers
        .map((offer) => offer.owner?.name)
        .filter(Boolean)
    ),
  ];

  // ------------------------------------
  // FILTER + SORT
  // ------------------------------------

  const filteredOffers = useMemo(() => {
    let list = [...offers];

    // Stops
    if (stopsFilter !== 'all') {
      if (stopsFilter === '2') {
        list = list.filter(
          (offer) =>
            getFlightDetails(offer).stops >= 2
        );
      } else {
        list = list.filter(
          (offer) =>
            getFlightDetails(offer).stops ===
            Number(stopsFilter)
        );
      }
    }

    // Airline
    if (airlineFilter !== 'all') {
      list = list.filter(
        (offer) =>
          offer.owner?.name === airlineFilter
      );
    }

    // Max price PER PASSENGER
    if (maxPrice) {
      list = list.filter((offer) => {
        const total = Number(
          offer.total_amount || 0
        );

        const perPassenger =
          total / Math.max(passengerCount, 1);

        return perPassenger <= Number(maxPrice);
      });
    }

    // Cheapest
    if (sort === 'price') {
      list.sort((a, b) => {
        const priceA =
          Number(a.total_amount || 0) /
          Math.max(passengerCount, 1);

        const priceB =
          Number(b.total_amount || 0) /
          Math.max(passengerCount, 1);

        return priceA - priceB;
      });
    }

    // Fastest
    if (sort === 'duration') {
      list.sort(
        (a, b) =>
          getFlightDetails(a).duration -
          getFlightDetails(b).duration
      );
    }

    // Recommended
    if (sort === 'best') {
      list.sort((a, b) => {
        const priceA =
          Number(a.total_amount || 0) /
          Math.max(passengerCount, 1);

        const priceB =
          Number(b.total_amount || 0) /
          Math.max(passengerCount, 1);

        const stopA =
          getFlightDetails(a).stops;

        const stopB =
          getFlightDetails(b).stops;

        const durationA =
          getFlightDetails(a).duration;

        const durationB =
          getFlightDetails(b).duration;

        const scoreA =
          priceA +
          stopA * 50 +
          durationA * 0.05;

        const scoreB =
          priceB +
          stopB * 50 +
          durationB * 0.05;

        return scoreA - scoreB;
      });
    }

    return list;
  }, [
    offers,
    stopsFilter,
    airlineFilter,
    maxPrice,
    sort,
    passengerCount,
  ]);

  // ------------------------------------
  // SELECT FLIGHT
  // ------------------------------------

  function selectFlight(offer) {
    const params = new URLSearchParams();

    params.set('offerId', offer.id);

    params.set(
      'adults',
      String(adults)
    );

    params.set(
      'tripType',
      searchParams.get('tripType') || 'oneway'
    );

    params.set(
      'cabin',
      searchParams.get('cabin') || 'economy'
    );

    const returnDate =
      searchParams.get('returnDate');

    if (returnDate) {
      params.set(
        'returnDate',
        returnDate
      );
    }

    // Keep child ages
    searchParams.getAll('childAge').forEach((age) => {
      if (age !== '') {
        params.append('childAge', age);
      }
    });

    router.push(
      `/checkout?${params.toString()}`
    );
  }

  // ------------------------------------
  // LOADING
  // ------------------------------------

  if (loading) {
    return (
      <main className="results-shell">
        <header className="site-header">
          <div className="brand">
            ✈ Trip Scanner <b>Hub</b>
          </div>
        </header>

        <div className="loading-box">
          Searching live flight offers…
        </div>
      </main>
    );
  }

  // ------------------------------------
  // PAGE
  // ------------------------------------

  return (
    <main className="results-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">✈</span>
          Trip Scanner <b>Hub</b>
        </div>

        <button
          onClick={() => router.push('/')}
        >
          ← Change search
        </button>
      </header>

      {/* SEARCH SUMMARY */}

      <div className="results-top">
        <div>
          <span className="eyebrow">
            FLIGHT RESULTS
          </span>

          <h1>
            {searchParams.get('origin')}
            <span> → </span>
            {searchParams.get('destination')}
          </h1>

          <p>
            {date(
              searchParams.get(
                'departureDate'
              )
            )}

            {searchParams.get('tripType') ===
              'return' &&
              ` · Return ${date(
                searchParams.get(
                  'returnDate'
                )
              )}`}

            {' · '}

            {passengerCount}{' '}
            traveller
            {passengerCount !== 1
              ? 's'
              : ''}
          </p>
        </div>

        <select
          value={sort}
          onChange={(e) =>
            setSort(e.target.value)
          }
        >
          <option value="best">
            Recommended
          </option>

          <option value="price">
            Cheapest
          </option>

          <option value="duration">
            Fastest
          </option>
        </select>
      </div>

      {error ? (
        <div className="error">
          ⚠ {error}
        </div>
      ) : (
        <div className="results-layout">

          {/* FILTERS */}

          <aside className="filters">
            <h3>Filter flights</h3>

            <label>
              Stops

              <select
                value={stopsFilter}
                onChange={(e) =>
                  setStopsFilter(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  Any stops
                </option>

                <option value="0">
                  Direct
                </option>

                <option value="1">
                  1 stop
                </option>

                <option value="2">
                  2+ stops
                </option>
              </select>
            </label>

            <label>
              Airline

              <select
                value={airlineFilter}
                onChange={(e) =>
                  setAirlineFilter(
                    e.target.value
                  )
                }
              >
                <option value="all">
                  All airlines
                </option>

                {airlines.map((name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                ))}
              </select>
            </label>

            {offers.length > 0 && (
              <label>
                Maximum price per passenger

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(
                      e.target.value
                    )
                  }
                />
              </label>
            )}

            <button
              className="clear"
              onClick={() => {
                setStopsFilter('all');
                setAirlineFilter('all');
                setMaxPrice('');
              }}
            >
              Clear filters
            </button>
          </aside>

          {/* RESULTS */}

          <section className="flight-list">

            <div className="result-count">
              {filteredOffers.length}{' '}
              flight option
              {filteredOffers.length !== 1
                ? 's'
                : ''}
            </div>

            {filteredOffers.length === 0 ? (
              <div className="loading-box">
                No flights match your filters.
              </div>
            ) : (
              filteredOffers.map(
                (offer, index) => (
                  <FlightCard
                    key={
                      offer.id || index
                    }
                    offer={offer}
                    passengerCount={
                      passengerCount
                    }
                    onSelect={() =>
                      selectFlight(
                        offer
                      )
                    }
                  />
                )
              )
            )}
          </section>
        </div>
      )}
    </main>
  );
}

// ======================================
// FLIGHT CARD
// ======================================

function FlightCard({
  offer,
  passengerCount,
  onSelect,
}) {
  const {
    segments,
    duration,
    stops,
  } = getFlightDetails(offer);

  const totalPrice =
    Number(
      offer.total_amount || 0
    );

  // IMPORTANT:
  // Search page shows PER PASSENGER
  const perPassengerPrice =
    totalPrice /
    Math.max(passengerCount, 1);

  return (
    <article className="flight-result">

      <div className="flight-main">

        {/* AIRLINE */}

        <div className="airline">
          <div className="logo-box">
            {offer.owner
              ?.logo_symbol_url ? (
              <img
                src={
                  offer.owner
                    .logo_symbol_url
                }
                alt=""
              />
            ) : (
              '✈'
            )}
          </div>

          <div>
            <b>
              {offer.owner?.name ||
                'Airline'}
            </b>

            <small>
              {segments
                .map(
                  (segment) => {
                    const code =
                      segment
                        .marketing_carrier
                        ?.iata_code;

                    const number =
                      segment
                        .marketing_carrier_flight_number;

                    if (!code) {
                      return '';
                    }

                    return `${code} ${
                      number || ''
                    }`;
                  }
                )
                .filter(Boolean)
                .join(' · ')}
            </small>
          </div>
        </div>

        {/* TIMINGS */}

        <div className="timeline">
          {segments.map(
            (segment, index) => (
              <div
                className="leg"
                key={index}
              >

                <div>
                  <strong>
                    {time(
                      segment.departing_at
                    )}
                  </strong>

                  <span>
                    {
                      segment
                        .origin
                        ?.iata_code
                    }
                  </span>
                </div>

                <div className="line">
                  <small>
                    {durationText(
                      mins(
                        segment.departing_at,
                        segment.arriving_at
                      )
                    )}
                  </small>

                  <i></i>

                  <small>
                    {index <
                    segments.length - 1
                      ? 'Connection'
                      : 'Flight'}
                  </small>
                </div>

                <div>
                  <strong>
                    {time(
                      segment.arriving_at
                    )}
                  </strong>

                  <span>
                    {
                      segment
                        .destination
                        ?.iata_code
                    }
                  </span>
                </div>

              </div>
            )
          )}
        </div>

        {/* META */}

        <div className="flight-meta">
          <span>
            {stops === 0
              ? 'Direct'
              : `${stops} stop${
                  stops > 1
                    ? 's'
                    : ''
                }`}
          </span>

          <span>
            {durationText(
              duration
            )}
          </span>

          <span>
            🧳 Baggage varies by fare
          </span>
        </div>

      </div>

      {/* PRICE */}

      <div className="price-box">

        <small>
          From
        </small>

        <strong>
          {money(
            perPassengerPrice,
            offer.total_currency
          )}
        </strong>

        <span>
          per passenger
        </span>

        <small
          style={{
            marginTop: '5px',
            opacity: 0.7,
          }}
        >
          {passengerCount}{' '}
          traveller
          {passengerCount !== 1
            ? 's'
            : ''}{' '}
          ·{' '}
          {money(
            totalPrice,
            offer.total_currency
          )}{' '}
          total
        </small>

        <button
          onClick={onSelect}
        >
          Select flight →
        </button>

      </div>

    </article>
  );
}

// ======================================
// EXPORT
// ======================================

export default function Search() {
  return (
    <Suspense
      fallback={
        <main className="loading-box">
          Loading Trip Scanner Hub…
        </main>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
