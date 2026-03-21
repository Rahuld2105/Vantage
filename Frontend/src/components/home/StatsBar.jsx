import React from 'react';
import { motion } from 'framer-motion';
import { SITE_STATS } from '../../data/constants';

export default function StatsBar() {
  return (
    <section className="border-y border-white/5 bg-white/[0.015] px-4 py-16 sm:px-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 text-center md:grid-cols-4 md:gap-8">
        {SITE_STATS.map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:10 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
            className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-5">
            <div className="text-3xl md:text-4xl font-black text-white mb-2">{s.value}</div>
            <div className="text-xs text-white/30 uppercase tracking-widest">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
