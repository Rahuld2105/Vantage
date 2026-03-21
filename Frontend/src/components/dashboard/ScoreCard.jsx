import React from 'react';
import { motion } from 'framer-motion';

export default function ScoreCard({ scores, onEdit, onAdd }) {
  const avg = scores.length
    ? (scores.reduce((total, score) => total + Number(score.value), 0) / scores.length).toFixed(1)
    : '--';
  const best = scores.length ? Math.max(...scores.map((score) => Number(score.value))) : '--';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6 sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="mb-1 text-lg font-black text-white">Your Scores</h3>
          <p className="text-xs text-white/30">Stableford | Last 5 rounds | Rolling window</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-white px-4 py-2 text-xs font-black tracking-widest text-black transition-all hover:bg-cyan-400"
          >
            ADD SCORE
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-black tracking-widest text-cyan-400 transition-all hover:bg-cyan-500/20"
          >
            EDIT SCORES
          </button>
        </div>
      </div>

      <div className="mb-4 flex h-32 items-end gap-3">
        {scores.length === 0 ? (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 text-center text-sm text-white/25">
            No scores yet. Click Add Score to enter your latest round.
          </div>
        ) : (
          scores.map((score, index) => (
            <div key={`${score.date}-${index}`} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-black text-white">{score.value}</span>
              <div
                className="relative w-full overflow-hidden rounded-t-lg bg-cyan-500/10"
                style={{ height: `${(Number(score.value) / 45) * 96}px` }}
              >
                <div className={`absolute inset-0 rounded-t-lg ${index === 0 ? 'bg-cyan-500' : 'bg-cyan-500/40'}`} />
              </div>
              <span className="text-center text-[9px] text-white/25">
                {new Date(score.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30">Average</div>
          <div className="text-lg font-black text-white">{avg}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30">Best</div>
          <div className="text-lg font-black text-cyan-400">{best}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/30">Rounds</div>
          <div className="text-lg font-black text-white">{scores.length}/5</div>
        </div>
      </div>
    </motion.div>
  );
}
