import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, PlusCircle, Zap } from 'lucide-react';
import { useApp } from '../../Context/AppContext';
import { NAV_LINKS } from '../../data/constants';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';

export default function Navbar() {
  const { navigate, isLoggedIn, user, logout, isAdmin } = useApp();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showAdminLoginForm, setShowAdminLoginForm] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState('');

  const openScoreEntry = () => {
    if (!isLoggedIn) {
      setLoginPrompt('You need to sign in before adding a score.');
      setShowLoginForm(true);
      return;
    }

    navigate('dashboard');
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('vantage:open-score-modal', { detail: { mode: 'add' } }));
    }, 120);
  };

  const openLogin = () => {
    setLoginPrompt('');
    setShowLoginForm(true);
  };

  return (
    <>
      <nav className="fixed left-0 right-0 top-0 z-[100] border-b border-white/5 bg-[#020203]/75 px-4 py-4 backdrop-blur-2xl sm:px-6 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('home')}
            className="group flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-10 w-10 rotate-3 items-center justify-center rounded-xl bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-transform duration-500 group-hover:rotate-12">
              <Zap size={18} className="fill-current text-black" />
            </div>
            <div>
              <span className="block text-lg font-black tracking-tighter text-white">VANTAGE</span>
              <span className="hidden text-[10px] uppercase tracking-[0.3em] text-white/30 sm:block">Play for impact</span>
            </div>
          </motion.div>

          <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase">
            {NAV_LINKS.map((link) => (
              <button
                key={link.anchor}
                onClick={() => navigate('home', link.anchor)}
                className="group relative transition-colors hover:text-cyan-400"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-500 transition-all group-hover:w-full" />
              </button>
            ))}
            <button
              onClick={() => navigate('charities')}
              className="group relative transition-colors hover:text-cyan-400"
            >
              Charities
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-cyan-500 transition-all group-hover:w-full" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={openScoreEntry}
              className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-black tracking-[0.22em] text-cyan-400 transition-all hover:bg-cyan-500/20 sm:px-5"
            >
              <PlusCircle size={12} />
              <span className="hidden sm:inline">ADD SCORE</span>
              <span className="sm:hidden">SCORE</span>
            </motion.button>

            {isLoggedIn && user ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(isAdmin ? 'admin' : 'dashboard')}
                  className="hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-[10px] font-black tracking-widest text-cyan-400 transition-all hover:bg-cyan-500/20 md:block"
                >
                  {isAdmin ? 'ADMIN PANEL' : user.name}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={logout}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black tracking-widest text-white transition-all hover:bg-red-500/20 hover:text-red-400 sm:px-5"
                >
                  <LogOut size={12} />
                  <span className="hidden sm:inline">LOGOUT</span>
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAdminLoginForm(true)}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-[10px] font-black tracking-widest text-amber-300 transition-all hover:bg-amber-500/20 sm:px-5"
                >
                  ADMIN
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openLogin}
                  className="hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-[10px] font-black tracking-widest text-cyan-400 transition-all hover:bg-cyan-500/20 md:block"
                >
                  SIGN IN
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('subscribe')}
                  className="rounded-full bg-white px-4 py-2 text-[10px] font-black tracking-widest text-black transition-all hover:bg-cyan-400 sm:px-5"
                >
                  JOIN NOW
                </motion.button>
              </>
            )}
          </div>
        </div>
      </nav>

      {showLoginForm && (
        <LoginForm
          introMessage={loginPrompt}
          onClose={() => {
            setLoginPrompt('');
            setShowLoginForm(false);
          }}
          onSwitchToRegister={() => {
            setLoginPrompt('');
            setShowLoginForm(false);
            setShowRegisterForm(true);
          }}
        />
      )}

      {showAdminLoginForm && (
        <LoginForm
          mode="admin"
          onClose={() => setShowAdminLoginForm(false)}
          onSwitchToRegister={() => {}}
        />
      )}

      {showRegisterForm && (
        <RegisterForm
          onClose={() => setShowRegisterForm(false)}
          onSwitchToLogin={() => {
            setShowRegisterForm(false);
            setShowLoginForm(true);
          }}
        />
      )}
    </>
  );
}
