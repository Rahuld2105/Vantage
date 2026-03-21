import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { COLOR_MAP } from '../../data/charities';

const FALLBACK_COLOR = COLOR_MAP.cyan;

export default function CharityCard({ charity, index = 0, onSelect }) {
  const col = COLOR_MAP[charity.color] || FALLBACK_COLOR;
  const events = Array.isArray(charity.events) ? charity.events : [];

  return (
    <motion.button
      type="button"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay:index * 0.05 }}
      onClick={() => onSelect?.(charity)}
      className={`w-full text-left p-6 rounded-[24px] border ${col.border} ${col.bg} hover:scale-[1.02] transition-all cursor-pointer group`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border ${col.border} ${col.text} bg-white/5`}>
          {charity.category}
        </span>
        {events.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-white/30">
            <Calendar size={10} />{events.length} event{events.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
      <h3 className="text-lg font-black text-white mb-2">{charity.name}</h3>
      <p className="text-sm text-white/40 mb-4 leading-relaxed">{charity.description}</p>
      <div className="flex gap-4 mb-4">
        <div>
          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">Raised</div>
          <div className="text-sm font-black text-white">
            £{Number(charity.raised || 0).toLocaleString('en-GB')}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/25 uppercase tracking-widest mb-0.5">Impact</div>
          <div className="text-sm font-black text-white">{charity.impact || 'Verified partner'}</div>
        </div>
      </div>
      {events.length > 0 && (
        <div className="space-y-1">
          {events.slice(0, 2).map((event, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[10px] text-white/30 bg-white/5 rounded-lg px-3 py-1.5">
              <Calendar size={9} /> {event.title || event}
            </div>
          ))}
        </div>
      )}
    </motion.button>
  );
}
