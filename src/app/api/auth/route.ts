// ============================================================
// API Route: /api/auth
// POST — admin PIN authentication
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPin } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;
    
    if (!pin) {
      return NextResponse.json(
        { success: false, error: 'PIN is required' },
        { status: 400 }
      );
    }
    
    const isValid = verifyAdminPin(pin);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid PIN' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Error authenticating:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
