'use client';

// ============================================================
// Admin Orders Page — view and manage all orders
// ============================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order, OrderStatus } from '@/types';

const statusOptions: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '🍽️ All' },
  { key: 'placed', label: '📝 Placed' },
  { key: 'confirmed', label: '✅ Confirmed' },
  { key: 'preparing', label: '👨‍🍳 Preparing' },
  { key: 'ready', label: '🔔 Ready' },
  { key: 'picked_up', label: '🎉 Picked Up' },
  { key: 'cancelled', label: '🚫 Cancelled' },
];

const nextStatus: Record<string, string> = {
  placed: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'picked_up',
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth !== 'true') router.push('/admin');
  }, [router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const cancelOrderAdmin = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '48px', height: '48px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin-slow 1s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '28px' }}>
        <Link href="/admin/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
          <span className="gradient-text">All Orders</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
          {orders.length} total orders
        </p>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {statusOptions.map((opt) => (
          <button
            key={opt.key}
            className={`category-pill ${filterStatus === opt.key ? 'active' : ''}`}
            onClick={() => setFilterStatus(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📭</div>
          <p style={{ color: 'var(--text-muted)' }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredOrders.map((order, i) => (
            <div key={order.id} className="card" style={{
              padding: '20px',
              animation: `fadeIn 0.3s ease-out ${i * 0.03}s both`,
              borderLeft: `3px solid ${
                order.status === 'placed' ? '#6366f1' :
                order.status === 'confirmed' ? '#3b82f6' :
                order.status === 'preparing' ? '#f59e0b' :
                order.status === 'ready' ? '#10b981' :
                order.status === 'cancelled' ? '#ef4444' : '#6b7280'
              }`,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                flexWrap: 'wrap', gap: '12px',
              }}>
                {/* Order info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className={`status-badge status-${order.status}`} style={{
                      background: order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : undefined,
                      color: order.status === 'cancelled' ? '#ef4444' : undefined,
                    }}>
                      {order.status.replace('_', ' ')}
                    </span>
                    {order.tableNumber > 0 && (
                      <span style={{
                        padding: '2px 8px', background: 'rgba(249,115,22,0.1)',
                        borderRadius: '6px', fontSize: '0.75rem', color: 'var(--primary-light)',
                      }}>
                        Table {order.tableNumber}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {order.items.map((item) => `${item.name} ×${item.quantity}`).join(', ')}
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>👤 {order.customerName || 'Guest'}</span>
                    <span>💳 {order.paymentMethod === 'counter' ? 'Counter' : 'UPI'}</span>
                    <span>⏰ {new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Price + Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontWeight: 800,
                    color: order.status === 'cancelled' ? 'var(--text-muted)' : 'var(--primary)',
                    fontSize: '1.1rem',
                    fontFamily: 'Outfit, sans-serif',
                    textDecoration: order.status === 'cancelled' ? 'line-through' : 'none',
                  }}>
                    ₹{order.total}
                  </span>

                  {(order.status === 'placed' || order.status === 'confirmed') && (
                    <button
                      onClick={() => cancelOrderAdmin(order.id)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #ef4444',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                  )}

                  {nextStatus[order.status] && (
                    <button
                      className="btn-primary"
                      onClick={() => updateOrderStatus(order.id, nextStatus[order.status])}
                      style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                      → {nextStatus[order.status].replace('_', ' ')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

