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

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [offer, setOffer] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [contact, setContact] = useState({
    email: '',
    phone_number: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const offerId = sp.get('offerId');

    const adults = Math.max(
      1,
      Number(sp.get('adults') || 1)
    );

    const childAges = sp.getAll('childAge');

    const passengerList = [];

    // ADULTS
    for (let i = 0; i < adults; i++) {
      passengerList.push({
        type: 'adult',
        age: null,
        given_name: '',
        family_name: '',
        born_on: '',
        gender: 'm',
        nationality: 'GB',
        passport_number: '',
        passport_expiry_date: '',
      });
    }

    // CHILDREN
    childAges.forEach((age) => {
      if (age === '') return;

      passengerList.push({
        type: 'child',
        age: Number(age),
        given_name: '',
        family_name: '',
        born_on: '',
        gender: 'm',
        nationality: 'GB',
        passport_number: '',
        passport_expiry_date: '',
      });
    });

    setPassengers(passengerList);

    if (offerId) {
      fetch(
        `/api/orders?offerId=${encodeURIComponent(offerId)}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.offer) {
            setOffer(data.offer);
          } else {
            setError(
              data.error || 'Unable to load flight.'
            );
          }
        })
        .catch(() => {
          setError('Unable to load flight.');
        });
    }
  }, [sp]);

  function updatePassenger(index, field, value) {
    setPassengers((current) =>
      current.map((passenger, i) =>
        i === index
          ? {
              ...passenger,
              [field]: value,
            }
          : passenger
      )
    );
  }

  function updateContact(field, value) {
    setContact((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();
    setError('');

    // Validate passengers
    for (let i = 0; i < passengers.length; i++) {
      const passenger = passengers[i];

      if (
        !passenger.given_name ||
        !passenger.family_name ||
        !passenger.born_on
      ) {
        setError(
          `Please complete Passenger ${i + 1} details.`
        );
        return;
      }
    }

    // Validate contact information ONCE
    if (!contact.email) {
      setError('Please enter the contact email address.');
      return;
    }

    if (!contact.phone_number) {
      setError('Please enter the contact phone number.');
      return;
    }

    // Save passengers
    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(passengers)
    );

    // Save contact information ONCE
    sessionStorage.setItem(
      'tripScannerContact',
      JSON.stringify(contact)
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
      (slice) => slice.segments || []
    ) || [];

  return (
    <main className="checkout-shell">
      <header className="site-header">
        <div className="brand">
          ✈ Trip Scanner <b>Hub</b>
        </div>

        <span>Passenger details</span>
      </header>

      <div className="checkout-grid">
        <section>
          <div className="stepbar">
            <b>1 Passenger</b>
            <span>2 Payment</span>
            <span>3 Confirmation</span>
          </div>

          <form
            className="passenger-card"
            onSubmit={submit}
          >
            <h1>Passenger details</h1>

            <p>
              Enter passenger details exactly as shown on
              the passport or travel document.
            </p>

            {error && (
              <div className="error">
                ⚠ {error}
              </div>
            )}

            {/* =========================
                PASSENGERS
            ========================== */}

            {passengers.map((passenger, index) => (
              <div
                key={index}
                className="passenger-section"
                style={{
                  marginBottom: '28px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <h2>
                  Passenger {index + 1}{' '}
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#64748b',
                    }}
                  >
                    (
                    {passenger.type === 'child'
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
                      value={passenger.given_name}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          'given_name',
                          e.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Last name *
                    <input
                      type="text"
                      value={passenger.family_name}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          'family_name',
                          e.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Date of birth *
                    <input
                      type="date"
                      value={passenger.born_on}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          'born_on',
                          e.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Gender
                    <select
                      value={passenger.gender}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          'gender',
                          e.target.value
                        )
                      }
                    >
                      <option value="m">Male</option>
                      <option value="f">Female</option>
                    </select>
                  </label>

                  <label>
                    Nationality
                    <input
                      type="text"
                      value={passenger.nationality}
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
                      value={passenger.passport_number}
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
                      value={passenger.passport_expiry_date}
                      onChange={(e) =>
                        updatePassenger(
                          index,
                          'passport_expiry_date',
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>
              </div>
            ))}

            {/* =========================
                CONTACT INFORMATION
                ONLY ONCE
            ========================== */}

            <div
              className="contact-section"
              style={{
                marginTop: '32px',
                padding: '24px',
                borderRadius: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <h2>Contact information</h2>

              <p>
                We'll send your booking confirmation and
                important flight updates to these details.
              </p>

              <div className="form-grid">
                <label>
                  Email address *
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={contact.email}
                    onChange={(e) =>
                      updateContact(
                        'email',
                        e.target.value
                      )
                    }
                    required
                  />
                </label>

                <label>
                  Phone number *
                  <input
                    type="tel"
                    placeholder="+44 7xxx xxxxxx"
                    value={contact.phone_number}
                    onChange={(e) =>
                      updateContact(
                        'phone_number',
                        e.target.value
                      )
                    }
                    required
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="primary wide"
              style={{
                marginTop: '24px',
              }}
            >
              Continue to payment →
            </button>
          </form>
        </section>

        {/* =========================
            BOOKING SUMMARY
        ========================== */}

        <aside className="summary">
          <h3>Booking summary</h3>

          {segments.map((segment, index) => (
            <div
              className="summary-leg"
              key={index}
            >
              <b>
                {time(segment.departing_at)}{' '}
                {segment.origin?.iata_code}
                {' → '}
                {time(segment.arriving_at)}{' '}
                {segment.destination?.iata_code}
              </b>

              <small>
                {segment.marketing_carrier?.name}
                {' · '}
                {segment.marketing_carrier_flight_number}
              </small>
            </div>
          ))}

          <div className="total">
            <span>Total</span>

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
