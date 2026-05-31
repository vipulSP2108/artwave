import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './AppContext';
import { isAdmin } from './auth';
import { initStorage } from './storage';
import Navbar from './components/Navbar';

import HomePage         from './pages/HomePage';
import CategoryPage     from './pages/CategoryPage';
import SubmitPage       from './pages/SubmitPage';
import SubmissionPage   from './pages/SubmissionPage';
import LeaderboardPage  from './pages/LeaderboardPage';
import HallOfFamePage   from './pages/HallOfFamePage';
import ProfilePage      from './pages/ProfilePage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminQueue       from './pages/admin/AdminQueue';
import AdminCycles      from './pages/admin/AdminCycles';

function AdminRoute({ children }) {
  const { user } = useApp();
  if (!user || !isAdmin(user)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      <Navbar />
      <Routes>
        <Route path="/"                              element={<HomePage />} />
        <Route path="/category/:id"                  element={<CategoryPage />} />
        <Route path="/category/:id/submit"           element={<SubmitPage />} />
        <Route path="/category/:id/leaderboard"      element={<LeaderboardPage />} />
        <Route path="/submission/:id"                element={<SubmissionPage />} />
        <Route path="/halloffame"                    element={<HallOfFamePage />} />
        <Route path="/profile/:username"             element={<ProfilePage />} />
        <Route path="/login"                         element={<LoginPage />} />
        <Route path="/register"                      element={<RegisterPage />} />
        <Route path="/admin"                         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/queue/:categoryId"       element={<AdminRoute><AdminQueue /></AdminRoute>} />
        <Route path="/admin/cycles"                  element={<AdminRoute><AdminCycles /></AdminRoute>} />
        <Route path="*"                              element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initStorage().then(() => setIsReady(true));
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center text-ink-300 font-mono text-sm">
        Initializing file-based storage...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
