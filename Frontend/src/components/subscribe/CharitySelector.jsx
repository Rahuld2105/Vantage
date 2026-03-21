import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { COLOR_MAP } from '../../data/charities';

const FALLBACK_COLOR = COLOR_MAP.cyan;

export default function CharitySelector({
  charities,
  charity,
  setCharity,
  charityPct,
  setCharityPct,
  billing,
  price,
  onNext,
  onBack,
}) {
  const charityAmt = ((price * charityPct) / 100).toFixed(2);
  const firstCharityId = charities[0]?.uid ?? charities[0]?._id ?? charities[0]?.id ?? null;
  const selectedCharityId = charity ?? firstCharityId;
  const canContinue = Boolean(selectedCharityId);

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="text-xl font-black text-white mb-2">Select Your Charity</h3>
      <p className="text-white/45 text-sm mb-6 max-w-2xl">
        Pick the charity you want attached to this membership. A minimum of 10% of your subscription is directed to the selected cause, and you can increase that amount before paying.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {charities.map((item) => {
          const charityId = item.uid ?? item._id ?? item.id ?? null;
          const col = COLOR_MAP[item.color] || FALLBACK_COLOR;

          return (
            <button
              key={charityId}
              type="button"
              onClick={() => setCharity(charityId)}
              className={`cursor-pointer p-4 sm:p-5 rounded-2xl border transition-all text-left ${
                selectedCharityId === charityId ? `${col.border} ${col.bg}` : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 mt-1 border-2 transition-all ${selectedCharityId === charityId ? `${col.dot} border-transparent` : 'border-white/30'}`} />
                <div>
                  <div className="font-bold text-white text-sm">{item.name}</div>
                  <div className="text-xs text-white/40 mt-0.5">{item.impact}</div>
                  <div className="text-xs text-white/30 mt-2">Selected charity remains visible in the review step and dashboard.</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedCharityId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-2xl mb-6"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2 sm:gap-4">
            <span className="text-sm font-bold text-white">Current charity contribution</span>
            <span className="text-sm font-black text-cyan-400">{charityPct}% - ${charityAmt}/{billing === 'monthly' ? 'mo' : 'yr'}</span>
          </div>
          <div className="text-xs text-white/35 mb-3">
            Increase this percentage if you want more of your subscription directed toward impact.
          </div>
          <input
            type="range"
            min={10}
            max={50}
            value={charityPct}
            onChange={(e) => setCharityPct(Number(e.target.value))}
            className="w-full accent-cyan-500 mb-2"
          />
          <div className="flex justify-between text-[10px] text-white/30"><span>Min 10%</span><span>Max 50%</span></div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-4 bg-white/5 text-white/60 font-bold text-xs tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-all"
        >
          BACK
        </button>
        <button
          type="button"
          onClick={() => {
            if (!selectedCharityId) return;
            if (!charity) {
              setCharity(selectedCharityId);
            }
            onNext();
          }}
          disabled={!canContinue}
          className="flex-1 py-4 bg-cyan-500 text-black font-black text-sm tracking-widest rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          REVIEW DETAILS <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
