import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const offerId =
      searchParams.get('offerId');

    const key =
      process.env.DUFFEL_API_KEY;

    if (!offerId) {
      return NextResponse.json(
        {
          error:
            'Missing offerId',
        },
        {
          status: 400,
        }
      );
    }

    if (!key) {
      return NextResponse.json(
        {
          error:
            'DUFFEL_API_KEY is missing',
        },
        {
          status: 500,
        }
      );
    }

    const response =
      await fetch(
        `https://api.duffel.com/air/offers/${encodeURIComponent(
          offerId
        )}`,
        {
          headers: {
            Authorization:
              `Bearer ${key}`,

            'Duffel-Version':
              'v2',

            'Content-Type':
              'application/json',
          },

          cache:
            'no-store',
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            'Offer no longer available.',
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      demo: true,

      amount:
        data.data
          ?.total_amount,

      currency:
        data.data
          ?.total_currency,

      offer:
        data.data,
    });

  } catch (error) {
    console.error(
      'Payment API error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to load payment details.',
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * Temporary demo mode.
 *
 * Real payment API / Stripe can be
 * added later.
 *
 * We intentionally do NOT create
 * a real payment here.
 */
export async function POST(request) {
  try {
    const body =
      await request.json();

    const offerId =
      body?.offerId;

    if (!offerId) {
      return NextResponse.json(
        {
          error:
            'Missing offerId.',
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      demo: true,

      success: true,

      message:
        'Demo payment mode. No real payment was processed.',

      offerId,
    });

  } catch {
    return NextResponse.json(
      {
        error:
          'Invalid payment request.',
      },
      {
        status: 400,
      }
    );
  }
}