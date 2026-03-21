import React from 'react';
import { useApp } from '../../Context/AppContext';

export default function ProtectedRoute({ component: Component, fallback = null, requireAdmin = false }) {
  const { isLoggedIn, loading, user } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          </div>
          <p className="text-white/40 text-sm mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return fallback || <UnauthorizedPage />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <UnauthorizedPage adminOnly />;
  }

  return <Component />;
}

function UnauthorizedPage({ adminOnly = false }) {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-black text-white mb-4">Access Denied</h1>
        <p className="text-white/40 mb-8">
          {adminOnly
            ? 'You need an admin account to access this page.'
            : 'You need to sign in to access this page.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('home')}
            className="px-8 py-3 bg-white text-black font-black text-xs tracking-widest rounded-xl hover:bg-cyan-400 transition-all"
          >
            GO HOME
          </button>
        </div>
      </div>
    </div>
  );
}
