import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || 'LHR';
  const destination = searchParams.get('destination') || 'AMD';
  const departureDate = searchParams.get('departureDate') || '2026-10-04';

  const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

  try {
    const response = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_KEY}`,
        'Duffel-Version': 'v1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [
            {
              origin: origin,
              destination: destination,
              departure_date: departureDate,
            }
          ],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.errors ? JSON.stringify(data.errors) : 'Failed to fetch flight offers';
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
