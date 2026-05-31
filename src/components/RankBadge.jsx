export default function RankBadge({ rank }) {
  if (!rank) return null;
  const cfg = rank === 1 ? { bg: 'from-yellow-400 to-amber-500', text: '#000', label: '🥇' }
    : rank === 2 ? { bg: 'from-gray-300 to-gray-400', text: '#000', label: '🥈' }
    : rank === 3 ? { bg: 'from-amber-600 to-amber-800', text: '#fff', label: '🥉' }
    : { bg: 'from-ink-600 to-ink-700', text: '#aaa', label: `#${rank}` };
  return (
    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${cfg.bg}
      text-sm font-bold font-mono shadow-lg flex-shrink-0`}
      style={{ color: cfg.text }}>
      {rank <= 3 ? cfg.label : <span className="text-xs">{rank}</span>}
    </div>
  );
}
