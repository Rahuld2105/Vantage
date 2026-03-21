import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './Context/AppContext';
import Navbar          from './components/layout/Navbar';
import HomePage        from './pages/HomePage';
import CharitiesPage   from './pages/CharitiesPage';
import SubscribePage   from './pages/subscribePage';
import DashboardPage   from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute  from './components/auth/ProtectedRoute';

function Router() {
  const { page } = useApp();

  const pages = {
    home:       <HomePage />,
    charities:  <CharitiesPage />,
    subscribe:  <SubscribePage />,
    dashboard:  <ProtectedRoute component={DashboardPage} />,
    admin:      <ProtectedRoute component={AdminDashboardPage} requireAdmin />,
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-cyan-500 selection:text-black antialiased font-sans relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-5%] h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-8%] h-[26rem] w-[26rem] rounded-full bg-blue-500/10 blur-[180px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]" />
      </div>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {pages[page] ?? <HomePage />}
        </motion.div>
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        body {
          overflow-x: hidden;
          background: #020203;
          color: white;
        }
        input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          background: rgba(255,255,255,0.1);
          outline: none;
        }
        * {
          scrollbar-width: thin;
          scrollbar-color: rgba(34,211,238,0.35) rgba(255,255,255,0.04);
        }
        *::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        *::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.04);
        }
        *::-webkit-scrollbar-thumb {
          background: rgba(34,211,238,0.3);
          border-radius: 999px;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #06b6d4;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(6,182,212,0.4);
        }
        input[type=date]::-webkit-calendar-picker-indicator {
          filter: invert(0.4);
        }
      `}} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
