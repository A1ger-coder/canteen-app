'use client';

// ============================================================
// Landing Page — Hero with QR code scanning CTA
// ============================================================

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}>
        {/* Background gradient orbs */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
          top: '10%',
          left: '-10%',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          bottom: '10%',
          right: '-5%',
          filter: 'blur(60px)',
        }} />

        {/* Floating food emojis */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', fontSize: '2rem', animation: 'float 3s ease-in-out infinite' }}>🍕</div>
        <div style={{ position: 'absolute', top: '25%', right: '12%', fontSize: '1.8rem', animation: 'float 3s ease-in-out 0.5s infinite' }}>☕</div>
        <div style={{ position: 'absolute', bottom: '25%', left: '15%', fontSize: '2.2rem', animation: 'float 3s ease-in-out 1s infinite' }}>🍔</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', fontSize: '1.5rem', animation: 'float 3s ease-in-out 1.5s infinite' }}>🧁</div>
        <div style={{ position: 'absolute', top: '40%', left: '5%', fontSize: '1.4rem', animation: 'float 3s ease-in-out 0.8s infinite' }}>🥗</div>

        {/* Main content */}
        <div className="animate-fade-in-up" style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '16px',
            animation: 'float 4s ease-in-out infinite',
          }}>
            🍽️
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '16px',
          }}>
            <span className="gradient-text">QuickBite</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '12px',
            fontWeight: 500,
          }}>
            College & Office Canteen Ordering
          </p>

          <p style={{
            fontSize: '0.95rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            marginBottom: '40px',
            maxWidth: '480px',
            margin: '0 auto 40px',
          }}>
            Scan the QR code at your table, browse the menu, place your order, 
            and get notified when it&apos;s ready. No queues, no hassle.
          </p>

          {/* CTA buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link href="/menu" className="btn-primary animate-pulse-glow" style={{
              padding: '16px 40px',
              fontSize: '1.1rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}>
              📋 View Menu
            </Link>

            <Link href="/admin" className="btn-secondary" style={{
              padding: '16px 32px',
              fontSize: '1rem',
              borderRadius: '16px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              👨‍💼 Admin Panel
            </Link>
          </div>
        </div>

        {/* How it works section */}
        <div className="animate-fade-in" style={{
          position: 'relative',
          zIndex: 1,
          marginTop: '80px',
          width: '100%',
          maxWidth: '900px',
        }}>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '32px',
            color: 'var(--text-secondary)',
          }}>
            How it works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: '📱', title: 'Scan QR Code', desc: 'Scan the QR code placed at your table' },
              { icon: '📋', title: 'Browse Menu', desc: 'Explore our wide variety of dishes' },
              { icon: '🛒', title: 'Place Order', desc: 'Add items to cart and checkout' },
              { icon: '🔔', title: 'Get Notified', desc: 'Track your order and pick up when ready' },
            ].map((step, i) => (
              <div key={i} className="card" style={{
                padding: '28px 20px',
                textAlign: 'center',
                animation: `fadeInUp 0.5s ease-out ${0.2 + i * 0.1}s both`,
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{step.icon}</div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  marginBottom: '8px',
                  letterSpacing: '2px',
                }}>
                  STEP {i + 1}
                </div>
                <h3 style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginBottom: '8px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
