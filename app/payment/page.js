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

/* =========================================
   MONEY
========================================= */

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

/* =========================================
   TIME
========================================= */

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

/* =========================================
   CARD NUMBER
========================================= */

function formatCardNumber(value) {
  const digits = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 16);

  return digits
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/* =========================================
   EXPIRY MM/YY
========================================= */

function formatExpiry(value) {
  const digits = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return (
    digits.slice(0, 2) +
    '/' +
    digits.slice(2)
  );
}

/* =========================================
   VALIDATION
========================================= */

function validCardNumber(value) {
  const digits = String(value || '')
    .replace(/\D/g, '');

  return digits.length === 16;
}

function validExpiry(value) {
  const match = String(value || '').match(
    /^(\d{2})\/(\d{2})$/
  );

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = Number(match[2]);

  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();

  const currentMonth =
    now.getMonth() + 1;

  const currentYear =
    now.getFullYear() % 100;

  if (year < currentYear) {
    return false;
  }

  if (
    year === currentYear &&
    month < currentMonth
  ) {
    return false;
  }

  return true;
}

function validCVV(value) {
  return /^\d{3,4}$/.test(
    String(value || '')
  );
}

function validName(value) {
  return (
    String(value || '').trim().length >= 2
  );
}

/* =========================================
   PAYMENT CONTENT
========================================= */

function PaymentContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const offerId =
    sp.get('offerId');

  const [offer, setOffer] =
    useState(null);

  const [method, setMethod] =
    useState('card');

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState('');

  /* CARD DATA */

  const [cardNumber, setCardNumber] =
    useState('');

  const [expiry, setExpiry] =
    useState('');

  const [cvv, setCvv] =
    useState('');

  const [cardholderName, setCardholderName] =
    useState('');

  const [billingCountry, setBillingCountry] =
    useState('GB');

  /* =========================================
     LOAD OFFER
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadOffer() {
      if (!offerId) {
        setError(
          'Flight offer is missing.'
        );
        return;
      }

      try {
        const response = await fetch(
          `/api/payment?offerId=${encodeURIComponent(
            offerId
          )}`,
          {
            method: 'GET',
            cache: 'no-store',
          }
        );

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            data?.error ||
              'Unable to load payment details.'
          );
        }

        if (!data?.offer) {
          throw new Error(
            'Flight offer could not be loaded.'
          );
        }

        setOffer(data.offer);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              'Unable to load payment details.'
          );
        }
      }
    }

    loadOffer();

    return () => {
      cancelled = true;
    };
  }, [offerId]);

  /* =========================================
     VALIDATION STATUS
  ========================================= */

  const cardNumberEntered =
    cardNumber.length > 0;

  const expiryEntered =
    expiry.length > 0;

  const cvvEntered =
    cvv.length > 0;

  const nameEntered =
    cardholderName.length > 0;

  const cardNumberValid =
    validCardNumber(cardNumber);

  const expiryValid =
    validExpiry(expiry);

  const cvvValid =
    validCVV(cvv);

  const nameValid =
    validName(cardholderName);

  const cardComplete =
    cardNumberValid &&
    expiryValid &&
    cvvValid &&
    nameValid;

  const canPay =
    Boolean(offer) &&
    !busy &&
    (
      method === 'apple' ||
      cardComplete
    );

  /* =========================================
     DEMO PAYMENT
  ========================================= */

  async function pay(event) {
    event.preventDefault();

    setError('');

    if (!offer) {
      setError(
        'Flight offer is not available.'
      );
      return;
    }

    /* CARD CHECK */

    if (method === 'card') {
      if (!cardNumberValid) {
        setError(
          'Please enter a valid 16-digit card number.'
        );
        return;
      }

      if (!expiryValid) {
        setError(
          'Please enter a valid card expiry date in MM/YY format.'
        );
        return;
      }

      if (!cvvValid) {
        setError(
          'Please enter a valid 3 or 4 digit CVV.'
        );
        return;
      }

      if (!nameValid) {
        setError(
          'Please enter the cardholder name.'
        );
        return;
      }
    }

    setBusy(true);

    try {
      /*
       * TEMPORARY DEMO PAYMENT
       *
       * No real payment.
       * No Duffel order creation.
       * No card details stored.
       */

      const demoOrder = {
        id:
          `DEMO-${Date.now()}`,

        offer_id:
          offerId,

        status:
          'demo_confirmed',

        payment_status:
          'demo_paid',

        amount:
          offer.total_amount,

        currency:
          offer.total_currency,

        payment_method:
          method,

        created_at:
          new Date().toISOString(),
      };

      /*
       * Save only demo booking information.
       *
       * Card number,
       * expiry and CVV
       * are NOT saved.
       */

      sessionStorage.setItem(
        'tripScannerOrder',
        JSON.stringify(
          demoOrder
        )
      );

      sessionStorage.setItem(
        'tripScannerPayment',
        'demo'
      );

      router.push(
        `/confirmation?orderId=${encodeURIComponent(
          demoOrder.id
        )}`
      );
    } catch (err) {
      setError(
        err?.message ||
          'Demo payment failed.'
      );

      setBusy(false);
    }
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

      <header className="site-header">

        <div className="brand">
          ✈ Trip Scanner{' '}
          <b>Hub</b>
        </div>

        <span>
          Payment
        </span>

      </header>

      <div className="checkout-grid">

        {/* =====================================
            PAYMENT SECTION
        ====================================== */}

        <section>

          <div className="stepbar">

            <span>
              ✓ Passenger
            </span>

            <b>
              2 Payment
            </b>

            <span>
              3 Confirmation
            </span>

          </div>

          <form
            className="payment-card"
            onSubmit={pay}
          >

            <div className="demo-badge">
              DEMO PAYMENT · No real money will be charged
            </div>

            <h1>
              Choose payment method
            </h1>

            <p>
              Your payment page is ready.
              This is currently a safe demo
              checkout.
            </p>

            {/* PAYMENT METHODS */}

            <div className="pay-methods">

              <button
                type="button"
                className={
                  method === 'apple'
                    ? 'selected'
                    : ''
                }
                onClick={() => {
                  setMethod('apple');
                  setError('');
                }}
              >
                 Apple Pay
                <small>
                  Demo
                </small>
              </button>

              <button
                type="button"
                className={
                  method === 'card'
                    ? 'selected'
                    : ''
                }
                onClick={() => {
                  setMethod('card');
                  setError('');
                }}
              >
                💳 Card
                <small>
                  Demo
                </small>
              </button>

            </div>

            {/* =================================
                APPLE PAY
            ================================== */}

            {method === 'apple' ? (

              <div className="wallet-demo">

                <div className="apple-mark">
                  
                </div>

                <b>
                  Apple Pay
                </b>

                <span>
                  Demo wallet payment
                </span>

              </div>

            ) : (

              /* =================================
                 CARD
              ================================== */

              <div className="card-demo">

                {/* CARD NUMBER */}

                <label>

                  Card number

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={
                      cardNumber
                    }
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    onChange={(event) => {
                      setCardNumber(
                        formatCardNumber(
                          event.target.value
                        )
                      );
                      setError('');
                    }}
                    style={{
                      border:
                        cardNumberEntered
                          ? cardNumberValid
                            ? '2px solid #16a34a'
                            : '2px solid #dc2626'
                          : undefined,

                      background:
                        cardNumberEntered
                          ? cardNumberValid
                            ? '#f0fdf4'
                            : '#fef2f2'
                          : undefined,
                    }}
                  />

                  {cardNumberEntered &&
                    !cardNumberValid && (
                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '5px',
                          color:
                            '#dc2626',
                          fontWeight:
                            '600',
                        }}
                      >
                        ❌ Enter a valid 16-digit card number.
                      </small>
                    )}

                  {cardNumberValid && (
                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '5px',
                        color:
                          '#16a34a',
                        fontWeight:
                          '600',
                      }}
                    >
                      ✓ Card number is valid
                    </small>
                  )}

                </label>

                {/* EXPIRY + CVV */}

                <div className="form-grid">

                  {/* EXPIRY */}

                  <label>

                    Expiry

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      value={
                        expiry
                      }
                      placeholder="MM/YY"
                      maxLength={5}
                      onChange={(event) => {
                        setExpiry(
                          formatExpiry(
                            event.target.value
                          )
                        );
                        setError('');
                      }}
                      style={{
                        border:
                          expiryEntered
                            ? expiryValid
                              ? '2px solid #16a34a'
                              : '2px solid #dc2626'
                            : undefined,

                        background:
                          expiryEntered
                            ? expiryValid
                              ? '#f0fdf4'
                              : '#fef2f2'
                            : undefined,
                      }}
                    />

                    {expiryEntered &&
                      !expiryValid && (
                        <small
                          style={{
                            display:
                              'block',
                            marginTop:
                              '5px',
                            color:
                              '#dc2626',
                            fontWeight:
                              '600',
                          }}
                        >
                          ❌ Enter a valid expiry date, e.g. 08/29.
                        </small>
                      )}

                    {expiryValid && (
                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '5px',
                          color:
                            '#16a34a',
                          fontWeight:
                            '600',
                        }}
                      >
                        ✓ Expiry date is valid
                      </small>
                    )}

                  </label>

                  {/* CVV */}

                  <label>

                    CVV

                    <input
                      type="password"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      value={cvv}
                      placeholder="•••"
                      maxLength={4}
                      onChange={(event) => {
                        setCvv(
                          event.target.value
                            .replace(
                              /\D/g,
                              ''
                            )
                            .slice(
                              0,
                              4
                            )
                        );
                        setError('');
                      }}
                      style={{
                        border:
                          cvvEntered
                            ? cvvValid
                              ? '2px solid #16a34a'
                              : '2px solid #dc2626'
                            : undefined,

                        background:
                          cvvEntered
                            ? cvvValid
                              ? '#f0fdf4'
                              : '#fef2f2'
                            : undefined,
                      }}
                    />

                    {cvvEntered &&
                      !cvvValid && (
                        <small
                          style={{
                            display:
                              'block',
                            marginTop:
                              '5px',
                            color:
                              '#dc2626',
                            fontWeight:
                              '600',
                          }}
                        >
                          ❌ CVV must be 3 or 4 digits.
                        </small>
                      )}

                    {cvvValid && (
                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '5px',
                          color:
                            '#16a34a',
                          fontWeight:
                            '600',
                        }}
                      >
                        ✓ CVV is valid
                      </small>
                    )}

                  </label>

                </div>

                {/* CARDHOLDER */}

                <label>

                  Cardholder name

                  <input
                    type="text"
                    autoComplete="cc-name"
                    value={
                      cardholderName
                    }
                    placeholder="Name on card"
                    onChange={(event) => {
                      setCardholderName(
                        event.target.value
                      );
                      setError('');
                    }}
                    style={{
                      border:
                        nameEntered
                          ? nameValid
                            ? '2px solid #16a34a'
                            : '2px solid #dc2626'
                          : undefined,

                      background:
                        nameEntered
                          ? nameValid
                            ? '#f0fdf4'
                            : '#fef2f2'
                          : undefined,
                    }}
                  />

                  {nameEntered &&
                    !nameValid && (
                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '5px',
                          color:
                            '#dc2626',
                          fontWeight:
                            '600',
                        }}
                      >
                        ❌ Please enter the cardholder name.
                      </small>
                    )}

                  {nameValid && (
                    <small
                      style={{
                        display:
                          'block',
                        marginTop:
                          '5px',
                        color:
                          '#16a34a',
                        fontWeight:
                          '600',
                      }}
                    >
                      ✓ Cardholder name is valid
                    </small>
                  )}

                </label>

                {/* BILLING COUNTRY */}

                <label>

                  Billing country

                  <select
                    value={
                      billingCountry
                    }
                    onChange={(event) =>
                      setBillingCountry(
                        event.target.value
                      )
                    }
                  >

                    <option value="GB">
                      United Kingdom
                    </option>

                    <option value="IN">
                      India
                    </option>

                    <option value="US">
                      United States
                    </option>

                    <option value="PT">
                      Portugal
                    </option>

                  </select>

                </label>

              </div>
            )}

            {/* ERROR */}

            {error && (
              <div
                className="error"
                style={{
                  marginTop:
                    '16px',
                  wordBreak:
                    'break-word',
                }}
              >
                ⚠ {error}
              </div>
            )}

            {/* PAY */}

            <button
              type="submit"
              disabled={
                !canPay
              }
              className="primary wide"
              style={{
                marginTop:
                  '18px',

                opacity:
                  canPay
                    ? 1
                    : 0.5,

                cursor:
                  canPay
                    ? 'pointer'
                    : 'not-allowed',
              }}
            >
              {busy
                ? 'Processing…'
                : `Pay ${
                    offer
                      ? money(
                          offer.total_amount,
                          offer.total_currency
                        )
                      : ''
                  } →`}
            </button>

            <div className="secure-note">
              🔒 Demo mode · No card details are stored or charged.
            </div>

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
                      ?.name ||
                    offer?.owner?.name
                  }

                  {' · '}

                  {
                    segment
                      .marketing_carrier_flight_number ||
                    ''
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

export default function Payment() {
  return (
    <Suspense
      fallback={
        <main className="loading-box">
          Loading Trip Scanner Hub…
        </main>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}