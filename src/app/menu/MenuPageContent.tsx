'use client';

// ============================================================
// Menu Page Content — browse food items with category filters & search
// ============================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MenuItem, Category } from '@/types';
import { useCart } from '@/context/CartContext';
import MenuCard from '@/components/MenuCard';
import Link from 'next/link';

const categories: { key: Category | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: '🍽️' },
  { key: 'snacks', label: 'Snacks', icon: '🍟' },
  { key: 'beverages', label: 'Beverages', icon: '🥤' },
  { key: 'meals', label: 'Meals', icon: '🍛' },
  { key: 'desserts', label: 'Desserts', icon: '🍰' },
];

export default function MenuPageContent() {
  const searchParams = useSearchParams();
  const { setTable, totalItems, totalPrice, state } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Read table number from QR code URL param
  useEffect(() => {
    const table = searchParams.get('table');
    if (table) {
      setTable(parseInt(table));
    }
  }, [searchParams, setTable]);

  // Fetch menu items
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch('/api/menu');
        const data = await res.json();
        if (data.success) {
          setMenuItems(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, []);

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
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
        <p style={{ color: 'var(--text-muted)' }}>Loading menu...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', paddingBottom: totalItems > 0 ? '100px' : '40px' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '24px' }}>
        {state.tableNumber && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.2)',
            borderRadius: '20px',
            marginBottom: '16px',
            fontSize: '0.85rem',
            color: 'var(--primary-light)',
          }}>
            🪑 Table {state.tableNumber}
          </div>
        )}
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '2rem',
          fontWeight: 800,
        }}>
          Our <span className="gradient-text">Menu</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '0.9rem' }}>
          {menuItems.length} items available
        </p>
      </div>

      {/* Search & Filters */}
      <div className="animate-fade-in" style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1rem',
          }}>
            🔍
          </span>
          <input
            type="text"
            className="input"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px' }}
          />
        </div>

        {/* Category pills + veg toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => (
              <button
                key={cat.key}
                className={`category-pill ${activeCategory === cat.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.key)}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Veg toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '20px',
              border: `1px solid ${vegOnly ? 'var(--veg)' : 'var(--border)'}`,
              background: vegOnly ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)',
              color: vegOnly ? 'var(--veg)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <div className="veg-badge" style={{ width: '14px', height: '14px' }} />
            Veg Only
          </button>
        </div>
      </div>

      {/* Menu grid */}
      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🍽️</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No items found</p>
          <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Try a different search or category</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {filteredItems.map((item, index) => (
            <MenuCard key={item.id} item={item} index={index} />
          ))}
        </div>
      )}

      {/* Floating cart bar */}
      {totalItems > 0 && (
        <a href="/cart" style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: '600px',
          padding: '16px 24px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 9999,
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          textDecoration: 'none',
          color: 'inherit',
          background: 'rgba(20, 20, 20, 0.95)',
          cursor: 'pointer',
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {totalItems} item{totalItems > 1 ? 's' : ''} • 
            </span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginLeft: '4px' }}>
              ₹{totalPrice}
            </span>
          </div>
          <span style={{
            padding: '10px 28px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            color: '#fff',
            borderRadius: '12px',
            fontWeight: 700,
          }}>
            View Cart 🛒
          </span>
        </a>
      )}
    </div>
  );
}
