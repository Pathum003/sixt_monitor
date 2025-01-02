import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // First get nearby branches
    const response = await fetch('https://grpc-prod.orange.sixt.com/com.sixt.service.location.api.LocationService/GetNearbyBranches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sx-platform': 'web-next',
        'x-client-type': 'web',
        'Origin': 'https://www.sixt.com',
        'Referer': 'https://www.sixt.com/'
      },
      body: JSON.stringify({
        "position": {
          "latitude": 34.1688,  // North Hollywood coordinates
          "longitude": -118.3726
        },
        "max_distance": 50000,  // 50km radius
        "pickup_datetime": {"value": "2025-01-09T12:30"},
        "return_datetime": {"value": "2025-02-05T12:30"},
        "vehicle_type": "car"
      })
    });

    const data = await response.json();
    console.log('Branches found:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}