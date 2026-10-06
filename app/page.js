'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const [tripType, setTripType] = useState('return');
  const [origin, setOrigin] = useState('LHR');
  const [destination, setDestination] = useState('AMD');
  const [departureDate, setDepartureDate] = useState(today);

  const [adults, setAdults] = useState(1);
  const [childrenAges, setChildrenAges] = useState([]);

  const [cabin, setCabin] = useState('Economy');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const totalTravellers = adults + childrenAges.length;

  // Add/remove children
  const setChildren = (numberOfChildren) => {
    const n = Math.max(0, Math.min(8, Number(numberOfChildren)));

    if (adults + n > 9) {
      setError('Maximum 9 passengers per booking.');
      return;
    }

    setError('');

    setChildrenAges((currentAges) => {
      return Array.from(
        { length: n },
        (_, index) => currentAges[index] ?? null
      );
    });
  };

  // Change child age
  const changeChildAge = (index, age) => {
    const updatedAges = [...childrenAges];

    updatedAges[index] = Number(age);

    setChildrenAges(updatedAges);

    setError('');
  };

  // Search flights
  const search = (e) => {
    e.preventDefault();

    setError('');

    if (!origin.trim()) {
      setError('Please enter your departure airport.');
      return;
    }

    if (!destination.trim()) {
      setError('Please enter your destination airport.');
      return;
    }

    if (departureDate < today) {
      setError('Departure date cannot be in the past.');
      return;
    }

    if (totalTravellers > 9) {
      setError('Maximum 9 passengers per booking.');
      return;
    }

    // Make sure every child has an age selected
    if (childrenAges.some((age) => age === null)) {
      setError('Please select the age of every child.');
      setOpen(true);
      return;
    }

    const childParams = childrenAges
      .map((age) => `&childAge=${encodeURIComponent(age)}`)
      .join('');

    router.push(
      `/search?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(
        destination
      )}&departureDate=${encodeURIComponent(
        departureDate
      )}&adults=${adults}${childParams}`
    );
  };

  return (
    <div className="page-shell">

      {/* HEADER */}
      <header className="site-header">
        <nav className="nav">

          <a className="brand" href="/">
            <span className="brand-mark">✈</span>
            Perfect Motion
          </a>

          <div className="nav-links">
            <a href="/">Flights</a>
            <a href="/bookings">My bookings</a>
            <a className="nav-cta" href="/bookings">
              Manage booking
            </a>
          </div>

        </nav>
      </header>


      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">

          <span className="eyebrow">
            ✦ Smart flight search
          </span>

          <h1>
            Find your next flight
            <br />
            at a better price.
          </h1>

          <p className="hero-copy">
            Compare routes and choose the flight that fits your journey.
            Simple search, clear prices and a smoother booking experience.
          </p>

        </div>
      </section>


      {/* SEARCH CARD */}
      <section className="search-card">

        {/* RETURN / ONE WAY */}
        <div className="trip-tabs">

          <button
            type="button"
            className={`trip-tab ${
              tripType === 'return' ? 'active' : ''
            }`}
            onClick={() => setTripType('return')}
          >
            ↔ Return
          </button>

          <button
            type="button"
            className={`trip-tab ${
              tripType === 'oneway' ? 'active' : ''
            }`}
            onClick={() => setTripType('oneway')}
          >
            → One-way
          </button>

        </div>


        {/* ERROR */}
        {error && (
          <div className="error-box">
            ⚠ {error}
          </div>
        )}


        <form onSubmit={search}>

          <div className="search-grid">

            {/* FROM */}
            <div className="field">

              <label>From</label>

              <input
                value={origin}
                onChange={(e) =>
                  setOrigin(e.target.value.toUpperCase())
                }
                placeholder="LHR"
                maxLength={4}
                required
              />

              <div className="subtle">
                Airport code
              </div>

            </div>


            {/* TO */}
            <div className="field">

              <label>To</label>

              <input
                value={destination}
                onChange={(e) =>
                  setDestination(e.target.value.toUpperCase())
                }
                placeholder="AMD"
                maxLength={4}
                required
              />

              <div className="subtle">
                Airport code
              </div>

            </div>


            {/* DEPARTURE */}
            <div className="field">

              <label>Departure</label>

              <input
                type="date"
                min={today}
                value={departureDate}
                onChange={(e) =>
                  setDepartureDate(e.target.value)
                }
                required
              />

            </div>


            {/* TRAVELLERS */}
            <div className="field passenger-wrap">

              <label>
                Travellers & cabin
              </label>

              <button
                type="button"
                className="traveller-trigger"
                onClick={() => setOpen(!open)}
              >
                <strong>
                  {totalTravellers}{' '}
                  {totalTravellers === 1
                    ? 'traveller'
                    : 'travellers'}
                </strong>

                <span>
                  · {cabin}
                </span>
              </button>


              {/* PASSENGER PANEL */}
              {open && (
                <div className="passenger-panel">

                  {/* ADULTS */}
                  <div className="passenger-row">

                    <div>
                      <b>Adults</b>

                      <div className="subtle">
                        18+ years
                      </div>
                    </div>

                    <select
                      className="counter-select"
                      value={adults}
                      onChange={(e) => {
                        const numberOfAdults =
                          Number(e.target.value);

                        if (
                          numberOfAdults +
                            childrenAges.length <=
                          9
                        ) {
                          setAdults(numberOfAdults);
                          setError('');
                        }
                      }}
                    >
                      {Array.from(
                        { length: 9 },
                        (_, index) => (
                          <option
                            key={index + 1}
                            value={index + 1}
                          >
                            {index + 1}
                          </option>
                        )
                      )}
                    </select>

                  </div>


                  {/* CHILDREN */}
                  <div className="passenger-row">

                    <div>
                      <b>Children</b>

                      <div className="subtle">
                        0–17 years
                      </div>
                    </div>

                    <select
                      className="counter-select"
                      value={childrenAges.length}
                      onChange={(e) =>
                        setChildren(
                          Number(e.target.value)
                        )
                      }
                    >
                      {Array.from(
                        { length: 10 - adults },
                        (_, index) => (
                          <option
                            key={index}
                            value={index}
                          >
                            {index}
                          </option>
                        )
                      )}
                    </select>

                  </div>


                  {/* CHILD AGE SELECTORS */}
                  {childrenAges.map(
                    (age, index) => (

                      <div
                        className="age-row"
                        key={index}
                      >

                        <div>
                          <b>
                            Child {index + 1}
                          </b>

                          <div className="subtle">
                            Age 0–17 years
                          </div>
                        </div>


                        <select
                          className={`counter-select ${
                            age === null
                              ? 'age-required'
                              : ''
                          }`}
                          value={
                            age === null
                              ? ''
                              : age
                          }
                          onChange={(e) =>
                            changeChildAge(
                              index,
                              e.target.value
                            )
                          }
                        >

                          <option
                            value=""
                            disabled
                          >
                            Select age
                          </option>

                          {Array.from(
                            { length: 18 },
                            (_, ageNumber) => (

                              <option
                                key={ageNumber}
                                value={ageNumber}
                              >
                                {ageNumber}{' '}
                                {ageNumber === 1
                                  ? 'year'
                                  : 'years'}
                              </option>

                            )
                          )}

                        </select>

                      </div>

                    )
                  )}


                  {/* CABIN */}
                  <div className="passenger-row">

                    <div>
                      <b>Cabin</b>
                    </div>

                    <select
                      className="counter-select"
                      value={cabin}
                      onChange={(e) =>
                        setCabin(e.target.value)
                      }
                    >

                      <option>
                        Economy
                      </option>

                      <option>
                        Premium Economy
                      </option>

                      <option>
                        Business
                      </option>

                      <option>
                        First
                      </option>

                    </select>

                  </div>


                  {/* DONE */}
                  <button
                    className="done-btn"
                    type="button"
                    onClick={() => {

                      if (
                        childrenAges.some(
                          (age) => age === null
                        )
                      ) {
                        setError(
                          'Please select the age of every child.'
                        );
                        return;
                      }

                      setError('');
                      setOpen(false);

                    }}
                  >
                    Done
                  </button>

                </div>
              )}

            </div>


            {/* SEARCH BUTTON */}
            <button
              className="search-button"
              type="submit"
            >
              Search flights
            </button>

          </div>

        </form>

      </section>


      {/* BENEFITS */}
      <section className="benefits">

        <div className="benefit">

          <div className="benefit-icon">
            ⌕
          </div>

          <h3>
            Compare more options
          </h3>

          <p>
            See available offers in one clean,
            easy-to-read search result.
          </p>

        </div>


        <div className="benefit">

          <div className="benefit-icon">
            £
          </div>

          <h3>
            Clear pricing
          </h3>

          <p>
            Keep the total price visible so you
            can choose with confidence.
          </p>

        </div>


        <div className="benefit">

          <div className="benefit-icon">
            ✓
          </div>

          <h3>
            Simple checkout
          </h3>

          <p>
            Enter passenger details through a
            focused, modern booking form.
          </p>

        </div>

      </section>

    </div>
  );
}
