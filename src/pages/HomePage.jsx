import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy, Zap } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { computePhase, getPhaseEnd } from '../cycle';
import { getActiveTeaser, getActiveCycle } from '../storage';
import PhaseBanner from '../components/PhaseBanner';

function TeaserCard({ catId }) {
  const cat = CATEGORIES.find(c => c.id === catId);
  const teaser = getActiveTeaser(catId);
  const cycle = getActiveCycle(catId);
  if (!cat) return null;
  return (
    <div className="relative rounded-2xl overflow-hidden border border-ink-700 group hover:border-ink-500 transition-all duration-300">
      {teaser && teaser.contentType === 'image' ? (
        <div className="relative h-64 bg-ink-900">
          <img src={teaser.contentUrl} alt={teaser.title} className="w-full h-full object-contain relative z-10" />
          <img src={teaser.contentUrl} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent z-10" />
        </div>
      ) : teaser && teaser.contentType === 'text' ? (
        <div className="h-64 relative flex items-center justify-center overflow-hidden" style={{ background: cat.bgGradient }}>
          <div className="absolute inset-0 bg-ink-900/60" />
          <p className="relative z-10 font-body text-sm text-ink-200 px-6 text-center leading-relaxed line-clamp-6 italic">
            "{teaser.contentText?.slice(0, 200)}…"
          </p>
        </div>
      ) : (
        <div className="h-64 relative flex items-center justify-center overflow-hidden" style={{ background: cat.bgGradient }}>
          <div className="absolute inset-0 bg-ink-900/70" />
          <span className="text-7xl opacity-10 relative z-10">{cat.icon}</span>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{cat.icon}</span>
          <span className="font-ui font-bold text-sm" style={{ color: cat.accentColor }}>{cat.label}</span>
          {teaser && <span className="ml-auto flex items-center gap-1 text-xs font-ui text-amber-400"><Trophy size={11} /> Last Winner</span>}
        </div>
        {teaser ? (
          <>
            <h3 className="font-display font-bold text-ink-100 text-lg leading-tight">{teaser.title}</h3>
            <p className="text-xs text-ink-400 font-ui mt-1">by @{teaser.username} · {teaser.finalVoteCount} votes</p>
          </>
        ) : (
          <p className="font-ui text-ink-400 text-sm italic">{cat.tagline}</p>
        )}
        {cycle && (
          <div className="mt-3 flex items-center justify-between">
            <PhaseBanner cycle={cycle} />
            <Link to={`/category/${catId}`} className="flex items-center gap-1 text-xs font-ui font-semibold hover:gap-2 transition-all" style={{ color: cat.accentColor }}>
              Explore <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="min-h-screen bg-ink-950">
      <section className="relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center relative">
          <div className={`transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-full text-xs font-ui font-semibold text-amber-400 mb-6">
              <Zap size={11} /> Community-Powered Art Showcase
            </span>
            <h1 className="font-display font-black text-5xl md:text-7xl text-ink-100 leading-none tracking-tight mb-4">
              Where Art<br /><span className="text-amber-400">Finds Its Voice</span>
            </h1>
            <p className="font-body text-ink-400 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              Submit your work. The community votes. Winners are immortalised. A new cycle, every time.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {CATEGORIES.filter(c => c.active).map(cat => (
                <Link key={cat.id} to={`/category/${cat.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-ui font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: cat.bgGradient, border: `1px solid ${cat.accentColor}44`, color: cat.accentColor }}>
                  {cat.icon} {cat.label}
                </Link>
              ))}
              <Link to="/halloffame" className="flex items-center gap-2 px-5 py-2.5 rounded-full font-ui font-semibold text-sm border border-ink-600 text-ink-300 hover:border-ink-400 hover:text-ink-100 transition-all duration-200 hover:-translate-y-0.5">
                🏆 Hall of Fame
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[{ n:'01', t:'Submit', d:'5-day window. One entry per cycle.', i:'✦' },
            { n:'02', t:'Vote',   d:'Community votes during the 30-day live period.', i:'♥' },
            { n:'03', t:'Win',    d:'Top-ranked work enters the Hall of Fame.', i:'◆' }].map(s => (
            <div key={s.n} className="text-center p-4">
              <div className="font-mono text-3xl text-amber-400/30 font-black mb-2">{s.i}</div>
              <div className="font-mono text-xs text-amber-400 mb-1">{s.n}</div>
              <div className="font-display font-bold text-ink-100 mb-1">{s.t}</div>
              <div className="font-ui text-ink-500 text-xs leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="font-display font-bold text-2xl text-ink-200 mb-6">Active Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.filter(c => c.active).map(cat => <TeaserCard key={cat.id} catId={cat.id} />)}
        </div>
      </section>
    </div>
  );
}
