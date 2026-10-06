'use client';

import {
  Suspense,
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

function money(amount, currency) {
  try {
    return new Intl.NumberFormat(
      'en-GB',
      {
        style: 'currency',
        currency: currency || 'GBP',
      }
    ).format(Number(amount));
  } catch {
    return `${currency || 'GBP'} ${amount}`;
  }
}

function time(value) {
  if (!value) return '—';

  return new Date(value).toLocaleTimeString(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [offer, setOffer] =
    useState(null);

  const [passengers, setPassengers] =
    useState([]);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const offerId =
      sp.get('offerId');

    const adults = Math.max(
      1,
      Number(sp.get('adults') || 1)
    );

    const childAges =
      sp.getAll('childAge');

    const passengerList = [];

    // Adults
    for (
      let i = 0;
      i < adults;
      i++
    ) {
      passengerList.push({
        type: 'adult',
        age: null,

        given_name: '',
        family_name: '',
        email: '',
        phone_number: '',
        born_on: '',
        gender: 'm',
        nationality: 'GB',
        passport_number: '',
        passport_expiry_date: '',
      });
    }

    // Children
    childAges.forEach(
      (age) => {
        if (age === '') return;

        passengerList.push({
          type: 'child',
          age: Number(age),

          given_name: '',
          family_name: '',
          email: '',
          phone_number: '',
          born_on: '',
          gender: 'm',
          nationality: 'GB',
          passport_number: '',
          passport_expiry_date: '',
        });
      }
    );

    setPassengers(
      passengerList
    );

    if (offerId) {
      fetch(
        `/api/orders?offerId=${encodeURIComponent(
          offerId
        )}`
      )
        .then((response) =>
          response.json()
        )
        .then((data) => {
          if (data.offer) {
            setOffer(data.offer);
          } else {
            setError(
              data.error ||
                'Unable to load flight.'
            );
          }
        })
        .catch(() =>
          setError(
            'Unable to load flight.'
          )
        );
    }
  }, [sp]);

  function updatePassenger(
    index,
    field,
    value
  ) {
    setPassengers((current) =>
      current.map(
        (passenger, i) =>
          i === index
            ? {
                ...passenger,
                [field]: value,
              }
            : passenger
      )
    );
  }

  function submit(event) {
    event.preventDefault();

    setError('');

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const passenger =
        passengers[i];

      if (
        !passenger.given_name ||
        !passenger.family_name ||
        !passenger.born_on
      ) {
        setError(
          `Please complete Passenger ${
            i + 1
          } details.`
        );

        return;
      }

      if (
        passenger.type === 'adult' &&
        !passenger.email
      ) {
        setError(
          `Please enter email for Passenger ${
            i + 1
          }.`
        );

        return;
      }
    }

    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(passengers)
    );

    sessionStorage.setItem(
      'tripScannerOfferId',
      sp.get('offerId') || ''
    );

    router.push(
      `/payment?offerId=${encodeURIComponent(
        sp.get('offerId') || ''
      )}`
    );
  }

  const segments =
    offer?.slices?.flatMap(
      (slice) =>
        slice.segments || []
    ) || [];

  return (
    <main className="checkout-shell">
      <header className="site-header">
        <div className="brand">
          ✈ Trip Scanner{' '}
          <b>Hub</b>
        </div>

        <span>
          Passenger details
        </span>
      </header>

      <div className="checkout-grid">
        <section>
          <div className="stepbar">
            <b>
              1 Passenger
            </b>

            <span>
              2 Payment
            </span>

            <span>
              3 Confirmation
            </span>
          </div>

          <form
            className="passenger-card"
            onSubmit={submit}
          >
            <h1>
              Passenger details
            </h1>

            <p>
              Enter details exactly as
              shown on the passport or
              travel document.
            </p>

            {error && (
              <div className="error">
                ⚠ {error}
              </div>
            )}

            {passengers.map(
              (
                passenger,
                index
              ) => (
                <div
                  key={index}
                  className="passenger-section"
                  style={{
                    marginBottom:
                      '28px',
                    paddingBottom:
                      '24px',
                    borderBottom:
                      '1px solid #e5e7eb',
                  }}
                >
                  <h2>
                    Passenger{' '}
                    {index + 1}{' '}
                    <span
                      style={{
                        fontSize:
                          '14px',
                        fontWeight:
                          '500',
                        color:
                          '#64748b',
                      }}
                    >
                      (
                      {passenger.type ===
                      'child'
                        ? `Child · age ${passenger.age}`
                        : 'Adult'}
                      )
                    </span>
                  </h2>

                  <div className="form-grid">
                    <label>
                      First name *
                      <input
                        type="text"
                        value={
                          passenger.given_name
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'given_name',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Last name *
                      <input
                        type="text"
                        value={
                          passenger.family_name
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'family_name',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Date of birth *
                      <input
                        type="date"
                        value={
                          passenger.born_on
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'born_on',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Gender
                      <select
                        value={
                          passenger.gender
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'gender',
                            e.target.value
                          )
                        }
                      >
                        <option value="m">
                          Male
                        </option>

                        <option value="f">
                          Female
                        </option>
                      </select>
                    </label>

                    <label>
                      Nationality
                      <input
                        type="text"
                        value={
                          passenger.nationality
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'nationality',
                            e.target.value.toUpperCase()
                          )
                        }
                      />
                    </label>

                    <label>
                      Passport number
                      <input
                        type="text"
                        value={
                          passenger.passport_number
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'passport_number',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Passport expiry
                      <input
                        type="date"
                        value={
                          passenger.passport_expiry_date
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'passport_expiry_date',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Phone
                      <input
                        type="tel"
                        value={
                          passenger.phone_number
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'phone_number',
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Email
                      {passenger.type ===
                        'adult' && (
                        <span> *</span>
                      )}

                      <input
                        type="email"
                        value={
                          passenger.email
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'email',
                            e.target.value
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              )
            )}

            <button
              type="submit"
              className="primary wide"
            >
              Continue to payment →
            </button>
          </form>
        </section>

        <aside className="summary">
          <h3>
            Booking summary
          </h3>

          {segments.map(
            (segment, index) => (
              <div
                className="summary-leg"
                key={index}
              >
                <b>
                  {time(
                    segment.departing_at
                  )}{' '}
                  {
                    segment.origin
                      ?.iata_code
                  }{' '}
                  →
                  {` `}
                  {time(
                    segment.arriving_at
                  )}{' '}
                  {
                    segment.destination
                      ?.iata_code
                  }
                </b>

                <small>
                  {
                    segment
                      .marketing_carrier
                      ?.name
                  }{' '}
                  ·{' '}
                  {
                    segment
                      .marketing_carrier_flight_number
                  }
                </small>
              </div>
            )
          )}

          <div className="total">
            <span>
              Total
            </span>

            <strong>
              {offer &&
                money(
                  offer.total_amount,
                  offer.total_currency
                )}
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function Checkout() {
  return (
    <Suspense
      fallback={
        <main className="loading-box">
          Loading Trip Scanner Hub…
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
