import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Clock, CheckCircle, XCircle, Users, BarChart2 } from 'lucide-react';
import { useApp } from '../../AppContext';
import { isAdmin } from '../../auth';
import { getSubmissions, getVotes, getUsers, getActiveCycle } from '../../storage';
import { CATEGORIES, PHASE_LABELS, PHASE_COLORS } from '../../constants';
import { computePhase } from '../../cycle';

export default function AdminDashboard() {
  const { user } = useApp();
  const nav = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user || !isAdmin(user)) { nav('/'); return; }
    const allSubs = getSubmissions();
    setStats({
      pending:  allSubs.filter(s=>s.status==='pending_review').length,
      live:     allSubs.filter(s=>s.status==='live').length,
      rejected: allSubs.filter(s=>s.status==='rejected').length,
      votes:    getVotes().length,
      users:    getUsers().length,
    });
  }, [user]);

  if (!user || !isAdmin(user) || !stats) return null;

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-700/30"><Shield size={22} className="text-purple-400"/></div>
          <div><h1 className="font-display font-black text-2xl text-ink-100">Admin Dashboard</h1><p className="text-xs font-ui text-ink-500">Welcome back, @{user.username}</p></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {[{l:'Pending',v:stats.pending,I:Clock,c:'text-amber-400'},{l:'Live',v:stats.live,I:CheckCircle,c:'text-green-400'},
            {l:'Rejected',v:stats.rejected,I:XCircle,c:'text-rose-400'},{l:'Votes',v:stats.votes,I:BarChart2,c:'text-blue-400'},{l:'Users',v:stats.users,I:Users,c:'text-purple-400'}
          ].map(({l,v,I,c})=>(
            <div key={l} className="bg-ink-800 border border-ink-700 rounded-xl p-4 text-center">
              <I size={18} className={`${c} mx-auto mb-2`}/>
              <div className="font-mono font-black text-2xl text-ink-100">{v}</div>
              <div className="text-xs font-ui text-ink-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <h2 className="font-display font-bold text-xl text-ink-200 mb-4">Review Queues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {CATEGORIES.filter(c=>c.active).map(cat => {
            const cycle = getActiveCycle(cat.id);
            const phase = cycle ? computePhase(cycle) : null;
            const pending = getSubmissions({ categoryId: cat.id, status: 'pending_review' });
            return (
              <div key={cat.id} className="bg-ink-800 border border-ink-700 rounded-2xl p-6 shadow-lg flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-2xl">{cat.icon}</span><span className="font-display font-black text-xl text-ink-100">{cat.label}</span></div>
                  {phase && <span className="text-xs font-ui px-2.5 py-1 rounded-full border font-semibold" style={{color:PHASE_COLORS[phase],borderColor:PHASE_COLORS[phase]+'44',backgroundColor:PHASE_COLORS[phase]+'11'}}>{PHASE_LABELS[phase]}</span>}
                </div>
                
                {/* Visual Preview Row */}
                {pending.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-4 mb-2 scrollbar-thin scrollbar-thumb-ink-700 scrollbar-track-transparent">
                    {pending.map(sub => (
                      <div key={sub.id} className="w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-ink-700 relative bg-ink-900 group">
                        {sub.contentType === 'image' ? (
                          <img src={sub.contentUrl} alt={sub.title} className="w-full h-full object-cover" />
                        ) : sub.composition ? (
                          <div 
                            className="w-full h-full relative" 
                            style={{ 
                              background: sub.composition.bg.startsWith('url') 
                                ? `${sub.composition.bg} center/cover no-repeat` 
                                : sub.composition.bg 
                            }}
                          >
                            <div className="absolute inset-0 bg-black/20" />
                            <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-50">✍️</span>
                          </div>
                        ) : (
                          <div className="w-full h-full p-2" style={{ background: cat.bgGradient }}>
                            <div className="text-[8px] leading-tight font-body text-ink-200 opacity-70 overflow-hidden h-full">{sub.contentText}</div>
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                          <div className="text-[10px] font-ui font-semibold text-white truncate">{sub.title}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 mb-4 border border-dashed border-ink-700 rounded-xl bg-ink-900/30">
                    <CheckCircle size={32} className="text-ink-600 mb-2"/>
                    <span className="text-sm font-ui text-ink-500">All caught up! Queue is empty.</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-ink-700/50">
                  <span className="text-sm font-ui text-ink-400"><span className="text-amber-400 font-mono font-bold text-lg">{pending.length}</span> awaiting review</span>
                  <Link to={`/admin/queue/${cat.id}`} className={`px-4 py-2 rounded-xl text-sm font-ui font-bold transition-all shadow-md ${pending.length>0?'bg-gradient-to-r from-amber-500 to-amber-400 text-black hover:-translate-y-0.5':'bg-ink-700 text-ink-500 pointer-events-none shadow-none'}`}>
                    {pending.length>0?'Start Reviewing →':'Queue Empty'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <Link to="/admin/cycles" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-800 border border-ink-700 text-ink-300 text-sm font-ui hover:border-ink-500 transition-colors">
          <BarChart2 size={15}/> Cycle Management
        </Link>
      </div>
    </div>
  );
}
