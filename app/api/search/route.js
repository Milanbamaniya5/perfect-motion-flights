import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || 'LHR';
  const destination = searchParams.get('destination') || 'AMD';
  const departureDate = searchParams.get('departureDate') || '2026-10-04';
  const returnDate = searchParams.get('returnDate') || '2026-11-29';

  const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

  try {
    const offerRequestResponse = await fetch('https://api.duffel.com/air/offer_requests', {
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
            },
            ...(returnDate ? [{
              origin: destination,
              destination: origin,
              departure_date: returnDate,
            }] : [])
          ],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
        },
      }),
    });

    const offerRequestData = await offerRequestResponse.json();

    if (!offerRequestResponse.ok) {
      // Yahan error ko properly string mein convert kiya hai taaki [object Object] na aaye
      const errorMessage = offerRequestData.errors 
        ? JSON.stringify(offerRequestData.errors) 
        : 'Failed to fetch flight offers from Duffel';

      return NextResponse.json(
        { error: errorMessage },
        { status: offerRequestResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: offerRequestData.data,
    });

  } catch (error) {
    console.error('Duffel API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
