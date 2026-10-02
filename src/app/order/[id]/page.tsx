'use client';

// ============================================================
// Order Tracking Page — real-time order status
// ============================================================

import React, { useState, useEffect, use } from 'react';
import { Order, OrderStatus } from '@/types';
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

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        // Clear active order if it's been picked up
        if (data.data.status === 'picked_up') {
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

  useEffect(() => {
    fetchOrder();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
      {/* Success banner */}
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
          {order.status === 'ready' ? '🎉' : order.status === 'preparing' ? '👨‍🍳' : '📋'}
        </div>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 800,
          marginBottom: '8px',
        }}>
          {order.status === 'ready' ? (
            <span style={{ color: 'var(--accent)' }}>Your Order is Ready!</span>
          ) : order.status === 'picked_up' ? (
            'Order Complete'
          ) : (
            <>Order <span className="gradient-text">#{order.id.slice(0, 8)}</span></>
          )}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {order.status === 'ready'
            ? 'Please pick up your order from the counter'
            : 'We\'ll notify you when your order is ready'}
        </p>
      </div>

      {/* Status timeline */}
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
          <span style={{ color: 'var(--primary)' }}>₹{order.total}</span>
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
        <button
          onClick={fetchOrder}
          className="btn-primary"
          style={{ flex: 1, padding: '14px' }}
        >
          Refresh Status 🔄
        </button>
      </div>
    </div>
  );
}
