import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Eye, ChevronLeft, ChevronRight, Keyboard } from 'lucide-react';
import { useApp } from '../../AppContext';
import { isAdmin } from '../../auth';
import { getSubmissions, updateSubmission, getUserById, addNotif } from '../../storage';
import { CATEGORIES } from '../../constants';
import { genId, now, formatDateTime, wordCount } from '../../utils';

export default function AdminQueue() {
  const { categoryId } = useParams();
  const { user, refreshCycles } = useApp();
  const nav = useNavigate();
  const [queue, setQueue]     = useState([]);
  const [index, setIndex]     = useState(0);
  const [note, setNote]       = useState('');
  const [rejectMode, setRejectMode] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [done, setDone]       = useState(false);

  const cat = CATEGORIES.find(c => c.id === categoryId);

  const loadQueue = useCallback(() => {
    const pending = getSubmissions({ categoryId, status: 'pending_review' });
    setQueue(pending);
    setIndex(0);
  }, [categoryId]);

  useEffect(() => {
    if (!user || !isAdmin(user)) { nav('/'); return; }
    loadQueue();
  }, [user, loadQueue]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'a' || e.key === 'A') handleApprove();
      if (e.key === 'r' || e.key === 'R') setRejectMode(true);
      if (e.key === 'f' || e.key === 'F') setLightbox(l => !l);
      if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, queue.length - 1));
      if (e.key === 'ArrowLeft')  setIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Escape') { setRejectMode(false); setLightbox(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [queue, index]);

  if (!user || !isAdmin(user)) return null;

  const current = queue[index];

  const handleApprove = () => {
    if (!current) return;
    updateSubmission(current.id, { status: 'live', reviewedBy: user.id, reviewedAt: now() });
    addNotif({ id: genId('notif'), userId: current.userId, type: 'submission_approved',
      message: `Your work "${current.title}" was approved and is now live! 🎉`,
      createdAt: now(), read: false });
    const next = getSubmissions({ categoryId, status: 'pending_review' });
    setQueue(next);
    setRejectMode(false);
    setNote('');
    if (next.length === 0) setDone(true);
  };

  const handleReject = () => {
    if (!current) return;
    updateSubmission(current.id, { status: 'rejected', adminNote: note || null,
      reviewedBy: user.id, reviewedAt: now() });
    addNotif({ id: genId('notif'), userId: current.userId, type: 'submission_rejected',
      message: `Your work "${current.title}" was not approved.${note ? ` Reason: ${note}` : ''}`,
      createdAt: now(), read: false });
    const next = getSubmissions({ categoryId, status: 'pending_review' });
    setQueue(next);
    setRejectMode(false);
    setNote('');
    if (next.length === 0) setDone(true);
  };

  if (done || queue.length === 0) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="text-center p-8 max-w-sm">
        <Check size={48} className="text-green-400 mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-ink-100 mb-2">Queue Clear!</h2>
        <p className="font-ui text-ink-400 mb-6">All {cat?.label} submissions have been reviewed.</p>
        <Link to="/admin" className="text-amber-400 font-ui hover:underline">← Back to Dashboard</Link>
      </div>
    </div>
  );

  const isImage = current?.contentType === 'image';
  const wc = current?.contentText ? wordCount(current.contentText) : null;

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Lightbox */}
      {lightbox && isImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}>
          <img src={current.contentUrl} alt={current.title}
            className="max-w-[95vw] max-h-[90vh] object-contain" />
          <div className="absolute bottom-6 flex gap-4">
            <button onClick={e => { e.stopPropagation(); handleApprove(); setLightbox(false); }}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500
              rounded-xl text-white font-ui font-bold transition-colors">
              <Check size={18} /> Approve (A)
            </button>
            <button onClick={e => { e.stopPropagation(); setLightbox(false); setRejectMode(true); }}
              className="flex items-center gap-2 px-6 py-3 bg-rose-700 hover:bg-rose-600
              rounded-xl text-white font-ui font-bold transition-colors">
              <X size={18} /> Reject (R)
            </button>
          </div>
          <button className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl font-ui"
            onClick={() => setLightbox(false)}>✕</button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm font-ui
            text-ink-500 hover:text-ink-300">
            <ArrowLeft size={14} /> Dashboard
          </Link>
          <div className="flex items-center gap-2 text-sm font-ui text-ink-400">
            <span className="font-mono font-bold text-ink-200">{index + 1}</span>
            <span>/</span>
            <span className="font-mono">{queue.length}</span>
            <span className="text-ink-600">pending</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">{cat?.icon}</span>
          <h1 className="font-display font-black text-2xl text-ink-100">
            {cat?.label} Review Queue
          </h1>
          <div className="ml-auto flex items-center gap-1 text-xs font-ui text-ink-600">
            <Keyboard size={12} /> A/R/F/←→
          </div>
        </div>

        {/* Card */}
        <div className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden mb-4">
          {/* Image preview */}
          {isImage && current.contentUrl && (
            <div className="relative bg-ink-900 cursor-zoom-in" onClick={() => setLightbox(true)}>
              <img src={current.contentUrl} alt={current.title}
                className="w-full object-contain max-h-[50vh]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink-900/20" />
              <div className="absolute bottom-3 right-3 text-xs font-ui bg-ink-900/80
                rounded-lg px-2 py-1 text-ink-400">Press F or click for full view</div>
            </div>
          )}

          {/* Story Composition or Legacy Text */}
          {!isImage && current?.composition ? (
            <div className="p-6 border-b border-ink-700 flex justify-center bg-ink-950 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:16px_16px]">
              <div 
                className="relative w-full max-w-[360px] aspect-[9/16] overflow-hidden rounded-xl shadow-2xl border border-ink-800"
                style={{ 
                  background: current.composition.bg.startsWith('url') 
                    ? `${current.composition.bg} center/cover no-repeat` 
                    : current.composition.bg 
                }}
              >
                {current.composition.elements.map(el => (
                  <div
                    key={el.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${el.x}%`,
                      top: `${el.y}%`,
                      transform: 'translate(-50%, -50%)',
                      color: el.color,
                      fontSize: `${el.fontSize}px`,
                      textAlign: el.align,
                      whiteSpace: 'pre-wrap',
                      minWidth: '50px',
                      width: el.width ? `${el.width}%` : 'auto',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                    }}
                  >
                    {el.text}
                  </div>
                ))}
              </div>
            </div>
          ) : !isImage && current?.contentText && (
            <div className="p-6 border-b border-ink-700 max-h-96 overflow-y-auto">
              <div className="font-body text-sm text-ink-200 leading-relaxed whitespace-pre-wrap">
                {current.contentText}
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display font-bold text-xl text-ink-100">{current?.title}</h2>
                <p className="text-sm font-ui text-ink-400 mt-1">
                  by <span className="text-ink-300">@{current?.username}</span>
                  <span className="mx-1.5 text-ink-600">·</span>
                  {formatDateTime(current?.submittedAt)}
                  {wc && <span className="ml-2 text-ink-500">{wc} words</span>}
                  {current?.isLateEntry && <span className="ml-2 text-purple-400 font-semibold">Late Entry</span>}
                </p>
                {current?.description && (
                  <p className="text-sm font-ui text-ink-500 mt-2 italic">{current.description}</p>
                )}
              </div>
              {isImage && current?.contentWidth > 0 && (
                <div className="text-xs font-mono text-ink-600 flex-shrink-0">
                  {current.contentWidth}×{current.contentHeight}
                </div>
              )}
            </div>

            {/* Reject note */}
            {rejectMode && (
              <div className="mb-4 p-4 bg-rose-900/10 border border-rose-700/30 rounded-xl">
                <label className="block text-xs font-ui text-rose-400 mb-2 font-semibold">
                  Rejection note (optional — shown to the creator)
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                  placeholder="e.g. Content doesn't fit the category guidelines…"
                  className="w-full bg-ink-900 border border-rose-700/30 rounded-lg px-3 py-2
                  text-sm font-ui text-ink-200 placeholder-ink-600 resize-none focus:outline-none
                  focus:border-rose-500/50" />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {!rejectMode ? (
                <>
                  <button onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-green-700 hover:bg-green-600 text-white font-ui font-bold transition-colors">
                    <Check size={18} /> Approve <span className="text-green-300 text-xs">(A)</span>
                  </button>
                  <button onClick={() => setRejectMode(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-rose-800 hover:bg-rose-700 text-white font-ui font-bold transition-colors">
                    <X size={18} /> Reject <span className="text-rose-300 text-xs">(R)</span>
                  </button>
                  {isImage && (
                    <button onClick={() => setLightbox(true)}
                      className="px-4 py-3 rounded-xl bg-ink-700 border border-ink-600
                      text-ink-300 hover:text-ink-100 font-ui transition-colors">
                      <Eye size={18} />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={handleReject}
                    className="flex-1 py-3 rounded-xl bg-rose-700 hover:bg-rose-600
                    text-white font-ui font-bold transition-colors">
                    Confirm Reject
                  </button>
                  <button onClick={() => { setRejectMode(false); setNote(''); }}
                    className="px-5 py-3 rounded-xl bg-ink-700 border border-ink-600
                    text-ink-300 font-ui hover:text-ink-100 transition-colors">
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setIndex(i => Math.max(i - 1, 0))} disabled={index === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-ui
            text-ink-400 hover:text-ink-200 disabled:opacity-30 disabled:cursor-not-allowed
            border border-ink-700 hover:border-ink-500 transition-colors">
            <ChevronLeft size={15} /> Previous
          </button>
          <div className="flex gap-1">
            {queue.slice(0, 8).map((_, i) => (
              <button key={i} onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors
                  ${i === index ? 'bg-amber-400' : 'bg-ink-600 hover:bg-ink-400'}`} />
            ))}
          </div>
          <button onClick={() => setIndex(i => Math.min(i + 1, queue.length - 1))}
            disabled={index === queue.length - 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-ui
            text-ink-400 hover:text-ink-200 disabled:opacity-30 disabled:cursor-not-allowed
            border border-ink-700 hover:border-ink-500 transition-colors">
            Next <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
