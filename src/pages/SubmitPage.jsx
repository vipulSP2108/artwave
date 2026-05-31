import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Upload, X, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import { CATEGORIES, MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_TAGS_PER_SUBMISSION, PHASE } from '../constants';
import { computePhase, canSubmit } from '../cycle';
import { getActiveCycle, createSubmission, updateUser, addNotif } from '../storage';
import { useApp } from '../AppContext';
import { genId, now, fileToBase64, getImageDimensions, wordCount, sanitizeText, extractTags } from '../utils';

export default function SubmitPage() {
  const { id } = useParams();
  const { user } = useApp();
  const nav = useNavigate();
  const cat = CATEGORIES.find(c => c.id === id);
  const cycle = getActiveCycle(id);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  if (!cat) return <div className="p-8 text-center text-ink-400">Category not found</div>;
  if (!user) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <p className="font-ui text-ink-400"><Link to="/login" className="text-amber-400 underline">Login</Link> to submit.</p>
    </div>
  );

  const submitCheck = canSubmit(cycle, user.id);
  if (!submitCheck.allowed) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl text-ink-200 mb-2">Can't Submit Right Now</h2>
        <p className="font-ui text-ink-400 mb-4">{submitCheck.reason}</p>
        <Link to={`/category/${id}`} className="text-amber-400 font-ui hover:underline">← Back to {cat.label}</Link>
      </div>
    </div>
  );

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > (cat.maxFileSizeMB||10)*1024*1024) { setError(`Image too large (max ${cat.maxFileSizeMB}MB)`); return; }
    if (!cat.allowedMimeTypes.includes(file.type)) { setError('File type not allowed'); return; }
    setError('');
    setImagePreview(await fileToBase64(file));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
    if (!t || tags.includes(t) || tags.length >= MAX_TAGS_PER_SUBMISSION) return;
    setTags(p => [...p, t]); setTagInput('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) return setError('Title is required');
    if (cat.displayMode==='IMAGE' && !imagePreview) return setError('Please upload an image');
    if (cat.displayMode==='TEXT') {
      const wc = wordCount(text);
      if (wc < (cat.minWords||50)) return setError(`Min ${cat.minWords} words (you have ${wc})`);
      if (wc > (cat.maxWords||5000)) return setError(`Max ${cat.maxWords} words`);
    }
    setSubmitting(true);
    try {
      const autoTags = cat.displayMode==='TEXT' ? extractTags(text,3) : [];
      const allTags = [...new Set([...tags,...autoTags])].slice(0, MAX_TAGS_PER_SUBMISSION);
      const phase = cycle ? computePhase(cycle) : null;
      const dims = imagePreview ? await getImageDimensions(imagePreview) : {};
      createSubmission({
        id: genId('sub'), cycleId: cycle.id, categoryId: id,
        userId: user.id, username: user.username,
        title: sanitizeText(title), description: sanitizeText(description),
        contentType: cat.displayMode==='IMAGE' ? 'image' : 'text',
        contentUrl: imagePreview||null,
        contentText: cat.displayMode==='TEXT' ? sanitizeText(text) : null,
        contentWidth: dims.width||0, contentHeight: dims.height||0,
        tags: allTags, isLateEntry: phase===PHASE.LATE_SUBMISSION,
        status: 'pending_review', adminNote: null, reviewedBy: null, reviewedAt: null,
        submittedAt: now(), voteCount: 0, wilsonScore: 0, trendScore: 0, rank: null,
      });
      updateUser(user.id, { totalSubmissions: (user.totalSubmissions||0)+1 });
      setDone(true);
    } catch(e) { setError(e.message); }
    setSubmitting(false);
  };

  if (done) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-ink-100 mb-2">Submitted!</h2>
        <p className="font-ui text-ink-400 mb-2">Your work is pending admin review.</p>
        <p className="font-ui text-ink-500 text-sm mb-6">You'll be notified when it goes live.</p>
        <Link to={`/category/${id}`} className="text-amber-400 font-ui hover:underline">← Back to {cat.label}</Link>
      </div>
    </div>
  );

  const wc = cat.displayMode==='TEXT' ? wordCount(text) : 0;
  return (
    <div className="min-h-screen bg-ink-950">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link to={`/category/${id}`} className="text-ink-500 hover:text-ink-300 text-sm font-ui">← {cat.icon} {cat.label}</Link>
          <h1 className="font-display font-black text-3xl text-ink-100 mt-2">Submit Your Work</h1>
          <p className="font-ui text-ink-400 text-sm mt-1">{cat.description}</p>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider mb-2">Title <span className="text-rose-400">*</span></label>
            <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={MAX_TITLE_LENGTH} placeholder="Give your work a title…"
              className="w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 text-ink-100 font-ui placeholder-ink-600 focus:outline-none focus:border-amber-400/50 transition-colors" />
          </div>
          {cat.displayMode==='IMAGE' && (
            <div>
              <label className="block text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider mb-2">Artwork <span className="text-rose-400">*</span></label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-ink-600 bg-ink-900">
                  <img src={imagePreview} alt="preview" className="w-full object-contain max-h-80" />
                  <button onClick={()=>setImagePreview(null)} className="absolute top-2 right-2 p-1.5 bg-ink-900/80 rounded-full text-ink-400 hover:text-white"><X size={16}/></button>
                </div>
              ) : (
                <button onClick={()=>fileRef.current?.click()} className="w-full h-48 border-2 border-dashed border-ink-600 rounded-xl flex flex-col items-center justify-center gap-2 text-ink-500 hover:border-amber-400/40 hover:text-ink-300 transition-all hover:bg-ink-800/50 cursor-pointer">
                  <Upload size={28}/><span className="font-ui text-sm">Click to upload</span>
                  <span className="font-ui text-xs text-ink-600">JPG, PNG, GIF, WebP · max {cat.maxFileSizeMB}MB</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept={cat.allowedMimeTypes.join(',')} onChange={handleImage} className="hidden" />
            </div>
          )}
          {cat.displayMode==='TEXT' && (
            <div>
              <label className="block text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider mb-2">
                Your Story <span className="text-rose-400">*</span>
                <span className="ml-auto float-right font-normal normal-case text-ink-500">{wc} / {cat.maxWords} words</span>
              </label>
              <textarea value={text} onChange={e=>setText(e.target.value)} rows={14} placeholder="Begin your story…"
                className="w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 text-ink-200 font-body text-sm leading-relaxed placeholder-ink-600 resize-none focus:outline-none focus:border-amber-400/50 transition-colors" />
              <p className={`text-xs font-ui mt-1 ${wc<(cat.minWords||50)?'text-ink-500':'text-green-500'}`}>Min {cat.minWords} words required</p>
            </div>
          )}
          <div>
            <label className="block text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider mb-2">Description <span className="text-ink-600">(optional)</span></label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={MAX_DESCRIPTION_LENGTH} rows={3} placeholder="Tell us about your work…"
              className="w-full bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 text-ink-200 font-ui text-sm placeholder-ink-600 resize-none focus:outline-none focus:border-amber-400/50 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider mb-2">Tags <span className="text-ink-600">(up to {MAX_TAGS_PER_SUBMISSION})</span></label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-ink-700 border border-ink-600 rounded-full text-xs font-ui text-ink-300">
                  #{t}<button onClick={()=>setTags(p=>p.filter(x=>x!==t))} className="text-ink-500 hover:text-rose-400 ml-0.5"><X size={10}/></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addTag())} placeholder="Add a tag…"
                className="flex-1 bg-ink-800 border border-ink-600 rounded-xl px-3 py-2 text-sm text-ink-200 font-ui placeholder-ink-600 focus:outline-none focus:border-amber-400/50" />
              <button onClick={addTag} disabled={tags.length>=MAX_TAGS_PER_SUBMISSION} className="px-3 py-2 bg-ink-700 border border-ink-600 rounded-xl text-ink-300 hover:bg-ink-600 transition-colors disabled:opacity-50"><Tag size={15}/></button>
            </div>
          </div>
          {error && <div className="flex items-center gap-2 p-3 bg-rose-900/20 border border-rose-700/30 rounded-xl text-rose-400 text-sm font-ui"><AlertCircle size={16}/>{error}</div>}
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-3.5 rounded-xl font-ui font-bold text-black text-base transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg,${cat.accentColor},${cat.accentDark})` }}>
            {submitting ? 'Submitting…' : 'Submit Work'}
          </button>
        </div>
      </div>
    </div>
  );
}
