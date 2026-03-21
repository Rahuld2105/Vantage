import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const statusColorMap = {
  pending: 'text-yellow-400',
  approved: 'text-cyan-400',
  rejected: 'text-red-400',
  paid: 'text-emerald-400',
};

export default function WinningsCard({ winnings = [] }) {
  const total = winnings.reduce((sum, winner) => sum + Number(winner.prizeAmount || 0), 0);

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
      className="p-6 rounded-[24px] border border-white/10 bg-white/[0.02]">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-black text-white">Winnings</h3>
        <Wallet size={18} className="text-cyan-400" />
      </div>
      <div className="text-3xl font-black text-white mb-1">£{total.toFixed(2)}</div>
      <div className="text-xs text-white/30 mb-5">Total won lifetime</div>
      <div className="space-y-2">
        {winnings.length ? winnings.map((winner) => (
          <div key={winner._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs">
            <div>
              <div className="font-bold text-white">
                {winner.drawId?.month || 'Draw Result'}
              </div>
              <div className="text-white/40">{winner.tier}</div>
            </div>
            <div className="text-right">
              <div className="font-black text-white">£{Number(winner.prizeAmount || 0).toFixed(2)}</div>
              <div className={`font-bold ${statusColorMap[winner.paymentStatus] || 'text-white/50'}`}>
                {(winner.paymentStatus || 'pending').toUpperCase()}
              </div>
            </div>
          </div>
        )) : (
          <div className="p-3 bg-white/5 rounded-xl text-xs text-white/40">
            No winnings yet. Keep your scores current to enter future draws.
          </div>
        )}
      </div>
    </motion.div>
  );
}
