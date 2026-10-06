'use client';

import {
  useEffect,
  useState,
} from 'react';

export default function Confirmation() {
  const [order, setOrder] =
    useState(null);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        sessionStorage.getItem(
          'tripScannerOrder'
        );

      if (stored) {
        const parsed =
          JSON.parse(stored);

        if (
          parsed &&
          typeof parsed ===
            'object'
        ) {
          setOrder(parsed);
        }
      }
    } catch (error) {
      console.error(
        'Unable to read demo booking:',
        error
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return (
      <main className="loading-box">
        Loading Trip Scanner Hub…
      </main>
    );
  }

  const reference =
    order?.booking_reference ||
    order?.bookingReference ||
    order?.id ||
    'CONFIRMED';

  const amount =
    order?.amount;

  const currency =
    order?.currency ||
    'GBP';

  return (
    <main className="confirm-shell">

      <div className="confirm-card">

        <div className="success">
          ✓
        </div>

        <span className="eyebrow">
          TRIP SCANNER HUB
        </span>

        <h1>
          Booking confirmed
        </h1>

        <p>
          Your demo booking has been
          created successfully.
        </p>

        {/* BOOKING REFERENCE */}

        <div className="pnr">

          <small>
            BOOKING REFERENCE
          </small>

          <b>
            {reference}
          </b>

        </div>

        {/* DEMO PAYMENT */}

        <div
          style={{
            marginTop: '18px',
            padding: '14px 16px',
            borderRadius: '12px',
            background: '#f0fdf4',
            border:
              '1px solid #bbf7d0',
            color: '#166534',
          }}
        >

          <strong>
            ✓ Demo payment successful
          </strong>

          <div
            style={{
              marginTop: '5px',
              fontSize: '14px',
            }}
          >
            No real money was charged.
            Real payment will be connected
            later.
          </div>

        </div>

        {/* TOTAL */}

        {amount && (
          <div
            style={{
              marginTop: '18px',
              padding: '14px 16px',
              borderRadius: '12px',
              background: '#f8fafc',
              border:
                '1px solid #e2e8f0',
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems: 'center',
            }}
          >

            <span>
              Demo total
            </span>

            <strong>
              {new Intl.NumberFormat(
                'en-GB',
                {
                  style: 'currency',
                  currency,
                }
              ).format(
                Number(amount)
              )}
            </strong>

          </div>
        )}

        {/* NEW SEARCH */}

        <a
          href="/"
          className="primary link-btn"
          style={{
            display: 'block',
            marginTop: '24px',
            textAlign: 'center',
            textDecoration: 'none',
          }}
        >
          Search another flight
        </a>

      </div>

    </main>
  );
}