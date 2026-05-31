# run commond
# nvm use 22.12.0 && npm run dev

# ArtWave — Community Art Showcase & Ranking Platform

> Create. Vote. Celebrate.

A full-featured, cyclic art showcase built with **React + Tailwind CSS**. Community members submit artwork and stories during timed windows, the admin approves submissions, the community votes, and winners are immortalised in the Hall of Fame.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Build for production
npm run build
```

### First Login
1. Register an account named **`admin`** (or `artwave_mod`) to get admin access automatically
2. Register a regular account to test submissions and voting
3. Visit `/admin` to access the admin dashboard

---

## 🗂️ Project Structure

```
artwave/
├── src/
│   ├── constants.js          ← ALL config: categories, timings, roles, limits
│   ├── storage.js            ← LocalStorage data layer (swap for API later)
│   ├── auth.js               ← Register, login, session management
│   ├── cycle.js              ← Cycle phase engine & timers
│   ├── ranking.js            ← Wilson Score + trending algorithm
│   ├── utils.js              ← Date helpers, text tools, ID generation
│   ├── AppContext.jsx         ← Global state provider
│   ├── App.jsx               ← Router
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Countdown.jsx
│   │   ├── PhaseBanner.jsx
│   │   ├── SubmissionCard.jsx
│   │   ├── VoteButton.jsx
│   │   └── RankBadge.jsx
│   └── pages/
│       ├── HomePage.jsx
│       ├── CategoryPage.jsx
│       ├── SubmitPage.jsx
│       ├── SubmissionPage.jsx
│       ├── LeaderboardPage.jsx
│       ├── HallOfFamePage.jsx
│       ├── ProfilePage.jsx
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       └── admin/
│           ├── AdminDashboard.jsx
│           ├── AdminQueue.jsx    ← Approve/Reject (keyboard: A/R/F/←/→)
│           └── AdminCycles.jsx
```

---

## ⚙️ Adding a New Category

Open `src/constants.js` and add one object to the `CATEGORIES` array:

```js
{
  id: 'photography',
  label: 'Photography',
  icon: '📷',
  description: 'Landscape, portrait, street photography',
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  maxFileSizeMB: 15,
  maxWords: null,
  minWords: null,
  displayMode: 'IMAGE',      // 'IMAGE' or 'TEXT'
  accentColor: '#818cf8',
  accentDark: '#6366f1',
  bgGradient: 'linear-gradient(135deg, #818cf822, #1a1a1a)',
  tagline: 'The world through your lens',
  active: true,
}
```

That's it. All routes, nav links, leaderboards, and admin queues update automatically.

---

## 🔄 The Cycle

Each category runs on its own independent cycle:

| Phase | Duration | What happens |
|-------|----------|--------------|
| Submission Window | 5 days | Users submit work |
| Admin Review | 5 days | Admin approves/rejects |
| Live / Voting | 30 days | Community votes |
| Late Submission | Days 20–25 | Second submission window opens |
| Late Admin Review | 5 days | Admin reviews late entries |
| Results | 2 days | Rankings frozen, winner announced |
| Archive | — | Work archived, new cycle begins |

All timings are in `constants.js` → `CYCLE_*` constants.

---

## 🛡️ Admin Panel

Visit `/admin` when logged in as `admin` or `artwave_mod`.

**Review Queue keyboard shortcuts:**
- `A` — Approve current submission
- `R` — Reject (opens note field)
- `F` — Full view / lightbox toggle
- `←` / `→` — Previous / Next card
- `Esc` — Cancel reject / close lightbox

---

## 📊 Ranking Algorithm

Uses **Wilson Score Lower Bound** (95% confidence interval):
- Prevents 1-vote submissions from dominating
- Statistically fair at all vote counts
- Late entries get a configurable 15% boost for 5 days (`LATE_ENTRY_BOOST_FACTOR`)

---

## 💾 Data Storage

All data is stored in **localStorage** using the key prefix `artwave_*`. The schema matches what a REST API would expect — migration steps:

1. Replace `storage.js` functions with `fetch()` calls to your API
2. Move file uploads to S3/Cloudinary
3. Replace localStorage sessions with JWT/cookies
4. All constants that are config → move to `.env`

---

## 🔑 Constants Reference (`src/constants.js`)

| Constant | Default | Description |
|----------|---------|-------------|
| `ADMIN_USERNAMES` | `['admin', 'artwave_mod']` | Usernames that get admin role |
| `CYCLE_SUBMISSION_DAYS` | `5` | Length of submission window |
| `CYCLE_LIVE_DAYS` | `30` | Length of voting period |
| `MAX_SUBMISSIONS_PER_USER_PER_CYCLE` | `1` | One entry per cycle |
| `LATE_ENTRY_BOOST_FACTOR` | `1.15` | 15% ranking boost for late entries |
| `RANKING_Z_SCORE` | `1.96` | Wilson score confidence (95%) |
| `MAX_VOTES_PER_HOUR` | `20` | Rate limit per user |
| `ACCOUNT_MIN_AGE_HOURS` | `24` | New accounts: votes are provisional |

---

## 🎨 Tech Stack

- **React 18** + React Router v6
- **Tailwind CSS v3**
- **Lucide React** icons
- **Vite** build tool
- **LocalStorage** data persistence (no backend required)
- Fonts: Playfair Display, Syne, Libre Baskerville, DM Mono (Google Fonts)

---

## 📝 License

MIT
