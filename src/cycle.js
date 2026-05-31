import {
  PHASE, CYCLE_SUBMISSION_DAYS, CYCLE_ADMIN_REVIEW_DAYS,
  CYCLE_LIVE_DAYS, CYCLE_LATE_SUBMIT_START, CYCLE_LATE_SUBMIT_DAYS,
  CYCLE_LATE_REVIEW_DAYS, CYCLE_WRAP_UP_DAYS, CATEGORIES,
} from './constants';
import {
  getCycles, createCycle, updateCycle, getActiveCycle,
  getSubmissions, createHOFEntry, updateSubmission, getHOF,
} from './storage';
import { genId, now, addDays } from './utils';
import { rankSubmissions } from './ranking';

export const computePhase = (cycle) => {
  const n = new Date();
  const t = (s) => new Date(s);
  if (n < t(cycle.submissionEnd))    return PHASE.SUBMISSION;
  if (n < t(cycle.reviewEnd))        return PHASE.ADMIN_REVIEW;
  if (n < t(cycle.lateSubmitStart))  return PHASE.LIVE;
  if (n < t(cycle.lateSubmitEnd))    return PHASE.LATE_SUBMISSION;
  if (n < t(cycle.lateReviewEnd))    return PHASE.LATE_REVIEW;
  if (n < t(cycle.liveEnd))          return PHASE.LIVE;
  if (n < t(cycle.archiveAt))        return PHASE.RESULTS;
  return PHASE.ARCHIVE;
};

export const getPhaseEnd = (cycle) => {
  const n = new Date();
  const t = (s) => new Date(s);
  if (n < t(cycle.submissionEnd))    return cycle.submissionEnd;
  if (n < t(cycle.reviewEnd))        return cycle.reviewEnd;
  if (n < t(cycle.lateSubmitStart))  return cycle.lateSubmitStart;
  if (n < t(cycle.lateSubmitEnd))    return cycle.lateSubmitEnd;
  if (n < t(cycle.lateReviewEnd))    return cycle.lateReviewEnd;
  if (n < t(cycle.liveEnd))          return cycle.liveEnd;
  return cycle.archiveAt;
};

export const buildCycleTimestamps = (startDate) => {
  const s = startDate || now();
  const submissionEnd   = addDays(s, CYCLE_SUBMISSION_DAYS);
  const reviewEnd       = addDays(submissionEnd, CYCLE_ADMIN_REVIEW_DAYS);
  const liveStart       = reviewEnd;
  const lateSubmitStart = addDays(liveStart, CYCLE_LATE_SUBMIT_START);
  const lateSubmitEnd   = addDays(lateSubmitStart, CYCLE_LATE_SUBMIT_DAYS);
  const lateReviewEnd   = addDays(lateSubmitEnd, CYCLE_LATE_REVIEW_DAYS);
  const liveEnd         = lateReviewEnd;
  const archiveAt       = addDays(liveEnd, CYCLE_WRAP_UP_DAYS);
  return {
    submissionStart: s, submissionEnd, reviewEnd, liveStart,
    lateSubmitStart, lateSubmitEnd, lateReviewEnd, liveEnd, archiveAt,
  };
};

export const initializeCycles = () => {
  CATEGORIES.filter(c => c.active).forEach(cat => {
    const existing = getActiveCycle(cat.id);
    if (!existing) {
      const timestamps = buildCycleTimestamps(now());
      const cycleNum = (getCycles({ categoryId: cat.id }).length || 0) + 1;
      createCycle({
        id: genId('cycle'),
        categoryId: cat.id,
        cycleNumber: cycleNum,
        phase: PHASE.SUBMISSION,
        ...timestamps,
        winnerId: null,
        createdAt: now(),
      });
    }
  });
};

export const syncCyclePhase = (cycle) => {
  const currentPhase = computePhase(cycle);
  if (currentPhase !== cycle.phase) {
    const updated = updateCycle(cycle.id, { phase: currentPhase });
    if (currentPhase === PHASE.RESULTS && cycle.phase !== PHASE.RESULTS) {
      finalizeResults(updated || cycle);
    }
    return updated;
  }
  return cycle;
};

const finalizeResults = (cycle) => {
  const liveSubs = getSubmissions({ cycleId: cycle.id, status: 'live' });
  if (!liveSubs.length) return;
  const ranked = rankSubmissions(liveSubs);
  ranked.forEach(s => updateSubmission(s.id, { rank: s.rank, voteCount: s.voteCount }));
  const winner = ranked[0];
  if (!winner) return;
  updateCycle(cycle.id, { winnerId: winner.id });
  // Mark previous teasers inactive
  const prevHOF = getHOF({ categoryId: cycle.categoryId });
  prevHOF.forEach(h => {
    if (h.isTeaserActive) {
      const all = JSON.parse(localStorage.getItem('artwave_halloffame') || '[]');
      const updated = all.map(x => x.id === h.id ? { ...x, isTeaserActive: false } : x);
      localStorage.setItem('artwave_halloffame', JSON.stringify(updated));
    }
  });
  createHOFEntry({
    id: genId('hof'),
    submissionId: winner.id,
    categoryId: cycle.categoryId,
    cycleId: cycle.id,
    cycleNumber: cycle.cycleNumber,
    userId: winner.userId,
    username: winner.username,
    title: winner.title,
    contentUrl: winner.contentUrl,
    contentType: winner.contentType,
    contentText: winner.contentText,
    finalVoteCount: winner.voteCount,
    finalRank: 1,
    archivedAt: now(),
    isTeaserActive: true,
  });
};

export const syncAllCycles = () => {
  getCycles().forEach(cycle => {
    if (cycle.phase !== PHASE.ARCHIVE) syncCyclePhase(cycle);
  });
};

export const canSubmit = (cycle, userId) => {
  if (!cycle) return { allowed: false, reason: 'No active cycle' };
  const phase = computePhase(cycle);
  if (phase !== PHASE.SUBMISSION && phase !== PHASE.LATE_SUBMISSION)
    return { allowed: false, reason: 'Submission window is closed' };
  if (!userId) return { allowed: false, reason: 'Login required to submit' };
  const existing = getSubmissions({ cycleId: cycle.id, userId });
  if (existing.length > 0) return { allowed: false, reason: 'You already submitted to this cycle' };
  return { allowed: true };
};

export const canVote = (cycle, submission, userId) => {
  if (!cycle || !submission || !userId) return false;
  const phase = computePhase(cycle);
  if (![PHASE.LIVE, PHASE.LATE_SUBMISSION, PHASE.LATE_REVIEW].includes(phase)) return false;
  if (submission.userId === userId) return false;
  return true;
};

