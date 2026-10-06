'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

/* =============================================
   MONEY
============================================= */

function money(
  amount,
  currency
) {
  try {
    return new Intl.NumberFormat(
      'en-GB',
      {
        style: 'currency',
        currency:
          currency || 'GBP',
      }
    ).format(
      Number(amount)
    );
  } catch {
    return `${
      currency || 'GBP'
    } ${amount}`;
  }
}

/* =============================================
   TIME
============================================= */

function time(value) {
  if (!value) return '—';

  return new Date(
    value
  ).toLocaleTimeString(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

/* =============================================
   DATE HELPERS
============================================= */

function parseDate(value) {
  if (!value) return null;

  const date = new Date(
    `${value}T00:00:00`
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function formatDateInput(
  date
) {
  if (!date) return '';

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addMonths(
  date,
  months
) {
  const result =
    new Date(date);

  result.setMonth(
    result.getMonth() +
      months
  );

  return result;
}

function subtractYears(
  date,
  years
) {
  const result =
    new Date(date);

  result.setFullYear(
    result.getFullYear() -
      years
  );

  return result;
}

/* =============================================
   AGE
============================================= */

function calculateAgeOnDate(
  dobString,
  travelDateString
) {
  const dob =
    parseDate(dobString);

  const travelDate =
    parseDate(
      travelDateString
    );

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

/* =============================================
   INFANT AGE
============================================= */

function infantAgeText(age) {
  return Number(age) === 0
    ? 'Under 1 year'
    : '1 year';
}

/* =============================================
   LABEL
============================================= */

function passengerLabel(
  passenger
) {
  if (
    passenger.type ===
    'adult'
  ) {
    return 'Adult · 18+';
  }

  if (
    passenger.type ===
    'child'
  ) {
    return `Child · age ${passenger.age}`;
  }

  if (
    passenger.type ===
    'infant'
  ) {
    return `Infant · ${infantAgeText(
      passenger.age
    )}`;
  }

  return passenger.type;
}

/* =============================================
   DOB RANGE
============================================= */

function getDobRange(
  passenger,
  departureDate
) {
  const travelDate =
    parseDate(
      departureDate
    );

  if (!travelDate) {
    return {
      min: '',
      max: '',
    };
  }

  /* ADULT */

  if (
    passenger.type ===
    'adult'
  ) {
    return {
      min:
        formatDateInput(
          subtractYears(
            travelDate,
            100
          )
        ),

      max:
        formatDateInput(
          subtractYears(
            travelDate,
            18
          )
        ),
    };
  }

  /* CHILD */

  if (
    passenger.type ===
    'child'
  ) {
    const age =
      Number(
        passenger.age
      );

    const max =
      subtractYears(
        travelDate,
        age
      );

    const min =
      subtractYears(
        travelDate,
        age + 1
      );

    min.setDate(
      min.getDate() + 1
    );

    return {
      min:
        formatDateInput(
          min
        ),

      max:
        formatDateInput(
          max
        ),
    };
  }

  /* INFANT */

  if (
    passenger.type ===
    'infant'
  ) {
    const age =
      Number(
        passenger.age
      );

    const max =
      subtractYears(
        travelDate,
        age
      );

    const min =
      subtractYears(
        travelDate,
        age + 1
      );

    min.setDate(
      min.getDate() + 1
    );

    return {
      min:
        formatDateInput(
          min
        ),

      max:
        formatDateInput(
          max
        ),
    };
  }

  return {
    min: '',
    max: '',
  };
}

/* =============================================
   FIELD STATUS
============================================= */

function fieldStyle(
  valid,
  invalid
) {
  if (valid) {
    return {
      border:
        '2px solid #16a34a',
      background:
        '#f0fdf4',
      outline:
        'none',
    };
  }

  if (invalid) {
    return {
      border:
        '2px solid #dc2626',
      background:
        '#fef2f2',
      outline:
        'none',
    };
  }

  return {};
}

/* =============================================
   CHECKOUT CONTENT
============================================= */

function CheckoutContent() {
  const router =
    useRouter();

  const sp =
    useSearchParams();

  const [
    offer,
    setOffer,
  ] = useState(null);

  const [
    passengers,
    setPassengers,
  ] = useState([]);

  const [
    contact,
    setContact,
  ] = useState({
    email: '',
    phone_number: '',
  });

  const [error, setError] =
    useState('');

  /* ===========================================
     URL PASSENGERS
  =========================================== */

  const adults =
    Math.max(
      1,
      Number(
        sp.get(
          'adults'
        ) || 1
      )
    );

  const childAges =
    sp
      .getAll('childAge')
      .filter(
        (age) =>
          age !== ''
      );

  const infantAges =
    sp
      .getAll('infantAge')
      .filter(
        (age) =>
          age !== ''
      );

  /* ===========================================
     CREATE PASSENGERS
  =========================================== */

  useEffect(() => {
    const offerId =
      sp.get(
        'offerId'
      );

    const passengerList =
      [];

    /* ADULT */

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
        passport_expiry_date:
          '',
      });
    }

    /* CHILD */

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
          passport_expiry_date:
            '',
        });
      }
    );

    /* INFANT */

    infantAges.forEach(
      (age) => {
        passengerList.push({
          type: 'infant',
          age:
            Number(age) === 1
              ? 1
              : 0,

          given_name: '',
          family_name: '',
          born_on: '',
          gender: 'm',
          nationality: 'GB',
          passport_number: '',
          passport_expiry_date:
            '',
        });
      }
    );

    setPassengers(
      passengerList
    );

    /* LOAD OFFER */

    if (offerId) {
      fetch(
        `/api/orders?offerId=${encodeURIComponent(
          offerId
        )}`
      )
        .then(
          (response) =>
            response.json()
        )
        .then((data) => {
          if (
            data.offer
          ) {
            setOffer(
              data.offer
            );
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
  }, [
    sp,
    adults,
    childAges.join(','),
    infantAges.join(','),
  ]);

  /* ===========================================
     DEPARTURE
  =========================================== */

  const departureDate =
    sp.get(
      'departureDate'
    ) ||
    offer?.slices?.[0]
      ?.segments?.[0]
      ?.departing_at
      ?.slice(0, 10);

  /* ===========================================
     PASSPORT MINIMUM
  =========================================== */

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

  /* ===========================================
     UPDATE
  =========================================== */

  function updatePassenger(
    index,
    field,
    value
  ) {
    setPassengers(
      (current) =>
        current.map(
          (
            passenger,
            i
          ) =>
            i === index
              ? {
                  ...passenger,
                  [field]:
                    value,
                }
              : passenger
        )
    );

    setError('');
  }

  function updateContact(
    field,
    value
  ) {
    setContact(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );

    setError('');
  }

  /* ===========================================
     VALIDATE PASSENGER
  =========================================== */

  function validatePassenger(
    passenger
  ) {
    if (
      !passenger.born_on
    ) {
      return {
        valid: false,
        message:
          'Date of Birth is required.',
      };
    }

    const dob =
      parseDate(
        passenger.born_on
      );

    const travel =
      parseDate(
        departureDate
      );

    if (!dob || !travel) {
      return {
        valid: false,
        message:
          'Please enter a valid Date of Birth.',
      };
    }

    const age =
      calculateAgeOnDate(
        passenger.born_on,
        departureDate
      );

    if (
      passenger.type ===
      'adult'
    ) {
      if (age < 18) {
        return {
          valid: false,
          message:
            'Adult must be 18 years or older on the departure date.',
        };
      }
    }

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
        return {
          valid: false,
          message:
            `This passenger is selected as Child age ${passenger.age}. Please enter the correct Date of Birth.`,
        };
      }
    }

    if (
      passenger.type ===
      'infant'
    ) {
      if (
        age < 0 ||
        age >= 2
      ) {
        return {
          valid: false,
          message:
            'Infant must be under 2 years old on the departure date.',
        };
      }

      if (
        age !==
        Number(
          passenger.age
        )
      ) {
        return {
          valid: false,
          message:
            `This passenger is selected as Infant ${infantAgeText(
              passenger.age
            )}. Please enter the correct Date of Birth.`,
        };
      }
    }

    if (
      !passenger.passport_expiry_date
    ) {
      return {
        valid: false,
        message:
          'Passport expiry date is required.',
      };
    }

    const expiry =
      parseDate(
        passenger.passport_expiry_date
      );

    if (!expiry) {
      return {
        valid: false,
        message:
          'Please enter a valid passport expiry date.',
      };
    }

    const minimumExpiry =
      addMonths(
        travel,
        6
      );

    if (
      expiry <
      minimumExpiry
    ) {
      return {
        valid: false,
        message:
          'Passport must be valid for at least 6 months after the departure date.',
      };
    }

    if (
      expiry <= dob
    ) {
      return {
        valid: false,
        message:
          'Passport expiry date must be after the Date of Birth.',
      };
    }

    return {
      valid: true,
      message: '',
    };
  }

  /* ===========================================
     PASSENGER STATUS
  =========================================== */

  function getPassengerStatus(
    passenger
  ) {
    const result =
      validatePassenger(
        passenger
      );

    if (
      !passenger.born_on &&
      !passenger.passport_expiry_date
    ) {
      return {
        dobValid: false,
        expiryValid: false,
        dobError: false,
        expiryError: false,
      };
    }

    const dob =
      parseDate(
        passenger.born_on
      );

    const travel =
      parseDate(
        departureDate
      );

    let dobValid =
      false;

    if (
      dob &&
      travel
    ) {
      const age =
        calculateAgeOnDate(
          passenger.born_on,
          departureDate
        );

      if (
        passenger.type ===
        'adult'
      ) {
        dobValid =
          age >= 18;
      }

      if (
        passenger.type ===
        'child'
      ) {
        dobValid =
          age ===
          Number(
            passenger.age
          );
      }

      if (
        passenger.type ===
        'infant'
      ) {
        dobValid =
          age >= 0 &&
          age < 2 &&
          age ===
            Number(
              passenger.age
            );
      }
    }

    const expiry =
      parseDate(
        passenger.passport_expiry_date
      );

    let expiryValid =
      false;

    if (
      expiry &&
      travel &&
      dob
    ) {
      const minimum =
        addMonths(
          travel,
          6
        );

      expiryValid =
        expiry >=
          minimum &&
        expiry > dob;
    }

    return {
      dobValid,

      expiryValid,

      dobError:
        Boolean(
          passenger.born_on
        ) &&
        !dobValid,

      expiryError:
        Boolean(
          passenger.passport_expiry_date
        ) &&
        !expiryValid,

      overall:
        result.valid,
    };
  }

  /* ===========================================
     ALL VALID?
  =========================================== */

  const allPassengersValid =
    useMemo(() => {
      if (
        passengers.length ===
        0
      ) {
        return false;
      }

      return passengers.every(
        (passenger) => {
          const result =
            validatePassenger(
              passenger
            );

          return result.valid;
        }
      );
    }, [
      passengers,
      departureDate,
    ]);

  const contactValid =
    Boolean(
      contact.email &&
        contact.email.includes(
          '@'
        ) &&
        contact.phone_number
    );

  const canContinue =
    allPassengersValid &&
    contactValid;

  /* ===========================================
     SUBMIT
  =========================================== */

  function submit(event) {
    event.preventDefault();

    setError('');

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const result =
        validatePassenger(
          passengers[i]
        );

      if (!result.valid) {
        setError(
          `Passenger ${i + 1}: ${result.message}`
        );
        return;
      }

      if (
        !passengers[i]
          .given_name ||
        !passengers[i]
          .family_name
      ) {
        setError(
          `Please complete Passenger ${
            i + 1
          } name.`
        );
        return;
      }
    }

    if (
      !contactValid
    ) {
      setError(
        'Please enter a valid contact email and phone number.'
      );
      return;
    }

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
      sp.get(
        'offerId'
      ) || ''
    );

    router.push(
      `/payment?offerId=${encodeURIComponent(
        sp.get(
          'offerId'
        ) || ''
      )}`
    );
  }

  /* ===========================================
     SEGMENTS
  =========================================== */

  const segments =
    offer?.slices?.flatMap(
      (slice) =>
        slice.segments || []
    ) || [];

  /* ===========================================
     PAGE
  =========================================== */

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
            onSubmit={
              submit
            }
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

                const status =
                  getPassengerStatus(
                    passenger
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
                            '600',

                          color:
                            passenger.type ===
                            'infant'
                              ? '#2563eb'
                              : '#64748b',
                        }}
                      >

                        (
                        {passengerLabel(
                          passenger
                        )}
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
                          style={fieldStyle(
                            status.dobValid,
                            status.dobError
                          )}
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

                        {status.dobError && (
                          <small
                            style={{
                              display:
                                'block',

                              marginTop:
                                '6px',

                              color:
                                '#dc2626',

                              fontWeight:
                                '600',
                            }}
                          >

                            {passenger.type ===
                              'adult' &&
                              '❌ Adult must be 18+ on the departure date.'}

                            {passenger.type ===
                              'child' &&
                              `❌ Child must be exactly age ${passenger.age} on the departure date.`}

                            {passenger.type ===
                              'infant' &&
                              `❌ Infant must be ${infantAgeText(
                                passenger.age
                              )} and under 2 years on the departure date.`}

                          </small>
                        )}

                        {status.dobValid && (
                          <small
                            style={{
                              display:
                                'block',

                              marginTop:
                                '6px',

                              color:
                                '#16a34a',

                              fontWeight:
                                '600',
                            }}
                          >
                            ✓ Date of Birth is valid
                          </small>
                        )}

                        {!status.dobValid &&
                          !status.dobError && (
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
                                `Infant must be under 2 years on the departure date.`}

                            </small>
                          )}

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
                          style={fieldStyle(
                            status.expiryValid,
                            status.expiryError
                          )}
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

                        {status.expiryError && (
                          <small
                            style={{
                              display:
                                'block',

                              marginTop:
                                '6px',

                              color:
                                '#dc2626',

                              fontWeight:
                                '600',
                            }}
                          >
                            ❌ Passport must be valid for at least 6 months after departure.
                          </small>
                        )}

                        {status.expiryValid && (
                          <small
                            style={{
                              display:
                                'block',

                              marginTop:
                                '6px',

                              color:
                                '#16a34a',

                              fontWeight:
                                '600',
                            }}
                          >
                            ✓ Passport expiry date is valid
                          </small>
                        )}

                        {!status.expiryValid &&
                          !status.expiryError && (
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
                              Passport must be valid for at least 6 months after departure.
                            </small>
                          )}

                      </label>

                    </div>

                  </div>
                );
              }
            )}

            {/* CONTACT */}

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

              <div className="form-grid">

                <label>

                  Email address *

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={
                      contact.email
                    }
                    style={{
                      ...(contact.email
                        ? contact.email.includes(
                            '@'
                          )
                          ? {
                              border:
                                '2px solid #16a34a',
                              background:
                                '#f0fdf4',
                            }
                          : {
                              border:
                                '2px solid #dc2626',
                              background:
                                '#fef2f2',
                            }
                        : {}),
                    }}
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
              disabled={
                !canContinue
              }
              style={{
                marginTop:
                  '24px',

                opacity:
                  canContinue
                    ? 1
                    : 0.5,

                cursor:
                  canContinue
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              {canContinue
                ? 'Continue to payment →'
                : 'Complete passenger details →'}
            </button>

          </form>

        </section>

        {/* SUMMARY */}

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

/* =============================================
   EXPORT
============================================= */

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