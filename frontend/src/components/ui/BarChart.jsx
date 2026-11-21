import React, { useState } from 'react';

// Single-series column chart: one hue (--chart), no legend (the title names it),
// 4px rounded tops on the baseline, 2px gaps, recessive axis, hover tooltip,
// and a table view for screen readers and anyone who wants the numbers.
export default function BarChart({ data, xKey = 'year', yKey = 'count', title, unit = '', height = 140 }) {
  const [hover, setHover] = useState(null);
  const [table, setTable] = useState(false);
  if (!data?.length) return null;
  const max = Math.max(...data.map((d) => d[yKey]), 1);
  const n = data.length;
  const W = 100; // percentage-based viewBox width
  // Thin marks: at most ~62% of each slot, and never wider than 7% of the plot.
  const slot = W / n;
  const bw = Math.min(slot * 0.62, 7);
  const fmt = (v) => v.toLocaleString();

  return (
    <figure className="relative">
      <figcaption className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium text-ink-2">{title}</span>
        <button onClick={() => setTable(!table)} className="text-2xs text-ink-3 underline-offset-2 hover:text-ink hover:underline">
          {table ? 'Chart' : 'Table'}
        </button>
      </figcaption>
      {table ? (
        <div className="max-h-48 overflow-y-auto rounded-lg border border-rule">
          <table className="w-full text-xs">
            <thead className="bg-sunken text-ink-2"><tr><th className="px-3 py-1.5 text-left font-medium">{xKey}</th><th className="px-3 py-1.5 text-right font-medium">{unit || yKey}</th></tr></thead>
            <tbody>{data.map((d) => <tr key={d[xKey]} className="border-t border-rule"><td className="px-3 py-1">{d[xKey]}</td><td className="px-3 py-1 text-right font-mono">{fmt(d[yKey])}</td></tr>)}</tbody>
          </table>
        </div>
      ) : (
        <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} 100`} preserveAspectRatio="none" className="h-full w-full overflow-visible" role="img" aria-label={`${title}: ${data.map((d) => `${d[xKey]} ${d[yKey]}`).join(', ')}`}>
            {[0.5, 1].map((t) => (
              <line key={t} x1="0" x2={W} y1={100 - t * 96} y2={100 - t * 96} stroke="rgb(var(--rule))" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
            ))}
            {data.map((d, i) => {
              const h = Math.max((d[yKey] / max) * 96, d[yKey] > 0 ? 1.5 : 0);
              const x = i * slot + (slot - bw) / 2;
              return (
                <g key={d[xKey]} onMouseEnter={() => setHover(i)}>
                  <rect x={i * (W / n)} y="0" width={W / n} height="100" fill="transparent" />
                  <path
                    d={`M${x} 100 V${100 - h + 2} Q${x} ${100 - h} ${x + 1} ${100 - h} H${x + bw - 1} Q${x + bw} ${100 - h} ${x + bw} ${100 - h + 2} V100 Z`}
                    fill="rgb(var(--chart))"
                    opacity={hover === null || hover === i ? 1 : 0.45}
                    style={{ transition: 'opacity .15s' }}
                  />
                </g>
              );
            })}
            <line x1="0" x2={W} y1="100" y2="100" stroke="rgb(var(--ink-3))" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          </svg>
          {hover !== null && (
            <div
              className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-ink px-2 py-1 text-2xs text-paper shadow-lift"
              style={{ left: `${((hover + 0.5) / n) * 100}%` }}
            >
              <b className="font-medium">{data[hover][xKey]}</b> · {fmt(data[hover][yKey])} {unit}
            </div>
          )}
          <div className="mt-1 flex justify-between font-mono text-[0.6rem] text-ink-3">
            <span>{data[0][xKey]}</span>
            <span>{data[n - 1][xKey]}</span>
          </div>
        </div>
      )}
    </figure>
  );
}
