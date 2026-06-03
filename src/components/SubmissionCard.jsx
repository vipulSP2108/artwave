import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Clock } from 'lucide-react';
import VoteButton from './VoteButton';
import RankBadge from './RankBadge';
import { previewText, formatDate, wordCount } from '../utils';
import { CATEGORIES } from '../constants';
import { getSubmissionById } from '../storage';

export default function SubmissionCard({ submission, showRank = false, trending = false, onVoted }) {
  const nav = useNavigate();
  const [version, setVersion] = useState(0);
  const [localSub, setLocalSub] = useState(submission);

  useEffect(() => {
    if (version > 0) setLocalSub(getSubmissionById(submission.id));
    else setLocalSub(submission);
  }, [version, submission]);

  const cat = CATEGORIES.find(c => c.id === localSub.categoryId);
  const isImage = localSub.contentType === 'image';
  const go = () => nav(`/submission/${localSub.id}`);

  const handleVoted = () => {
    setVersion(v => v + 1);
    if (onVoted) onVoted();
  };

  return (
    <div onClick={go} className="group relative bg-ink-800 border border-ink-700 rounded-xl
      overflow-hidden cursor-pointer hover:border-ink-500 transition-all duration-300
      hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-0.5">

      {/* Image */}
      {isImage && localSub.contentUrl && (
        <div className="relative overflow-hidden bg-ink-900 w-full">
          <img src={localSub.contentUrl} alt={localSub.title}
            className="w-full h-auto block" />
        </div>
      )}

      {/* Story Composition or Legacy Text */}
      {!isImage && localSub.composition ? (
        <div 
          className="relative w-full aspect-[9/16] overflow-hidden"
          style={{ 
            background: localSub.composition.bg.startsWith('url') 
              ? `${localSub.composition.bg} center/cover no-repeat` 
              : localSub.composition.bg 
          }}
        >
          {localSub.composition.elements.map(el => (
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
      ) : !isImage && (
        <div className="p-6 relative overflow-hidden" style={{ background: cat?.bgGradient }}>
          <div className="absolute inset-0 bg-ink-900/70" />
          <div className="relative font-body text-sm leading-relaxed text-ink-200 whitespace-pre-wrap">
            {localSub.contentText}
          </div>
        </div>
      )}

      {/* Meta bar */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start gap-2">
          {showRank && <RankBadge rank={localSub.rank} />}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-ink-100 truncate text-sm leading-tight
              group-hover:text-amber-300 transition-colors">
              {localSub.title}
            </h3>
            <p className="text-xs text-ink-400 font-ui mt-0.5 truncate">
              by <span className="text-ink-300">@{localSub.username || 'unknown'}</span>
              <span className="mx-1">·</span>
              <span className="text-ink-500">{formatDate(localSub.submittedAt)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {trending && (
              <span className="flex items-center gap-1 text-xs text-orange-400 font-ui font-semibold">
                <Flame size={12} /> Trending
              </span>
            )}
            {localSub.isLateEntry && (
              <span className="flex items-center gap-1 text-xs text-purple-400 font-ui">
                <Clock size={12} /> Late
              </span>
            )}
            {localSub.tags?.length > 0 && (
              <div className="flex gap-1">
                {localSub.tags.slice(0, 2).map(t => (
                  <span key={t} className="text-xs px-1.5 py-0.5 bg-ink-700 text-ink-400
                    rounded font-ui">{t}</span>
                ))}
              </div>
            )}
          </div>
          <div onClick={e => e.stopPropagation()}>
            <VoteButton submission={{ ...localSub, voteCount: localSub.voteCount || 0 }}
              size="sm" onVoted={handleVoted} />
          </div>
        </div>
      </div>
    </div>
  );
}
