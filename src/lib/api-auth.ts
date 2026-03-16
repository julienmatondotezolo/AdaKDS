import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

/**
 * Get authentication headers for API routes
 */
export async function getAuthHeaders(): Promise<{ [key: string]: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('ada_access_token')?.value;
    
    if (!token) {
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`,
    };
  } catch {
    return {};
  }
}

/**
 * Make authenticated request to backend API
 */
export async function makeBackendRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-kds.adasystems.app';
  const authHeaders = await getAuthHeaders();
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  });
}