import React, { useState } from 'react';
import type { HistoricalMeasurement } from '../types/dashboard';

interface Props {
  data: HistoricalMeasurement[];
}

export default function HistoricalMetricsChart({ data }: Props) {
  const [metricType, setMetricType] = useState<'uptime' | 'responseTimeMs' | 'lcp'>('uptime');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <p>No hay mediciones históricas registradas.</p>;
  }

  const values = data.map(d => d[metricType]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Calculate points
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const norm = (d[metricType] - minVal) / range;
    const y = padding.top + chartH - (norm * chartH);
    return { x, y, val: d[metricType], date: d.timestamp };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const getMetricLabel = () => {
    switch (metricType) {
      case 'uptime': return 'Disponibilidad / Uptime (%)';
      case 'responseTimeMs': return 'Tiempo de Respuesta HTTP (ms)';
      case 'lcp': return 'Largest Contentful Paint - LCP (s)';
    }
  };

  const getMetricColor = () => {
    switch (metricType) {
      case 'uptime': return 'var(--color-status-success)';
      case 'responseTimeMs': return 'var(--color-status-info)';
      case 'lcp': return 'var(--color-brand-red)';
    }
  };

  return (
    <div className="m3-card" style={{ padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0 }}>Evolución Histórica (Últimos 30 Días)</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
            {getMetricLabel()}
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-1)', backgroundColor: 'var(--md-sys-color-surface-container-high)', padding: '3px', borderRadius: 'var(--md-shape-full)' }}>
          <button
            type="button"
            className="m3-btn"
            style={{
              minHeight: '28px',
              padding: '2px 10px',
              fontSize: '11px',
              backgroundColor: metricType === 'uptime' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: metricType === 'uptime' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)'
            }}
            onClick={() => setMetricType('uptime')}
          >
            Uptime (%)
          </button>
          <button
            type="button"
            className="m3-btn"
            style={{
              minHeight: '28px',
              padding: '2px 10px',
              fontSize: '11px',
              backgroundColor: metricType === 'responseTimeMs' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: metricType === 'responseTimeMs' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)'
            }}
            onClick={() => setMetricType('responseTimeMs')}
          >
            Latencia (ms)
          </button>
          <button
            type="button"
            className="m3-btn"
            style={{
              minHeight: '28px',
              padding: '2px 10px',
              fontSize: '11px',
              backgroundColor: metricType === 'lcp' ? 'var(--md-sys-color-primary)' : 'transparent',
              color: metricType === 'lcp' ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-on-surface)'
            }}
            onClick={() => setMetricType('lcp')}
          >
            LCP (seg)
          </button>
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          role="img"
          aria-label={`Gráfico de tendencia histórica para ${getMetricLabel()}`}
        >
          {/* Grid lines */}
          <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} stroke="var(--md-sys-color-outline-variant)" strokeDasharray="3 3" />
          <line x1={padding.left} y1={padding.top + chartH / 2} x2={width - padding.right} y2={padding.top + chartH / 2} stroke="var(--md-sys-color-outline-variant)" strokeDasharray="3 3" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="var(--md-sys-color-outline)" strokeWidth="1.5" />

          {/* Y Axis labels */}
          <text x={padding.left - 8} y={padding.top + 4} fill="var(--md-sys-color-on-surface-variant)" fontSize="10" textAnchor="end" fontWeight="bold">
            {maxVal.toFixed(1)}
          </text>
          <text x={padding.left - 8} y={padding.top + chartH / 2 + 4} fill="var(--md-sys-color-on-surface-variant)" fontSize="10" textAnchor="end">
            {((maxVal + minVal) / 2).toFixed(1)}
          </text>
          <text x={padding.left - 8} y={height - padding.bottom + 4} fill="var(--md-sys-color-on-surface-variant)" fontSize="10" textAnchor="end">
            {minVal.toFixed(1)}
          </text>

          {/* Area fill */}
          <polygon
            points={`${padding.left},${height - padding.bottom} ${polylinePoints} ${width - padding.right},${height - padding.bottom}`}
            fill={getMetricColor()}
            fillOpacity="0.12"
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke={getMetricColor()}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Points */}
          {points.map((p, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 3}
                  fill={isHovered ? 'var(--md-sys-color-surface)' : getMetricColor()}
                  stroke={getMetricColor()}
                  strokeWidth={isHovered ? 3 : 1.5}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                {/* Date labels on X axis for key points */}
                {idx % 5 === 0 && (
                  <text
                    x={p.x}
                    y={height - padding.bottom + 18}
                    fill="var(--md-sys-color-on-surface-variant)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {p.date}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && points[hoverIndex] && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: `${(points[hoverIndex].x / width) * 100}%`,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--md-sys-color-surface-container-highest)',
              color: 'var(--md-sys-color-on-surface)',
              border: '1px solid var(--md-sys-color-outline)',
              borderRadius: 'var(--md-shape-sm)',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 700,
              boxShadow: 'var(--md-sys-elevation-2)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10
            }}
          >
            {points[hoverIndex].date}: {points[hoverIndex].val} {metricType === 'uptime' ? '%' : metricType === 'responseTimeMs' ? 'ms' : 's'}
          </div>
        )}
      </div>
    </div>
  );
}
