import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, logout as authLogout } from './auth';
import { syncAllCycles, initializeCycles } from './cycle';
import { getNotifs } from './storage';

const Ctx = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notifs, setNotifs]     = useState([]);
  const [cycleVersion, setCycleVersion] = useState(0); // bump to re-render

  const refreshUser = useCallback(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) setNotifs(getNotifs(u.id));
  }, []);

  const refreshCycles = useCallback(() => {
    syncAllCycles();
    setCycleVersion(v => v + 1);
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    setNotifs([]);
  }, []);

  useEffect(() => {
    initializeCycles();
    syncAllCycles();
    refreshUser();
    setLoading(false);
    // Sync cycles every minute
    const interval = setInterval(() => {
      syncAllCycles();
      setCycleVersion(v => v + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, notifs, cycleVersion, refreshUser, refreshCycles, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useApp = () => useContext(Ctx);
