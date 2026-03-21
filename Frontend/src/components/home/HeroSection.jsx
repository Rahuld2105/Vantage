import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Activity, ShieldCheck, Trophy, ChevronRight } from 'lucide-react';
import { useApp } from '../../Context/AppContext';

const TRUST_POINTS = [
  'Choose a verified charity before you pay',
  'Monthly and yearly plans with clear pricing',
  'Stripe checkout and dashboard tracking included',
];

export default function HeroSection() {
  const { navigate } = useApp();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 sm:px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cyan-600/8 blur-[200px] rounded-full" />
        <motion.div
          animate={{ opacity: [0.08, 0.16, 0.08], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/8 blur-[160px] rounded-full"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <motion.div style={{ opacity, scale }} className="z-10 max-w-6xl pt-24 pb-16 text-center sm:pt-28 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/8 px-4 py-2 text-[9px] font-black uppercase tracking-[0.24em] text-cyan-300 sm:mb-8 sm:px-5 sm:text-[10px] sm:tracking-[0.3em] shadow-[0_0_30px_rgba(34,211,238,0.08)]"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Golf Subscription + Charity Impact
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-5 text-[42px] font-black leading-[0.92] tracking-[-0.05em] text-white sm:mb-6 sm:text-6xl sm:leading-[0.88] md:text-[92px]"
        >
          PLAY FOR
          <br />
          <span className="bg-gradient-to-b from-white via-cyan-100 to-white/20 bg-clip-text text-transparent">
            PRIZES. FUND IMPACT.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mb-5 max-w-3xl text-base font-medium leading-relaxed text-white/72 sm:mb-6 sm:text-lg md:text-xl"
        >
          Vantage is a subscription for golfers: choose a plan, support a verified charity, enter monthly draws,
          and track everything from one dashboard.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mx-auto mb-8 max-w-2xl px-2 text-sm leading-relaxed text-white/48 sm:mb-10 sm:px-0 md:text-base"
        >
          You pay a fixed monthly or yearly amount. A visible percentage goes to your chosen cause. The rest powers
          your membership benefits and draw entry.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="mx-auto mb-10 grid max-w-4xl grid-cols-1 gap-3 sm:mb-12 md:grid-cols-3"
        >
          {TRUST_POINTS.map((point) => (
            <div key={point} className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm text-white/68 backdrop-blur-sm md:text-center">
              {point}
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="flex flex-col justify-center gap-3 sm:gap-4 md:flex-row"
        >
          <button
            onClick={() => navigate('subscribe')}
            className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-xs font-black tracking-widest text-black transition-all hover:scale-[1.01] hover:bg-cyan-400 sm:w-auto sm:px-12 sm:py-5 shadow-[0_18px_60px_rgba(255,255,255,0.08)]"
          >
            CHOOSE A PLAN <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-xs font-black tracking-widest text-white transition-all hover:bg-white/10 sm:w-auto sm:px-12 sm:py-5"
          >
            SEE HOW IT WORKS
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-12 hidden lg:block p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
      >
        <div className="flex items-center gap-4">
          <ShieldCheck className="text-cyan-500" size={20} />
          <div className="text-left">
            <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Trust Layer</div>
            <div className="text-sm font-bold text-white">Verified charities and secure Stripe checkout</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 16, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-32 right-12 hidden lg:block p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
      >
        <div className="flex items-center gap-4">
          <Trophy className="text-yellow-400" size={20} />
          <div className="text-left">
            <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Current Jackpot</div>
            <div className="text-sm font-bold text-white">$24,200</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        className="absolute top-32 right-16 hidden xl:block p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
      >
        <div className="flex items-center gap-4">
          <Activity className="text-emerald-400" size={20} />
          <div className="text-left">
            <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Member View</div>
            <div className="text-sm font-bold text-white">Plan, charity, status, and impact in one dashboard</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
