import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export default function SubscriptionCard({ planName, price, charityPct, charityAmt, renewDate, status }) {
  const rows = [
    { label: 'Plan', value: planName },
    { label: 'Billing', value: typeof price === 'number' ? `$${price}/month` : `$${price}` },
    { label: 'Status', value: (status || 'active').toUpperCase() },
    { label: 'Charity share', value: `${charityPct}% ($${charityAmt})` },
    { label: 'Next renewal', value: renewDate },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="p-6 rounded-[24px] border border-white/10 bg-white/[0.02]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black text-white">Subscription</h3>
        <ShieldCheck size={18} className="text-emerald-400" />
      </div>
      <p className="text-xs text-white/35 mb-5">Your active membership should be easy to verify at a glance, including price, charity allocation, and renewal timing.</p>
      <div className="space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between gap-4 text-sm py-2.5 border-b border-white/5 last:border-0">
            <span className="text-white/40">{row.label}</span>
            <span className="font-bold text-white text-right">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/45">
        Need to change your selected charity or contribution percentage? Use the dashboard controls instead of starting checkout again.
      </div>
    </motion.div>
  );
}
