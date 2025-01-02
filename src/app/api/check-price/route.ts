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
        'Referer': 'https://www.sixt.com/',
        'x-correlation-id': '850f662d-db29-4931-b5d5-d081a17feede',
        'x-client-id': 'web-browser-2501015753736131000537365900144030',
        'x-sx-o-client-id': '61cf6566-5666-4a77-83a8-7c6147a0c5d2:oeu1735771264797r0.5707519380626047'
      },
      body: JSON.stringify({
        "offer_matrix_id": "cc323592-0db0-4151-b5a4-1930e03b0532",
        "currency": "USD",
        "trip_spec": {
          "pickup_datetime": {"value": "2025-01-07T12:30"},
          "pickup_location_selection_id": "cd39902b-c6cb-4bf8-bece-1103f0ab192d",
          "return_location_selection_id": "cd39902b-c6cb-4bf8-bece-1103f0ab192d",
          "return_datetime": {"value": "2025-02-03T12:30"},
          "vehicle_type": 10
        }
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}