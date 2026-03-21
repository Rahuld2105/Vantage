import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';

export default function ProfileCard({ user, onSave, saving = false }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await onSave?.(form);
      setForm((current) => ({ ...current, password: '' }));
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.message || 'Failed to update profile.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="p-8 rounded-[28px] border border-white/10 bg-white/[0.02]"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-black text-white mb-1">Your Profile</h3>
          <p className="text-xs text-white/35">Update the member details tied to your account.</p>
        </div>
        <UserRound size={20} className="text-cyan-400" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Full name"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
          />
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
            type="email"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
          />
        </div>

        <input
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          placeholder="New password (optional)"
          type="password"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30"
        />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-white/35">
            Leave password blank to keep your current password unchanged.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-cyan-500 px-5 py-3 text-xs font-black tracking-[0.2em] text-black disabled:opacity-50"
          >
            {saving ? 'SAVING...' : 'SAVE PROFILE'}
          </button>
        </div>

        {message && (
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/60">
            {message}
          </div>
        )}
      </form>
    </motion.div>
  );
}
