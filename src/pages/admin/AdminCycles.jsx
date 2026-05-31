import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApp } from '../../AppContext';
import { isAdmin } from '../../auth';
import { getCycles, updateCycle, getActiveCycle } from '../../storage';
import { CATEGORIES, PHASE, PHASE_LABELS, PHASE_COLORS } from '../../constants';
import { computePhase, initializeCycles } from '../../cycle';
import { formatDateTime } from '../../utils';
import PhaseBanner from '../../components/PhaseBanner';

const PHASE_ORDER = [PHASE.SUBMISSION,PHASE.ADMIN_REVIEW,PHASE.LIVE,PHASE.LATE_SUBMISSION,PHASE.LATE_REVIEW,PHASE.RESULTS,PHASE.ARCHIVE];

export default function AdminCycles() {
  const { user, refreshCycles } = useApp();
  const nav = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (!user||!isAdmin(user)) { nav('/'); return; }
    setCycles(getCycles());
  }, [user]);

  if (!user||!isAdmin(user)) return null;

  const handleForcePhase = (cycleId, phase) => {
    updateCycle(cycleId, { phase });
    refreshCycles();
    setCycles(getCycles());
    setConfirm(null);
  };

  const handleNewCycle = (catId) => {
    const existing = getActiveCycle(catId);
    if (existing && existing.phase !== PHASE.ARCHIVE) updateCycle(existing.id, { phase: PHASE.ARCHIVE });
    initializeCycles();
    refreshCycles();
    setCycles(getCycles());
  };

  return (
    <div className="min-h-screen bg-ink-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-ui text-ink-500 hover:text-ink-300 mb-6"><ArrowLeft size={14}/> Dashboard</Link>
        <h1 className="font-display font-black text-2xl text-ink-100 mb-6">Cycle Management</h1>

        {confirm && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
            <div className="bg-ink-800 border border-amber-500/30 rounded-2xl p-6 max-w-sm w-full">
              <div className="flex items-center gap-2 mb-3 text-amber-400"><AlertTriangle size={20}/><span className="font-ui font-bold">Force Phase Change</span></div>
              <p className="text-sm font-ui text-ink-300 mb-4">Force to <strong className="text-amber-400">{PHASE_LABELS[confirm.phase]}</strong>? This cannot be undone automatically.</p>
              <div className="flex gap-3">
                <button onClick={()=>handleForcePhase(confirm.cycleId,confirm.phase)} className="flex-1 py-2 rounded-xl bg-amber-500 text-black font-ui font-bold text-sm hover:bg-amber-400 transition-colors">Confirm</button>
                <button onClick={()=>setConfirm(null)} className="flex-1 py-2 rounded-xl bg-ink-700 text-ink-300 font-ui text-sm hover:bg-ink-600 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {CATEGORIES.filter(c=>c.active).map(cat => {
            const catCycles = cycles.filter(c=>c.categoryId===cat.id).sort((a,b)=>b.cycleNumber-a.cycleNumber);
            const active = catCycles[0];
            const phase = active ? computePhase(active) : null;
            return (
              <div key={cat.id} className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><span className="text-xl">{cat.icon}</span><span className="font-display font-bold text-lg text-ink-100">{cat.label}</span>{active&&<span className="text-xs font-mono text-ink-500">Cycle #{active.cycleNumber}</span>}</div>
                  <div className="flex items-center gap-2">
                    {active&&<PhaseBanner cycle={active}/>}
                    <button onClick={()=>handleNewCycle(cat.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-ui font-semibold bg-ink-700 border border-ink-600 text-ink-400 hover:text-ink-200 hover:border-ink-500 transition-colors"><RefreshCw size={12}/> New Cycle</button>
                  </div>
                </div>
                {active && (
                  <>
                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-ui">
                      {[['Submission Opens',active.submissionStart],['Submission Closes',active.submissionEnd],['Review Ends',active.reviewEnd],['Live Starts',active.liveStart],['Late Submit',active.lateSubmitStart],['Archive',active.archiveAt]].map(([l,d])=>(
                        <div key={l} className="flex items-center justify-between p-2 bg-ink-900/50 rounded-lg">
                          <span className="text-ink-500">{l}</span><span className="font-mono text-ink-300">{formatDateTime(d).split(',')[0]}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-ui text-ink-600 mb-2 uppercase tracking-wider">Force advance to phase:</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {PHASE_ORDER.map(p=>(
                          <button key={p} onClick={()=>setConfirm({cycleId:active.id,phase:p})} disabled={p===phase}
                            className="px-2.5 py-1 rounded-lg text-xs font-ui font-semibold border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{color:PHASE_COLORS[p],borderColor:PHASE_COLORS[p]+'44',backgroundColor:p===phase?PHASE_COLORS[p]+'22':'transparent'}}>
                            {PHASE_LABELS[p]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
