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
  return Math.max(
    0,
    Math.round(
      (new Date(b).getTime() - new Date(a).getTime()) / 60000
    )
  );
}

function dur(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
}

function details(offer) {
  const segs =
    offer?.slices?.flatMap((slice) => slice.segments || []) || [];

  const duration = segs.reduce(
    (total, segment) =>
      total + mins(segment.departing_at, segment.arriving_at),
    0
  );

  const stops = Math.max(0, segs.length - 1);

  return {
    segs,
    duration,
    stops,
  };
}

function SearchContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [sort, setSort] = useState('best');
  const [stops, setStops] = useState('all');
  const [airline, setAirline] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    async function searchFlights() {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();

        const copyParams = [
          'origin',
          'destination',
          'departureDate',
          'returnDate',
          'tripType',
          'adults',
          'cabin',
        ];

        copyParams.forEach((key) => {
          const value = sp.get(key);

          if (value) {
            params.set(key, value);
          }
        });

        // IMPORTANT:
        // Send every child age to the API
        sp.getAll('childAge').forEach((age) => {
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
        setError(err.message || 'Unable to search flights');
      } finally {
        setLoading(false);
      }
    }

    if (sp.get('origin') && sp.get('destination')) {
      searchFlights();
    } else {
      setLoading(false);
      setError('Missing flight search details.');
    }
  }, [sp]);

  const airlines = [
    ...new Set(
      offers
        .map((offer) => offer.owner?.name)
        .filter(Boolean)
    ),
  ];

  const prices = offers
    .map((offer) => Number(offer.total_amount) || 0)
    .filter((price) => price > 0);

  const highest = Math.ceil(
    Math.max(...prices, 0)
  );

  const filtered = useMemo(() => {
    let list = [...offers];

    if (stops !== 'all') {
      if (stops === '2') {
        list = list.filter(
          (offer) => details(offer).stops >= 2
        );
      } else {
        list = list.filter(
          (offer) =>
            details(offer).stops === Number(stops)
        );
      }
    }

    if (airline !== 'all') {
      list = list.filter(
        (offer) =>
          offer.owner?.name === airline
      );
    }

    if (maxPrice) {
      list = list.filter(
        (offer) =>
          Number(offer.total_amount) <=
          Number(maxPrice)
      );
    }

    if (sort === 'price') {
      list.sort(
        (a, b) =>
          Number(a.total_amount) -
          Number(b.total_amount)
      );
    }

    if (sort === 'duration') {
      list.sort(
        (a, b) =>
          details(a).duration -
          details(b).duration
      );
    }

    if (sort === 'best') {
      list.sort((a, b) => {
        const priceDifference =
          Number(a.total_amount) -
          Number(b.total_amount);

        const stopDifference =
          details(a).stops -
          details(b).stops;

        return (
          priceDifference * 0.4 +
          stopDifference * 20
        );
      });
    }

    return list;
  }, [
    offers,
    stops,
    airline,
    maxPrice,
    sort,
  ]);

  function selectFlight(offer) {
    const params = new URLSearchParams();

    params.set('offerId', offer.id);

    // IMPORTANT:
    // Passenger information is preserved
    // when going from search → checkout.

    const adults = sp.get('adults') || '1';

    params.set('adults', adults);

    const tripType =
      sp.get('tripType') || 'oneway';

    params.set('tripType', tripType);

    const cabin =
      sp.get('cabin') || 'economy';

    params.set('cabin', cabin);

    const returnDate =
      sp.get('returnDate');

    if (returnDate) {
      params.set('returnDate', returnDate);
    }

    sp.getAll('childAge').forEach((age) => {
      if (age !== '') {
        params.append('childAge', age);
      }
    });

    router.push(
      `/checkout?${params.toString()}`
    );
  }

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

  return (
    <main className="results-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">✈</span>
          Trip Scanner <b>Hub</b>
        </div>

        <button onClick={() => router.push('/')}>
          ← Change search
        </button>
      </header>

      <div className="results-top">
        <div>
          <span className="eyebrow">
            FLIGHT RESULTS
          </span>

          <h1>
            {sp.get('origin')}
            <span> → </span>
            {sp.get('destination')}
          </h1>

          <p>
            {date(sp.get('departureDate'))}

            {sp.get('tripType') === 'return' &&
              ` · Return ${date(
                sp.get('returnDate')
              )}`}

            {' · '}

            {sp.get('adults') || 1} adult
            {(Number(sp.get('adults') || 1) !== 1)
              ? 's'
              : ''}

            {sp.getAll('childAge').length > 0 &&
              ` · ${sp.getAll('childAge').length} child`}
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
          <aside className="filters">
            <h3>Filter flights</h3>

            <label>
              Stops

              <select
                value={stops}
                onChange={(e) =>
                  setStops(e.target.value)
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
                value={airline}
                onChange={(e) =>
                  setAirline(e.target.value)
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

            {highest > 0 && (
              <label>
                Maximum price

                <input
                  type="range"
                  min="0"
                  max={highest}
                  value={
                    maxPrice || highest
                  }
                  onChange={(e) =>
                    setMaxPrice(e.target.value)
                  }
                />

                <b>
                  {money(
                    maxPrice || highest,
                    offers[0]
                      ?.total_currency || 'GBP'
                  )}
                </b>
              </label>
            )}

            <button
              className="clear"
              onClick={() => {
                setStops('all');
                setAirline('all');
                setMaxPrice('');
              }}
            >
              Clear filters
            </button>
          </aside>

          <section className="flight-list">
            <div className="result-count">
              {filtered.length} flight option
              {filtered.length !== 1
                ? 's'
                : ''}
            </div>

            {filtered.map(
              (offer, index) => (
                <FlightCard
                  key={
                    offer.id || index
                  }
                  offer={offer}
                  onSelect={() =>
                    selectFlight(offer)
                  }
                />
              )
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function FlightCard({
  offer,
  onSelect,
}) {
  const d = details(offer);

  return (
    <article className="flight-result">
      <div className="flight-main">
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
              {d.segs
                .map((segment) =>
                  segment
                    .marketing_carrier
                    ?.iata_code
                    ? `${segment.marketing_carrier.iata_code} ${
                        segment.marketing_carrier_flight_number ||
                        ''
                      }`
                    : ''
                )
                .filter(Boolean)
                .join(' · ')}
            </small>
          </div>
        </div>

        <div className="timeline">
          {d.segs.map(
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
                      segment.origin
                        ?.iata_code
                    }
                  </span>
                </div>

                <div className="line">
                  <small>
                    {dur(
                      mins(
                        segment.departing_at,
                        segment.arriving_at
                      )
                    )}
                  </small>

                  <i></i>

                  <small>
                    {index <
                    d.segs.length - 1
                      ? 'connection'
                      : 'flight'}
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
                      segment.destination
                        ?.iata_code
                    }
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        <div className="flight-meta">
          <span>
            {d.stops === 0
              ? 'Direct'
              : `${d.stops} stop${
                  d.stops > 1
                    ? 's'
                    : ''
                }`}
          </span>

          <span>
            {dur(d.duration)}
          </span>

          <span>
            🧳 Baggage varies by fare
          </span>
        </div>
      </div>

      <div className="price-box">
        <small>From</small>

        <strong>
          {money(
            offer.total_amount,
            offer.total_currency
          )}
        </strong>

        <span>
          total for selected passengers
        </span>

        <button onClick={onSelect}>
          Select flight →
        </button>
      </div>
    </article>
  );
}

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
