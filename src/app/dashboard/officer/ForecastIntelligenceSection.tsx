import React from 'react';
import { getForecastingIntelligence } from '@/lib/dashboard/get-forecast-intelligence';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

export default async function ForecastIntelligenceSection() {
  const forecastData = await getForecastingIntelligence();

  const theme = {
    goldDark: '#b88a1b',
  };

  const v = {
    surface: 'var(--surface)',
    border: 'var(--border)',
    accent: 'var(--accent)',
    accentLight: 'var(--accent-light)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    green: '#10b981',
    shadow: '0 4px 24px rgba(30,58,138,0.07)',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
      
      {/* Left Widget: Expected Price Changes */}
      <div style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
        boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: v.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📊 Forecast Volatility Tracker
          </h3>
          <span style={{ fontSize: '0.75rem', color: v.textSecondary }}>ARIMA price indicators for current catalog items</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
          {/* Expected to Increase */}
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: v.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Inflation Warning (Expected to Increase)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
              {forecastData.expectedToIncrease.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: v.textSecondary, padding: '0.25rem 0' }}>No products expected to increase.</div>
              ) : (
                forecastData.expectedToIncrease.slice(0, 3).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: v.textPrimary }}>{p.name}</span>
                    <span style={{ fontWeight: 800, color: '#dc2626', background: 'rgba(239, 68, 68, 0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <TrendingUp style={{ width: 10, height: 10 }} /> +{p.changePct.toFixed(1)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Expected to Decrease */}
          <div style={{ borderTop: `1px solid ${v.border}`, paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: v.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Savings Opportunities (Expected to Decrease)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
              {forecastData.expectedToDecrease.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: v.textSecondary, padding: '0.25rem 0' }}>No products expected to decrease.</div>
              ) : (
                forecastData.expectedToDecrease.slice(0, 3).map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 600, color: v.textPrimary }}>{p.name}</span>
                    <span style={{ fontWeight: 800, color: v.green, background: 'rgba(16, 185, 129, 0.05)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <TrendingDown style={{ width: 10, height: 10 }} /> {p.changePct.toFixed(1)}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Widget: Potential Savings KPI */}
      <div style={{
        background: v.surface,
        border: `1px solid ${v.border}`, borderRadius: '1.25rem', padding: '1.5rem',
        boxShadow: v.shadow, display: 'flex', flexDirection: 'column', gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: v.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💰 Potential Procurement Savings
          </h3>
          <span style={{ fontSize: '0.75rem', color: v.textSecondary }}>Estimated budget impact of forecast-guided buying</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.25rem', margin: '0.5rem 0', alignItems: 'baseline' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 900, color: v.accent }}>
              ₱{forecastData.potentialSavings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ background: 'rgba(30,58,138,0.05)', border: `1px solid rgba(30,58,138,0.12)`, borderRadius: '0.75rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
            <Sparkles style={{ width: 16, height: 16, color: theme.goldDark, flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.75rem', color: v.textPrimary, margin: 0, lineHeight: 1.4 }}>
              <strong>Decision Tip:</strong> Procuring products marked with <strong>BUY NOW</strong> immediately avoids upcoming price spikes. Deferring items marked with <strong>WAIT FOR PRICE DROP</strong> captures upcoming savings.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
