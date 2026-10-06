'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

const countries = [
  ['GB', 'United Kingdom', '+44', 10],
  ['IN', 'India', '+91', 10],
  ['US', 'United States', '+1', 10],
  ['CA', 'Canada', '+1', 10],
  ['AU', 'Australia', '+61', 9],
  ['DE', 'Germany', '+49', 10],
  ['FR', 'France', '+33', 9],
  ['AE', 'United Arab Emirates', '+971', 9],
  ['SG', 'Singapore', '+65', 8],
  ['JP', 'Japan', '+81', 10],
];

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const birth = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const monthDifference = today.getMonth() - birth.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birth.getDate())
  ) {
    age--;
  }

  return age;
}

function isValidDateOfBirth(dateOfBirth) {
  if (!dateOfBirth) return false;

  const birth = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();

  return (
    !Number.isNaN(birth.getTime()) &&
    birth <= today
  );
}

function Checkout() {
  const q = useSearchParams();
  const offerId = q.get('offerId');

  const [ps, setPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [global, setGlobal] = useState('');

  useEffect(() => {
    if (!offerId) {
      setGlobal('Missing flight offer.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const r = await fetch(
          `/api/orders?offerId=${encodeURIComponent(offerId)}`
        );

        const d = await r.json();

        if (!r.ok) {
          throw new Error(
            d.error || 'Could not load flight offer.'
          );
        }

        if (d.offer?.passengers) {
          setPs(
            d.offer.passengers.map((p) => ({
              id: p.id,
              type: p.type,

              given_name: '',
              family_name: '',

              gender: 'm',

              born_on: '',

              nationality: 'GB',

              email: '',
              phone_code: '+44',
              phone_number: '',

              passport_number: '',
              passport_expiry_date: '',
            }))
          );
        } else {
          setGlobal(
            'No passenger information was found for this flight.'
          );
        }
      } catch (e) {
        setGlobal(
          e.message ||
            'Could not load passenger details.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [offerId]);

  const change = (i, key, value) => {
    setPs((current) =>
      current.map((p, index) => {
        if (index !== i) return p;

        if (key === 'nationality') {
          const country = countries.find(
            (c) => c[0] === value
          );

          return {
            ...p,
            nationality: value,
            phone_code:
              country?.[2] || '+44',
          };
        }

        return {
          ...p,
          [key]: value,
        };
      })
    );

    setErrors((current) => {
      const updated = { ...current };

      delete updated[`${key}_${i}`];

      return updated;
    });

    setGlobal('');
  };

  const submit = async (e) => {
    e.preventDefault();

    setErrors({});
    setGlobal('');

    const er = {};

    ps.forEach((p, i) => {
      if (!p.given_name.trim()) {
        er[`given_${i}`] = 'Required';
      }

      if (!p.family_name.trim()) {
        er[`family_${i}`] = 'Required';
      }

      // -------------------------
      // DATE OF BIRTH
      // -------------------------

      if (!p.born_on) {
        er[`dob_${i}`] = 'Date of birth is required';
      } else if (!isValidDateOfBirth(p.born_on)) {
        er[`dob_${i}`] = 'Invalid date of birth';
      }

      // -------------------------
      // PHONE
      // -------------------------

      const country =
        countries.find(
          (x) => x[2] === p.phone_code
        ) || ['', '', '', 10];

      let phone = p.phone_number.trim();

      let targetLength = country[3];

      if (
        p.phone_code === '+44' &&
        phone.startsWith('0')
      ) {
        targetLength = 11;
      }

      if (!/^\d+$/.test(phone)) {
        er[`phone_${i}`] =
          'Phone number must contain numbers only';
      } else if (
        phone.length !== targetLength
      ) {
        er[`phone_${i}`] =
          'Invalid phone number';
      }

      // -------------------------
      // EMAIL
      // -------------------------

      if (!p.email.trim()) {
        er[`email_${i}`] = 'Email is required';
      }

      // -------------------------
      // PASSPORT
      // -------------------------

      if (!p.passport_number.trim()) {
        er[`passport_${i}`] =
          'Passport number is required';
      }

      if (!p.passport_expiry_date) {
        er[`exp_${i}`] =
          'Passport expiry is required';
      }
    });

    if (Object.keys(er).length > 0) {
      setErrors(er);
      setGlobal(
        'Please fix the highlighted fields before continuing.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const passengers = ps.map((p) => {
        let phone = p.phone_number.trim();

        // UK numbers:
        // 07123456789 -> +447123456789
        if (
          p.phone_code === '+44' &&
          phone.startsWith('0')
        ) {
          phone = phone.slice(1);
        }

        // -------------------------
        // IMPORTANT:
        // Calculate age from DOB.
        // -------------------------

        const calculatedAge =
          calculateAge(p.born_on);

        console.log(
          `Passenger ${p.id}: DOB=${p.born_on}, age=${calculatedAge}`
        );

        return {
          id: p.id,

          given_name:
            p.given_name.trim(),

          family_name:
            p.family_name.trim(),

          gender: p.gender,

          // Duffel expects:
          // YYYY-MM-DD
          born_on: p.born_on,

          // Age is calculated from DOB
          // and NOT manually entered.
          age: calculatedAge,

          title:
            p.gender === 'm'
              ? 'mr'
              : 'ms',

          email:
            p.email.trim(),

          phone_number:
            `${p.phone_code}${phone}`,

          identity_documents: [
            {
              type: 'passport',

              number:
                p.passport_number
                  .trim()
                  .toUpperCase(),

              unique_identifier:
                p.passport_number
                  .trim()
                  .toUpperCase(),

              expires_on:
                p.passport_expiry_date,

              issuing_country_code:
                p.nationality || 'GB',
            },
          ],
        };
      });

      console.log(
        'Submitting passengers:',
        passengers
      );

      const r = await fetch(
        '/api/orders',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            offer_id: offerId,
            passengers,
          }),
        }
      );

      const d = await r.json();

      if (!r.ok) {
        throw new Error(
          d.error ||
            'Booking failed.'
        );
      }

      setResult(d.data);
    } catch (e) {
      console.error(e);

      setGlobal(
        e.message ||
          'Booking failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loader-page">
        <div className="loader" />
      </div>
    );
  }

  if (result) {
    return (
      <div className="page-shell">

        <div className="success">

          <div className="success-icon">
            ✓
          </div>

          <h2>
            Booking confirmed
          </h2>

          <p>
            Your reservation has been
            created successfully.
          </p>

          <p>
            <b>PNR:</b>{' '}
            <strong>
              {result.booking_reference}
            </strong>
          </p>

          <a
            className="select-btn"
            style={{
              display: 'inline-block',
            }}
            href="/"
          >
            Book another flight
          </a>

        </div>

      </div>
    );
  }

  return (
    <div className="page-shell">

      {/* HEADER */}

      <header className="site-header">

        <nav className="nav">

          <a
            className="brand"
            href="/"
          >
            <span className="brand-mark">
              ✈
            </span>

            Perfect Motion
          </a>

          <div className="nav-links">

            <a href="/">
              Flights
            </a>

            <a href="/bookings">
              My bookings
            </a>

          </div>

        </nav>

      </header>


      {/* MAIN */}

      <main className="content">

        <div className="page-top">

          <div>

            <h1 className="page-title">
              Passenger details
            </h1>

            <div className="subtle">
              Complete the details exactly
              as shown on travel documents.
            </div>

          </div>

        </div>


        {/* STEPPER */}

        <div className="stepper">

          <div className="step">
            1 · Search
          </div>

          <div className="step">
            2 · Select flight
          </div>

          <div className="step active">
            3 · Passenger details
          </div>

        </div>


        <div className="checkout-grid">

          <form onSubmit={submit}>

            {global && (
              <div className="error-box">
                ⚠ {global}
              </div>
            )}


            {ps.map((p, i) => {

              const age =
                calculateAge(
                  p.born_on
                );

              return (
                <section
                  className="passenger-card"
                  key={p.id}
                >

                  <div className="passenger-head">

                    <h3>
                      Passenger {i + 1}
                    </h3>

                    <span className="type-badge">
                      {p.type}
                    </span>

                  </div>


                  {/* BASIC DETAILS */}

                  <div className="form-grid">

                    <Field
                      label="Given name"
                      error={
                        errors[
                          `given_${i}`
                        ]
                      }
                    >

                      <input
                        value={
                          p.given_name
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'given_name',
                            e.target.value
                          )
                        }
                        required
                        placeholder="Given name"
                      />

                    </Field>


                    <Field
                      label="Family name"
                      error={
                        errors[
                          `family_${i}`
                        ]
                      }
                    >

                      <input
                        value={
                          p.family_name
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'family_name',
                            e.target.value
                          )
                        }
                        required
                        placeholder="Family name"
                      />

                    </Field>


                    {/* DOB */}

                    <Field
                      label="Date of birth"
                      error={
                        errors[
                          `dob_${i}`
                        ]
                      }
                    >

                      <input
                        type="date"
                        max={
                          new Date()
                            .toISOString()
                            .split('T')[0]
                        }
                        value={
                          p.born_on
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'born_on',
                            e.target.value
                          )
                        }
                        required
                      />

                      {age !== null &&
                        age >= 0 && (
                          <div
                            className="subtle"
                            style={{
                              marginTop:
                                '6px',
                            }}
                          >
                            Age: {age}{' '}
                            years
                          </div>
                        )}

                    </Field>


                    {/* GENDER */}

                    <Field label="Gender">

                      <select
                        value={
                          p.gender
                        }
                        onChange={(e) =>
                          change(
                            i,
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

                    </Field>


                    {/* NATIONALITY */}

                    <Field label="Nationality">

                      <select
                        value={
                          p.nationality
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'nationality',
                            e.target.value
                          )
                        }
                      >

                        {countries.map(
                          (c) => (
                            <option
                              key={c[0]}
                              value={c[0]}
                            >
                              {c[1]}
                            </option>
                          )
                        )}

                      </select>

                    </Field>

                    <div />

                  </div>


                  {/* PHONE */}

                  <div className="form-grid three">

                    <Field label="Code">

                      <select
                        value={
                          p.phone_code
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'phone_code',
                            e.target.value
                          )
                        }
                      >

                        {countries.map(
                          (c) => (
                            <option
                              key={
                                c[0] +
                                c[2]
                              }
                              value={c[2]}
                            >
                              {c[2]}
                            </option>
                          )
                        )}

                      </select>

                    </Field>


                    <Field
                      label="Phone number"
                      error={
                        errors[
                          `phone_${i}`
                        ]
                      }
                    >

                      <input
                        value={
                          p.phone_number
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'phone_number',
                            e.target.value
                          )
                        }
                        required
                        placeholder="Phone number"
                        inputMode="numeric"
                      />

                    </Field>

                  </div>


                  {/* EMAIL / PASSPORT */}

                  <div className="form-grid">

                    <Field
                      label="Email"
                      error={
                        errors[
                          `email_${i}`
                        ]
                      }
                    >

                      <input
                        type="email"
                        value={
                          p.email
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'email',
                            e.target.value
                          )
                        }
                        required
                        placeholder="you@example.com"
                      />

                    </Field>


                    <Field
                      label="Passport number"
                      error={
                        errors[
                          `passport_${i}`
                        ]
                      }
                    >

                      <input
                        value={
                          p.passport_number
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'passport_number',
                            e.target.value
                          )
                        }
                        required
                        placeholder="Passport number"
                      />

                    </Field>


                    <Field
                      label="Passport expiry"
                      error={
                        errors[
                          `exp_${i}`
                        ]
                      }
                    >

                      <input
                        type="date"
                        value={
                          p.passport_expiry_date
                        }
                        onChange={(e) =>
                          change(
                            i,
                            'passport_expiry_date',
                            e.target.value
                          )
                        }
                        required
                      />

                    </Field>

                  </div>

                </section>
              );
            })}


            {/* SUBMIT */}

            <button
              className="complete-btn"
              disabled={submitting}
              type="submit"
            >

              {submitting
                ? 'Processing secure booking…'
                : 'Complete booking →'}

            </button>

          </form>


          {/* SUMMARY */}

          <aside className="summary-card">

            <h3>
              Booking summary
            </h3>

            <div className="summary-row">

              <span>
                Passengers
              </span>

              <b>
                {ps.length}
              </b>

            </div>


            <div className="summary-row">

              <span>
                Passenger details
              </span>

              <b>
                Required
              </b>

            </div>


            <div className="summary-total">

              <span>
                Secure checkout
              </span>

              <span>
                ✓
              </span>

            </div>


            <div className="subtle">
              Your details are sent
              securely to the booking
              service.
            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}


function Field({
  label,
  error,
  children,
}) {
  return (
    <div className="form-field">

      <label>
        {label}
      </label>

      {children}

      {error && (
        <div className="field-error">
          {error}
        </div>
      )}

    </div>
  );
}


export default function CheckoutPage() {

  return (
    <Suspense
      fallback={
        <div className="loader-page">
          <div className="loader" />
        </div>
      }
    >
      <Checkout />
    </Suspense>
  );
}
