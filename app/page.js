'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const today = new Date().toISOString().split('T')[0];

  const [tripType, setTripType] = useState('return');
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [childrenAges, setChildrenAges] = useState([]);
  const [infantAges, setInfantAges] = useState([]);
  const [cabin, setCabin] = useState('economy');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  function setChildCount(count) {
    const n = Number(count);

    const next = Array.from(
      { length: n },
      (_, i) => childrenAges[i] ?? 5
    );

    setChildrenAges(next);
  }

  function setInfantCount(count) {
    const n = Number(count);

    const next = Array.from(
      { length: n },
      (_, i) => infantAges[i] ?? 0
    );

    setInfantAges(next);
  }

  function search(e) {
    e.preventDefault();
    setError('');

    if (!origin.trim() || origin.trim().length !== 3) {
      return setError('Please enter a valid 3-letter departure airport code.');
    }

    if (!destination.trim() || destination.trim().length !== 3) {
      return setError('Please enter a valid 3-letter destination airport code.');
    }

    if (!departureDate) {
      return setError('Please select a departure date.');
    }

    if (
      tripType === 'return' &&
      (!returnDate || returnDate < departureDate)
    ) {
      return setError('Please select a valid return date.');
    }

    const totalPassengers =
      adults +
      childrenAges.length +
      infantAges.length;

    if (totalPassengers > 9) {
      return setError('Maximum 9 passengers per booking.');
    }

    if (infantAges.length > adults) {
      return setError('There cannot be more infants than adults.');
    }

    const params = new URLSearchParams({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      departureDate,
      adults: String(adults),
      cabin,
      tripType,
    });

    if (tripType === 'return') {
      params.set('returnDate', returnDate);
    }

    childrenAges.forEach((age) => {
      params.append('childAge', String(age));
    });

    infantAges.forEach((age) => {
      params.append('infantAge', String(age));
    });

    router.push(`/search?${params.toString()}`);
  }

  const totalPassengers =
    adults +
    childrenAges.length +
    infantAges.length;

  return (
    <main className="home-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">✈</span>
          <span>
            Trip Scanner <b>Hub</b>
          </span>
        </div>

        <nav>
          <a href="#why">Why us</a>
          <a href="#help">Help</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            FLIGHTS • HOTELS • TRAVEL
          </span>

          <h1>
            Find your flight.
            <br />
            <span>Travel smarter.</span>
          </h1>

          <p>
            Compare real-time flight offers and choose the journey
            that works best for you.
          </p>
        </div>

        <div className="search-panel">
          <div className="trip-tabs">
            <button
              className={tripType === 'return' ? 'active' : ''}
              onClick={() => setTripType('return')}
            >
              ↔ Return
            </button>

            <button
              className={tripType === 'oneway' ? 'active' : ''}
              onClick={() => setTripType('oneway')}
            >
              → One-way
            </button>
          </div>

          {error && (
            <div className="error">
              ⚠ {error}
            </div>
          )}

          <form onSubmit={search}>
            <div className="search-grid">
              <label className="field">
                <small>FROM</small>

                <input
                  value={origin}
                  onChange={(e) =>
                    setOrigin(e.target.value.toUpperCase())
                  }
                  placeholder="LHR"
                  maxLength={3}
                />

                <b>London Heathrow</b>
              </label>

              <div className="swap">⇄</div>

              <label className="field">
                <small>TO</small>

                <input
                  value={destination}
                  onChange={(e) =>
                    setDestination(e.target.value.toUpperCase())
                  }
                  placeholder="AMD"
                  maxLength={3}
                />

                <b>Ahmedabad</b>
              </label>

              <label className="field">
                <small>DEPARTURE</small>

                <input
                  type="date"
                  min={today}
                  value={departureDate}
                  onChange={(e) =>
                    setDepartureDate(e.target.value)
                  }
                />
              </label>

              {tripType === 'return' && (
                <label className="field">
                  <small>RETURN</small>

                  <input
                    type="date"
                    min={departureDate || today}
                    value={returnDate}
                    onChange={(e) =>
                      setReturnDate(e.target.value)
                    }
                  />
                </label>
              )}

              <div className="field passenger-field">
                <small>PASSENGERS</small>

                <button
                  type="button"
                  onClick={() => setOpen(!open)}
                >
                  {totalPassengers}{' '}
                  passenger
                  {totalPassengers !== 1 ? 's' : ''} · {cabin}
                </button>

                {open && (
                  <div className="passenger-pop">

                    {/* ADULTS */}
                    <div className="pop-row">
                      <span>
                        <b>Adults</b>
                        <small>18+ years</small>
                      </span>

                      <select
                        value={adults}
                        onChange={(e) =>
                          setAdults(Number(e.target.value))
                        }
                      >
                        {Array.from(
                          { length: 9 },
                          (_, i) => (
                            <option key={i + 1}>
                              {i + 1}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* CHILDREN */}
                    <div className="pop-row">
                      <span>
                        <b>Children</b>
                        <small>2–17 years</small>
                      </span>

                      <select
                        value={childrenAges.length}
                        onChange={(e) =>
                          setChildCount(e.target.value)
                        }
                      >
                        {Array.from(
                          {
                            length:
                              Math.max(
                                0,
                                9 -
                                  adults -
                                  infantAges.length
                              ) + 1,
                          },
                          (_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* CHILD AGE */}
                    {childrenAges.map((age, i) => (
                      <div
                        className="pop-row"
                        key={`child-${i}`}
                      >
                        <span>
                          Child {i + 1} age
                        </span>

                        <select
                          value={age}
                          onChange={(e) =>
                            setChildrenAges(
                              childrenAges.map(
                                (x, j) =>
                                  j === i
                                    ? Number(e.target.value)
                                    : x
                              )
                            )
                          }
                        >
                          {Array.from(
                            { length: 16 },
                            (_, a) => (
                              <option
                                key={a + 2}
                                value={a + 2}
                              >
                                {a + 2} years
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    ))}

                    {/* INFANTS */}
                    <div className="pop-row">
                      <span>
                        <b>Infants</b>
                        <small>Under 2 years</small>
                      </span>

                      <select
                        value={infantAges.length}
                        onChange={(e) =>
                          setInfantCount(e.target.value)
                        }
                      >
                        {Array.from(
                          {
                            length:
                              Math.max(
                                0,
                                9 -
                                  adults -
                                  childrenAges.length
                              ) + 1,
                          },
                          (_, i) => (
                            <option key={i} value={i}>
                              {i}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* INFANT AGE */}
                    {infantAges.map((age, i) => (
                      <div
                        className="pop-row"
                        key={`infant-${i}`}
                      >
                        <span>
                          Infant {i + 1} age
                        </span>

                        <select
                          value={age}
                          onChange={(e) =>
                            setInfantAges(
                              infantAges.map(
                                (x, j) =>
                                  j === i
                                    ? Number(e.target.value)
                                    : x
                              )
                            )
                          }
                        >
                          <option value={0}>
                            Under 1 year
                          </option>

                          <option value={1}>
                            1 year
                          </option>
                        </select>
                      </div>
                    ))}

                    {/* CABIN */}
                    <div className="pop-row">
                      <span>
                        <b>Cabin</b>
                      </span>

                      <select
                        value={cabin}
                        onChange={(e) =>
                          setCabin(e.target.value)
                        }
                      >
                        <option value="economy">
                          Economy
                        </option>

                        <option value="premium_economy">
                          Premium Economy
                        </option>

                        <option value="business">
                          Business
                        </option>

                        <option value="first">
                          First
                        </option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="done"
                      onClick={() => setOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button className="search-button">
              Search flights <span>→</span>
            </button>
          </form>
        </div>
      </section>

      <section id="why" className="benefits">
        <div>
          <strong>✓</strong>
          <h3>Real flight offers</h3>
          <p>
            Flight details are taken from the live supplier
            response.
          </p>
        </div>

        <div>
          <strong>↕</strong>
          <h3>Smart filters</h3>
          <p>
            Sort by price, duration, stops and departure time.
          </p>
        </div>

        <div>
          <strong>🔒</strong>
          <h3>Secure checkout</h3>
          <p>
            Passenger details and payment are handled in separate
            steps.
          </p>
        </div>
      </section>

      <footer id="help">
        © 2026 Trip Scanner Hub · Compare flights with confidence.
      </footer>
    </main>
  );
}
