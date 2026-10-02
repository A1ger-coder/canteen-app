'use client';

// ============================================================
// Admin Dashboard — overview with live orders and stats
// ============================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth !== 'true') {
      router.push('/admin');
    }
  }, [router]);

  // Fetch orders
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

  const todayOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt).toDateString();
    return orderDate === new Date().toDateString();
  });

  const activeOrders = orders.filter((o) => !['picked_up'].includes(o.status));
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);

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

  const nextStatus: Record<string, string> = {
    placed: 'confirmed',
    confirmed: 'preparing',
    preparing: 'ready',
    ready: 'picked_up',
  };

  const statusLabels: Record<string, string> = {
    placed: '📝 Placed',
    confirmed: '✅ Confirmed',
    preparing: '👨‍🍳 Preparing',
    ready: '🔔 Ready',
    picked_up: '🎉 Picked Up',
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin-slow 1s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800 }}>
            <span className="gradient-text">Admin Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link href="/admin/menu" className="btn-secondary" style={{
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '10px 18px',
          }}>
            📋 Menu
          </Link>
          <Link href="/admin/orders" className="btn-secondary" style={{
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '10px 18px',
          }}>
            📦 All Orders
          </Link>
          <Link href="/admin/qr" className="btn-secondary" style={{
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '10px 18px',
          }}>
            🔲 QR Codes
          </Link>
          <button onClick={handleLogout} className="btn-ghost" style={{ fontSize: '0.85rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="animate-fade-in" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {[
          { label: 'Active Orders', value: activeOrders.length, icon: '🔥', color: '#f59e0b' },
          { label: "Today's Orders", value: todayOrders.length, icon: '📦', color: '#6366f1' },
          { label: "Today's Revenue", value: `₹${todayRevenue}`, icon: '💰', color: '#10b981' },
          { label: 'Total Orders', value: orders.length, icon: '📊', color: '#3b82f6' },
        ].map((stat, i) => (
          <div key={i} className="card" style={{
            padding: '24px',
            animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '8px' }}>
                  {stat.label}
                </p>
                <p style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: stat.color,
                }}>
                  {stat.value}
                </p>
              </div>
              <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live Orders */}
      <h2 style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '1.3rem',
        fontWeight: 700,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        🔴 Live Orders
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ef4444',
          animation: 'status-pulse 1.5s ease-in-out infinite',
          display: 'inline-block',
        }} />
      </h2>

      {activeOrders.length === 0 ? (
        <div className="card" style={{
          padding: '48px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>😴</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No active orders right now</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}>
          {activeOrders.map((order, i) => (
            <div key={order.id} className="card" style={{
              padding: '20px',
              animation: `slideInRight 0.4s ease-out ${i * 0.05}s both`,
              borderLeft: `3px solid ${
                order.status === 'placed' ? '#6366f1' :
                order.status === 'confirmed' ? '#3b82f6' :
                order.status === 'preparing' ? '#f59e0b' :
                '#10b981'
              }`,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <div>
                  <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                    #{order.id.slice(0, 8)}
                  </span>
                  {order.tableNumber > 0 && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 8px',
                      background: 'rgba(249, 115, 22, 0.1)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--primary-light)',
                    }}>
                      Table {order.tableNumber}
                    </span>
                  )}
                </div>
                <span className={`status-badge status-${order.status}`}>
                  {statusLabels[order.status]}
                </span>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '12px' }}>
                {order.items.map((item, j) => (
                  <div key={j} style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    padding: '4px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '12px',
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{order.total}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {nextStatus[order.status] && (
                  <button
                    className="btn-primary"
                    onClick={() => updateOrderStatus(order.id, nextStatus[order.status])}
                    style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '10px' }}
                  >
                    → {statusLabels[nextStatus[order.status]]}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
