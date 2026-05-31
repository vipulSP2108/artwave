import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { register } from '../auth';
import { useApp } from '../AppContext';
import { APP_NAME } from '../constants';

export default function RegisterPage() {
  const { refreshUser } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(form);
      refreshUser();
      nav('/');
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display font-black text-3xl text-amber-400">{APP_NAME}</Link>
          <p className="text-ink-500 font-ui text-sm mt-1">Join the community of creators</p>
        </div>
        <form onSubmit={handle} className="bg-ink-800 border border-ink-700 rounded-2xl p-6 space-y-4">
          {[['username','Username','text','min 3 chars'],['email','Email','email',''],['password','Password','password','min 8 chars']].map(([k,l,t,hint]) => (
            <div key={k}>
              <label className="block text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
                {l} {hint && <span className="normal-case font-normal text-ink-600 ml-1">{hint}</span>}
              </label>
              <input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                className="w-full bg-ink-900 border border-ink-600 rounded-xl px-4 py-2.5 text-ink-100
                font-ui focus:outline-none focus:border-amber-400/50 transition-colors placeholder-ink-700"
                placeholder={l} required />
            </div>
          ))}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-900/20 border border-rose-700/30
              rounded-xl text-rose-400 text-sm font-ui">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-ui font-bold text-black bg-amber-500
            hover:bg-amber-400 transition-colors disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <p className="text-center text-sm font-ui text-ink-500">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
