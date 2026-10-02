'use client';

// ============================================================
// Admin Menu Management — CRUD for menu items
// ============================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MenuItem, Category } from '@/types';

const categoryEmoji: Record<Category, string> = {
  snacks: '🍟',
  beverages: '🥤',
  meals: '🍛',
  desserts: '🍰',
};

export default function AdminMenuPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'snacks' as Category,
    image: '',
    isVeg: true,
    isAvailable: true,
    preparationTime: '10',
  });

  // Auth check
  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth !== 'true') router.push('/admin');
  }, [router]);

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (data.success) setMenuItems(data.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '', description: '', price: '', category: 'snacks',
      image: '', isVeg: true, isAvailable: true, preparationTime: '10',
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) return;

    try {
      if (editingItem) {
        await fetch(`/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            preparationTime: Number(formData.preparationTime),
          }),
        });
      } else {
        await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            price: Number(formData.price),
            preparationTime: Number(formData.preparationTime),
          }),
        });
      }
      resetForm();
      fetchMenu();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      image: item.image || '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      preparationTime: String(item.preparationTime),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      fetchMenu();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      fetchMenu();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const filteredItems = filterCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => item.category === filterCategory);

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
      <div className="animate-fade-in" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <Link href="/admin/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
            <span className="gradient-text">Menu Management</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
            {menuItems.length} items total
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { resetForm(); setShowForm(true); }}
          style={{ fontSize: '0.9rem' }}
        >
          + Add Item
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        {(['all', 'snacks', 'beverages', 'meals', 'desserts'] as const).map((cat) => (
          <button
            key={cat}
            className={`category-pill ${filterCategory === cat ? 'active' : ''}`}
            onClick={() => setFilterCategory(cat)}
          >
            {cat === 'all' ? '🍽️ All' : `${categoryEmoji[cat]} ${cat.charAt(0).toUpperCase() + cat.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200, padding: '20px',
        }} onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="card animate-fade-in-up" style={{
            padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>
              {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input className="input" placeholder="Item name *" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

              <textarea className="input" placeholder="Description" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ minHeight: '80px', resize: 'vertical' }} />

              <div style={{ display: 'flex', gap: '12px' }}>
                <input className="input" type="number" placeholder="Price (₹) *" value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  style={{ flex: 1 }} />
                <input className="input" type="number" placeholder="Prep time (min)" value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  style={{ flex: 1 }} />
              </div>

              <select className="input" value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}>
                <option value="snacks">🍟 Snacks</option>
                <option value="beverages">🥤 Beverages</option>
                <option value="meals">🍛 Meals</option>
                <option value="desserts">🍰 Desserts</option>
              </select>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  📷 Image URL (paste a link to a food photo)
                </label>
                <input className="input" placeholder="https://example.com/food-photo.jpg" value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
                {formData.image && (
                  <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.image} alt="Preview" style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  fontSize: '0.9rem', color: 'var(--text-secondary)',
                }}>
                  <input type="checkbox" checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    style={{ accentColor: 'var(--veg)', width: '18px', height: '18px' }} />
                  Vegetarian
                </label>
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                  fontSize: '0.9rem', color: 'var(--text-secondary)',
                }}>
                  <input type="checkbox" checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }} />
                  Available
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button className="btn-secondary" onClick={resetForm} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleSubmit} style={{ flex: 1 }}>
                  {editingItem ? 'Update' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu items table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.map((item, i) => (
          <div key={item.id} className="card" style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            animation: `fadeIn 0.3s ease-out ${i * 0.03}s both`,
            opacity: item.isAvailable ? 1 : 0.5,
          }}>
            {/* Icon */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: `linear-gradient(135deg, hsl(${(i * 50) % 360}, 50%, 15%), hsl(${(i * 50 + 40) % 360}, 40%, 10%))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', flexShrink: 0,
            }}>
              {categoryEmoji[item.category]}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={item.isVeg ? 'veg-badge' : 'nonveg-badge'} style={{ width: '14px', height: '14px' }} />
                <span style={{ fontWeight: 700, fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem' }}>
                  {item.name}
                </span>
                {!item.isAvailable && (
                  <span style={{
                    fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(239,68,68,0.1)',
                    color: '#ef4444', borderRadius: '6px', fontWeight: 600,
                  }}>
                    UNAVAILABLE
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.description}
              </p>
            </div>

            {/* Price */}
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem', fontFamily: 'Outfit, sans-serif', whiteSpace: 'nowrap' }}>
              ₹{item.price}
            </span>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              <button onClick={() => toggleAvailability(item)} className="btn-ghost"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                {item.isAvailable ? '🟢' : '🔴'}
              </button>
              <button onClick={() => handleEdit(item)} className="btn-ghost"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}>
                ✏️
              </button>
              <button onClick={() => handleDelete(item.id)} className="btn-ghost"
                style={{ fontSize: '0.8rem', padding: '6px 10px', color: '#ef4444' }}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
