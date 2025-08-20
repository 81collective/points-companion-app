// Utility functions for extracting user information from API requests
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function getUserFromRequest(request: NextRequest) {
  try {
    // Create supabase client for server-side operations
    const supabase = createClient();
    
    // Get the user from the session
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

export async function requireAuthentication(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}