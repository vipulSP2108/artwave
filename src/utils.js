// ── ID GENERATION ─────────────────────────────────────────────────────────────
export const genId = (prefix = 'id') =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ── DATE HELPERS ──────────────────────────────────────────────────────────────
export const now = () => new Date().toISOString();
export const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};
export const diffDays = (a, b = new Date().toISOString()) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  return (new Date(a) - new Date(b)) / msPerDay;
};
export const isPast = (dateStr) => new Date(dateStr) < new Date();
export const isFuture = (dateStr) => new Date(dateStr) > new Date();

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const formatCountdown = (targetDateStr) => {
  const diff = new Date(targetDateStr) - new Date();
  if (diff <= 0) return { expired: true, label: 'Expired' };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  return { expired: false, days, hrs, mins, secs,
    label: days > 0 ? `${days}d ${hrs}h ${mins}m` : `${hrs}h ${mins}m ${secs}s` };
};

// ── TEXT HELPERS ──────────────────────────────────────────────────────────────
export const wordCount = (text) =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const previewText = (text, words = 80) => {
  const w = text.trim().split(/\s+/);
  return w.length <= words ? text : w.slice(0, words).join(' ') + '…';
};

export const readingTime = (text) => {
  const mins = Math.ceil(wordCount(text) / 200);
  return `~${mins} min read`;
};

export const sanitizeText = (text) =>
  text.replace(/<[^>]*>/g, '').trim();

// ── IMAGE HELPERS ─────────────────────────────────────────────────────────────
export const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

export const getImageDimensions = (src) =>
  new Promise((res) => {
    const img = new Image();
    img.onload = () => res({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => res({ width: 0, height: 0 });
    img.src = src;
  });

// ── TAG EXTRACTION ────────────────────────────────────────────────────────────
import { STOPWORDS } from './constants';
export const extractTags = (text, count = 5) => {
  const freq = {};
  text.toLowerCase().match(/\b[a-z]{4,}\b/g)?.forEach((w) => {
    if (!STOPWORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([w]) => w);
};

// ── MISC ──────────────────────────────────────────────────────────────────────
export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
