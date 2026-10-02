'use client';

// ============================================================
// MenuCard — individual food item card with add-to-cart
// ============================================================

import React, { useState } from 'react';
import { MenuItem } from '@/types';
import { useCart } from '@/context/CartContext';

interface MenuCardProps {
  item: MenuItem;
  index: number;
}

export default function MenuCard({ item, index }: MenuCardProps) {
  const { addItem, updateQuantity, state } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const cartItem = state.items.find((ci) => ci.menuItem.id === item.id);
  const quantityInCart = cartItem?.quantity || 0;

  const handleAdd = () => {
    setIsAdding(true);
    addItem(item);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, quantityInCart - 1);
  };

  return (
    <div
      className="card"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image area with category gradient */}
      <div style={{
        position: 'relative',
        height: '160px',
        background: `linear-gradient(135deg, hsl(${(index * 40) % 360}, 60%, 15%), hsl(${(index * 40 + 60) % 360}, 50%, 10%))`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          {item.category === 'snacks' ? '🍟' :
           item.category === 'beverages' ? '🥤' :
           item.category === 'meals' ? '🍛' : '🍰'}
        </span>

        {/* Unavailable overlay */}
        {!item.isAvailable && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            fontWeight: 700,
            fontSize: '0.9rem',
            letterSpacing: '1px',
          }}>
            UNAVAILABLE
          </div>
        )}

        {/* Veg/Non-veg badge */}
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <div className={item.isVeg ? 'veg-badge' : 'nonveg-badge'} />
        </div>

        {/* Prep time */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          padding: '3px 8px',
          borderRadius: '8px',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          ⏱️ {item.preparationTime}m
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
      }}>
        <h3 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}>
          {item.name}
        </h3>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.description}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '4px',
        }}>
          <span style={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'var(--primary)',
            fontFamily: 'Outfit, sans-serif',
          }}>
            ₹{item.price}
          </span>

          {item.isAvailable ? (
            quantityInCart > 0 ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--primary)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={handleDecrement}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  −
                </button>
                <span style={{
                  padding: '6px 4px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  minWidth: '24px',
                  textAlign: 'center',
                  color: 'var(--primary)',
                }}>
                  {quantityInCart}
                </span>
                <button
                  onClick={handleAdd}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 700,
                  }}
                >
                  +
                </button>
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={handleAdd}
                style={{
                  padding: '8px 20px',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  transform: isAdding ? 'scale(0.95)' : undefined,
                }}
              >
                {isAdding ? '✓ Added' : 'ADD'}
              </button>
            )
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Sold out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
