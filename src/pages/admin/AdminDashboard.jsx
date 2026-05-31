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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {CATEGORIES.filter(c=>c.active).map(cat => {
            const cycle = getActiveCycle(cat.id);
            const phase = cycle ? computePhase(cycle) : null;
            const pending = getSubmissions({ categoryId: cat.id, status: 'pending_review' });
            return (
              <div key={cat.id} className="bg-ink-800 border border-ink-700 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><span className="text-xl">{cat.icon}</span><span className="font-ui font-bold text-ink-200">{cat.label}</span></div>
                  {phase && <span className="text-xs font-ui px-2 py-0.5 rounded-full border" style={{color:PHASE_COLORS[phase],borderColor:PHASE_COLORS[phase]+'44',backgroundColor:PHASE_COLORS[phase]+'11'}}>{PHASE_LABELS[phase]}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-ui text-ink-400"><span className="text-amber-400 font-mono font-bold text-lg">{pending.length}</span> awaiting review</span>
                  <Link to={`/admin/queue/${cat.id}`} className={`px-3 py-1.5 rounded-lg text-xs font-ui font-semibold transition-colors ${pending.length>0?'bg-amber-500 text-black hover:bg-amber-400':'bg-ink-700 text-ink-500 pointer-events-none'}`}>
                    {pending.length>0?'Review Now':'Queue Empty'}
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
