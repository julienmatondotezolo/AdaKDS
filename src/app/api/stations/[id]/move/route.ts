import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const response = await fetch(`${API_BASE_URL}/api/v1/stations/${id}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Backend API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error moving station:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move station' },
      { status: 500 }
    );
  }
}