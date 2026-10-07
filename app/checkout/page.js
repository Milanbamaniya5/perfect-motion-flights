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

/* =============================================
   TIME
============================================= */

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

/* =============================================
   DATE HELPERS
============================================= */

function parseDate(value) {
  if (!value) return null;

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
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

/* =============================================
   AGE CALCULATION
============================================= */

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

/* =============================================
   INFANT AGE TEXT
============================================= */

function infantAgeText(age) {
  return Number(age) === 0
    ? 'under 1 year'
    : '1 year';
}

/* =============================================
   PASSENGER LABEL
============================================= */

function passengerLabel(passenger) {
  if (passenger.type === 'adult') {
    return 'Adult · 18+';
  }

  if (passenger.type === 'child') {
    return `Child · age ${passenger.age}`;
  }

  if (passenger.type === 'infant') {
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
    parseDate(departureDate);

  if (!travelDate) {
    return {
      min: '',
      max: '',
    };
  }

  /* ADULT — 18+ */

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

  /* CHILD — EXACT SELECTED AGE */

  if (passenger.type === 'child') {
    const selectedAge =
      Number(passenger.age);

    const latestDob =
      subtractYears(
        travelDate,
        selectedAge
      );

    const earliestDob =
      subtractYears(
        travelDate,
        selectedAge + 1
      );

    earliestDob.setDate(
      earliestDob.getDate() + 1
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

  /* INFANT — UNDER 2 */

  if (passenger.type === 'infant') {
    const selectedAge =
      Number(passenger.age);

    const latestDob =
      subtractYears(
        travelDate,
        selectedAge
      );

    const earliestDob =
      subtractYears(
        travelDate,
        selectedAge + 1
      );

    earliestDob.setDate(
      earliestDob.getDate() + 1
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

  return {
    min: '',
    max: '',
  };
}

/* =============================================
   PHONE RULES
============================================= */

function getPhoneRules(country) {
  const rules = {
    GB: {
      code: '+44',
      digits: 10,
      label:
        'UK number must contain 10 digits after +44 and start with 7.',
      pattern: /^7\d{9}$/,
    },

    IN: {
      code: '+91',
      digits: 10,
      label:
        'India mobile number must contain 10 digits and start with 6–9.',
      pattern: /^[6-9]\d{9}$/,
    },

    PT: {
      code: '+351',
      digits: 9,
      label:
        'Portugal number must contain 9 digits.',
      pattern: /^[29]\d{8}$/,
    },

    US: {
      code: '+1',
      digits: 10,
      label:
        'US number must contain 10 digits.',
      pattern: /^[2-9]\d{9}$/,
    },
  };

  return (
    rules[country] ||
    rules.GB
  );
}

/* =============================================
   PHONE CLEAN
============================================= */

function cleanPhone(value) {
  return String(value || '')
    .replace(/\D/g, '');
}

/* =============================================
   PHONE VALIDATION
============================================= */

function validatePhone(
  country,
  value
) {
  const rules =
    getPhoneRules(country);

  const digits =
    cleanPhone(value);

  return (
    digits.length ===
      rules.digits &&
    rules.pattern.test(digits)
  );
}

/* =============================================
   EMAIL VALIDATION
============================================= */

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || '').trim()
  );
}

/* =============================================
   FIELD STYLE
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
      outline: 'none',
    };
  }

  if (invalid) {
    return {
      border:
        '2px solid #dc2626',
      background:
        '#fef2f2',
      outline: 'none',
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

  const [offer, setOffer] =
    useState(null);

  const [passengers, setPassengers] =
    useState([]);

  const [contact, setContact] =
    useState({
      email: '',
      phone_country: 'GB',
      phone_number: '',
    });

  const [error, setError] =
    useState('');

  /* ===========================================
     PASSENGER COUNTS
  =========================================== */

  const adults =
    Math.max(
      1,
      Number(
        sp.get('adults') || 1
      )
    );

  const childAges =
    sp
      .getAll('childAge')
      .filter(
        (age) => age !== ''
      );

  const infantAges =
    sp
      .getAll('infantAge')
      .filter(
        (age) => age !== ''
      );

  /* ===========================================
     CREATE PASSENGERS
  =========================================== */

  useEffect(() => {
    const offerId =
      sp.get('offerId');

    const passengerList = [];

    /* ADULTS */

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

    /* CHILDREN */

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

    /* INFANTS */

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
          if (data.offer) {
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
     DEPARTURE DATE
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
     UPDATE PASSENGER
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

  /* ===========================================
     UPDATE CONTACT
  =========================================== */

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
      !passenger.given_name ||
      !passenger.family_name
    ) {
      return {
        valid: false,
        message:
          'First name and last name are required.',
      };
    }

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

    /* ADULT */

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

    /* CHILD */

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

    /* INFANT */

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

    /* PASSPORT EXPIRY */

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
     PASSENGER FIELD STATUS
  =========================================== */

  function getPassengerStatus(
    passenger
  ) {
    const dob =
      parseDate(
        passenger.born_on
      );

    const travel =
      parseDate(
        departureDate
      );

    let dobValid = false;

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
    };
  }

  /* ===========================================
     ALL PASSENGERS VALID
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
        (passenger) =>
          validatePassenger(
            passenger
          ).valid
      );
    }, [
      passengers,
      departureDate,
    ]);

  /* ===========================================
     CONTACT VALIDATION
  =========================================== */

  const emailValid =
    validateEmail(
      contact.email
    );

  const phoneValid =
    validatePhone(
      contact.phone_country,
      contact.phone_number
    );

  const contactValid =
    emailValid &&
    phoneValid;

  /* ===========================================
     CONTINUE BUTTON
  =========================================== */

  const canContinue =
    allPassengersValid &&
    contactValid;

  /* ===========================================
     SUBMIT
  =========================================== */

  function submit(event) {
    event.preventDefault();

    setError('');

    /* PASSENGERS */

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const passenger =
        passengers[i];

      const result =
        validatePassenger(
          passenger
        );

      if (!result.valid) {
        setError(
          `Passenger ${i + 1}: ${result.message}`
        );
        return;
      }
    }

    /* EMAIL */

    if (!emailValid) {
      setError(
        'Please enter a valid email address.'
      );
      return;
    }

    /* PHONE */

    if (!phoneValid) {
      setError(
        getPhoneRules(
          contact.phone_country
        ).label
      );
      return;
    }

    /* FORMAT CONTACT */

    const phoneRules =
      getPhoneRules(
        contact.phone_country
      );

    const formattedContact = {
      email:
        contact.email.trim(),

      phone_number:
        `${phoneRules.code}${cleanPhone(
          contact.phone_number
        )}`,

      phone_country:
        contact.phone_country,
    };

    /* SAVE PASSENGERS */

    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(
        passengers
      )
    );

    /* SAVE CONTACT */

    sessionStorage.setItem(
      'tripScannerContact',
      JSON.stringify(
        formattedContact
      )
    );

    /* SAVE OFFER */

    sessionStorage.setItem(
      'tripScannerOfferId',
      sp.get(
        'offerId'
      ) || ''
    );

    /* PAYMENT */

    router.push(
      `/payment?offerId=${encodeURIComponent(
        sp.get(
          'offerId'
        ) || ''
      )}`
    );
  }

  /* ===========================================
     FLIGHT SEGMENTS
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
                          onChange={(e) =>
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
                                `Infant must be ${infantAgeText(
                                  passenger.age
                                )} and under 2 years on the departure date.`}

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
                          onChange={(e) =>
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
                          onChange={(e) =>
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
                          onChange={(e) =>
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
                              Must be valid for at least 6 months after departure.
                            </small>
                          )}

                      </label>

                    </div>

                  </div>
                );
              }
            )}

            {/* =================================
                CONTACT INFORMATION
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
                    style={{
                      border:
                        contact.email
                          ? emailValid
                            ? '2px solid #16a34a'
                            : '2px solid #dc2626'
                          : undefined,

                      background:
                        contact.email
                          ? emailValid
                            ? '#f0fdf4'
                            : '#fef2f2'
                          : undefined,
                    }}
                    required
                  />

                  {contact.email &&
                    !emailValid && (
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
                        ❌ Please enter a valid email address.
                      </small>
                    )}

                  {emailValid && (
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
                      ✓ Email address is valid
                    </small>
                  )}

                </label>

                {/* PHONE */}

                <label>

                  Phone number *

                  <div
                    style={{
                      display:
                        'flex',

                      gap:
                        '8px',
                    }}
                  >

                    <select
                      value={
                        contact.phone_country
                      }
                      onChange={(e) => {
                        updateContact(
                          'phone_country',
                          e.target.value
                        );

                        updateContact(
                          'phone_number',
                          ''
                        );
                      }}
                      style={{
                        width:
                          '105px',

                        flexShrink:
                          0,
                      }}
                    >

                      <option value="GB">
                        🇬🇧 +44
                      </option>

                      <option value="IN">
                        🇮🇳 +91
                      </option>

                      <option value="PT">
                        🇵🇹 +351
                      </option>

                      <option value="US">
                        🇺🇸 +1
                      </option>

                    </select>

                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      value={
                        contact.phone_number
                      }
                      placeholder={
                        contact.phone_country ===
                        'GB'
                          ? '7XXXXXXXXX'
                          : contact.phone_country ===
                            'IN'
                          ? '9XXXXXXXXX'
                          : contact.phone_country ===
                            'PT'
                          ? '9XXXXXXXX'
                          : 'XXXXXXXXXX'
                      }
                      onChange={(e) => {
                        const digits =
                          cleanPhone(
                            e.target.value
                          );

                        const rules =
                          getPhoneRules(
                            contact.phone_country
                          );

                        updateContact(
                          'phone_number',
                          digits.slice(
                            0,
                            rules.digits
                          )
                        );
                      }}
                      style={{
                        flex: 1,

                        border:
                          contact.phone_number
                            ? phoneValid
                              ? '2px solid #16a34a'
                              : '2px solid #dc2626'
                            : undefined,

                        background:
                          contact.phone_number
                            ? phoneValid
                              ? '#f0fdf4'
                              : '#fef2f2'
                            : undefined,
                      }}
                      required
                    />

                  </div>

                  {contact.phone_number &&
                    !phoneValid && (
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
                        ❌{' '}
                        {
                          getPhoneRules(
                            contact.phone_country
                          ).label
                        }
                      </small>
                    )}

                  {phoneValid && (
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
                      ✓ Phone number is valid
                    </small>
                  )}

                </label>

              </div>

            </div>

            {/* =================================
                CONTINUE
            ================================== */}

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