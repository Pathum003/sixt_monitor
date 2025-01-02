import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('https://grpc-prod.orange.sixt.com/com.sixt.service.nearbyoffers.api.NearbyOffersService/GetNearbyOffers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sx-platform': 'web-next',
        'x-client-type': 'web',
        'Origin': 'https://www.sixt.com',
        'Referer': 'https://www.sixt.com/'
      },
      body: JSON.stringify({
        "offer_matrix_id": "99277d94-1a88-4887-83d8-b6f6fbdb5927",
        "pickup_location_id": "6c44c18c-3860-41bc-a661-931855a3afcf",
        "return_location_id": "6c44c18c-3860-41bc-a661-931855a3afcf",
        "pickup_datetime": {"value": "2025-01-09T12:30"},
        "return_datetime": {"value": "2025-02-05T12:30"},
        "vehicle_type": "car"
      })
    });

    const data = await response.json();
    console.log('API Response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}