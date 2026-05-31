import { useState, useEffect } from 'react';
import { formatCountdown } from '../utils';

export default function Countdown({ targetDate, label = 'Closes in' }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const c = formatCountdown(targetDate);
  if (c.expired) return null;
  const parts = c.days > 0
    ? [{ v: c.days, l: 'days' }, { v: c.hrs, l: 'hrs' }, { v: c.mins, l: 'min' }, { v: c.secs, l: 'sec' }]
    : [{ v: c.hrs, l: 'hrs' }, { v: c.mins, l: 'min' }, { v: c.secs, l: 'sec' }];
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
      <span className="text-ink-400 font-ui">{label}</span>
      {parts.map(({ v, l }) => (
        <span key={l} className="flex items-center gap-0.5">
          <span className="bg-ink-700 px-1.5 py-0.5 rounded text-amber-300 font-bold tabular-nums">
            {String(v).padStart(2, '0')}
          </span>
          <span className="text-ink-500">{l}</span>
        </span>
      ))}
    </div>
  );
}
