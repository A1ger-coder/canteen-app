'use client';

// ============================================================
// Admin Feedback Page — view all customer reviews & ratings
// ============================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Feedback } from '@/types';

export default function AdminFeedbackPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth !== 'true') router.push('/admin');
  }, [router]);

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      if (data.success) setFeedbacks(data.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    const interval = setInterval(fetchFeedback, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredFeedbacks = filterRating === 'all'
    ? feedbacks
    : feedbacks.filter((fb) => fb.rating === filterRating);

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: feedbacks.filter((fb) => fb.rating === star).length,
    percent: feedbacks.length > 0
      ? Math.round((feedbacks.filter((fb) => fb.rating === star).length / feedbacks.length) * 100)
      : 0,
  }));

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
          <span className="gradient-text">Customer Feedback</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
          {feedbacks.length} total reviews from customers
        </p>
      </div>

      {/* Stats Overview */}
      <div className="animate-fade-in" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {/* Average Rating Card */}
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '8px' }}>
            Average Rating
          </p>
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#f59e0b',
          }}>
            ⭐ {avgRating}
          </p>
        </div>

        {/* Total Reviews Card */}
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '8px' }}>
            Total Reviews
          </p>
          <p style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '2.5rem',
            fontWeight: 800,
            color: '#6366f1',
          }}>
            {feedbacks.length}
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="card" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500, marginBottom: '14px' }}>
            Rating Distribution
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ratingDistribution.map(({ star, count, percent }) => (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                <span style={{ width: '50px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {star} ⭐
                </span>
                <div style={{
                  flex: 1,
                  height: '8px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <span style={{ width: '45px', textAlign: 'right', color: 'var(--text-muted)' }}>
                  {count} ({percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`category-pill ${filterRating === 'all' ? 'active' : ''}`}
          onClick={() => setFilterRating('all')}
        >
          🍽️ All ({feedbacks.length})
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            className={`category-pill ${filterRating === star ? 'active' : ''}`}
            onClick={() => setFilterRating(star)}
          >
            {'⭐'.repeat(star)} ({feedbacks.filter((fb) => fb.rating === star).length})
          </button>
        ))}
      </div>

      {/* Feedback List */}
      {filteredFeedbacks.length === 0 ? (
        <div className="card" style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
          <p style={{ color: 'var(--text-muted)' }}>
            {filterRating === 'all' ? 'No feedback received yet' : `No ${filterRating}-star reviews`}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {filteredFeedbacks.map((fb, i) => (
            <div key={fb.id} className="card" style={{
              padding: '20px',
              animation: `fadeIn 0.3s ease-out ${i * 0.04}s both`,
              borderLeft: `3px solid ${
                fb.rating >= 4 ? '#10b981' : fb.rating === 3 ? '#f59e0b' : '#ef4444'
              }`,
            }}>
              {/* Stars + Order ID */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {'⭐'.repeat(fb.rating)}
                  {'☆'.repeat(5 - fb.rating)}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '6px',
                }}>
                  Order #{fb.orderId.slice(0, 8)}
                </span>
              </div>

              {/* Comment */}
              {fb.comment ? (
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  marginBottom: '12px',
                }}>
                  &quot;{fb.comment}&quot;
                </p>
              ) : (
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  marginBottom: '12px',
                }}>
                  No written comment provided.
                </p>
              )}

              {/* Timestamp */}
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textAlign: 'right',
                borderTop: '1px solid var(--border)',
                paddingTop: '10px',
              }}>
                📅 {new Date(fb.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
