import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { offerId } = await request.json();
    const key = process.env.DUFFEL_API_KEY;
    if (!offerId || !key) return NextResponse.json({ error: 'Missing offerId or DUFFEL_API_KEY' }, { status: 400 });

    const r = await fetch(`https://api.duffel.com/air/offers/${offerId}`, {
      headers: { Authorization: `Bearer ${key}`, 'Duffel-Version': 'v2', 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    const j = await r.json();
    if (!r.ok) return NextResponse.json({ error: 'Offer no longer available' }, { status: 400 });

    return NextResponse.json({
      demo: true,
      amount: j.data.total_amount,
      currency: j.data.total_currency,
      offer: j.data
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
