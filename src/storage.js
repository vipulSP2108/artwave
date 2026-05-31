import { STORAGE_KEYS } from './constants';
let _cache = {
  [STORAGE_KEYS.USERS]: [],
  [STORAGE_KEYS.CYCLES]: [],
  [STORAGE_KEYS.SUBMISSIONS]: [],
  [STORAGE_KEYS.VOTES]: [],
  [STORAGE_KEYS.HOF]: [],
  [STORAGE_KEYS.NOTIFS]: []
};

let _isInitialized = false;

export const initStorage = async () => {
  if (_isInitialized) return;
  try {
    const res = await fetch('/api/init');
    if (res.ok) {
      const data = await res.json();
      // Only copy keys that match our STORAGE_KEYS (remove 'artwave_' prefix for mapping)
      Object.keys(_cache).forEach(k => {
        const fileKey = k.replace('artwave_', '');
        if (data[fileKey]) _cache[k] = data[fileKey];
      });
    }
  } catch (e) {
    console.error('Failed to init storage API', e);
  }
  _isInitialized = true;
};

const read = (key) => _cache[key] || [];

const write = (key, data) => {
  _cache[key] = data; // Sync local cache immediately for fast reads
  // Write-behind to the local API
  const fileKey = key.replace('artwave_', '');
  fetch(`/api/${fileKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(e => console.error('Failed to write to API', e));
  return true;
};

export const getUsers      = ()      => read(STORAGE_KEYS.USERS);
export const getUserById   = (id)    => getUsers().find(u => u.id === id) || null;
export const getUserByName = (name)  => getUsers().find(u => u.username.toLowerCase() === name.toLowerCase()) || null;
export const createUser    = (data)  => { const u = getUsers(); u.push(data); write(STORAGE_KEYS.USERS, u); return data; };
export const updateUser    = (id, patch) => {
  const u = getUsers().map(x => x.id === id ? { ...x, ...patch } : x);
  write(STORAGE_KEYS.USERS, u);
  return u.find(x => x.id === id);
};

export const getCycles = (filters = {}) => {
  let c = read(STORAGE_KEYS.CYCLES);
  if (filters.categoryId) c = c.filter(x => x.categoryId === filters.categoryId);
  if (filters.phase)      c = c.filter(x => x.phase === filters.phase);
  return c;
};
export const getCycleById  = (id)         => getCycles().find(c => c.id === id) || null;
export const createCycle   = (data)       => { const c = getCycles(); c.push(data); write(STORAGE_KEYS.CYCLES, c); return data; };
export const updateCycle   = (id, patch)  => {
  const c = getCycles().map(x => x.id === id ? { ...x, ...patch } : x);
  write(STORAGE_KEYS.CYCLES, c);
  return c.find(x => x.id === id);
};

export const getSubmissions = (filters = {}) => {
  let s = read(STORAGE_KEYS.SUBMISSIONS);
  if (filters.categoryId) s = s.filter(x => x.categoryId === filters.categoryId);
  if (filters.cycleId)    s = s.filter(x => x.cycleId    === filters.cycleId);
  if (filters.userId)     s = s.filter(x => x.userId     === filters.userId);
  if (filters.status)     s = s.filter(x => x.status     === filters.status);
  return s;
};
export const getSubmissionById = (id)        => getSubmissions().find(s => s.id === id) || null;
export const createSubmission  = (data)      => { const s = getSubmissions(); s.push(data); write(STORAGE_KEYS.SUBMISSIONS, s); return data; };
export const updateSubmission  = (id, patch) => {
  const s = getSubmissions().map(x => x.id === id ? { ...x, ...patch } : x);
  write(STORAGE_KEYS.SUBMISSIONS, s);
  return s.find(x => x.id === id);
};

export const getVotes             = (filters = {}) => {
  let v = read(STORAGE_KEYS.VOTES);
  if (filters.submissionId) v = v.filter(x => x.submissionId === filters.submissionId);
  if (filters.userId)       v = v.filter(x => x.userId       === filters.userId);
  return v;
};
export const createVote           = (data) => { const v = getVotes(); v.push(data); write(STORAGE_KEYS.VOTES, v); return data; };
export const deleteVote           = (id)   => { write(STORAGE_KEYS.VOTES, getVotes().filter(v => v.id !== id)); };
export const getVoteByUserAndSub  = (userId, submissionId) =>
  getVotes().find(v => v.userId === userId && v.submissionId === submissionId) || null;

export const getHOF         = (filters = {}) => {
  let h = read(STORAGE_KEYS.HOF);
  if (filters.categoryId) h = h.filter(x => x.categoryId === filters.categoryId);
  return h.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
};
export const createHOFEntry = (data)   => { const h = read(STORAGE_KEYS.HOF); h.push(data); write(STORAGE_KEYS.HOF, h); return data; };
export const getActiveTeaser = (catId) => {
  const entries = getHOF({ categoryId: catId });
  return entries[0] || null;
};

export const getSession   = ()     => { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)); } catch { return null; } };
export const setSession   = (data) => localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(data));
export const clearSession = ()     => localStorage.removeItem(STORAGE_KEYS.SESSION);

export const getNotifs     = (userId) => read(STORAGE_KEYS.NOTIFS).filter(n => n.userId === userId);
export const addNotif      = (data)   => { const n = read(STORAGE_KEYS.NOTIFS); n.push(data); write(STORAGE_KEYS.NOTIFS, n); };
export const markNotifRead = (id)     => {
  const n = read(STORAGE_KEYS.NOTIFS).map(x => x.id === id ? { ...x, read: true } : x);
  write(STORAGE_KEYS.NOTIFS, n);
};

// ── CONVENIENCE: getActiveCycle (avoids circular import) ─────────────────────
export const getActiveCycle = (catId) =>
  getCycles({ categoryId: catId })
    .filter(c => c.phase !== 'archive')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
