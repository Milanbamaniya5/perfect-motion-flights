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

/* =========================================
   DATE HELPERS
========================================= */

function parseDate(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfToday() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function calculateAge(bornOn, referenceDate) {
  const dob = parseDate(bornOn);
  const ref = referenceDate || startOfToday();

  if (!dob) return null;

  let age =
    ref.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    ref.getMonth() -
    dob.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      ref.getDate() < dob.getDate()
    )
  ) {
    age--;
  }

  return age;
}

function getDepartureDate(searchParams) {
  const departureDate =
    searchParams.get('departureDate');

  if (departureDate) {
    return parseDate(departureDate);
  }

  return startOfToday();
}

/* =========================================
   CHECKOUT
========================================= */

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [offer, setOffer] = useState(null);

  const [passengers, setPassengers] =
    useState([]);

  const [contact, setContact] =
    useState({
      email: '',
      phone_number: '',
    });

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

    /* =====================================
       ADULTS
    ===================================== */

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
        born_on: '',
        gender: 'm',
        nationality: 'GB',

        passport_number: '',
        passport_expiry_date: '',
      });
    }

    /* =====================================
       CHILDREN
    ===================================== */

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

    setPassengers(
      passengerList
    );

    /* =====================================
       LOAD OFFER
    ===================================== */

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
        .catch(() => {
          setError(
            'Unable to load flight.'
          );
        });
    }
  }, [sp]);

  /* =========================================
     UPDATE PASSENGER
  ========================================= */

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

  /* =========================================
     UPDATE CONTACT
  ========================================= */

  function updateContact(
    field,
    value
  ) {
    setContact((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* =========================================
     VALIDATE PASSENGERS
  ========================================= */

  function validatePassengers() {
    const departureDate =
      getDepartureDate(sp);

    const today =
      startOfToday();

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const passenger =
        passengers[i];

      const passengerNumber =
        i + 1;

      /* ================================
         NAME
      ================================= */

      if (
        !passenger.given_name ||
        !passenger.given_name.trim()
      ) {
        return `Please enter first name for Passenger ${passengerNumber}.`;
      }

      if (
        !passenger.family_name ||
        !passenger.family_name.trim()
      ) {
        return `Please enter last name for Passenger ${passengerNumber}.`;
      }

      /* ================================
         DOB REQUIRED
      ================================= */

      if (!passenger.born_on) {
        return `Please enter date of birth for Passenger ${passengerNumber}.`;
      }

      const dob =
        parseDate(
          passenger.born_on
        );

      if (!dob) {
        return `Invalid date of birth for Passenger ${passengerNumber}.`;
      }

      /* ================================
         DOB CANNOT BE FUTURE
      ================================= */

      if (dob > today) {
        return `Date of birth cannot be in the future for Passenger ${passengerNumber}.`;
      }

      /* ================================
         AGE AT TRAVEL
      ================================= */

      const ageAtTravel =
        calculateAge(
          passenger.born_on,
          departureDate
        );

      if (
        ageAtTravel === null ||
        ageAtTravel < 0
      ) {
        return `Invalid date of birth for Passenger ${passengerNumber}.`;
      }

      /* ================================
         ADULT VALIDATION
      ================================= */

      if (
        passenger.type === 'adult'
      ) {
        if (ageAtTravel < 18) {
          return `Passenger ${passengerNumber} must be 18 or older.`;
        }
      }

      /* ================================
         CHILD VALIDATION
      ================================= */

      if (
        passenger.type === 'child'
      ) {
        const selectedChildAge =
          Number(passenger.age);

        if (
          !Number.isFinite(
            selectedChildAge
          )
        ) {
          return `Child age is missing for Passenger ${passengerNumber}.`;
        }

        if (
          ageAtTravel !==
          selectedChildAge
        ) {
          return `Passenger ${passengerNumber} must be exactly ${selectedChildAge} years old on the departure date.`;
        }

        if (
          ageAtTravel >= 18
        ) {
          return `Passenger ${passengerNumber} cannot be booked as a child.`;
        }
      }

      /* ================================
         PASSPORT NUMBER
      ================================= */

      if (
        !passenger.passport_number ||
        !passenger.passport_number.trim()
      ) {
        return `Please enter passport number for Passenger ${passengerNumber}.`;
      }

      /* ================================
         PASSPORT EXPIRY REQUIRED
      ================================= */

      if (
        !passenger.passport_expiry_date
      ) {
        return `Please enter passport expiry date for Passenger ${passengerNumber}.`;
      }

      const expiry =
        parseDate(
          passenger.passport_expiry_date
        );

      if (!expiry) {
        return `Invalid passport expiry date for Passenger ${passengerNumber}.`;
      }

      /* ================================
         PASSPORT CANNOT EXPIRE TODAY/PAST
      ================================= */

      if (expiry <= today) {
        return `Passport for Passenger ${passengerNumber} must be valid on the booking date.`;
      }

      /* ================================
         EXPIRY MUST BE AFTER DOB
      ================================= */

      if (expiry <= dob) {
        return `Passport expiry date is invalid for Passenger ${passengerNumber}.`;
      }
    }

    return '';
  }

  /* =========================================
     SUBMIT
  ========================================= */

  function submit(event) {
    event.preventDefault();

    setError('');

    /* ================================
       PASSENGER VALIDATION
    ================================= */

    const passengerError =
      validatePassengers();

    if (passengerError) {
      setError(
        passengerError
      );

      return;
    }

    /* ================================
       CONTACT EMAIL
    ================================= */

    if (
      !contact.email ||
      !contact.email.trim()
    ) {
      setError(
        'Please enter the contact email address.'
      );

      return;
    }

    /* ================================
       EMAIL FORMAT
    ================================= */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        contact.email.trim()
      )
    ) {
      setError(
        'Please enter a valid email address.'
      );

      return;
    }

    /* ================================
       PHONE
    ================================= */

    if (
      !contact.phone_number ||
      !contact.phone_number.trim()
    ) {
      setError(
        'Please enter the contact phone number.'
      );

      return;
    }

    /* ================================
       PHONE FORMAT
    ================================= */

    const phoneDigits =
      contact.phone_number.replace(
        /\D/g,
        ''
      );

    if (
      phoneDigits.length < 7
    ) {
      setError(
        'Please enter a valid phone number.'
      );

      return;
    }

    /* ================================
       SAVE PASSENGERS
    ================================= */

    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(
        passengers
      )
    );

    /* ================================
       SAVE CONTACT
    ================================= */

    sessionStorage.setItem(
      'tripScannerContact',
      JSON.stringify(
        contact
      )
    );

    /* ================================
       SAVE OFFER
    ================================= */

    sessionStorage.setItem(
      'tripScannerOfferId',
      sp.get('offerId') || ''
    );

    /* ================================
       GO TO PAYMENT
    ================================= */

    router.push(
      `/payment?offerId=${encodeURIComponent(
        sp.get('offerId') || ''
      )}`
    );
  }

  /* =========================================
     FLIGHT SEGMENTS
  ========================================= */

  const segments =
    offer?.slices?.flatMap(
      (slice) =>
        slice.segments || []
    ) || [];

  /* =========================================
     PAGE
  ========================================= */

  return (
    <main className="checkout-shell">

      {/* HEADER */}

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

        {/* =================================
            LEFT SIDE
        ================================== */}

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
              Enter passenger details
              exactly as shown on the
              passport or travel document.
            </p>

            {/* ERROR */}

            {error && (
              <div
                className="error"
                style={{
                  marginBottom:
                    '20px',
                  padding:
                    '14px 16px',
                  borderRadius:
                    '10px',
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* =================================
                PASSENGERS
            ================================== */}

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
                      {
                        passenger.type ===
                        'child'
                          ? `Child · age ${passenger.age}`
                          : 'Adult'
                      }
                      )
                    </span>

                  </h2>

                  <div className="form-grid">

                    {/* FIRST NAME */}

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
                        required
                      />

                    </label>

                    {/* LAST NAME */}

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
                        required
                      />

                    </label>

                    {/* DOB */}

                    <label>
                      Date of birth *

                      <input
                        type="date"
                        value={
                          passenger.born_on
                        }
                        max={
                          new Date()
                            .toISOString()
                            .split('T')[0]
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'born_on',
                            e.target.value
                          )
                        }
                        required
                      />

                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '5px',
                          color:
                            '#64748b',
                        }}
                      >
                        Must match the
                        passenger's real
                        date of birth.
                      </small>

                    </label>

                    {/* GENDER */}

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

                    {/* NATIONALITY */}

                    <label>
                      Nationality

                      <input
                        type="text"
                        value={
                          passenger.nationality
                        }
                        maxLength={2}
                        placeholder="GB"
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'nationality',
                            e.target.value.toUpperCase()
                          )
                        }
                      />

                    </label>

                    {/* PASSPORT NUMBER */}

                    <label>
                      Passport number *

                      <input
                        type="text"
                        value={
                          passenger.passport_number
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'passport_number',
                            e.target.value.toUpperCase()
                          )
                        }
                        required
                      />

                    </label>

                    {/* PASSPORT EXPIRY */}

                    <label>
                      Passport expiry *

                      <input
                        type="date"
                        value={
                          passenger.passport_expiry_date
                        }
                        min={
                          new Date(
                            Date.now() +
                            24 *
                            60 *
                            60 *
                            1000
                          )
                            .toISOString()
                            .split('T')[0]
                        }
                        onChange={(e) =>
                          updatePassenger(
                            index,
                            'passport_expiry_date',
                            e.target.value
                          )
                        }
                        required
                      />

                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '5px',
                          color:
                            '#64748b',
                        }}
                      >
                        Passport must still
                        be valid.
                      </small>

                    </label>

                  </div>

                </div>

              )
            )}

            {/* =================================
                CONTACT INFORMATION
                ONLY ONCE
            ================================== */}

            <div
              className="contact-section"
              style={{
                marginTop:
                  '32px',
                padding:
                  '24px',
                borderRadius:
                  '16px',
                background:
                  '#f8fafc',
                border:
                  '1px solid #e2e8f0',
              }}
            >

              <h2>
                Contact information
              </h2>

              <p>
                We'll send your booking
                confirmation and important
                flight updates to these
                details.
              </p>

              <div className="form-grid">

                {/* EMAIL */}

                <label>
                  Email address *

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={
                      contact.email
                    }
                    onChange={(e) =>
                      updateContact(
                        'email',
                        e.target.value
                      )
                    }
                    required
                  />

                </label>

                {/* PHONE */}

                <label>
                  Phone number *

                  <input
                    type="tel"
                    placeholder="+44 7xxx xxxxxx"
                    value={
                      contact.phone_number
                    }
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

            {/* =================================
                CONTINUE
            ================================== */}

            <button
              type="submit"
              className="primary wide"
              style={{
                marginTop:
                  '24px',
              }}
            >
              Continue to payment →
            </button>

          </form>

        </section>

        {/* =================================
            BOOKING SUMMARY
        ================================== */}

        <aside className="summary">

          <h3>
            Booking summary
          </h3>

          {segments.map(
            (
              segment,
              index
            ) => (

              <div
                className="summary-leg"
                key={index}
              >

                <b>
                  {time(
                    segment.departing_at
                  )}{' '}

                  {
                    segment
                      .origin
                      ?.iata_code
                  }

                  {' → '}

                  {time(
                    segment.arriving_at
                  )}{' '}

                  {
                    segment
                      .destination
                      ?.iata_code
                  }

                </b>

                <small>

                  {
                    segment
                      .marketing_carrier
                      ?.name
                  }

                  {' · '}

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

/* =========================================
   EXPORT
========================================= */

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
