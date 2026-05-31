import { PHASE_LABELS, PHASE_COLORS, PHASE } from '../constants';
import Countdown from './Countdown';
import { getPhaseEnd, computePhase } from '../cycle';

export default function PhaseBanner({ cycle }) {
  if (!cycle) return null;
  const phase = computePhase(cycle);
  const color = PHASE_COLORS[phase];
  const label = PHASE_LABELS[phase];
  const end   = getPhaseEnd(cycle);
  const isActive = [PHASE.SUBMISSION, PHASE.LIVE, PHASE.LATE_SUBMISSION].includes(phase);
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border"
      style={{ borderColor: color + '44', backgroundColor: color + '11' }}>
      <span className="w-2 h-2 rounded-full animate-pulse-slow flex-shrink-0"
        style={{ backgroundColor: color }} />
      <span className="text-sm font-ui font-semibold" style={{ color }}>{label}</span>
      {isActive && <Countdown targetDate={end} />}
      {phase === PHASE.ARCHIVE && (
        <span className="text-xs text-ink-400 font-ui">Cycle complete</span>
      )}
    </div>
  );
}
