import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

// Custom sleek light tooltip
function CustomTooltip({ active, payload, label, unit, title }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--panel-border)',
          borderRadius: '10px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
            {title || payload[0].name}:
          </span>
          <span
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: payload[0].color || '#2B8A62',
            }}
          >
            {payload[0].value}
          </span>
          {unit && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unit}</span>}
        </div>
      </div>
    );
  }
  return null;
}

export default function HealthChart({
  title,
  data = [],
  dataKey,
  color = '#2B8A62',
  secondaryColor = '#57C99A',
  unit = '',
  type = 'area', // 'area', 'bar', 'line'
  targetValue = null,
  targetLabel = '',
  height = 240,
  isDemo = false,
}) {
  const gradientId = `grad-${dataKey}-${Math.random().toString(36).substr(2, 4)}`;

  // Format date labels nicely (e.g., '10/12' or 'Oct 12')
  const formattedData = data.map((d) => {
    let dateStr = d.date;
    try {
      const parts = d.date.split('-');
      if (parts.length === 3) {
        dateStr = `${parts[1]}/${parts[2]}`;
      }
    } catch (e) {
      // keep raw date
    }
    return {
      ...d,
      displayDate: dateStr,
    };
  });

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {title}
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Historical 14-day tracking pattern
          </span>
        </div>
        {isDemo && (
          <span className="badge-demo" title="Showing realistic simulated demo records">
            Demo Data
          </span>
        )}
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' ? (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                  <stop offset="100%" stopColor={secondaryColor} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#DFEAE2" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip unit={unit} title={title} />} />
              {targetValue && (
                <ReferenceLine
                  y={targetValue}
                  stroke="#2B8A62"
                  strokeDasharray="4 4"
                  label={{ value: targetLabel, fill: 'var(--text-muted)', fontSize: 10, position: 'top' }}
                />
              )}
              <Bar dataKey={dataKey} fill={`url(#${gradientId})`} radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#DFEAE2" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip unit={unit} title={title} />} />
              {targetValue && (
                <ReferenceLine
                  y={targetValue}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  label={{ value: targetLabel, fill: 'var(--text-muted)', fontSize: 10, position: 'top' }}
                />
              )}
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                dot={{ r: 3, fill: color, stroke: '#FFFFFF', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#FFFFFF', stroke: color, strokeWidth: 3 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#DFEAE2" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="displayDate" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip unit={unit} title={title} />} />
              {targetValue && (
                <ReferenceLine
                  y={targetValue}
                  stroke="#2563EB"
                  strokeDasharray="4 4"
                  label={{ value: targetLabel, fill: 'var(--text-muted)', fontSize: 10, position: 'top' }}
                />
              )}
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.2}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
