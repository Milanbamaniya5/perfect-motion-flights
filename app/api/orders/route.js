import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { offer_id, passengers } = body;
    const DUFFEL_API_KEY = process.env.DUFFEL_API_KEY;

    if (!offer_id || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid offer_id or passengers data' }, { status: 400 });
    }

    // 1. Pehle Duffel se offer details fetch karein taaki exact total amount aur passenger IDs mil sakein
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
    const duffelPassengerId = offer.passengers[0].id; // Offer ke andar ki official passenger ID

    // 2. Format passengers using the exact ID from the offer
    const formattedPassengers = passengers.map((p) => ({
      id: duffelPassengerId, // Yahan offer wali ID use karni hai
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

    // 3. Create the order with the exact matching payment amount
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
              amount: totalAmount, // Exact offer amount match karega
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
