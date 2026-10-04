// ============================================================
// API Route: /api/orders/[id]/cancel
// POST — cancel an order (only if status is 'placed' or 'confirmed')
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { cancelOrder } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cancelled = await cancelOrder(id);

    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: 'Order cannot be cancelled. It may already be preparing or completed.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: cancelled });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
