'use client';

// ============================================================
// Order Tracking Page — real-time order status, cancellation, and feedback
// ============================================================

import React, { useState, useEffect, use } from 'react';
import { Order, OrderStatus, Feedback } from '@/types';
import Link from 'next/link';

const statusSteps: { key: OrderStatus; label: string; icon: string; color: string }[] = [
  { key: 'placed', label: 'Order Placed', icon: '📝', color: '#6366f1' },
  { key: 'confirmed', label: 'Confirmed', icon: '✅', color: '#3b82f6' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: '#f59e0b' },
  { key: 'ready', label: 'Ready!', icon: '🔔', color: '#10b981' },
  { key: 'picked_up', label: 'Picked Up', icon: '🎉', color: '#6b7280' },
];

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cancellation state
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        // Clear active order if it's been picked up or cancelled
        if (data.data.status === 'picked_up' || data.data.status === 'cancelled') {
          localStorage.removeItem('canteen-active-order');
        }
      } else {
        setError('Order not found');
      }
    } catch {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch(`/api/feedback?orderId=${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setFeedback(data.data);
      }
    } catch {
      // Ignore feedback fetch errors
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchFeedback();
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setShowCancelConfirm(false);
        localStorage.removeItem('canteen-active-order');
      } else {
        setCancelError(data.error || 'Failed to cancel order');
      }
    } catch {
      setCancelError('Error processing cancellation request');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;
    setSubmittingFeedback(true);
    setFeedbackError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data);
        setFeedbackSuccess(true);
      } else {
        setFeedbackError(data.error || 'Failed to submit feedback');
      }
    } catch {
      setFeedbackError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin-slow 1s linear infinite',
        }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
          {error || 'Order not found'}
        </h2>
        <Link href="/menu" className="btn-primary" style={{ textDecoration: 'none', marginTop: '20px' }}>
          Back to Menu
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel = order.status === 'placed' || order.status === 'confirmed';
  const canGiveFeedback = order.status === 'picked_up';

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Banner */}
      <div className="animate-fade-in-up" style={{
        textAlign: 'center',
        padding: '32px 20px',
        marginBottom: '32px',
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '16px',
          animation: order.status === 'ready' ? 'float 1s ease-in-out infinite' : undefined,
        }}>
          {isCancelled
            ? '🚫'
            : order.status === 'ready'
            ? '🎉'
            : order.status === 'preparing'
            ? '👨‍🍳'
            : order.status === 'picked_up'
            ? '😋'
            : '📋'}
        </div>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 800,
          marginBottom: '8px',
        }}>
          {isCancelled ? (
            <span style={{ color: '#ef4444' }}>Order Cancelled</span>
          ) : order.status === 'ready' ? (
            <span style={{ color: 'var(--accent)' }}>Your Order is Ready!</span>
          ) : order.status === 'picked_up' ? (
            'Order Complete!'
          ) : (
            <>Order <span className="gradient-text">#{order.id.slice(0, 8)}</span></>
          )}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isCancelled
            ? 'This order was cancelled and will not be prepared.'
            : order.status === 'ready'
            ? 'Please pick up your order from the counter'
            : order.status === 'picked_up'
            ? 'Hope you enjoyed your meal!'
            : 'We\'ll notify you when your order is ready'}
        </p>
      </div>

      {/* Status timeline */}
      {!isCancelled ? (
        <div className="card animate-fade-in" style={{ padding: '28px', marginBottom: '24px' }}>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '24px',
          }}>
            Order Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} style={{ display: 'flex', gap: '16px' }}>
                  {/* Timeline line + dot */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '32px',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? step.color : 'var(--bg-secondary)',
                      border: `2px solid ${isCompleted ? step.color : 'var(--border)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      boxShadow: isCurrent ? `0 0 20px ${step.color}40` : undefined,
                      animation: isCurrent ? 'status-pulse 2s ease-in-out infinite' : undefined,
                    }}>
                      {isCompleted ? step.icon : ''}
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div style={{
                        width: '2px',
                        height: '32px',
                        background: index < currentStepIndex ? step.color : 'var(--border)',
                        transition: 'background 0.3s ease',
                      }} />
                    )}
                  </div>

                  {/* Label */}
                  <div style={{ paddingBottom: '16px' }}>
                    <span style={{
                      fontWeight: isCurrent ? 700 : 500,
                      color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontSize: '0.95rem',
                    }}>
                      {step.label}
                    </span>
                    {isCurrent && (
                      <span style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: step.color,
                        marginTop: '2px',
                        fontWeight: 500,
                      }}>
                        Current status
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{
          padding: '24px',
          marginBottom: '24px',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          background: 'rgba(239, 68, 68, 0.05)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem' }}>ℹ️</span>
            <div>
              <h4 style={{ fontWeight: 700, color: '#ef4444' }}>Order Cancelled</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Your order was cancelled before food preparation started. If any payment was deducted, it will be refunded.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order details */}
      <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.05rem',
          fontWeight: 700,
          marginBottom: '16px',
        }}>
          Order Details
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {order.items.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}>
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 800,
          fontSize: '1.1rem',
        }}>
          <span>Total</span>
          <span style={{ color: isCancelled ? 'var(--text-muted)' : 'var(--primary)', textDecoration: isCancelled ? 'line-through' : 'none' }}>
            ₹{order.total}
          </span>
        </div>

        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '12px',
          marginTop: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}>
          {order.tableNumber > 0 && <span>🪑 Table {order.tableNumber}</span>}
          <span>💳 {order.paymentMethod === 'counter' ? 'Pay at Counter' : 'UPI'}</span>
          <span>⏰ {new Date(order.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Cancellation section (shown if status is placed or confirmed) */}
      {canCancel && (
        <div className="card animate-fade-in" style={{
          padding: '24px',
          marginBottom: '24px',
          borderColor: 'rgba(239, 68, 68, 0.2)',
        }}>
          <h3 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.05rem',
            fontWeight: 700,
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}>
            Need to cancel this order?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            You can cancel your order as long as food preparation has not started yet.
          </p>

          {cancelError && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '12px',
            }}>
              ⚠️ {cancelError}
            </div>
          )}

          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              🚫 Cancel Order
            </button>
          ) : (
            <div style={{
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              textAlign: 'center',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.9rem' }}>
                Are you sure you want to cancel your order?
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                  disabled={cancelling}
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Section (shown after food pickup) */}
      {canGiveFeedback && (
        <div className="card animate-fade-in" style={{
          padding: '28px',
          marginBottom: '24px',
          borderColor: 'rgba(249, 115, 22, 0.3)',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.03) 0%, rgba(249,115,22,0.08) 100%)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '2.5rem' }}>⭐</span>
            <h3 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.2rem',
              fontWeight: 800,
              marginTop: '8px',
            }}>
              How was your food?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              We value your feedback to make our canteen experience better!
            </p>
          </div>

          {feedback ? (
            <div style={{
              textAlign: 'center',
              padding: '16px',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
            }}>
              <p style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>
                {feedbackSuccess ? '✨ Thank you for your review!' : 'Your Submitted Feedback:'}
              </p>
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                {'⭐'.repeat(feedback.rating)}
              </div>
              {feedback.comment && (
                <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  &quot;{feedback.comment}&quot;
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback}>
              {/* Star Rating Picker */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '20px',
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2rem',
                      cursor: 'pointer',
                      transform: (hoverRating || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                      filter: (hoverRating || rating) >= star ? 'drop-shadow(0 0 8px rgba(245,158,11,0.5))' : 'grayscale(1)',
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>

              {/* Comment text box */}
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your meal experience... (optional)"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                  }}
                />
              </div>

              {feedbackError && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '12px', textAlign: 'center' }}>
                  {feedbackError}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={submittingFeedback}
                style={{ width: '100%', padding: '14px' }}
              >
                {submittingFeedback ? 'Submitting...' : 'Submit Feedback 🚀'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
        <Link href="/menu" className="btn-secondary" style={{
          flex: 1,
          textAlign: 'center',
          textDecoration: 'none',
          padding: '14px',
        }}>
          Order More
        </Link>
        {!isCancelled && (
          <button
            onClick={fetchOrder}
            className="btn-primary"
            style={{ flex: 1, padding: '14px' }}
          >
            Refresh Status 🔄
          </button>
        )}
      </div>
    </div>
  );
}

