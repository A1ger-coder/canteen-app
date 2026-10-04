// ============================================================
// API Route: /api/feedback
// POST — submit feedback for an order
// GET — get all feedback (admin)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { submitFeedback, getAllFeedback, getFeedbackByOrderId } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.orderId || !body.rating) {
      return NextResponse.json(
        { success: false, error: 'Order ID and rating are required' },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if feedback already exists for this order
    const existing = await getFeedbackByOrderId(body.orderId);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Feedback already submitted for this order' },
        { status: 409 }
      );
    }

    const feedback = await submitFeedback({
      orderId: body.orderId,
      rating: body.rating,
      comment: body.comment || '',
    });

    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (orderId) {
      const feedback = await getFeedbackByOrderId(orderId);
      return NextResponse.json({ success: true, data: feedback });
    }

    const allFeedback = await getAllFeedback();
    return NextResponse.json({ success: true, data: allFeedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
