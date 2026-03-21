import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Dice5, Users, Heart } from 'lucide-react';
import { DRAW_TIERS } from '../../data/plans';

const DRAW_FACTS = [
  { label:'Draw Cadence',      value:'Monthly',              icon:Calendar },
  { label:'Draw Logic',        value:'Random + Algorithmic', icon:Dice5    },
  { label:'Split Among Winners',value:'Equal Share',         icon:Users    },
  { label:'Min. Charity Cut',  value:'10% of Sub',           icon:Heart    },
];

export default function DrawEngine() {
  return (
    <section id="draw" className="border-t border-white/5 px-4 py-20 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} className="mb-14 text-center">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.4em] text-cyan-400">Prize Structure</span>
          <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">THE DRAW ENGINE</h3>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/35">Fixed pool shares, automatic calculation, jackpot rollover if no 5-match winner.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {DRAW_TIERS.map((t, i) => (
            <motion.div key={i} initial={{ opacity:0, scale:0.95 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
              className={`relative overflow-hidden rounded-[24px] border bg-white/[0.02] p-8 shadow-2xl transition-all hover:-translate-y-1 hover:bg-white/[0.04] ${t.colorClass}`}>
              {i === 0 && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-[9px] font-black text-yellow-400 tracking-widest">
                  JACKPOT ROLLS OVER
                </div>
              )}
              <div className={`text-3xl font-black mb-1 ${t.textColor}`}>{t.match}</div>
              <div className="text-5xl font-black text-white mb-2">{t.share}<span className="text-lg text-white/30">%</span></div>
              <div className="text-xs text-white/40 mb-4 uppercase tracking-widest">of total prize pool</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${t.badgeClass}`}>{t.prize} Tier</span>
                {t.rollover && <span className="text-[10px] text-white/30">Unclaimed rolls to next month</span>}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap justify-around gap-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6 text-center backdrop-blur-sm">
          {DRAW_FACTS.map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <f.icon size={16} className="text-white/30" />
              <div className="text-xs text-white/30 uppercase tracking-widest">{f.label}</div>
              <div className="text-sm font-black text-white">{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
