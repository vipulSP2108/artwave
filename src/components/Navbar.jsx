import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useApp } from '../AppContext';
import { isAdmin } from '../auth';
import { markNotifRead } from '../storage';
import { APP_NAME, CATEGORIES } from '../constants';

export default function Navbar() {
  const { user, notifs, logout } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  const unread = notifs.filter(n => !n.read).length;

  const handleLogout = () => { logout(); nav('/'); };

  return (
    <header className="sticky top-0 z-50 bg-ink-900/95 backdrop-blur border-b border-ink-700">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="font-display font-black text-xl text-amber-400
          tracking-tight hover:text-amber-300 transition-colors flex-shrink-0">
          {APP_NAME}
          <span className="text-ink-600">.</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {CATEGORIES.filter(c => c.active).map(cat => {
            const active = loc.pathname.startsWith(`/category/${cat.id}`);
            return (
              <Link key={cat.id} to={`/category/${cat.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-ui
                  font-medium transition-all duration-150
                  ${active
                    ? 'text-amber-300 bg-amber-400/10 border border-amber-400/20'
                    : 'text-ink-300 hover:text-ink-100 hover:bg-ink-800'}`}>
                <span>{cat.icon}</span>{cat.label}
              </Link>
            );
          })}
          <Link to="/halloffame"
            className={`px-3 py-1.5 rounded-lg text-sm font-ui font-medium transition-colors
              ${loc.pathname === '/halloffame' ? 'text-amber-300 bg-amber-400/10 border border-amber-400/20' : 'text-ink-300 hover:text-ink-100 hover:bg-ink-800'}`}>
            🏆 Hall of Fame
          </Link>
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotifs(s => !s)}
                  className="relative p-2 rounded-lg text-ink-400 hover:text-ink-200
                  hover:bg-ink-800 transition-colors">
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full
                      text-[10px] font-bold text-black flex items-center justify-center font-mono">
                      {unread}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 top-10 w-80 bg-ink-800 border border-ink-600
                    rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-ink-700">
                      <h4 className="font-ui font-semibold text-sm text-ink-200">Notifications</h4>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifs.length === 0 ? (
                        <p className="text-center text-ink-500 text-sm py-6 font-ui">No notifications yet</p>
                      ) : notifs.map(n => (
                        <div key={n.id} onClick={() => markNotifRead(n.id)}
                          className={`px-4 py-3 border-b border-ink-700/50 cursor-pointer
                          hover:bg-ink-700 transition-colors ${!n.read ? 'bg-amber-400/5' : ''}`}>
                          <p className="text-sm text-ink-200 font-ui">{n.message}</p>
                          <p className="text-xs text-ink-500 font-mono mt-1">{n.createdAt?.slice(0,10)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Admin */}
              {isAdmin(user) && (
                <Link to="/admin" className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                  bg-purple-900/30 border border-purple-700/50 text-purple-300 text-xs font-ui
                  font-semibold hover:bg-purple-900/50 transition-colors">
                  <Shield size={13} /> Admin
                </Link>
              )}

              {/* Profile */}
              <Link to={`/profile/${user.username}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-800
                border border-ink-600 text-ink-200 text-sm font-ui hover:border-ink-500 transition-colors">
                <User size={14} />
                <span className="max-w-[80px] truncate">{user.username}</span>
              </Link>

              <button onClick={handleLogout} className="p-2 rounded-lg text-ink-500
                hover:text-rose-400 hover:bg-ink-800 transition-colors">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-1.5 text-sm font-ui font-medium
                text-ink-300 hover:text-ink-100 transition-colors">Login</Link>
              <Link to="/register" className="px-3 py-1.5 text-sm font-ui font-semibold
                bg-amber-500 hover:bg-amber-400 text-black rounded-lg transition-colors">
                Join
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 text-ink-400 hover:text-ink-200">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-700 bg-ink-900 px-4 py-3 flex flex-col gap-1">
          {CATEGORIES.filter(c => c.active).map(cat => (
            <Link key={cat.id} to={`/category/${cat.id}`} onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-ui
              text-ink-300 hover:bg-ink-800 hover:text-ink-100">
              {cat.icon} {cat.label}
            </Link>
          ))}
          <Link to="/halloffame" onClick={() => setMobileOpen(false)}
            className="px-3 py-2.5 rounded-lg text-sm font-ui text-ink-300 hover:bg-ink-800">
            🏆 Hall of Fame
          </Link>
        </div>
      )}
    </header>
  );
}
