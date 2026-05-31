// ─────────────────────────────────────────────────────────────────────────────
// RANKING — Wilson Score + Trending + Late-Entry Boost
// ─────────────────────────────────────────────────────────────────────────────
import {
  RANKING_Z_SCORE, LATE_ENTRY_BOOST_FACTOR,
  BOOST_DURATION_DAYS, TREND_RECENCY_WEIGHT,
} from './constants';
import { getVotes } from './storage';

// Wilson Score Lower Bound (95% confidence)
export const wilsonScore = (upvotes, total) => {
  if (total === 0) return 0;
  const p = upvotes / total;
  const z = RANKING_Z_SCORE;
  const z2 = z * z;
  return (p + z2 / (2 * total) - z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total))
    / (1 + z2 / total);
};

// Recency boost for late entries
const applyLateBoost = (score, submission) => {
  if (!submission.isLateEntry) return score;
  const boostExpiry = new Date(submission.submittedAt);
  boostExpiry.setDate(boostExpiry.getDate() + BOOST_DURATION_DAYS);
  if (new Date() > boostExpiry) return score;
  return score * LATE_ENTRY_BOOST_FACTOR;
};

// Trend score: votes in last 24/48 hours
export const computeTrendScore = (submissionId, baseScore) => {
  const votes = getVotes({ submissionId });
  const now = Date.now();
  const h24 = votes.filter(v => now - new Date(v.timestamp) < 86400000).length;
  const h48 = votes.filter(v => now - new Date(v.timestamp) < 172800000).length;
  return h24 * TREND_RECENCY_WEIGHT + h48 * 0.5 + baseScore * 0.3;
};

// Compute and return final display score
export const computeScore = (submission) => {
  const votes = getVotes({ submissionId: submission.id });
  const total = votes.length;
  const ws = wilsonScore(total, total); // all upvotes (upvote-only system)
  const boosted = applyLateBoost(ws, submission);
  return { wilsonScore: ws, finalScore: boosted, voteCount: total };
};

// Rank an array of submissions — returns sorted with rank assigned
export const rankSubmissions = (submissions) => {
  const scored = submissions.map(s => {
    const votes = getVotes({ submissionId: s.id });
    const voteCount = votes.length;
    const ws = wilsonScore(voteCount, voteCount);
    const finalScore = applyLateBoost(ws, s);
    const trendScore = computeTrendScore(s.id, ws);
    return { ...s, voteCount, wilsonScore: ws, finalScore, trendScore };
  });

  // Sort: finalScore DESC, then submittedAt ASC (tiebreak)
  scored.sort((a, b) => {
    if (b.finalScore !== a.finalScore) return b.finalScore - a.finalScore;
    return new Date(a.submittedAt) - new Date(b.submittedAt);
  });

  return scored.map((s, i) => ({ ...s, rank: i + 1 }));
};

// Top N trending
export const getTrending = (submissions, n = 3) => {
  return submissions
    .map(s => {
      const votes = getVotes({ submissionId: s.id });
      const voteCount = votes.length;
      const ws = wilsonScore(voteCount, voteCount);
      return { ...s, voteCount, trendScore: computeTrendScore(s.id, ws) };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, n);
};
