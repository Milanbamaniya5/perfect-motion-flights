export async function POST(request) {
  const { origin, destination, date } = await request.json();
  try {
    const response = await fetch('https://duffel.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
        'Duffel-Version': 'v2',
      },
      body: JSON.stringify({
        data: {
          slices: [{ origin: origin, destination: destination, departure_date: date }],
          passengers: [{ type: 'adult' }],
          cabin_class: 'economy',
        },
      }),
    });
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
