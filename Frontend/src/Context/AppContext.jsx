import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AppContext = createContext(null);

const getPageFromLocation = () => {
  const path = window.location.pathname.toLowerCase();

  if (path.startsWith('/dashboard')) return 'dashboard';
  if (path.startsWith('/subscribe')) return 'subscribe';
  if (path.startsWith('/charities')) return 'charities';
  if (path.startsWith('/admin')) return 'admin';
  return 'home';
};

const getPathForPage = (page) => {
  switch (page) {
    case 'dashboard':
      return '/dashboard';
    case 'subscribe':
      return '/subscribe';
    case 'charities':
      return '/charities';
    case 'admin':
      return '/admin';
    default:
      return '/';
  }
};

export function AppProvider({ children }) {
  const [page, setPage] = useState(getPageFromLocation);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
    setPage('home');
    window.history.replaceState({}, '', '/');
  }, []);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getMe();
      setUser(response.data);
    } catch (err) {
      console.error('Failed to load user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Load user on app start if token exists
  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);

  // Scroll to top on every page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [page]);

  useEffect(() => {
    const onPopState = () => {
      setPage(getPageFromLocation());
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const register = async (registrationData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.register(registrationData);
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const navigate = (dest, anchor) => {
    setPage(dest);
    const nextPath = getPathForPage(dest);
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    if (anchor) {
      setTimeout(() => {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  };

  const clearError = () => setError(null);

  return (
    <AppContext.Provider
      value={{
        // Navigation
        page,
        setPage,
        navigate,
        
        // Auth
        user,
        token,
        loading,
        error,
        clearError,
        isLoggedIn: !!token && !!user,
        isAdmin: user?.role === 'admin',
        register,
        login,
        logout,
        loadUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
