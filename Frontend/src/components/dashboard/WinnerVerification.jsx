import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Medal, Upload, CheckCircle } from 'lucide-react';
import { winnerAPI } from '../../services/api';

export default function WinnerVerification({ winners = [], onUpdated, onError }) {
  const inputRef = useRef(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [activeWinnerId, setActiveWinnerId] = useState('');

  const verifiableWinners = winners.filter((winner) =>
    ['pending', 'approved'].includes(winner.paymentStatus)
  );

  const activeWinner =
    verifiableWinners.find((winner) => winner._id === activeWinnerId) ||
    verifiableWinners[0] ||
    null;

  if (!activeWinner) {
    return null;
  }

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSubmittingId(activeWinner._id);
      await winnerAPI.uploadProof(activeWinner._id, file);
      await onUpdated?.();
    } catch (err) {
      onError?.(err.message || 'Failed to upload proof');
    } finally {
      setSubmittingId(null);
      event.target.value = '';
    }
  };

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
      className="p-8 rounded-[28px] border border-yellow-500/20 bg-yellow-500/5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-black text-white mb-1">Winner Verification</h3>
          <p className="text-xs text-yellow-400/70">
            {activeWinner.tier} winner for {activeWinner.drawId?.month || 'your latest draw'}
          </p>
        </div>
        <Medal size={20} className="text-yellow-400" />
      </div>

      {verifiableWinners.length > 1 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {verifiableWinners.map((winner) => {
            const isActive = winner._id === activeWinner._id;
            return (
              <button
                key={winner._id}
                type="button"
                onClick={() => setActiveWinnerId(winner._id)}
                className={`rounded-full border px-3 py-2 text-[10px] font-black tracking-[0.18em] transition-colors ${
                  isActive
                    ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300'
                    : 'border-white/10 text-white/55 hover:border-white/20 hover:text-white/75'
                }`}
              >
                {winner.tier.toUpperCase()} {winner.drawId?.month || 'DRAW'}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-5">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
        <span className="text-xs font-black text-yellow-400 tracking-widest">
          {submittingId
            ? 'UPLOADING PROOF...'
            : activeWinner.proofUrl
              ? 'PROOF SUBMITTED - UNDER REVIEW'
              : 'PAYMENT PENDING - AWAITING PROOF UPLOAD'}
        </span>
      </div>

      {!activeWinner.proofUrl ? (
        <div>
          <p className="text-xs text-white/40 mb-4 leading-relaxed">
            Upload a screenshot of your golf platform scores to verify your win and receive your payout.
          </p>
          <label
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-yellow-500/40 transition-all group"
          >
            <Upload size={20} className="text-white/30 group-hover:text-yellow-400 transition-colors" />
            <div className="text-xs text-white/30 group-hover:text-white/50 transition-colors text-center">
              Click to upload score screenshot
              <br />
              <span className="text-[10px] text-white/20">PNG, JPG - max 5MB</span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
          </label>
        </div>
      ) : (
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
          className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-5">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-black text-emerald-400 tracking-widest">
            Proof uploaded successfully. Your submission is waiting for admin review.
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
