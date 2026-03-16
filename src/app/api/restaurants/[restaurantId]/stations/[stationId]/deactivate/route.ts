import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app';

interface RouteParams {
  params: {
    restaurantId: string;
    stationId: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { restaurantId, stationId } = params;
    
    const apiUrl = `${API_BASE_URL}/api/v1/restaurants/${restaurantId}/stations/${stationId}/deactivate`;
    
    console.log('🔄 Frontend API: Deactivating station via backend:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'PATCH',
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
    console.log('✅ Frontend API: Station deactivated successfully');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      { 
        error: 'DEACTIVATE_ERROR', 
        message: 'Failed to deactivate station via backend API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}