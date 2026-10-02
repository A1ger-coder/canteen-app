// ============================================================
// API Route: /api/orders
// GET — list all orders (with optional status filter)
// POST — create a new order
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';
import { OrderStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | null;
    
    let orders = await getOrders();
    
    if (status) {
      orders = orders.filter((order) => order.status === status);
    }
    
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }
    
    const created = await createOrder({
      tableNumber: body.tableNumber || 0,
      items: body.items,
      total: body.total || body.items.reduce(
        (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0
      ),
      customerName: body.customerName || 'Guest',
      customerPhone: body.customerPhone || '',
      paymentMethod: body.paymentMethod || 'counter',
    });

    if (!created) {
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
