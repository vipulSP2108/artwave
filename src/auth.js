// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Register, Login, Session
// ─────────────────────────────────────────────────────────────────────────────
import { ADMIN_USERNAMES, ROLES, SESSION_DURATION_HOURS,
  MIN_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH } from './constants';
import { getUsers, getUserByName, createUser, getSession,
  setSession, clearSession } from './storage';
import { genId, now, addDays } from './utils';

const hashPassword = async (pw) => {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
};

export const register = async ({ username, email, password }) => {
  if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH)
    throw new Error(`Username must be ${MIN_USERNAME_LENGTH}–${MAX_USERNAME_LENGTH} chars`);
  if (password.length < MIN_PASSWORD_LENGTH)
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  if (getUserByName(username)) throw new Error('Username already taken');
  const hash = await hashPassword(password);
  const role = ADMIN_USERNAMES.includes(username.toLowerCase()) ? ROLES.ADMIN : ROLES.USER;
  const user = createUser({
    id: genId('usr'), username, email,
    passwordHash: hash, role,
    createdAt: now(), profilePicUrl: null, bio: '',
    totalVotesReceived: 0, totalSubmissions: 0, isActive: true,
  });
  const session = { token: genId('tok'), userId: user.id, createdAt: now(),
    expiresAt: addDays(now(), SESSION_DURATION_HOURS / 24) };
  setSession(session);
  return { user, session };
};

export const login = async ({ username, password }) => {
  const user = getUserByName(username);
  if (!user) throw new Error('Invalid username or password');
  const hash = await hashPassword(password);
  if (hash !== user.passwordHash) throw new Error('Invalid username or password');
  const session = { token: genId('tok'), userId: user.id, createdAt: now(),
    expiresAt: addDays(now(), SESSION_DURATION_HOURS / 24) };
  setSession(session);
  return { user, session };
};

export const logout = () => clearSession();

export const getCurrentUser = () => {
  const session = getSession();
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) { clearSession(); return null; }
  const users = getUsers();
  return users.find(u => u.id === session.userId) || null;
};

export const isAdmin = (user) =>
  user && (user.role === ROLES.ADMIN || ADMIN_USERNAMES.includes(user.username.toLowerCase()));
