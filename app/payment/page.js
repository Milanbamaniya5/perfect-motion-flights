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

function PaymentContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const offerId = sp.get('offerId');

  const [offer, setOffer] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [contact, setContact] = useState({
    email: '',
    phone_number: '',
  });

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('card');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const storedPassengers =
        sessionStorage.getItem(
          'tripScannerPassengers'
        );

      const storedContact =
        sessionStorage.getItem(
          'tripScannerContact'
        );

      if (storedPassengers) {
        setPassengers(
          JSON.parse(storedPassengers)
        );
      }

      if (storedContact) {
        setContact(
          JSON.parse(storedContact)
        );
      }
    } catch {
      setError(
        'Unable to load passenger details.'
      );
    }
  }, []);

  useEffect(() => {
    if (!offerId) {
      setError('Missing flight offer.');
      setLoading(false);
      return;
    }

    fetch(
      `/api/orders?offerId=${encodeURIComponent(
        offerId
      )}`
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              'Unable to load flight.'
          );
        }

        return data;
      })
      .then((data) => {
        if (!data.offer) {
          throw new Error(
            'Flight offer could not be loaded.'
          );
        }

        setOffer(data.offer);
      })
      .catch((err) => {
        setError(
          err?.message ||
            'Unable to load flight.'
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [offerId]);

  function formatCardNumber(value) {
    const digits = value
      .replace(/\D/g, '')
      .slice(0, 16);

    return digits.replace(
      /(.{4})/g,
      '$1 '
    ).trim();
  }

  function formatExpiry(value) {
    const digits = value
      .replace(/\D/g, '')
      .slice(0, 4);

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(
      2
    )}`;
  }

  function validatePayment() {
    if (!offerId) {
      return 'Missing flight offer.';
    }

    if (!offer) {
      return 'Flight offer is not loaded yet.';
    }

    if (
      !Array.isArray(passengers) ||
      passengers.length === 0
    ) {
      return 'Passenger details are missing.';
    }

    if (!contact.email) {
      return 'Contact email is missing.';
    }

    if (!contact.phone_number) {
      return 'Contact phone number is missing.';
    }

    /*
     * Demo card validation.
     * This does NOT charge a real card.
     */

    if (paymentMethod === 'card') {
      const digits = cardNumber.replace(
        /\D/g,
        ''
      );

      if (digits.length < 12) {
        return 'Please enter a valid card number.';
      }

      if (!expiry || expiry.length !== 5) {
        return 'Please enter card expiry date.';
      }

      if (!cvc || cvc.length < 3) {
        return 'Please enter a valid CVC.';
      }

      if (!cardName.trim()) {
        return 'Please enter the cardholder name.';
      }
    }

    return '';
  }

  async function completeBooking(event) {
    event.preventDefault();

    if (booking) return;

    setError('');

    const validationError =
      validatePayment();

    if (validationError) {
      setError(validationError);
      return;
    }

    setBooking(true);

    try {
      /*
       * ------------------------------------------------------
       * DEMO PAYMENT
       * ------------------------------------------------------
       *
       * No real card is charged.
       *
       * After demo payment succeeds we create the REAL
       * Duffel TEST order using /api/orders.
       */

      const response = await fetch(
        '/api/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            offer_id: offerId,
            passengers:
              passengers.map((passenger) => ({
                ...passenger,

                /*
                 * Contact details are attached to
                 * passengers where needed by Duffel.
                 */
                email:
                  passenger.email ||
                  contact.email,

                phone_number:
                  passenger.phone_number ||
                  contact.phone_number,
              })),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        console.error(
          'Duffel booking failed:',
          data
        );

        let message =
          data?.error ||
          'Duffel booking failed.';

        if (
          data?.duffel_errors &&
          Array.isArray(
            data.duffel_errors
          )
        ) {
          const details =
            data.duffel_errors
              .map(
                (item) =>
                  item?.message ||
                  item?.detail ||
                  ''
              )
              .filter(Boolean)
              .join(' | ');

          if (details) {
            message = details;
          }
        }

        throw new Error(message);
      }

      /*
       * ------------------------------------------------------
       * ACTUAL DUFFEL ORDER
       * ------------------------------------------------------
       */

      const order =
        data?.data || null;

      const orderId =
        data?.order_id ||
        order?.id ||
        '';

      const bookingReference =
        data?.booking_reference ||
        order?.booking_reference ||
        '';

      if (!orderId) {
        console.error(
          'No Duffel order ID returned:',
          data
        );

        throw new Error(
          'Payment completed, but Duffel did not return an order ID.'
        );
      }

      /*
       * Save the REAL Duffel order.
       */

      const bookingData = {
        id: orderId,

        order_id: orderId,

        booking_reference:
          bookingReference,

        offer_id: offerId,

        status: 'confirmed',

        payment_status: 'demo_paid',

        live_mode:
          data?.live_mode ??
          order?.live_mode ??
          false,

        type:
          data?.type ||
          order?.type ||
          'instant',

        total_amount:
          data?.total_amount ||
          order?.total_amount ||
          offer?.total_amount,

        total_currency:
          data?.total_currency ||
          order?.total_currency ||
          offer?.total_currency,

        passengers,

        contact,

        created_at:
          new Date().toISOString(),
      };

      /*
       * Save for confirmation page.
       */

      sessionStorage.setItem(
        'tripScannerBooking',
        JSON.stringify(
          bookingData
        )
      );

      sessionStorage.setItem(
        'tripScannerOrderId',
        orderId
      );

      sessionStorage.setItem(
        'tripScannerBookingReference',
        bookingReference
      );

      /*
       * Save locally for My Bookings page.
       */

      try {
        const existing =
          JSON.parse(
            localStorage.getItem(
              'my_flight_bookings'
            ) || '[]'
          );

        const updated = [
          bookingData,
          ...(Array.isArray(existing)
            ? existing.filter(
                (item) =>
                  item?.id !== orderId
              )
            : []),
        ];

        localStorage.setItem(
          'my_flight_bookings',
          JSON.stringify(updated)
        );
      } catch (storageError) {
        console.warn(
          'Unable to save local booking:',
          storageError
        );
      }

      /*
       * Go to confirmation.
       */

      router.push(
        `/confirmation?orderId=${encodeURIComponent(
          orderId
        )}`
      );
    } catch (err) {
      console.error(
        'Booking error:',
        err
      );

      setError(
        err?.message ||
          'Unable to complete booking.'
      );

      setBooking(false);
    }
  }

  const segments =
    offer?.slices?.flatMap(
      (slice) =>
        slice.segments || []
    ) || [];

  if (loading) {
    return (
      <main className="loading-box">
        Loading payment…
      </main>
    );
  }

  return (
    <main className="checkout-shell">
      <header className="site-header">
        <div className="brand">
          ✈ Trip Scanner <b>Hub</b>
        </div>

        <span>Payment</span>
      </header>

      <div className="checkout-grid">
        <section>
          <div className="stepbar">
            <span>✓ Passenger</span>
            <b>2 Payment</b>
            <span>3 Confirmation</span>
          </div>

          <form
            className="passenger-card"
            onSubmit={completeBooking}
          >
            <h1>Payment</h1>

            <p>
              Complete your demo payment to
              confirm the booking.
            </p>

            {error && (
              <div className="error">
                ⚠ {error}
              </div>
            )}

            {/* PAYMENT METHOD */}

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                marginBottom: '24px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setPaymentMethod(
                    'card'
                  )
                }
                style={{
                  padding: '14px 22px',
                  borderRadius: '12px',
                  border:
                    paymentMethod ===
                    'card'
                      ? '2px solid #111827'
                      : '1px solid #d1d5db',
                  background:
                    paymentMethod ===
                    'card'
                      ? '#f8fafc'
                      : '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                💳 Card
              </button>

              <button
                type="button"
                onClick={() =>
                  setPaymentMethod(
                    'applepay'
                  )
                }
                style={{
                  padding: '14px 22px',
                  borderRadius: '12px',
                  border:
                    paymentMethod ===
                    'applepay'
                      ? '2px solid #111827'
                      : '1px solid #d1d5db',
                  background:
                    paymentMethod ===
                    'applepay'
                      ? '#f8fafc'
                      : '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                 Pay
              </button>
            </div>

            {paymentMethod ===
              'card' && (
              <div
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background:
                    '#f8fafc',
                  border:
                    '1px solid #e2e8f0',
                }}
              >
                <h2
                  style={{
                    marginTop: 0,
                  }}
                >
                  Card details
                </h2>

                <div className="form-grid">
                  <label>
                    Cardholder name *
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardName}
                      onChange={(e) =>
                        setCardName(
                          e.target.value
                        )
                      }
                      autoComplete="cc-name"
                    />
                  </label>

                  <label>
                    Card number *
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(
                          formatCardNumber(
                            e.target.value
                          )
                        )
                      }
                      autoComplete="cc-number"
                    />
                  </label>

                  <label>
                    Expiry *
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) =>
                        setExpiry(
                          formatExpiry(
                            e.target.value
                          )
                        )
                      }
                      autoComplete="cc-exp"
                    />
                  </label>

                  <label>
                    CVC *
                    <input
                      type="password"
                      inputMode="numeric"
                      placeholder="123"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) =>
                        setCvc(
                          e.target.value
                            .replace(
                              /\D/g,
                              ''
                            )
                            .slice(0, 4)
                        )
                      }
                      autoComplete="cc-csc"
                    />
                  </label>
                </div>
              </div>
            )}

            {paymentMethod ===
              'applepay' && (
              <div
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  background:
                    '#f8fafc',
                  border:
                    '1px solid #e2e8f0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '42px',
                    marginBottom: '12px',
                  }}
                >
                  
                </div>

                <h2>
                  Apple Pay
                </h2>

                <p>
                  Demo Apple Pay payment.
                  No real payment will be
                  charged.
                </p>
              </div>
            )}

            {/* DEMO NOTICE */}

            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                borderRadius: '12px',
                background:
                  '#fff7ed',
                border:
                  '1px solid #fed7aa',
                color: '#9a3412',
              }}
            >
              <strong>
                Demo payment mode
              </strong>

              <p
                style={{
                  margin:
                    '6px 0 0',
                }}
              >
                No real money will be
                charged. After this demo
                payment, your booking will
                be submitted to the Duffel
                Test Account.
              </p>
            </div>

            {/* CONTACT */}

            <div
              style={{
                marginTop: '24px',
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

              <div className="form-grid">
                <label>
                  Email
                  <input
                    type="email"
                    value={
                      contact.email
                    }
                    readOnly
                  />
                </label>

                <label>
                  Phone
                  <input
                    type="tel"
                    value={
                      contact.phone_number
                    }
                    readOnly
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="primary wide"
              disabled={booking}
              style={{
                marginTop: '24px',
                opacity: booking
                  ? 0.7
                  : 1,
                cursor: booking
                  ? 'wait'
                  : 'pointer',
              }}
            >
              {booking
                ? 'Confirming booking…'
                : `Pay ${offer ? money(
                    offer.total_amount,
                    offer.total_currency
                  ) : ''} & Confirm booking →`}
            </button>
          </form>
        </section>

        {/* BOOKING SUMMARY */}

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
                    segment.marketing_carrier_flight_number
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
