import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useApp } from '../AppContext';
import { getVoteByUserAndSub, createVote, deleteVote, updateSubmission, getActiveCycle } from '../storage';
import { canVote } from '../cycle';
import { genId, now } from '../utils';

export default function VoteButton({ submission, size='md', onVoted }) {
  const { user } = useApp();
  const [animating, setAnimating] = useState(false);
  const cycle = getActiveCycle(submission.categoryId);
  const existingVote = user ? getVoteByUserAndSub(user.id, submission.id) : null;
  const voted = !!existingVote;
  const voteCheck = user ? canVote(cycle, submission, user) : { allowed: false, reason: 'Login to vote' };
  const votable = voteCheck.allowed;
  const count = submission.voteCount || 0;

  const handleVote = () => {
    if (!votable || animating) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
    if (voted) {
      deleteVote(existingVote.id);
      updateSubmission(submission.id, { voteCount: Math.max(0, count-1) });
    } else {
      createVote({ id: genId('vote'), submissionId: submission.id, userId: user.id, cycleId: cycle?.id, timestamp: now(), isProvisional: false });
      updateSubmission(submission.id, { voteCount: count+1 });
    }
    onVoted?.();
  };

  const s = size==='sm'?14:size==='lg'?22:18;
  const p = size==='sm'?'px-2 py-1 gap-1 text-xs':size==='lg'?'px-4 py-2 gap-2 text-base':'px-3 py-1.5 gap-1.5 text-sm';

  return (
    <button onClick={handleVote} disabled={!votable && !voted}
      title={voted ? 'Remove vote' : voteCheck.reason}
      className={`flex items-center ${p} rounded-full border font-ui font-semibold transition-all duration-200
        ${voted?'border-rose-500 bg-rose-500/10 text-rose-400'
          :votable?'border-ink-600 bg-ink-800 text-ink-300 hover:border-rose-500/50 hover:text-rose-400'
          :'border-ink-700 bg-ink-900 text-ink-600 cursor-not-allowed opacity-60'}`}>
      <Heart size={s} className={`transition-transform ${animating?'scale-125':'scale-100'}`} fill={voted?'currentColor':'none'}/>
      <span className="font-mono tabular-nums">{count}</span>
    </button>
  );
}
