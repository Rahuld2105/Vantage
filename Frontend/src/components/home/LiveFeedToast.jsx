import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveFeed } from '../../hooks/useLiveFeed';

export default function LiveFeedToast() {
  const { message, index } = useLiveFeed();
  return (
    <motion.div initial={{ y:100 }} animate={{ y:0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] hidden md:flex items-center gap-4 px-6 py-3 bg-[#020203]/90 backdrop-blur-3xl border border-white/10 rounded-full text-[10px] font-black tracking-widest text-white/50 shadow-2xl max-w-[90vw]">
      <span className="text-cyan-400 shrink-0">LIVE:</span>
      <AnimatePresence mode="wait">
        <motion.span key={index} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }} className="uppercase truncate">
          {message}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
