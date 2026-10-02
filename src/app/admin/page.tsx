'use client';

// ============================================================
// Admin Login Page — PIN-based authentication
// ============================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async () => {
    if (!pin) {
      setError('Please enter the admin PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('admin-auth', 'true');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid PIN. Try again.');
        setPin('');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-primary)',
    }}>
      {/* Background orbs */}
      <div style={{
        position: 'fixed',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
        top: '20%',
        right: '10%',
        filter: 'blur(60px)',
      }} />

      <div className="card animate-fade-in-up" style={{
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 800,
          marginBottom: '8px',
        }}>
          Admin Access
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          marginBottom: '32px',
        }}>
          Enter the admin PIN to continue
        </p>

        <input
          type="password"
          className="input"
          placeholder="Enter PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={6}
          style={{
            textAlign: 'center',
            fontSize: '1.5rem',
            letterSpacing: '12px',
            marginBottom: '16px',
          }}
          autoFocus
        />

        {error && (
          <div style={{
            padding: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '1rem',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Verifying...' : 'Login'}
        </button>

        <p style={{
          marginTop: '24px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}>
          Default PIN: <code style={{
            background: 'var(--bg-secondary)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontWeight: 600,
          }}>1234</code>
        </p>
      </div>
    </div>
  );
}
