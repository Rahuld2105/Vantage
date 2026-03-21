import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Info } from 'lucide-react';

const getToday = () => new Date().toISOString().split('T')[0];

export default function ScoreModal({ scores, onSave, onClose, mode = 'edit' }) {
  const initialDraft = (() => {
    const existingScores = scores.map((score) => ({ ...score }));
    if (mode === 'add' && existingScores.length < 5) {
      return [{ value: '', date: getToday() }, ...existingScores];
    }
    return existingScores;
  })();
  const [draft, setDraft] = useState(initialDraft);

  const addScore = () => {
    if (draft.length >= 5) return;
    setDraft((current) => [{ value: '', date: getToday() }, ...current]);
  };

  const removeScore = (index) => {
    setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateScore = (index, field, value) => {
    setDraft((current) =>
      current.map((score, itemIndex) => (itemIndex === index ? { ...score, [field]: value } : score))
    );
  };

  const isValid =
    draft.length === 0 ||
    draft.every((score) => score.value !== '' && Number(score.value) >= 1 && Number(score.value) <= 45 && score.date);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 sm:p-6 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0a0a0b] p-6 sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-black text-white">{mode === 'add' ? 'Add Score' : 'Manage Scores'}</h3>
            <p className="mt-1 text-xs text-white/40">Stableford | Range 1-45 | Last 5 rounds only</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-all hover:bg-white/20"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        <div className="mb-4 space-y-3">
          {draft.length < 5 && (
            <button
              type="button"
              onClick={addScore}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 py-3 text-xs text-white/30 transition-all hover:border-cyan-500/40 hover:text-cyan-400"
            >
              <Plus size={12} />
              Add Another Score
            </button>
          )}

          {draft.map((score, index) => (
            <motion.div
              key={`${score.date}-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={score.value}
                  onChange={(event) => updateScore(index, 'value', event.target.value)}
                  placeholder="Score"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-center text-base font-black text-white outline-none transition-colors focus:border-cyan-500 sm:w-24"
                />
                <input
                  type="date"
                  value={score.date}
                  onChange={(event) => updateScore(index, 'date', event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/75 outline-none transition-colors focus:border-cyan-500"
                />
              </div>
              <button
                type="button"
                onClick={() => removeScore(index)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 transition-all hover:bg-red-500/20"
              >
                <Minus size={10} className="text-white/40" />
              </button>
            </motion.div>
          ))}

          {draft.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/20">
              No scores yet. Add your first round above.
            </div>
          )}
        </div>

        <div className="mb-6 flex items-start gap-2 rounded-xl bg-white/5 p-3 text-[10px] text-white/30">
          <Info size={10} className="mt-0.5 shrink-0" />
          Only your latest 5 scores are kept. When you add a new one, the oldest score drops out automatically.
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isValid) return;
            onSave(draft.slice(0, 5));
            onClose();
          }}
          disabled={!isValid}
          className="w-full rounded-xl bg-cyan-500 py-4 text-xs font-black tracking-widest text-black transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          SAVE SCORES
        </button>
      </motion.div>
    </div>
  );
}
