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

function parseDate(value) {
  if (!value) return null;

  const parts = value.split('-').map(Number);

  if (parts.length !== 3) return null;

  const [year, month, day] = parts;

  if (!year || !month || !day) return null;

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateInput(date) {
  if (!date) return '';

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addYears(date, years) {
  const result = new Date(date);

  result.setFullYear(
    result.getFullYear() + years
  );

  return result;
}

function addMonths(date, months) {
  const result = new Date(date);

  result.setMonth(
    result.getMonth() + months
  );

  return result;
}

function addDays(date, days) {
  const result = new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}

function calculateAgeOnDate(
  dob,
  travelDate
) {
  const birth = parseDate(dob);
  const travel = parseDate(travelDate);

  if (!birth || !travel) {
    return null;
  }

  let age =
    travel.getFullYear() -
    birth.getFullYear();

  const month =
    travel.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      travel.getDate() < birth.getDate()
    )
  ) {
    age--;
  }

  return age;
}

function getDobLimits(
  passenger,
  departureDate
) {
  const departure =
    parseDate(departureDate);

  if (!departure) {
    return {
      min: '',
      max: '',
    };
  }

  // ADULT = 18+
  if (passenger.type === 'adult') {
    const max = addYears(
      departure,
      -18
    );

    const min = addYears(
      departure,
      -100
    );

    return {
      min: formatDateInput(min),
      max: formatDateInput(max),
    };
  }

  // CHILD / INFANT
  const age = Number(
    passenger.age
  );

  const max = addYears(
    departure,
    -age
  );

  const min = addDays(
    addYears(
      departure,
      -(age + 1)
    ),
    1
  );

  return {
    min: formatDateInput(min),
    max: formatDateInput(max),
  };
}

function getPassportExpiryMin(
  departureDate
) {
  const departure =
    parseDate(departureDate);

  if (!departure) return '';

  return formatDateInput(
    addMonths(departure, 6)
  );
}

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

  useEffect(() => {
    const offerId =
      sp.get('offerId');

    const adults = Math.max(
      1,
      Number(
        sp.get('adults') || 1
      )
    );

    const childAges =
      sp.getAll('childAge');

    const infantAges =
      sp.getAll('infantAge');

    const passengerList = [];

    // =========================
    // ADULTS
    // =========================

    for (
      let i = 0;
      i < adults;
      i++
    ) {
      passengerList.push({
        type: 'adult',
        age: null,

        title: 'mr',

        given_name: '',
        family_name: '',
        born_on: '',

        gender: 'm',
        nationality: 'GB',

        passport_number: '',
        passport_expiry_date: '',
      });
    }

    // =========================
    // CHILDREN
    // =========================

    childAges.forEach((age) => {
      if (age === '') return;

      passengerList.push({
        type: 'child',
        age: Number(age),

        title: 'mr',

        given_name: '',
        family_name: '',
        born_on: '',

        gender: 'm',
        nationality: 'GB',

        passport_number: '',
        passport_expiry_date: '',
      });
    });

    // =========================
    // INFANTS
    // =========================

    infantAges.forEach((age) => {
      if (age === '') return;

      passengerList.push({
        type: 'infant',
        age: Number(age),

        title: 'mr',

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

    // =========================
    // LOAD FLIGHT OFFER
    // =========================

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

  // =========================
  // PHONE NUMBER FORMAT
  // =========================

  function formatPhoneNumber(value) {
    let phone =
      value.replace(
        /[^\d+]/g,
        ''
      );

    // 00XXXXXXXX → +XXXXXXXX
    if (
      phone.startsWith('00')
    ) {
      phone =
        '+' +
        phone.slice(2);
    }

    // UK mobile/local number
    // 07XXXXXXXXX → +447XXXXXXXXX
    if (
      phone.startsWith('07')
    ) {
      phone =
        '+44' +
        phone.slice(1);
    }

    return phone;
  }

  function updateContact(
    field,
    value
  ) {
    if (
      field ===
      'phone_number'
    ) {
      value =
        formatPhoneNumber(
          value
        );
    }

    setContact((current) => ({
      ...current,
      [field]: value,
    }));
  }

  // =========================
  // PASSENGER VALIDATION
  // =========================

  function validatePassenger(
    passenger,
    index
  ) {
    const passengerNumber =
      index + 1;

    if (!passenger.title) {
      return `Please select a title for Passenger ${passengerNumber}.`;
    }

    if (
      !passenger.given_name ||
      !passenger.family_name
    ) {
      return `Please complete Passenger ${passengerNumber} name.`;
    }

    if (!passenger.born_on) {
      return `Please enter the date of birth for Passenger ${passengerNumber}.`;
    }

    const departureDate =
      sp.get(
        'departureDate'
      );

    const age =
      calculateAgeOnDate(
        passenger.born_on,
        departureDate
      );

    if (age === null) {
      return `Invalid date of birth for Passenger ${passengerNumber}.`;
    }

    // =========================
    // ADULT
    // =========================

    if (
      passenger.type ===
        'adult' &&
      age < 18
    ) {
      return `Passenger ${passengerNumber} must be at least 18 years old on the departure date.`;
    }

    // =========================
    // CHILD
    // =========================

    if (
      passenger.type ===
      'child'
    ) {
      if (
        age !==
        Number(
          passenger.age
        )
      ) {
        return `Passenger ${passengerNumber} must be exactly ${passenger.age} years old on the departure date.`;
      }
    }

    // =========================
    // INFANT
    // =========================

    if (
      passenger.type ===
      'infant'
    ) {
      if (
        age !==
        Number(
          passenger.age
        )
      ) {
        return `Passenger ${passengerNumber} must be exactly ${passenger.age} years old on the departure date.`;
      }

      if (
        Number(
          passenger.age
        ) > 1
      ) {
        return `Passenger ${passengerNumber} is marked as an infant but the selected age is over 1 year.`;
      }
    }

    // =========================
    // PASSPORT
    // =========================

    if (
      passenger.passport_number &&
      !passenger.passport_expiry_date
    ) {
      return `Please enter the passport expiry date for Passenger ${passengerNumber}.`;
    }

    if (
      passenger.passport_expiry_date
    ) {
      const expiry =
        parseDate(
          passenger.passport_expiry_date
        );

      const dob =
        parseDate(
          passenger.born_on
        );

      const departure =
        parseDate(
          departureDate
        );

      if (!expiry) {
        return `Invalid passport expiry date for Passenger ${passengerNumber}.`;
      }

      if (
        dob &&
        expiry <= dob
      ) {
        return `Passport expiry date must be after the date of birth for Passenger ${passengerNumber}.`;
      }

      if (departure) {
        const minimumExpiry =
          addMonths(
            departure,
            6
          );

        if (
          expiry <
          minimumExpiry
        ) {
          return `Passport for Passenger ${passengerNumber} must be valid for at least 6 months after the departure date.`;
        }
      }
    }

    return '';
  }

  // =========================
  // SUBMIT
  // =========================

  function submit(event) {
    event.preventDefault();

    setError('');

    const departureDate =
      sp.get(
        'departureDate'
      );

    if (!departureDate) {
      setError(
        'Departure date is missing.'
      );
      return;
    }

    // =========================
    // PASSENGERS
    // =========================

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const validationError =
        validatePassenger(
          passengers[i],
          i
        );

      if (validationError) {
        setError(
          validationError
        );
        return;
      }
    }

    // =========================
    // EMAIL
    // =========================

    if (
      !contact.email.trim()
    ) {
      setError(
        'Please enter the contact email address.'
      );
      return;
    }

    // =========================
    // PHONE
    // =========================

    const phone =
      contact.phone_number.trim();

    const phoneValid =
      /^\+[1-9]\d{7,14}$/.test(
        phone
      );

    if (!phoneValid) {
      setError(
        'Please enter a valid phone number in international format, e.g. +447123456789.'
      );
      return;
    }

    // =========================
    // SAVE PASSENGERS
    // =========================

    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(
        passengers
      )
    );

    // =========================
    // SAVE CONTACT
    // =========================

    sessionStorage.setItem(
      'tripScannerContact',
      JSON.stringify(
        contact
      )
    );

    // =========================
    // SAVE OFFER ID
    // =========================

    sessionStorage.setItem(
      'tripScannerOfferId',
      sp.get('offerId') || ''
    );

    // =========================
    // PAYMENT
    // =========================

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

  const departureDate =
    sp.get(
      'departureDate'
    );

  return (
    <main className="checkout-shell">

      <header className="site-header">

        <div className="brand">
          ✈ Trip Scanner <b>Hub</b>
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
              Enter passenger details
              exactly as shown on the
              passport or travel document.
            </p>

            {error && (
              <div className="error">
                ⚠ {error}
              </div>
            )}

            {/* =========================
                PASSENGERS
            ========================== */}

            {passengers.map(
              (
                passenger,
                index
              ) => {

                const dobLimits =
                  getDobLimits(
                    passenger,
                    departureDate
                  );

                const passportMin =
                  getPassportExpiryMin(
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
                        {passenger.type ===
                        'child'
                          ? `Child · age ${passenger.age}`
                          : passenger.type ===
                            'infant'
                          ? `Infant · age ${passenger.age}`
                          : 'Adult'}
                        )

                      </span>

                    </h2>

                    <div className="form-grid">

                      {/* TITLE */}

                      <label>

                        Title *

                        <select
                          value={
                            passenger.title
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'title',
                              e.target.value
                            )
                          }
                          required
                        >

                          <option value="">
                            Select title
                          </option>

                          <option value="mr">
                            Mr
                          </option>

                          <option value="mrs">
                            Mrs
                          </option>

                          <option value="ms">
                            Ms
                          </option>

                          <option value="miss">
                            Miss
                          </option>

                        </select>

                      </label>

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
                          min={
                            dobLimits.min
                          }
                          max={
                            dobLimits.max
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
                              '6px',
                            color:
                              '#64748b',
                          }}
                        >

                          {passenger.type ===
                          'adult'
                            ? 'Adult must be 18+ on departure.'
                            : passenger.type ===
                              'child'
                            ? `Child must be age ${passenger.age} on departure.`
                            : `Infant must be age ${passenger.age} on departure.`}

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
                          maxLength={2}
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

                      {/* PASSPORT NUMBER */}

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
                              e.target.value.toUpperCase()
                            )
                          }
                        />

                      </label>

                      {/* PASSPORT EXPIRY */}

                      <label>

                        Passport expiry

                        <input
                          type="date"
                          value={
                            passenger.passport_expiry_date
                          }
                          min={
                            passportMin
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'passport_expiry_date',
                              e.target.value
                            )
                          }
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
                          Minimum 6 months
                          after departure
                          date.
                        </small>

                      </label>

                    </div>

                  </div>
                );
              }
            )}

            {/* =========================
                CONTACT INFORMATION
            ========================== */}

            <div
              className="contact-section"
              style={{
                marginTop: '32px',
                padding: '24px',
                borderRadius: '16px',
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
                    inputMode="tel"
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
                    Example:
                    +447123456789
                  </small>

                </label>

              </div>

            </div>

            {/* CONTINUE */}

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
                    segment.origin
                      ?.iata_code
                  }

                  {' → '}

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
