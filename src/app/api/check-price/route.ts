import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('https://grpc-prod.orange.sixt.com/com.sixt.service.rent_booking.api.BookingService/GetNearbyBranchesV2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sx-platform': 'web-next',
        'x-client-type': 'web',
        'Origin': 'https://www.sixt.com',
        'Referer': 'https://www.sixt.com/'
      },
      body: JSON.stringify({
        "pu_location": "6c44c18c-3860-41bc-a661-931855a3afcf",
        "do_location": "6c44c18c-3860-41bc-a661-931855a3afcf",
        "pu_time": "2025-01-09T12:30",
        "do_time": "2025-02-05T12:30"
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