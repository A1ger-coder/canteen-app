// ============================================================
// API Route: /api/menu
// GET — list all menu items (with optional category filter)
// POST — add a new menu item (admin)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getMenuItems, addMenuItem } from '@/lib/db';
import { Category } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Category | null;
    
    let items = await getMenuItems();
    
    if (category) {
      items = items.filter((item) => item.category === category);
    }
    
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const created = await addMenuItem({
      name: body.name,
      description: body.description || '',
      price: Number(body.price),
      category: body.category || 'snacks',
      image: body.image || '/images/placeholder.jpg',
      isVeg: body.isVeg ?? true,
      isAvailable: body.isAvailable ?? true,
      preparationTime: body.preparationTime || 10,
    });

    if (!created) {
      return NextResponse.json(
        { success: false, error: 'Failed to add menu item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error adding menu item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add menu item' },
      { status: 500 }
    );
  }
}
