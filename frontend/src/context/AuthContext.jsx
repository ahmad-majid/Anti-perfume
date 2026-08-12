import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';

export const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interval ref for proactive token refresh (refresh ~1 min before 15-min expiry)
  const refreshTimerRef = useRef(null);

  // ── Persist user to localStorage ────────────────────────────────────────
  const persistUser = (data) => {
    setUser(data);
    if (data) {
      localStorage.setItem('userInfo', JSON.stringify(data));
    } else {
      localStorage.removeItem('userInfo');
    }
  };

  // ── Refresh access token using stored refresh token ───────────────────
  const refreshAccessToken = useCallback(async (currentUser) => {
    const stored = currentUser || user;
    if (!stored?.refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });

      if (!res.ok) {
        // Refresh token invalid/expired — log out silently
        persistUser(null);
        return null;
      }

      const data = await res.json();
      const updatedUser = { ...stored, token: data.token, refreshToken: data.refreshToken };
      persistUser(updatedUser);
      scheduleRefresh(updatedUser);
      return updatedUser;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Schedule proactive refresh 14 minutes after login ────────────────
  const scheduleRefresh = (currentUser) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (!currentUser?.refreshToken) return;
    // Access token lasts 15 min — refresh after 13 min to give 2 min buffer
    refreshTimerRef.current = setTimeout(() => {
      refreshAccessToken(currentUser);
    }, 13 * 60 * 1000);
  };

  // ── authedFetch — wrapper that auto-retries once on 401 ───────────────
  const authedFetch = useCallback(async (url, options = {}) => {
    const currentUser = JSON.parse(localStorage.getItem('userInfo'));
    if (!currentUser) return fetch(url, options);

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${currentUser.token}`,
    };

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401 && currentUser.refreshToken) {
      // Token expired — try to refresh and retry once
      const refreshed = await refreshAccessToken(currentUser);
      if (refreshed) {
        const retryHeaders = { ...(options.headers || {}), Authorization: `Bearer ${refreshed.token}` };
        res = await fetch(url, { ...options, headers: retryHeaders });
      }
    }

    return res;
  }, [refreshAccessToken]);

  // ── Boot: restore session from localStorage ───────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('userInfo');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      scheduleRefresh(parsed);
    }
    setLoading(false);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      persistUser(data);
      scheduleRefresh(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // ── Register ──────────────────────────────────────────────────────────
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      persistUser(data);
      scheduleRefresh(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────
  const logout = async () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    // Fire-and-forget server-side logout to delete refresh tokens
    if (user?.token) {
      fetch(`${API_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      }).catch(() => {});
    }
    persistUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError, authedFetch }}>
      {children}
    </AuthContext.Provider>
  );
};
