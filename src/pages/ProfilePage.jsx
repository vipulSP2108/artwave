import { useParams, Link } from 'react-router-dom';
import { User, Calendar, Award } from 'lucide-react';
import { getUserByName, getSubmissions } from '../storage';
import { CATEGORIES } from '../constants';
import { formatDate } from '../utils';
import { useApp } from '../AppContext';

const STATUS_STYLES = {
  pending_review: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  live:           'text-green-400 bg-green-400/10 border-green-400/20',
  rejected:       'text-rose-400 bg-rose-400/10 border-rose-400/20',
  archived:       'text-ink-500 bg-ink-700/30 border-ink-600/20',
  expired_unreviewed: 'text-ink-600 bg-ink-800/30 border-ink-700/20',
};
const STATUS_LABELS = {
  pending_review: 'Pending Review',
  live: 'Live',
  rejected: 'Rejected',
  archived: 'Archived',
  expired_unreviewed: 'Expired',
};

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useApp();
  const profileUser = getUserByName(username);
  if (!profileUser) return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center">
      <p className="font-ui text-ink-500">User not found.</p>
    </div>
  );
  const isOwn = currentUser?.id === profileUser.id;
  const subs = getSubmissions({ userId: profileUser.id });
  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = subs.filter(s => s.categoryId === cat.id);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Header */}
      <div className="border-b border-ink-800 bg-ink-900/50">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-700/20
            border border-amber-500/20 flex items-center justify-center">
            <User size={28} className="text-amber-400" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-ink-100">@{profileUser.username}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm font-ui text-ink-500">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> Joined {formatDate(profileUser.createdAt)}
              </span>
              <span>·</span>
              <span>{subs.length} submissions</span>
            </div>
            {profileUser.bio && <p className="text-sm font-body text-ink-400 mt-1 italic">{profileUser.bio}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {subs.length === 0 ? (
          <div className="text-center py-16">
            <Award size={40} className="text-ink-700 mx-auto mb-3" />
            <p className="font-ui text-ink-500">No submissions yet.</p>
            {isOwn && (
              <p className="text-sm font-ui text-ink-600 mt-1">
                Join a category and submit your first work!
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.filter(c => byCategory[c.id]?.length > 0).map(cat => (
              <section key={cat.id}>
                <h2 className="font-display font-bold text-lg text-ink-300 mb-3 flex items-center gap-2">
                  {cat.icon} {cat.label}
                </h2>
                <div className="space-y-2">
                  {byCategory[cat.id].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).map(s => (
                    <div key={s.id}
                      className="flex items-center gap-4 p-4 bg-ink-800 border border-ink-700
                      rounded-xl hover:border-ink-600 transition-colors">
                      {s.contentType === 'image' && s.contentUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-ink-900 flex-shrink-0">
                          <img src={s.contentUrl} alt={s.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {s.contentType === 'text' && (
                        <div className="w-12 h-12 rounded-lg bg-ink-700 flex-shrink-0
                          flex items-center justify-center text-lg"
                          style={{ background: cat.bgGradient }}>
                          <span className="opacity-50">✍️</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link to={`/submission/${s.id}`}
                          className="font-display font-bold text-ink-200 hover:text-amber-300
                          transition-colors truncate block">
                          {s.title}
                        </Link>
                        <p className="text-xs font-mono text-ink-600 mt-0.5">{formatDate(s.submittedAt)}</p>
                        {s.adminNote && (
                          <p className="text-xs font-ui text-ink-500 mt-0.5 italic">
                            Note: {s.adminNote}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {s.rank && (
                          <span className="text-xs font-mono font-bold text-amber-400">#{s.rank}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs font-mono text-ink-400">
                          ♥ {s.voteCount || 0}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-ui font-semibold rounded-full border
                          ${STATUS_STYLES[s.status] || STATUS_STYLES.archived}`}>
                          {STATUS_LABELS[s.status] || s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
