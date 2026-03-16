import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app';

interface RouteParams {
  params: {
    restaurantId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { restaurantId } = params;
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    
    const apiUrl = new URL(`/api/v1/restaurants/${restaurantId}/stations`, API_BASE_URL);
    if (includeDeleted) {
      apiUrl.searchParams.set('include_deleted', 'true');
    }

    console.log('🔄 Frontend API: Fetching stations from backend:', apiUrl.toString());

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer demo-token', // For development
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'BACKEND_ERROR', 
          message: `Backend API error: ${response.status}`,
          details: errorText 
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Frontend API: Stations fetched successfully:', data.stations?.length || 0, 'stations');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      { 
        error: 'FETCH_ERROR', 
        message: 'Failed to fetch stations from backend API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { restaurantId } = params;
    const body = await request.json();
    
    const apiUrl = `${API_BASE_URL}/api/v1/restaurants/${restaurantId}/stations`;
    
    console.log('🔄 Frontend API: Creating station via backend:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer demo-token', // For development
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Backend API error:', response.status, errorData);
      
      return NextResponse.json(
        { 
          error: errorData.error || 'BACKEND_ERROR', 
          message: errorData.message || `Backend API error: ${response.status}`
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Frontend API: Station created successfully');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      { 
        error: 'CREATE_ERROR', 
        message: 'Failed to create station via backend API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}