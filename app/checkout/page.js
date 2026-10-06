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

// ---------------------------------------------
// DATE HELPERS
// ---------------------------------------------

function parseDate(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addMonths(date, months) {
  const result = new Date(date);

  result.setMonth(
    result.getMonth() + months
  );

  return result;
}

function subtractYears(date, years) {
  const result = new Date(date);

  result.setFullYear(
    result.getFullYear() - years
  );

  return result;
}

// ---------------------------------------------
// AGE CALCULATION
// ---------------------------------------------

function calculateAgeOnDate(
  dobString,
  travelDateString
) {
  const dob = parseDate(dobString);
  const travelDate =
    parseDate(travelDateString);

  if (!dob || !travelDate) {
    return null;
  }

  let age =
    travelDate.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    travelDate.getMonth() -
    dob.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      travelDate.getDate() <
        dob.getDate()
    )
  ) {
    age--;
  }

  return age;
}

// ---------------------------------------------
// DOB RANGE
// ---------------------------------------------

function getDobRange(
  passenger,
  departureDate
) {
  const travelDate =
    parseDate(departureDate);

  if (!travelDate) {
    return {
      min: '',
      max: '',
    };
  }

  // -------------------------------------------
  // ADULT
  // Must be 18+
  // -------------------------------------------

  if (passenger.type === 'adult') {
    const latestDob =
      subtractYears(
        travelDate,
        18
      );

    const earliestDob =
      subtractYears(
        travelDate,
        100
      );

    return {
      min: formatDateInput(
        earliestDob
      ),
      max: formatDateInput(
        latestDob
      ),
    };
  }

  // -------------------------------------------
  // CHILD
  // Exact selected age
  // -------------------------------------------

  if (passenger.type === 'child') {
    const selectedAge =
      Number(passenger.age);

    const latestDob =
      subtractYears(
        travelDate,
        selectedAge
      );

    const nextBirthday =
      subtractYears(
        travelDate,
        selectedAge + 1
      );

    const earliestAllowedDob =
      new Date(nextBirthday);

    earliestAllowedDob.setDate(
      earliestAllowedDob.getDate() + 1
    );

    return {
      min: formatDateInput(
        earliestAllowedDob
      ),
      max: formatDateInput(
        latestDob
      ),
    };
  }

  // -------------------------------------------
  // INFANT
  // Exact selected age
  // -------------------------------------------

  if (passenger.type === 'infant') {
    const selectedAge =
      Number(passenger.age);

    const latestDob =
      subtractYears(
        travelDate,
        selectedAge
      );

    const nextBirthday =
      subtractYears(
        travelDate,
        selectedAge + 1
      );

    const earliestAllowedDob =
      new Date(nextBirthday);

    earliestAllowedDob.setDate(
      earliestAllowedDob.getDate() + 1
    );

    return {
      min: formatDateInput(
        earliestAllowedDob
      ),
      max: formatDateInput(
        latestDob
      ),
    };
  }

  return {
    min: '',
    max: '',
  };
}

// ---------------------------------------------
// DISPLAY AGE
// ---------------------------------------------

function passengerLabel(passenger) {
  if (passenger.type === 'adult') {
    return 'Adult';
  }

  if (passenger.type === 'child') {
    return `Child · age ${passenger.age}`;
  }

  if (passenger.type === 'infant') {
    return `Infant · age ${passenger.age}`;
  }

  return passenger.type;
}

// ---------------------------------------------
// MAIN CHECKOUT
// ---------------------------------------------

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [offer, setOffer] =
    useState(null);

  const [passengers, setPassengers] =
    useState([]);

  const [contact, setContact] =
    useState({
      email: '',
      phone_number: '',
    });

  const [error, setError] =
    useState('');

  // -------------------------------------------
  // CREATE PASSENGERS
  // -------------------------------------------

  useEffect(() => {
    const offerId =
      sp.get('offerId');

    const adults = Math.max(
      1,
      Number(
        sp.get('adults') || 1
      )
    );

    // Child ages from home page
    const childAges =
      sp.getAll('childAge')
        .filter(
          (age) => age !== ''
        );

    // Infant ages from home page
    const infantAges =
      sp.getAll('infantAge')
        .filter(
          (age) => age !== ''
        );

    const passengerList = [];

    // -----------------------------------------
    // ADULTS
    // -----------------------------------------

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

    // -----------------------------------------
    // CHILDREN
    // -----------------------------------------

    childAges.forEach(
      (age) => {
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
      }
    );

    // -----------------------------------------
    // INFANTS
    // -----------------------------------------

    infantAges.forEach(
      (age) => {
        passengerList.push({
          type: 'infant',
          age: Number(age),

          given_name: '',
          family_name: '',
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

    // -----------------------------------------
    // LOAD OFFER
    // -----------------------------------------

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

  // -------------------------------------------
  // UPDATE PASSENGER
  // -------------------------------------------

  function updatePassenger(
    index,
    field,
    value
  ) {
    setPassengers(
      (current) =>
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

  // -------------------------------------------
  // CONTACT
  // -------------------------------------------

  function updateContact(
    field,
    value
  ) {
    setContact(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  // -------------------------------------------
  // SUBMIT / VALIDATION
  // -------------------------------------------

  function submit(event) {
    event.preventDefault();

    setError('');

    const departureDate =
      sp.get('departureDate') ||
      offer?.slices?.[0]
        ?.segments?.[0]
        ?.departing_at
        ?.slice(0, 10);

    // -----------------------------------------
    // PASSENGER VALIDATION
    // -----------------------------------------

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const passenger =
        passengers[i];

      const passengerNumber =
        i + 1;

      // Required names
      if (
        !passenger.given_name ||
        !passenger.family_name
      ) {
        setError(
          `Please complete Passenger ${passengerNumber} name.`
        );
        return;
      }

      // DOB required
      if (!passenger.born_on) {
        setError(
          `Please enter Date of Birth for Passenger ${passengerNumber}.`
        );
        return;
      }

      // ---------------------------------------
      // AGE CHECK
      // ---------------------------------------

      const calculatedAge =
        calculateAgeOnDate(
          passenger.born_on,
          departureDate
        );

      if (
        calculatedAge === null
      ) {
        setError(
          `Invalid Date of Birth for Passenger ${passengerNumber}.`
        );
        return;
      }

      // ---------------------------------------
      // ADULT MUST BE 18+
      // ---------------------------------------

      if (
        passenger.type ===
          'adult' &&
        calculatedAge < 18
      ) {
        setError(
          `Passenger ${passengerNumber} is selected as Adult. Date of Birth must make the passenger 18 years or older on the travel date.`
        );
        return;
      }

      // ---------------------------------------
      // CHILD EXACT AGE
      // ---------------------------------------

      if (
        passenger.type ===
          'child'
      ) {
        if (
          calculatedAge !==
          Number(passenger.age)
        ) {
          setError(
            `Passenger ${passengerNumber} is selected as Child age ${passenger.age}. Please enter a Date of Birth matching that age on the travel date.`
          );
          return;
        }
      }

      // ---------------------------------------
      // INFANT EXACT AGE
      // ---------------------------------------

      if (
        passenger.type ===
          'infant'
      ) {
        if (
          calculatedAge !==
          Number(passenger.age)
        ) {
          setError(
            `Passenger ${passengerNumber} is selected as Infant age ${passenger.age}. Please enter a Date of Birth matching that age on the travel date.`
          );
          return;
        }

        if (
          calculatedAge < 0 ||
          calculatedAge > 1
        ) {
          setError(
            `Passenger ${passengerNumber} must be an infant aged 0–1 on the travel date.`
          );
          return;
        }
      }

      // ---------------------------------------
      // PASSPORT EXPIRY
      // ---------------------------------------

      if (
        !passenger.passport_expiry_date
      ) {
        setError(
          `Please enter passport expiry date for Passenger ${passengerNumber}.`
        );
        return;
      }

      const expiryDate =
        parseDate(
          passenger.passport_expiry_date
        );

      const travelDate =
        parseDate(
          departureDate
        );

      if (
        !expiryDate ||
        !travelDate
      ) {
        setError(
          `Invalid passport expiry date for Passenger ${passengerNumber}.`
        );
        return;
      }

      // Passport must be valid for
      // at least 6 months from departure
      const minimumExpiry =
        addMonths(
          travelDate,
          6
        );

      if (
        expiryDate <
        minimumExpiry
      ) {
        setError(
          `Passport for Passenger ${passengerNumber} must be valid for at least 6 months after the departure date.`
        );
        return;
      }

      // Passport expiry cannot be
      // before DOB
      if (
        expiryDate <=
        parseDate(
          passenger.born_on
        )
      ) {
        setError(
          `Passport expiry date for Passenger ${passengerNumber} must be after the Date of Birth.`
        );
        return;
      }
    }

    // -----------------------------------------
    // CONTACT VALIDATION
    // -----------------------------------------

    if (!contact.email) {
      setError(
        'Please enter the contact email address.'
      );
      return;
    }

    if (!contact.phone_number) {
      setError(
        'Please enter the contact phone number.'
      );
      return;
    }

    // -----------------------------------------
    // SAVE DATA
    // -----------------------------------------

    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(
        passengers
      )
    );

    sessionStorage.setItem(
      'tripScannerContact',
      JSON.stringify(
        contact
      )
    );

    sessionStorage.setItem(
      'tripScannerOfferId',
      sp.get('offerId') || ''
    );

    // -----------------------------------------
    // PAYMENT
    // -----------------------------------------

    router.push(
      `/payment?offerId=${encodeURIComponent(
        sp.get('offerId') || ''
      )}`
    );
  }

  // -------------------------------------------
  // FLIGHT SEGMENTS
  // -------------------------------------------

  const segments =
    offer?.slices?.flatMap(
      (slice) =>
        slice.segments || []
    ) || [];

  // -------------------------------------------
  // DEPARTURE DATE
  // -------------------------------------------

  const departureDate =
    sp.get('departureDate') ||
    offer?.slices?.[0]
      ?.segments?.[0]
      ?.departing_at
      ?.slice(0, 10);

  // Passport minimum expiry date
  const passportMinDate =
    departureDate
      ? formatDateInput(
          addMonths(
            parseDate(
              departureDate
            ),
            6
          )
        )
      : '';

  // -------------------------------------------
  // PAGE
  // -------------------------------------------

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
              Enter passenger details exactly
              as shown on the passport or
              travel document.
            </p>

            {error && (
              <div className="error">
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
              ) => {

                const dobRange =
                  getDobRange(
                    passenger,
                    departureDate
                  );

                return (
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
                        {passengerLabel(
                          passenger
                        )}
                        )
                      </span>

                    </h2>

                    <div
                      className="form-grid"
                    >

                      {/* FIRST NAME */}

                      <label>
                        First name *

                        <input
                          type="text"
                          value={
                            passenger.given_name
                          }
                          onChange={(
                            e
                          ) =>
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
                          onChange={(
                            e
                          ) =>
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
                          min={
                            dobRange.min ||
                            undefined
                          }
                          max={
                            dobRange.max ||
                            undefined
                          }
                          onChange={(
                            e
                          ) =>
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
                              '6px',
                            color:
                              '#64748b',
                          }}
                        >
                          {passenger.type ===
                            'adult' &&
                            'Adult must be 18+ on the departure date.'}

                          {passenger.type ===
                            'child' &&
                            `Child must be exactly age ${passenger.age} on the departure date.`}

                          {passenger.type ===
                            'infant' &&
                            `Infant must be exactly age ${passenger.age} on the departure date.`}
                        </small>
                      </label>

                      {/* GENDER */}

                      <label>
                        Gender

                        <select
                          value={
                            passenger.gender
                          }
                          onChange={(
                            e
                          ) =>
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
                          onChange={(
                            e
                          ) =>
                            updatePassenger(
                              index,
                              'nationality',
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                      </label>

                      {/* PASSPORT */}

                      <label>
                        Passport number

                        <input
                          type="text"
                          value={
                            passenger.passport_number
                          }
                          onChange={(
                            e
                          ) =>
                            updatePassenger(
                              index,
                              'passport_number',
                              e.target.value
                            )
                          }
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
                            passportMinDate ||
                            undefined
                          }
                          onChange={(
                            e
                          ) =>
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
                              '6px',
                            color:
                              '#64748b',
                          }}
                        >
                          Must be valid for at least 6 months after departure.
                        </small>
                      </label>

                    </div>

                  </div>
                );
              }
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
                flight updates to these details.
              </p>

              <div
                className="form-grid"
              >

                <label>
                  Email address *

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={
                      contact.email
                    }
                    onChange={(
                      e
                    ) =>
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
                    value={
                      contact.phone_number
                    }
                    onChange={(
                      e
                    ) =>
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

            {/* CONTINUE */}

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

// ---------------------------------------------
// EXPORT
// ---------------------------------------------

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
