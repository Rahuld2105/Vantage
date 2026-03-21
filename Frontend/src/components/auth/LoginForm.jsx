import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Lock } from 'lucide-react';
import { useApp } from '../../Context/AppContext';

export default function LoginForm({ onClose, onSwitchToRegister, mode = 'user', introMessage = '' }) {
  const { login, error, clearError, loading, navigate } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const isAdminMode = mode === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!email || !password) {
      setFormError('Email and password are required');
      return;
    }

    try {
      const result = await login(email, password);

      if (isAdminMode && result.user?.role !== 'admin') {
        setFormError('This account does not have admin access');
        return;
      }

      onClose();
      navigate(result.user?.role === 'admin' ? 'admin' : 'dashboard');
    } catch (err) {
      setFormError(err.message);
    }
  };

  const displayError = formError || error || introMessage;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#0a0a0b] border border-white/10 rounded-[32px] p-8"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">
              {isAdminMode ? 'Admin Sign In' : 'Sign In'}
            </h2>
            <p className="text-xs text-white/40 mt-2">
              {isAdminMode
                ? 'Use an admin account to open the control panel'
                : 'Welcome back to Vantage Impact'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Banner */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400"
            >
              {displayError}
            </motion.div>
          )}

          {/* Email Input */}
          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
              Email
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFormError('');
                }}
                placeholder="your@email.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormError('');
                }}
                placeholder="Enter your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-cyan-500 text-black font-black text-xs tracking-widest rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          {isAdminMode ? (
            <p className="text-xs text-white/40">
              Admin access is controlled from the backend user role.
            </p>
          ) : (
            <p className="text-xs text-white/40">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setEmail('');
                  setPassword('');
                  setFormError('');
                  onSwitchToRegister();
                }}
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
