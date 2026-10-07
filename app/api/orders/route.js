import { NextResponse } from 'next/server';

const DUFFEL_API = 'https://api.duffel.com';

function getHeaders(key) {
  return {
    Authorization: `Bearer ${key}`,
    'Duffel-Version': 'v2',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get('offerId');
    const key = process.env.DUFFEL_API_KEY;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing offerId' },
        { status: 400 }
      );
    }

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error: 'DUFFEL_API_KEY is not configured in Vercel Environment Variables.',
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${DUFFEL_API}/air/offers/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        headers: getHeaders(key),
        cache: 'no-store',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to load flight offer',
          duffel_status: response.status,
          duffel_error: data?.errors || data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      offer: data.data,
    });
  } catch (error) {
    console.error('Duffel GET offer error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unable to load flight offer',
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const offer_id = body?.offer_id;
    const passengers = body?.passengers;

    const key = process.env.DUFFEL_API_KEY;

    if (!key) {
      return NextResponse.json(
        {
          success: false,
          error:
            'DUFFEL_API_KEY is missing. Add DUFFEL_API_KEY to Vercel Environment Variables and redeploy.',
        },
        { status: 500 }
      );
    }

    if (!offer_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing offer_id',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing passengers',
        },
        { status: 400 }
      );
    }

    if (passengers.length > 9) {
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum 9 passengers per booking.',
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 1. GET THE CURRENT DUFFEL OFFER
     * ---------------------------------------------------------
     */

    const offerResponse = await fetch(
      `${DUFFEL_API}/air/offers/${encodeURIComponent(offer_id)}`,
      {
        method: 'GET',
        headers: getHeaders(key),
        cache: 'no-store',
      }
    );

    const offerJson = await offerResponse.json();

    if (!offerResponse.ok) {
      console.error('Duffel offer error:', offerJson);

      return NextResponse.json(
        {
          success: false,
          error: 'Offer is no longer available.',
          duffel_status: offerResponse.status,
          duffel_error: offerJson?.errors || offerJson,
        },
        { status: offerResponse.status }
      );
    }

    const offer = offerJson.data;

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duffel returned an empty offer.',
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. CHECK OFFER PASSENGER COUNT
     * ---------------------------------------------------------
     */

    const offerPassengers = Array.isArray(offer.passengers)
      ? offer.passengers
      : [];

    if (offerPassengers.length !== passengers.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Passenger count mismatch. Offer expects ${offerPassengers.length} passenger(s), ` +
            `but booking received ${passengers.length}.`,
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. BUILD DUFFEL PASSENGERS
     * ---------------------------------------------------------
     *
     * We use the passenger IDs supplied by the offer.
     * This is important because Duffel expects the passenger IDs
     * from the selected offer.
     */

    const duffelPassengers = passengers.map((p, index) => {
      const offerPassenger = offerPassengers[index];

      if (!offerPassenger?.id) {
        throw new Error(
          `Duffel passenger ID missing for passenger ${index + 1}.`
        );
      }

      const passenger = {
        id: offerPassenger.id,
        given_name: p.given_name,
        family_name: p.family_name,
        gender: p.gender || 'm',
        born_on: p.born_on,
      };

      if (p.title) {
        passenger.title = p.title;
      }

      if (p.email) {
        passenger.email = p.email;
      }

      if (p.phone_number) {
        passenger.phone_number = p.phone_number;
      }

      /*
       * Passport information
       */

      if (
        p.passport_number &&
        p.passport_expiry_date
      ) {
        passenger.identity_documents = [
          {
            type: 'passport',
            unique_identifier: p.passport_number,
            expires_on: p.passport_expiry_date,
            issuing_country_code:
              p.nationality || 'GB',
          },
        ];
      }

      return passenger;
    });

    /*
     * ---------------------------------------------------------
     * 4. CHECK PRICE
     * ---------------------------------------------------------
     */

    const totalAmount = String(offer.total_amount);
    const currency = String(offer.total_currency);

    if (!totalAmount || !currency) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duffel offer does not contain valid price information.',
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. CREATE DUFFEL ORDER
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     * type: "instant"
     *
     * Duffel requires "instant" when payments are supplied.
     *
     * Test account:
     * payment type = "balance"
     */

    const orderPayload = {
      data: {
        type: 'instant',

        selected_offers: [offer_id],

        passengers: duffelPassengers,

        payments: [
          {
            type: 'balance',
            amount: totalAmount,
            currency: currency,
          },
        ],
      },
    };

    console.log('Creating Duffel order:', {
      offer_id,
      passenger_count: duffelPassengers.length,
      amount: totalAmount,
      currency,
    });

    const orderResponse = await fetch(
      `${DUFFEL_API}/air/orders`,
      {
        method: 'POST',
        headers: getHeaders(key),
        body: JSON.stringify(orderPayload),
        cache: 'no-store',
      }
    );

    const orderJson = await orderResponse.json();

    /*
     * ---------------------------------------------------------
     * 6. HANDLE DUFFEL ERROR
     * ---------------------------------------------------------
     */

    if (!orderResponse.ok) {
      console.error(
        'Duffel CREATE ORDER ERROR:',
        JSON.stringify(orderJson, null, 2)
      );

      const errors = orderJson?.errors;

      let errorMessage = 'Duffel booking failed.';

      if (Array.isArray(errors) && errors.length > 0) {
        errorMessage = errors
          .map((err) => {
            const code = err?.code
              ? ` [${err.code}]`
              : '';

            const message =
              err?.message ||
              err?.detail ||
              'Unknown Duffel error';

            return `${message}${code}`;
          })
          .join(' | ');
      } else if (typeof errors === 'string') {
        errorMessage = errors;
      } else if (orderJson?.message) {
        errorMessage = orderJson.message;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          duffel_status: orderResponse.status,
          duffel_errors: errors || null,
        },
        {
          status: orderResponse.status,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 7. SUCCESS
     * ---------------------------------------------------------
     */

    const order = orderJson?.data;

    if (!order?.id) {
      console.error(
        'Duffel returned success but no order ID:',
        orderJson
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Duffel response did not contain an order ID.',
          duffel_response: orderJson,
        },
        { status: 500 }
      );
    }

    console.log(
      'DUFFEL ORDER CREATED:',
      order.id
    );

    console.log(
      'DUFFEL LIVE MODE:',
      order.live_mode
    );

    return NextResponse.json({
      success: true,

      data: order,

      order_id: order.id,

      booking_reference:
        order.booking_reference || null,

      live_mode:
        order.live_mode ?? false,

      type:
        order.type || 'instant',

      total_amount:
        order.total_amount || totalAmount,

      total_currency:
        order.total_currency || currency,
    });
  } catch (error) {
    console.error(
      'Duffel order API error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'Unexpected booking error.',
      },
      { status: 500 }
    );
  }
}
