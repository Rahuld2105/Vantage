import React from 'react';
import { motion } from 'framer-motion';
import { Dice5 } from 'lucide-react';

export default function DrawStatus({ summary }) {
  const drawRows = [
    {
      label: 'Entry status',
      value: summary?.statusLabel || 'Not Entered',
      color: summary?.isEntered ? 'text-emerald-400' : 'text-white/60',
    },
    {
      label: 'Next draw',
      value: summary?.nextDrawDate || 'TBD',
      color: 'text-white',
    },
    {
      label: 'Eligible draws',
      value: `${summary?.drawsEntered || 0} tracked`,
      color: 'text-white',
    },
    {
      label: 'Current jackpot',
      value: `$${Number(summary?.currentJackpot || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'text-yellow-400',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="p-6 rounded-[24px] border border-white/10 bg-white/[0.02]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black text-white">Draw Status</h3>
        <Dice5 size={18} className="text-purple-400" />
      </div>
      <p className="text-xs text-white/35 mb-5">This card shows whether your current subscription is actively entering you into the draw cycle.</p>
      <div className="space-y-1">
        {drawRows.map((row, i) => (
          <div key={i} className="flex justify-between gap-4 text-sm py-2.5 border-b border-white/5 last:border-0">
            <span className="text-white/40">{row.label}</span>
            <span className={`font-bold text-right ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
