import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Heart, ChevronRight } from 'lucide-react';
import { PLANS } from '../../data/plans';

export default function PlanSelector({ billing, setBilling, tier, setTier, onNext }) {
  const hasSelectedPlan = tier !== null && tier !== undefined;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="mb-6">
        <h3 className="text-xl font-black text-white mb-2">Pick Your Membership</h3>
        <p className="text-sm text-white/45 max-w-2xl">
          Compare the plans first. Your selected price, charity split, and checkout review all update from this choice.
        </p>
      </div>

      <div className="flex w-full sm:w-fit items-center gap-1 mb-8 p-1 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
        {['monthly', 'yearly'].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setBilling(value)}
            className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-black tracking-widest transition-all whitespace-nowrap ${
              billing === value ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            {value.toUpperCase()}
            {value === 'yearly' && <span className="ml-2 text-[9px] text-cyan-400">SAVE 20%</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANS.map((plan) => (
          <motion.button
            key={plan.id}
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => setTier(plan.id)}
            className={`cursor-pointer p-5 sm:p-6 rounded-[24px] border transition-all text-left ${
              tier === plan.id
                ? 'bg-white/10 border-cyan-500/50 shadow-2xl shadow-cyan-500/10'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            {tier === plan.id && <Sparkles size={12} className="text-cyan-400 mb-3 animate-pulse" />}
            <div className="text-[10px] font-bold tracking-[0.2em] text-cyan-500 uppercase mb-1">{plan.name}</div>
            <div className="text-[28px] sm:text-3xl font-black text-white mb-1">
              ${billing === 'monthly' ? plan.monthly : plan.yearly}
              <span className="text-xs text-white/30 font-medium">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <div className="text-xs text-white/40 mb-4">
              Includes membership access, dashboard tracking, and monthly draw eligibility while active.
            </div>
            <div className="flex items-center gap-1 text-[10px] text-cyan-400 mb-4">
              <Heart size={9} /> {plan.impact}
            </div>
            {plan.perks.map((perk, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-white/50 mb-1.5">
                <CheckCircle size={11} className="text-white/20 shrink-0" /> {perk}
              </div>
            ))}
          </motion.button>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!hasSelectedPlan}
        className="w-full py-4 sm:py-5 bg-cyan-500 text-black font-black text-sm tracking-widest rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        CONTINUE TO CHARITY <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}
