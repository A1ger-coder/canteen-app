'use client';

// ============================================================
// Navbar — sticky top navigation with cart badge
// ============================================================

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  // Don't show customer navbar on admin pages
  if (pathname?.startsWith('/admin')) return null;

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--glass-border)',
    }}>
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.8rem' }}>🍽️</span>
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.3rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, var(--primary), #fbbf24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          QuickBite
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Link
          href="/menu"
          className="btn-ghost"
          style={{
            color: pathname === '/menu' ? 'var(--primary)' : undefined,
            fontSize: '0.9rem',
          }}
        >
          📋 Menu
        </Link>

        <Link
          href="/cart"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--text-primary)',
            background: totalItems > 0 ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'var(--bg-card)',
            border: totalItems > 0 ? 'none' : '1px solid var(--border)',
            transition: 'all 0.3s ease',
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          🛒
          {totalItems > 0 && (
            <span style={{
              background: '#fff',
              color: 'var(--primary-dark)',
              borderRadius: '10px',
              padding: '1px 8px',
              fontSize: '0.75rem',
              fontWeight: 800,
              minWidth: '20px',
              textAlign: 'center',
            }}>
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
