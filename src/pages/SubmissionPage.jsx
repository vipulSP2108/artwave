import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Clock, BookOpen } from 'lucide-react';
import { getSubmissionById, getSubmissions, getActiveCycle } from '../storage';
import { computePhase } from '../cycle';
import { CATEGORIES, PHASE } from '../constants';
import { formatDateTime, readingTime, wordCount } from '../utils';
import { rankSubmissions } from '../ranking';
import VoteButton from '../components/VoteButton';
import RankBadge from '../components/RankBadge';
import SubmissionCard from '../components/SubmissionCard';
import { useApp } from '../AppContext';

export default function SubmissionPage() {
  const { id } = useParams();
  const { cycleVersion } = useApp();
  const [sub, setSub] = useState(null);
  const [ranked, setRanked] = useState([]);
  const [lightbox, setLightbox] = useState(false);
  const [fontSize, setFontSize] = useState('md');

  const loadData = useCallback(() => {
    const s = getSubmissionById(id);
    if (!s) return;
    setSub(s);
    const cycle = getActiveCycle(s.categoryId);
    const all = getSubmissions({ cycleId: cycle?.id || s.cycleId, status:'live' });
    setRanked(rankSubmissions(all));
  }, [id, cycleVersion]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!sub) return <div className="min-h-screen bg-ink-950 flex items-center justify-center"><p className="text-ink-500 font-ui">Submission not found</p></div>;

  const cat = CATEGORIES.find(c => c.id===sub.categoryId);
  const cycle = getActiveCycle(sub.categoryId);
  const phase = cycle ? computePhase(cycle) : null;
  const isLive = [PHASE.LIVE, PHASE.LATE_SUBMISSION, PHASE.LATE_REVIEW].includes(phase);
  const rankedSub = ranked.find(r=>r.id===id) || sub;
  const similar = ranked.filter(r=>r.id!==id).slice(0,3);
  const fsClass = {sm:'text-sm', md:'text-base', lg:'text-lg xl:text-xl'}[fontSize];

  return (
    <div className="min-h-screen bg-ink-950">
      {lightbox && sub.contentType==='image' && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={()=>setLightbox(false)}>
          <img src={sub.contentUrl} alt={sub.title} className="max-w-[95vw] max-h-[95vh] object-contain" />
          <button className="absolute top-4 right-4 text-white/60 hover:text-white font-ui text-3xl" onClick={()=>setLightbox(false)}>✕</button>
        </div>
      )}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link to={`/category/${sub.categoryId}`} className="inline-flex items-center gap-1.5 text-sm font-ui text-ink-500 hover:text-ink-300 mb-6">
          <ArrowLeft size={14}/> {cat?.icon} {cat?.label}
        </Link>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            {sub.contentType==='image' && sub.contentUrl && (
              <div className="relative rounded-2xl overflow-hidden bg-ink-900 border border-ink-700 cursor-zoom-in mb-6 group" onClick={()=>setLightbox(true)}>
                <img src={sub.contentUrl} alt={sub.title} className="w-full object-contain max-h-[70vh]" />
                <div className="absolute inset-0 -z-10"><img src={sub.contentUrl} alt="" aria-hidden className="w-full h-full object-cover blur-3xl scale-110 opacity-30"/></div>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-ink-900/80 rounded-lg px-2 py-1 text-xs font-ui text-ink-300">Click to zoom</div>
              </div>
            )}
            {sub.contentType==='text' && sub.contentText && (
              <div className="bg-ink-800/50 border border-ink-700 rounded-2xl overflow-hidden mb-6">
                <div className="flex items-center justify-between px-6 py-3 border-b border-ink-700">
                  <div className="flex items-center gap-2 text-xs font-ui text-ink-500">
                    <BookOpen size={13}/><span>{wordCount(sub.contentText)} words</span><span>·</span><span>{readingTime(sub.contentText)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {['sm','md','lg'].map(s => (
                      <button key={s} onClick={()=>setFontSize(s)} className={`px-2 py-1 rounded text-xs font-ui transition-colors ${fontSize===s?'bg-ink-600 text-ink-100':'text-ink-500 hover:text-ink-300'}`} style={{fontSize:s==='sm'?'11px':s==='md'?'13px':'15px'}}>A</button>
                    ))}
                  </div>
                </div>
                <div className={`px-8 py-8 font-body ${fsClass} text-ink-200 leading-[1.9] whitespace-pre-wrap max-w-prose mx-auto`}>{sub.contentText}</div>
              </div>
            )}
            {similar.length>0 && (
              <div>
                <h3 className="font-display font-bold text-lg text-ink-300 mb-4">More in {cat?.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{similar.map(s=><SubmissionCard key={s.id} submission={s} onVoted={loadData}/>)}</div>
              </div>
            )}
          </div>
          <aside className="space-y-4">
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                {rankedSub.rank && <RankBadge rank={rankedSub.rank}/>}
                <h1 className="font-display font-black text-xl text-ink-100 leading-tight flex-1">{sub.title}</h1>
              </div>
              <p className="text-sm font-ui text-ink-400 mb-4">by <Link to={`/profile/${sub.username}`} className="text-amber-400 hover:underline">@{sub.username}</Link></p>
              {isLive ? (
                <VoteButton submission={rankedSub} size="lg" onVoted={loadData}/>
              ) : (
                <div className="flex items-center gap-2 text-ink-400 text-sm font-ui">
                  <span className="text-rose-400">♥</span><span className="font-mono font-bold">{sub.voteCount||0}</span> votes
                </div>
              )}
            </div>
            {sub.description && (
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
                <h4 className="text-xs font-ui font-semibold text-ink-500 uppercase tracking-wider mb-2">About this work</h4>
                <p className="text-sm font-ui text-ink-300 leading-relaxed">{sub.description}</p>
              </div>
            )}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-ui text-ink-400"><Calendar size={14} className="text-ink-600"/>{formatDateTime(sub.submittedAt)}</div>
              {sub.isLateEntry && <div className="flex items-center gap-2 text-sm font-ui text-purple-400"><Clock size={14}/> Late entry</div>}
              <div className="flex items-center gap-2 text-sm font-ui text-ink-400"><span className="text-ink-600">{cat?.icon}</span>{cat?.label}</div>
            </div>
            {sub.tags?.length>0 && (
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
                <h4 className="text-xs font-ui font-semibold text-ink-500 uppercase tracking-wider mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {sub.tags.map(t=><span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-ink-700 border border-ink-600 rounded-full text-xs font-ui text-ink-400"><Tag size={10}/>{t}</span>)}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
