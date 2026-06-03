import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Plus, BarChart2, Flame } from 'lucide-react';
import { CATEGORIES, PHASE } from '../constants';
import { computePhase, canSubmit } from '../cycle';
import { getActiveCycle, getSubmissions } from '../storage';
import { rankSubmissions, getTrending } from '../ranking';
import { useApp } from '../AppContext';
import PhaseBanner from '../components/PhaseBanner';
import SubmissionCard from '../components/SubmissionCard';

export default function CategoryPage() {
  const { id } = useParams();
  const { user, cycleVersion } = useApp();
  const [submissions, setSubmissions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [sortBy, setSortBy] = useState('rank');
  const [filter, setFilter] = useState('all');
  const cat = CATEGORIES.find(c => c.id === id);
  const cycle = getActiveCycle(id);
  const phase = cycle ? computePhase(cycle) : null;

  const loadData = useCallback(() => {
    if (!cycle) return;
    const live = getSubmissions({ categoryId: id, cycleId: cycle.id, status: 'live' });
    const ranked = rankSubmissions(live);
    setSubmissions(ranked);
    setTrending(getTrending(ranked, 3));
  }, [id, cycle?.id, cycleVersion]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!cat) return <div className="p-8 text-center text-ink-400 font-ui">Category not found</div>;

  const submitCheck = canSubmit(cycle, user?.id, id);
  const isLive = phase === PHASE.LIVE || phase === PHASE.LATE_SUBMISSION || phase === PHASE.LATE_REVIEW;
  const isSubmission = phase === PHASE.SUBMISSION || phase === PHASE.LATE_SUBMISSION;

  const [sortedIds, setSortedIds] = useState([]);

  useEffect(() => {
    let list = [...submissions];
    if (filter === 'early') list = list.filter(s => !s.isLateEntry);
    if (filter === 'late')  list = list.filter(s => s.isLateEntry);
    if (sortBy === 'recent') list.sort((a,b) => new Date(b.submittedAt)-new Date(a.submittedAt));
    if (sortBy === 'votes')  list.sort((a,b) => b.voteCount-a.voteCount);
    
    setSortedIds(list.map(s => s.id));
  }, [submissions.length, filter, sortBy, id]);

  const displayed = sortedIds.map(sid => submissions.find(s => s.id === sid)).filter(Boolean);

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 opacity-20" style={{ background: cat.bgGradient }} />
        <div className="max-w-6xl mx-auto px-4 py-10 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{cat.icon}</span>
                <div>
                  <h1 className="font-display font-black text-3xl text-ink-100">{cat.label}</h1>
                  <p className="font-body text-ink-400 text-sm italic">{cat.tagline}</p>
                </div>
              </div>
              {cycle && <PhaseBanner cycle={cycle} />}
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/category/${id}/leaderboard`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ink-600 text-ink-300 text-sm font-ui hover:border-ink-400 transition-colors">
                <BarChart2 size={14} /> Leaderboard
              </Link>
              {submitCheck.allowed ? (
                <Link to={`/category/${id}/submit`} className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-ui font-semibold text-sm text-black transition-all hover:-translate-y-0.5"
                  style={{ background: `linear-gradient(135deg,${cat.accentColor},${cat.accentDark})` }}>
                  <Plus size={15} /> Submit Work
                </Link>
              ) : !user && isSubmission ? (
                <Link to="/login" className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-ui font-semibold text-sm text-black"
                  style={{ background: `linear-gradient(135deg,${cat.accentColor},${cat.accentDark})` }}>
                  <Plus size={15} /> Login to Submit
                </Link>
              ) : user && isSubmission ? (
                <div className="px-4 py-2 rounded-lg bg-ink-800 border border-ink-600 text-ink-500 text-sm font-ui cursor-not-allowed">
                  {submitCheck.reason}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {phase === PHASE.ADMIN_REVIEW && (
          <div className="mb-8 p-4 bg-purple-900/20 border border-purple-700/30 rounded-xl text-center font-ui text-purple-300">
            Submissions are under review. Voting opens soon.
          </div>
        )}
        {(phase === PHASE.ARCHIVE || !cycle) && (
          <div className="mb-8 p-4 bg-ink-800 border border-ink-700 rounded-xl text-center font-ui text-ink-400">
            This cycle has ended. A new cycle will begin soon.
          </div>
        )}
        {isLive && trending.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-ink-200 mb-4 flex items-center gap-2">
              <Flame size={18} className="text-orange-400" /> Trending Now
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trending.map(s => <SubmissionCard key={s.id} submission={s} trending onVoted={loadData} />)}
            </div>
          </section>
        )}
        {isLive && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="font-display font-bold text-xl text-ink-200">
                All Submissions <span className="text-sm font-ui font-normal text-ink-500">({submissions.length})</span>
              </h2>
              <div className="flex items-center gap-2 text-sm font-ui">
                <div className="flex rounded-lg overflow-hidden border border-ink-700">
                  {[['all','All'],['early','Early'],['late','Late']].map(([v,l]) => (
                    <button key={v} onClick={() => setFilter(v)} className={`px-3 py-1.5 transition-colors ${filter===v?'bg-ink-600 text-ink-100':'text-ink-400 hover:text-ink-200'}`}>{l}</button>
                  ))}
                </div>
                <div className="flex rounded-lg overflow-hidden border border-ink-700">
                  {[['rank','Rank'],['recent','Recent'],['votes','Votes']].map(([v,l]) => (
                    <button key={v} onClick={() => setSortBy(v)} className={`px-3 py-1.5 transition-colors ${sortBy===v?'bg-ink-600 text-ink-100':'text-ink-400 hover:text-ink-200'}`}>{l}</button>
                  ))}
                </div>
              </div>
            </div>
            {displayed.length === 0 ? (
              <div className="text-center py-20 text-ink-500 font-ui">
                <span className="text-5xl block mb-4">{cat.icon}</span>No submissions yet. Be the first!
              </div>
            ) : (
              <div className={`columns-1 sm:columns-2 ${cat.displayMode==='IMAGE'?'lg:columns-3':''} gap-5 space-y-5`}>
                {displayed.map(s => (
                  <div key={s.id} className="break-inside-avoid">
                    <SubmissionCard submission={s} showRank={sortBy==='rank'} onVoted={loadData} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        {isSubmission && submissions.length === 0 && (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">{cat.icon}</span>
            <p className="font-display font-bold text-2xl text-ink-300 mb-2">Submissions are open!</p>
            <p className="font-ui text-ink-500 mb-6">{cat.tagline}</p>
            {submitCheck.allowed && (
              <Link to={`/category/${id}/submit`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-ui font-semibold text-black text-base transition-all hover:-translate-y-1"
                style={{ background: `linear-gradient(135deg,${cat.accentColor},${cat.accentDark})` }}>
                <Plus size={18} /> Submit Your Work
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
