'use client';

// ============================================================
// Cart Page — review cart, special instructions, checkout
// ============================================================

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const {
    state,
    updateQuantity,
    updateInstructions,
    removeItem,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'counter' | 'upi'>('counter');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    if (state.items.length === 0) return;

    setIsPlacing(true);
    setError('');

    try {
      const orderData = {
        tableNumber: state.tableNumber || 0,
        items: state.items.map((ci) => ({
          menuItemId: ci.menuItem.id,
          name: ci.menuItem.name,
          quantity: ci.quantity,
          price: ci.menuItem.price,
          specialInstructions: ci.specialInstructions || '',
        })),
        total: totalPrice,
        customerName: customerName || 'Guest',
        customerPhone,
        paymentMethod,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('canteen-active-order', data.data.id);
        clearCart();
        router.push(`/order/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (state.items.length === 0) {
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
        <div className="animate-float" style={{ fontSize: '4rem', marginBottom: '20px' }}>🛒</div>
        <h2 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          Your cart is empty
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
          Add some delicious items from our menu!
        </p>
        <Link href="/menu" className="btn-primary" style={{
          textDecoration: 'none',
          padding: '14px 36px',
          fontSize: '1rem',
        }}>
          Browse Menu 📋
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '2rem',
          fontWeight: 800,
        }}>
          Your <span className="gradient-text">Cart</span>
        </h1>
        {state.tableNumber && (
          <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.9rem' }}>
            🪑 Table {state.tableNumber} • {totalItems} item{totalItems > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Cart items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {state.items.map((cartItem, index) => (
          <div
            key={cartItem.menuItem.id}
            className="card"
            style={{
              padding: '20px',
              animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
            }}
          >
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              {/* Food emoji */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, hsl(${(index * 60) % 360}, 50%, 15%), hsl(${(index * 60 + 40) % 360}, 40%, 10%))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                flexShrink: 0,
              }}>
                {cartItem.menuItem.category === 'snacks' ? '🍟' :
                 cartItem.menuItem.category === 'beverages' ? '🥤' :
                 cartItem.menuItem.category === 'meals' ? '🍛' : '🍰'}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div className={cartItem.menuItem.isVeg ? 'veg-badge' : 'nonveg-badge'} style={{ width: '14px', height: '14px' }} />
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                        {cartItem.menuItem.name}
                      </h3>
                    </div>
                    <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                      ₹{cartItem.menuItem.price} × {cartItem.quantity} = ₹{cartItem.menuItem.price * cartItem.quantity}
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(cartItem.menuItem.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '4px',
                      transition: 'color 0.2s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    ✕
                  </button>
                </div>

                {/* Quantity controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        padding: '6px 14px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      −
                    </button>
                    <span style={{
                      padding: '6px 8px',
                      fontWeight: 700,
                      minWidth: '28px',
                      textAlign: 'center',
                    }}>
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        padding: '6px 14px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Special instructions */}
                <input
                  type="text"
                  className="input"
                  placeholder="Special instructions (optional)"
                  value={cartItem.specialInstructions || ''}
                  onChange={(e) => updateInstructions(cartItem.menuItem.id, e.target.value)}
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    background: 'var(--bg-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer info */}
      <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          👤 Your Details <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ flex: '1 1 200px' }}
          />
          <input
            type="tel"
            className="input"
            placeholder="Phone number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={{ flex: '1 1 200px' }}
          />
        </div>
      </div>

      {/* Payment method */}
      <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          💳 Payment Method
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { key: 'counter', label: 'Pay at Counter', icon: '🏪' },
            { key: 'upi', label: 'UPI Payment', icon: '📱' },
          ].map((method) => (
            <button
              key={method.key}
              onClick={() => setPaymentMethod(method.key as 'counter' | 'upi')}
              style={{
                flex: '1 1 150px',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${paymentMethod === method.key ? 'var(--primary)' : 'var(--border)'}`,
                background: paymentMethod === method.key ? 'rgba(249, 115, 22, 0.08)' : 'var(--bg-secondary)',
                color: paymentMethod === method.key ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {method.icon} {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '20px' }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.1rem',
          fontWeight: 700,
          marginBottom: '16px',
        }}>
          🧾 Order Summary
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {state.items.map((ci) => (
            <div key={ci.menuItem.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}>
              <span>{ci.menuItem.name} × {ci.quantity}</span>
              <span>₹{ci.menuItem.price * ci.quantity}</span>
            </div>
          ))}
          <div style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '12px',
            marginTop: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 800,
            fontSize: '1.15rem',
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>₹{totalPrice}</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          color: '#ef4444',
          marginBottom: '16px',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {/* Place order button */}
      <button
        className="btn-primary"
        onClick={handlePlaceOrder}
        disabled={isPlacing}
        style={{
          width: '100%',
          padding: '18px',
          fontSize: '1.1rem',
          borderRadius: '16px',
          opacity: isPlacing ? 0.7 : 1,
          marginBottom: '40px',
        }}
      >
        {isPlacing ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin-slow 1s linear infinite',
            }} />
            Placing Order...
          </span>
        ) : (
          `Place Order • ₹${totalPrice}`
        )}
      </button>
    </div>
  );
}
