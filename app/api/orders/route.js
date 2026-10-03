import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { offer_id, passengers } = body;
    const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

    if (!offer_id || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid offer_id or passengers data' }, { status: 400 });
    }

    const formattedPassengers = passengers.map((p, index) => ({
      id: `pas_${index + 1}`,
      given_name: p.given_name,
      family_name: p.family_name,
      gender: p.gender,
      born_on: p.born_on,
      title: p.gender === 'm' ? 'mr' : 'ms',
      email: p.email,
      phone_number: p.phone_number,
      identity_documents: [
        {
          type: 'passport',
          number: p.passport_number,
          unique_identifier: p.passport_number,
          expires_on: p.passport_expiry_date,
          issuing_country_code: p.nationality || 'GB',
        }
      ]
    }));

    const orderResponse = await fetch('https://api.duffel.com/air/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_KEY}`,
        'Duffel-Version': 'v1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          selected_offers: [offer_id],
          passengers: formattedPassengers,
          payments: [
            {
              type: 'balance',
              amount: '0.00',
              currency: 'GBP'
            }
          ]
        }
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      const errorMessage = orderData.errors ? JSON.stringify(orderData.errors) : 'Failed to create order on Duffel';
      return NextResponse.json({ error: errorMessage }, { status: orderResponse.status });
    }

    return NextResponse.json({ success: true, data: orderData.data });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
