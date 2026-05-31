// ─────────────────────────────────────────────────────────────────────────────
// ARTWAVE — SINGLE SOURCE OF TRUTH FOR ALL CONSTANTS
// To add a new category: add one object to CATEGORIES array below. Done.
// ─────────────────────────────────────────────────────────────────────────────

// ── SITE INFO ─────────────────────────────────────────────────────────────────
export const APP_NAME = 'ArtWave';
export const APP_TAGLINE = 'Create. Vote. Celebrate.';
export const APP_VERSION = '1.0.0';

// ── CATEGORIES ────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  {
    id: 'illustration',
    label: 'Illustration',
    icon: '🎨',
    description: 'Digital art, drawings, paintings, sketches',
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSizeMB: 10,
    maxWords: null,
    minWords: null,
    displayMode: 'IMAGE',
    accentColor: '#f59e0b',
    accentDark: '#d97706',
    bgGradient: 'linear-gradient(135deg, #f59e0b22, #c0392b22)',
    tagline: 'Where strokes meet souls',
    active: true,
  },
  {
    id: 'story',
    label: 'Story',
    icon: '✍️',
    description: 'Short stories, flash fiction, poetry, creative writing',
    allowedMimeTypes: [],
    maxFileSizeMB: null,
    maxWords: 5000,
    minWords: 50,
    displayMode: 'TEXT',
    accentColor: '#2dd4bf',
    accentDark: '#14b8a6',
    bgGradient: 'linear-gradient(135deg, #2dd4bf22, #1a1a1a)',
    tagline: 'Words that leave marks',
    active: true,
  },
];

// ── CYCLE TIMING (days) ───────────────────────────────────────────────────────
export const CYCLE_SUBMISSION_DAYS      = 5;
export const CYCLE_ADMIN_REVIEW_DAYS    = 5;
export const CYCLE_LIVE_DAYS           = 30;
export const CYCLE_LATE_SUBMIT_START   = 20; // day within live period
export const CYCLE_LATE_SUBMIT_DAYS    = 5;
export const CYCLE_LATE_REVIEW_DAYS    = 5;
export const CYCLE_WRAP_UP_DAYS        = 2;

// ── TESTING / DEMO MODE ────────────────────────────────────────────────────────
export const ENABLE_TEST_MODE           = false;   // Enable faster phase transitions for testing
export const TEST_CYCLE_SUBMISSION_HOURS    = 1;      // Minutes for submission phase (when TEST_MODE enabled)
export const TEST_CYCLE_ADMIN_REVIEW_HOURS  = 0.5;    // Minutes for admin review phase (when TEST_MODE enabled)
export const TEST_CYCLE_LIVE_HOURS          = 1;      // Minutes for live/voting phase (when TEST_MODE enabled)
export const TEST_CYCLE_LATE_SUBMIT_START_HOURS = 0.5; // Minutes before late submission starts (when TEST_MODE enabled)
export const TEST_CYCLE_LATE_SUBMIT_HOURS   = 0.5;    // Minutes for late submission phase (when TEST_MODE enabled)
export const TEST_CYCLE_LATE_REVIEW_HOURS   = 0.5;    // Minutes for late review phase (when TEST_MODE enabled)
export const TEST_CYCLE_WRAP_UP_HOURS       = 0.5;    // Minutes for wrap-up phase (when TEST_MODE enabled)

// ── PHASES ────────────────────────────────────────────────────────────────────
export const PHASE = {
  SUBMISSION:      'submission',
  ADMIN_REVIEW:    'admin_review',
  LIVE:            'live',
  LATE_SUBMISSION: 'late_submission',
  LATE_REVIEW:     'late_review',
  RESULTS:         'results',
  ARCHIVE:         'archive',
};

export const PHASE_LABELS = {
  [PHASE.SUBMISSION]:      'Submissions Open',
  [PHASE.ADMIN_REVIEW]:    'Under Review',
  [PHASE.LIVE]:            'Voting Live',
  [PHASE.LATE_SUBMISSION]: 'Late Submissions Open',
  [PHASE.LATE_REVIEW]:     'Under Review',
  [PHASE.RESULTS]:         'Results',
  [PHASE.ARCHIVE]:         'Cycle Complete',
};

export const PHASE_COLORS = {
  [PHASE.SUBMISSION]:      '#f59e0b',
  [PHASE.ADMIN_REVIEW]:    '#8b5cf6',
  [PHASE.LIVE]:            '#22c55e',
  [PHASE.LATE_SUBMISSION]: '#f59e0b',
  [PHASE.LATE_REVIEW]:     '#8b5cf6',
  [PHASE.RESULTS]:         '#f59e0b',
  [PHASE.ARCHIVE]:         '#555',
};

// ── USER ROLES ────────────────────────────────────────────────────────────────
export const ROLES = { VISITOR: 'visitor', USER: 'user', ADMIN: 'admin' };

// ── ADMIN ACCESS ──────────────────────────────────────────────────────────────
export const ADMIN_USERNAME             = 'admin';
export const ADMIN_PASSWORD             = 'admin@123';
export const ADMIN_USERNAMES            = ['admin', 'artwave_mod'];
export const ADMIN_PANEL_PATH           = '/admin';
export const ADMIN_SESSION_TIMEOUT_MINS = 60;

// ── SUBMISSION RULES ──────────────────────────────────────────────────────────
export const MAX_SUBMISSIONS_PER_USER_PER_CYCLE = 12;
export const MAX_TITLE_LENGTH                   = 100;
export const MAX_DESCRIPTION_LENGTH             = 500;
export const MAX_TAGS_PER_SUBMISSION            = 5;
export const MAX_TAG_LENGTH                     = 20;

// ── SUBMISSION FEATURE TOGGLERS ────────────────────────────────────────────────
export const ALLOW_MULTIPLE_IMAGE_SUBMISSIONS   = true;   // Allow users to submit multiple images per cycle
export const ALLOW_MULTIPLE_STORY_SUBMISSIONS   = true;   // Allow users to submit multiple stories per cycle

// ── VOTING RULES ──────────────────────────────────────────────────────────────
export const MAX_VOTES_PER_HOUR      = 20;
export const ACCOUNT_MIN_AGE_HOURS   = 24;
export const CAN_VOTE_OWN_SUBMISSION = false;

// ── RANKING ───────────────────────────────────────────────────────────────────
export const RANKING_Z_SCORE          = 1.96;
export const LATE_ENTRY_BOOST_FACTOR  = 1.15;
export const BOOST_DURATION_DAYS      = 5;
export const TREND_RECENCY_WEIGHT     = 1.0;
export const TRENDING_BADGE_COUNT     = 3;
export const LEADERBOARD_PAGE_SIZE    = 20;

// ── DISPLAY ───────────────────────────────────────────────────────────────────
export const SUBMISSION_CARD_MAX_HEIGHT_PX = 480;
export const SUBMISSION_CARD_MIN_HEIGHT_PX = 200;
export const IMAGE_FIT_MODE               = 'contain';
export const TEXT_PREVIEW_WORDS           = 80;
export const HALL_OF_FAME_PER_PAGE        = 12;

// ── AUTH / SESSION ────────────────────────────────────────────────────────────
export const SESSION_DURATION_HOURS = 24;
export const MIN_PASSWORD_LENGTH    = 8;
export const MAX_USERNAME_LENGTH    = 30;
export const MIN_USERNAME_LENGTH    = 3;

// ── RECOMMENDATION ────────────────────────────────────────────────────────────
export const RECOMMENDATION_COUNT      = 3;
export const RECOMMENDATION_MIN_MATCH  = 2;
export const STOPWORDS = new Set([
  'the','a','an','is','in','of','and','to','it','was','for','on','are',
  'with','as','at','be','by','from','or','but','not','this','that',
]);

// ── DATA STORAGE KEYS (localStorage) ─────────────────────────────────────────
export const STORAGE_KEYS = {
  USERS:       'artwave_users',
  CYCLES:      'artwave_cycles',
  SUBMISSIONS: 'artwave_submissions',
  VOTES:       'artwave_votes',
  HOF:         'artwave_halloffame',
  SESSION:     'artwave_session',
  NOTIFS:      'artwave_notifications',
};
