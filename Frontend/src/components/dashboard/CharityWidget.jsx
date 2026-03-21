import React from 'react';
import { motion } from 'framer-motion';
import { Check, Globe, Heart } from 'lucide-react';
import { useApp } from '../../Context/AppContext';

export default function CharityWidget({
  charityId,
  charityPct,
  setCharityPct,
  subPrice,
  charities = [],
  selectedCharityId,
  setSelectedCharityId,
  onSave,
  saving = false,
}) {
  const { navigate } = useApp();
  const currentCharityId = selectedCharityId || charityId?._id || charityId;
  const charity = charities.find((item) => item._id === currentCharityId) || (typeof charityId === 'object' ? charityId : null);
  const charityAmt = ((subPrice * charityPct) / 100).toFixed(2);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="p-8 rounded-[28px] border border-cyan-500/20 bg-cyan-500/5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-black text-white mb-1">Your Charity</h3>
          <p className="text-xs text-white/35">Visible contribution settings for your active subscription</p>
        </div>
        <Heart size={20} className="text-cyan-400" />
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 overflow-hidden">
          {charity?.imageUrl ? (
            <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
          ) : (
            <Globe size={20} className="text-cyan-400" />
          )}
        </div>
        <div>
          <div className="font-black text-white">{charity?.name || 'Selected charity'}</div>
          <div className="text-xs text-white/40">{charity?.impact || 'Making verified community impact'}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between gap-4 text-sm mb-2">
          <span className="text-white/50">Current contribution</span>
          <span className="font-black text-cyan-400">{charityPct}% - ${charityAmt}</span>
        </div>
        <div className="text-xs text-white/35 mb-3">
          Reselect your charity or adjust the percentage directed to impact, then save both changes together.
        </div>
        {charities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {charities.map((item) => {
              const isSelected = item._id === currentCharityId;
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => setSelectedCharityId?.(item._id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-cyan-500/40 bg-cyan-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-black text-white text-sm">{item.name}</div>
                      <div className="text-xs text-white/40 mt-1">{item.impact || 'Verified charity partner'}</div>
                    </div>
                    {isSelected && <Check size={16} className="text-cyan-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <input
          type="range"
          min={10}
          max={50}
          value={charityPct}
          onChange={(e) => setCharityPct(Number(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between text-[10px] text-white/25 mt-1">
          <span>Min 10%</span><span>Max 50%</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button onClick={() => navigate('charities')}
          className="text-xs text-white/35 hover:text-cyan-400 transition-colors font-bold text-left">
          View charities and impact details
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !currentCharityId}
          className="rounded-xl bg-cyan-500 px-5 py-3 text-xs font-black tracking-[0.2em] text-black disabled:opacity-50"
        >
          {saving ? 'SAVING...' : 'SAVE CHARITY'}
        </button>
      </div>
    </motion.div>
  );
}
