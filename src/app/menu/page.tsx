import { Suspense } from 'react';
import MenuPageContent from './MenuPageContent';

export default function MenuPage() {
  return (
    <Suspense fallback={
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
    }>
      <MenuPageContent />
    </Suspense>
  );
}
