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
  const childAges = searchParams.getAll('childAge').map(Number);
  const key = process.env.DUFFEL_API_KEY;
  if (!key) return NextResponse.json({ error: 'DUFFEL_API_KEY is missing in .env.local' }, { status: 500 });
  if (!origin || !destination || !departureDate) return NextResponse.json({ error: 'Missing search details' }, { status: 400 });

  const passengers = [{ type: 'adult' }].map((x,i)=>i < adults ? x : null).filter(Boolean);
  while (passengers.length < adults) passengers.push({ type: 'adult' });
  childAges.forEach(age => passengers.push({ type: age < 2 ? 'infant_without_seat' : 'child', age }));
  const slices = [{ origin, destination, departure_date: departureDate }];
  if (tripType === 'return') slices.push({ origin: destination, destination: origin, departure_date: returnDate });

  try {
    const res = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Duffel-Version': 'v2', 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { slices, passengers, cabin_class: cabin, max_connections: 2, return_offers: true } }),
      cache: 'no-store'
    });
    const json = await res.json();
    if (!res.ok) return NextResponse.json({ error: json.errors ? JSON.stringify(json.errors) : 'Duffel search failed' }, { status: res.status });
    return NextResponse.json({ data: json.data, offers: json.data?.offers || [] });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
