import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app';

interface RouteParams {
  params: {
    restaurantId: string;
    stationId: string;
  };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { restaurantId, stationId } = params;
    const body = await request.json();
    
    const apiUrl = `${API_BASE_URL}/api/v1/restaurants/${restaurantId}/stations/${stationId}`;
    
    console.log('🔄 Frontend API: Updating station via backend:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'PUT',
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
    console.log('✅ Frontend API: Station updated successfully');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      { 
        error: 'UPDATE_ERROR', 
        message: 'Failed to update station via backend API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { restaurantId, stationId } = params;
    
    const apiUrl = `${API_BASE_URL}/api/v1/restaurants/${restaurantId}/stations/${stationId}`;
    
    console.log('🔄 Frontend API: Deleting station via backend:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer demo-token', // For development
        'Content-Type': 'application/json'
      }
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
    console.log('✅ Frontend API: Station deleted successfully');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      { 
        error: 'DELETE_ERROR', 
        message: 'Failed to delete station via backend API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}