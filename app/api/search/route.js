import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');

  const tripType = searchParams.get('tripType') || 'oneway';
  const adults = Number(searchParams.get('adults') || 1);
  const cabin = searchParams.get('cabin') || 'economy';

  const childAges = searchParams
    .getAll('childAge')
    .filter((value) => value && value.trim() !== '')
    .map(Number)
    .filter(
      (age) =>
        Number.isFinite(age) &&
        age >= 0 &&
        age <= 17
    );

  const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

  if (!DUFFEL_API_KEY) {
    return NextResponse.json(
      {
        error:
          'DUFFEL_API_KEY is missing in .env.local',
      },
      { status: 500 }
    );
  }

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      {
        error: 'Missing search details',
      },
      { status: 400 }
    );
  }

  // -----------------------------
  // PASSENGERS
  // -----------------------------

  const passengers = [];

  // Adults
  for (let i = 0; i < adults; i++) {
    passengers.push({
      type: 'adult',
    });
  }

  // Children
  // IMPORTANT:
  // Duffel requires either `type` OR `age`.
  // Do NOT send both for the same passenger.
  for (const age of childAges) {
    passengers.push({
      age: age,
    });
  }

  // -----------------------------
  // FLIGHT SLICES
  // -----------------------------

  const slices = [
    {
      origin: origin,
      destination: destination,
      departure_date: departureDate,
    },
  ];

  // Return flight
  if (tripType === 'return') {
    if (!returnDate) {
      return NextResponse.json(
        {
          error:
            'Return date is required for a return trip',
        },
        { status: 400 }
      );
    }

    slices.push({
      origin: destination,
      destination: origin,
      departure_date: returnDate,
    });
  }

  // -----------------------------
  // DUFFEL SEARCH
  // -----------------------------

  try {
    const response = await fetch(
      'https://api.duffel.com/air/offer_requests',
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${DUFFEL_API_KEY}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          data: {
            slices: slices,

            passengers: passengers,

            cabin_class: cabin,

            max_connections: 2,

            return_offers: true,
          },
        }),

        cache: 'no-store',
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: result.errors
            ? JSON.stringify(result.errors)
            : 'Duffel search failed',
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      offers: result.data?.offers || [],
    });

  } catch (error) {
    console.error('Duffel Search Error:', error);

    return NextResponse.json(
      {
        error:
          error.message ||
          'Unable to search flights',
      },
      {
        status: 500,
      }
    );
  }
}
