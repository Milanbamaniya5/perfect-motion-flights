import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const offerId = searchParams.get('offerId');
  const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

  if (!offerId) {
    return NextResponse.json({ error: 'Missing offerId' }, { status: 400 });
  }

  try {
    const offerRes = await fetch(`https://api.duffel.com/air/offers/${offerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_KEY}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
    });

    const offerData = await offerRes.json();
    if (!offerRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch offer details' }, { status: 400 });
    }

    return NextResponse.json({ success: true, offer: offerData.data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { offer_id, passengers } = body;
    const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

    if (!offer_id || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const offerRes = await fetch(`https://api.duffel.com/air/offers/${offer_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_KEY}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
    });

    const offerData = await offerRes.json();
    if (!offerRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch offer details for payment matching' }, { status: 400 });
    }

    const offer = offerData.data;
    const totalAmount = offer.total_amount;
    const currency = offer.total_currency;

    // Mapping passengers and ensuring identity documents have required fields
    const formattedPassengers = passengers.map((p, index) => {
      const passportNum = p.passport_number || p.identity_documents?.[0]?.number;
      const passportExpiry = p.passport_expiry_date || p.identity_documents?.[0]?.expires_on;

      return {
        id: offer.passengers[index] ? offer.passengers[index].id : `pas_${index + 1}`,
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
            number: passportNum,
            unique_identifier: passportNum, // Mandatory field fix
            expires_on: passportExpiry,       // Mandatory field fix
            issuing_country_code: p.nationality || 'GB',
          }
        ]
      };
    });

    const orderResponse = await fetch('https://api.duffel.com/air/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DUFFEL_API_KEY}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          selected_offers: [offer_id],
          passengers: formattedPassengers,
          payments: [
            {
              type: 'balance',
              amount: totalAmount,
              currency: currency
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
