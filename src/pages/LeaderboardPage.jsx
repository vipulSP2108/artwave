import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart2, ArrowLeft } from 'lucide-react';
import { CATEGORIES, LEADERBOARD_PAGE_SIZE } from '../constants';
import { getActiveCycle, getSubmissions } from '../storage';
import { rankSubmissions } from '../ranking';
import { useApp } from '../AppContext';
import RankBadge from '../components/RankBadge';
import VoteButton from '../components/VoteButton';
import PhaseBanner from '../components/PhaseBanner';
import { formatDate } from '../utils';

export default function LeaderboardPage() {
  const { id } = useParams();
  const { cycleVersion } = useApp();
  const [ranked, setRanked] = useState([]);
  const [page, setPage] = useState(1);
  const cat = CATEGORIES.find(c => c.id===id);
  const cycle = getActiveCycle(id);

  const [sortedIds, setSortedIds] = useState([]);

  useEffect(() => {
    if (!cycle) return;
    const live = getSubmissions({ cycleId: cycle.id, status:'live' });
    setRanked(rankSubmissions(live));
  }, [cycle?.id, cycleVersion]);

  useEffect(() => {
    setSortedIds(ranked.map(r => r.id));
  }, [ranked.length, id]);

  if (!cat) return null;

  const stabilizedRanked = sortedIds.map(sid => ranked.find(r => r.id === sid)).filter(Boolean);
  const paged = stabilizedRanked.slice(0, page * LEADERBOARD_PAGE_SIZE);

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to={`/category/${id}`} className="inline-flex items-center gap-1.5 text-sm font-ui text-ink-500 hover:text-ink-300 mb-6">
          <ArrowLeft size={14}/> {cat.icon} {cat.label}
        </Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-black text-3xl text-ink-100 flex items-center gap-2"><BarChart2 size={24} className="text-amber-400"/> Leaderboard</h1>
            <p className="text-sm font-ui text-ink-500 mt-1">{ranked.length} submissions · Cycle #{cycle?.cycleNumber}</p>
          </div>
          {cycle && <PhaseBanner cycle={cycle}/>}
        </div>
        {ranked.length===0 ? (
          <div className="text-center py-20 text-ink-500 font-ui">No ranked submissions yet. Voting opens soon.</div>
        ) : (
          <div className="space-y-2">
            {paged.map(s => (
              <Link key={s.id} to={`/submission/${s.id}`} className="flex items-center gap-4 p-4 bg-ink-800 border border-ink-700 rounded-xl hover:border-ink-500 transition-all group">
                <RankBadge rank={s.rank}/>
                {s.contentType==='image' && s.contentUrl ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-ink-900 flex-shrink-0"><img src={s.contentUrl} alt={s.title} className="w-full h-full object-cover"/></div>
                ) : (
                  <div className="w-14 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-xl" style={{background:cat.bgGradient}}><span className="opacity-60">✍️</span></div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-ink-100 truncate group-hover:text-amber-300 transition-colors">{s.title}</h3>
                  <p className="text-xs text-ink-500 font-ui mt-0.5">@{s.username} · {formatDate(s.submittedAt)}{s.isLateEntry&&<span className="ml-2 text-purple-400">Late</span>}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0" onClick={e=>e.preventDefault()}>
                  <div className="hidden sm:block text-right">
                    <div className="font-mono font-bold text-ink-200 text-sm">{s.voteCount}</div>
                    <div className="text-xs text-ink-600 font-ui">votes</div>
                  </div>
                  <VoteButton submission={s} size="sm" onVoted={()=>{const live=getSubmissions({cycleId:cycle?.id,status:'live'});setRanked(rankSubmissions(live));}}/>
                </div>
              </Link>
            ))}
            {paged.length < ranked.length && (
              <button onClick={()=>setPage(p=>p+1)} className="w-full py-3 text-sm font-ui text-ink-400 hover:text-ink-200 border border-ink-700 hover:border-ink-500 rounded-xl transition-colors mt-4">
                Load more ({ranked.length-paged.length} remaining)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
