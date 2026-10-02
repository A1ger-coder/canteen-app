'use client';

// ============================================================
// Admin QR Code Generator — generate printable QR codes
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function AdminQRPage() {
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');
  const [tableCount, setTableCount] = useState(10);
  const [qrCodes, setQrCodes] = useState<{ table: number; dataUrl: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (auth !== 'true') router.push('/admin');
  }, [router]);

  // Auto-detect base URL
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const generateQRCodes = async () => {
    setGenerating(true);
    const codes: { table: number; dataUrl: string }[] = [];

    for (let i = 1; i <= tableCount; i++) {
      const url = `${baseUrl}/menu?table=${i}`;
      try {
        const dataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        });
        codes.push({ table: i, dataUrl });
      } catch (error) {
        console.error(`Error generating QR for table ${i}:`, error);
      }
    }

    setQrCodes(codes);
    setGenerating(false);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QuickBite QR Codes</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
            .qr-card {
              border: 2px solid #ddd; border-radius: 12px; padding: 20px;
              text-align: center; page-break-inside: avoid;
            }
            .qr-card img { width: 180px; height: 180px; }
            .brand { font-size: 18px; font-weight: 800; color: #f97316; margin-bottom: 6px; }
            .table-num { font-size: 24px; font-weight: 900; margin: 8px 0; }
            .scan-text { font-size: 11px; color: #888; }
            @media print {
              .grid { grid-template-columns: repeat(3, 1fr); }
            }
          </style>
        </head>
        <body>
          <div class="grid">
            ${qrCodes.map((qr) => `
              <div class="qr-card">
                <div class="brand">🍽️ QuickBite</div>
                <img src="${qr.dataUrl}" alt="Table ${qr.table} QR" />
                <div class="table-num">Table ${qr.table}</div>
                <div class="scan-text">Scan to order food</div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '28px' }}>
        <Link href="/admin/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginTop: '8px' }}>
          <span className="gradient-text">QR Code Generator</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem' }}>
          Generate printable QR codes for each table
        </p>
      </div>

      {/* Config */}
      <div className="card animate-fade-in" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, marginBottom: '16px' }}>
          ⚙️ Configuration
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 300px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Base URL
            </label>
            <input
              className="input"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-domain.com"
            />
          </div>
          <div style={{ flex: '0 0 150px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Number of Tables
            </label>
            <input
              className="input"
              type="number"
              min="1"
              max="50"
              value={tableCount}
              onChange={(e) => setTableCount(parseInt(e.target.value) || 1)}
            />
          </div>
          <button
            className="btn-primary"
            onClick={generateQRCodes}
            disabled={generating}
            style={{ padding: '12px 24px', opacity: generating ? 0.7 : 1 }}
          >
            {generating ? 'Generating...' : '🔲 Generate QR Codes'}
          </button>
        </div>
      </div>

      {/* QR Codes grid */}
      {qrCodes.length > 0 && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700 }}>
              📱 Generated QR Codes ({qrCodes.length})
            </h3>
            <button className="btn-primary" onClick={handlePrint} style={{ fontSize: '0.85rem' }}>
              🖨️ Print All
            </button>
          </div>

          <div ref={printRef} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}>
            {qrCodes.map((qr, i) => (
              <div key={qr.table} className="card" style={{
                padding: '24px',
                textAlign: 'center',
                animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both`,
              }}>
                <p style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary)',
                  marginBottom: '12px',
                }}>
                  🍽️ QuickBite
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.dataUrl}
                  alt={`Table ${qr.table} QR Code`}
                  style={{
                    width: '180px',
                    height: '180px',
                    margin: '0 auto',
                    borderRadius: '12px',
                    display: 'block',
                  }}
                />
                <p style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  marginTop: '12px',
                }}>
                  Table {qr.table}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Scan to order food
                </p>
                <a
                  href={qr.dataUrl}
                  download={`table-${qr.table}-qr.png`}
                  className="btn-ghost"
                  style={{ marginTop: '8px', fontSize: '0.8rem', display: 'inline-block' }}
                >
                  ⬇️ Download
                </a>
              </div>
            ))}
          </div>
        </>
      )}

      {qrCodes.length === 0 && !generating && (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔲</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Configure and generate QR codes above
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>
            Each QR code will link to the menu page with the table number pre-filled
          </p>
        </div>
      )}
    </div>
  );
}
