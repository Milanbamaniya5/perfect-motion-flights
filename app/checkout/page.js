import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || 'LHR';
  const destination = searchParams.get('destination') || 'AMD';
  const departureDate = searchParams.get('departureDate') || '2026-10-04';
  const adultsCount = parseInt(searchParams.get('adults')) || 1;
  const childAges = searchParams.getAll('childAge').map(age => parseInt(age));

  const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

  try {
    const passengersList = [];
    for (let i = 0; i < adultsCount; i++) {
      passengersList.push({ type: 'adult' });
    }
    childAges.forEach(age => {
      passengersList.push({ type: 'child', age: age });
    });

    const response = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_KEY}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin, destination, departure_date: departureDate }],
          passengers: passengersList,
          cabin_class: 'economy',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: JSON.stringify(data.errors) }, { status: response.status });
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
