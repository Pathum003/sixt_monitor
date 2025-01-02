import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('https://grpc-prod.orange.sixt.com/com.sixt.service.rent_booking.api.BookingService/GetOfferRecommendationsV2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sx-platform': 'web-next',
        'x-client-type': 'web',
        'Origin': 'https://www.sixt.com',
        'Referer': 'https://www.sixt.com/'
      },
      body: JSON.stringify({
        "offer_matrix_id": "cc323592-0db0-4151-b5a4-1930e03b0532",
        "currency": "USD",
        "trip_spec": {
          "pickup_datetime": {"value": "2025-01-07T12:30"},
          "pickup_location_selection_id": "cd39902b-c6cb-4f8-bece-1103f0ab192d",
          "return_location_selection_id": "cd39902b-c6cb-4f8-bece-1103f0ab192d",
          "return_datetime": {"value": "2025-02-03T12:30"},
          "vehicle_type": 10
        }
      })
    });

    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}