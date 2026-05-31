import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getHOF } from '../storage';
import { CATEGORIES, HALL_OF_FAME_PER_PAGE } from '../constants';
import { formatDate } from '../utils';

function HOFCard({ entry }) {
  const cat = CATEGORIES.find(c => c.id === entry.categoryId);
  return (
    <Link to={`/submission/${entry.submissionId}`}
      className="group bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden
      hover:border-ink-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
      {/* Thumbnail */}
      {entry.contentType === 'image' && entry.contentUrl ? (
        <div className="relative h-48 bg-ink-900 overflow-hidden">
          <img src={entry.contentUrl} alt={entry.title}
            className="w-full h-full object-contain relative z-10" />
          <img src={entry.contentUrl} alt="" aria-hidden
            className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent z-10" />
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1
            bg-amber-500 rounded-full text-xs font-ui font-bold text-black">
            <Trophy size={11} /> #1
          </div>
        </div>
      ) : (
        <div className="h-48 relative flex items-center justify-center overflow-hidden"
          style={{ background: cat?.bgGradient }}>
          <div className="absolute inset-0 bg-ink-900/60" />
          <p className="relative z-10 font-body text-sm text-ink-200 px-6 text-center
            line-clamp-4 italic">
            "{entry.contentText?.slice(0, 150)}…"
          </p>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1
            bg-amber-500 rounded-full text-xs font-ui font-bold text-black">
            <Trophy size={11} /> #1
          </div>
        </div>
      )}

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">{cat?.icon}</span>
          <span className="text-xs font-ui font-semibold" style={{ color: cat?.accentColor }}>
            {cat?.label} · Cycle #{entry.cycleNumber}
          </span>
        </div>
        <h3 className="font-display font-bold text-ink-100 group-hover:text-amber-300
          transition-colors leading-tight mb-1">{entry.title}</h3>
        <p className="text-xs text-ink-400 font-ui">
          by <span className="text-ink-300">@{entry.username}</span>
          <span className="mx-1">·</span>
          <span className="text-amber-400 font-mono font-bold">{entry.finalVoteCount}</span>
          <span className="text-ink-600"> votes</span>
        </p>
        <p className="text-xs text-ink-600 font-mono mt-1">{formatDate(entry.archivedAt)}</p>
      </div>
    </Link>
  );
}

export default function HallOfFamePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const allEntries = getHOF();
  const filtered = activeCategory === 'all' ? allEntries
    : allEntries.filter(e => e.categoryId === activeCategory);
  const paged = filtered.slice(0, page * HALL_OF_FAME_PER_PAGE);

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 py-12 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
            bg-amber-500/10 border border-amber-500/20 mb-4">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <h1 className="font-display font-black text-4xl text-ink-100 mb-2">Hall of Fame</h1>
          <p className="font-body text-ink-400 text-lg italic">
            Every winning work, preserved forever.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button onClick={() => { setActiveCategory('all'); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-ui font-semibold transition-colors
              ${activeCategory === 'all' ? 'bg-amber-500 text-black' : 'bg-ink-800 border border-ink-600 text-ink-400 hover:text-ink-200'}`}>
            All
          </button>
          {CATEGORIES.filter(c => c.active).map(cat => (
            <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-ui
                font-semibold transition-colors
                ${activeCategory === cat.id
                  ? 'text-black'
                  : 'bg-ink-800 border border-ink-600 text-ink-400 hover:text-ink-200'}`}
              style={activeCategory === cat.id ? { backgroundColor: cat.accentColor } : {}}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {paged.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={48} className="text-ink-700 mx-auto mb-4" />
            <p className="font-ui text-ink-500">No winners yet. The first cycle is underway!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {paged.map(entry => <HOFCard key={entry.id} entry={entry} />)}
            </div>
            {paged.length < filtered.length && (
              <button onClick={() => setPage(p => p + 1)}
                className="w-full mt-8 py-3 text-sm font-ui text-ink-400 hover:text-ink-200
                border border-ink-700 hover:border-ink-500 rounded-xl transition-colors">
                Load more
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
