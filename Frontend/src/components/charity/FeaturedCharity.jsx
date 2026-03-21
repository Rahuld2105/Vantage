import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Star, Calendar, ArrowRight } from 'lucide-react';
import { charityAPI } from '../../services/api';
import { useApp } from '../../Context/AppContext';

export default function FeaturedCharity() {
  const { navigate } = useApp();
  const [charity, setCharity] = useState(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const response = await charityAPI.getAll();
        const charities = response.data?.charities || [];
        setCharity(charities.find((item) => item.featured) || charities[0] || null);
      } catch {
        setCharity(null);
      }
    };

    loadFeatured();
  }, []);

  if (!charity) {
    return (
      <div className="p-8 rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent text-white/50 text-center">
        No featured charity available
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
      className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-transparent p-8 md:p-12">
      <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
        <Star size={10} className="text-cyan-400 fill-current" />
        <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">Featured Charity</span>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 overflow-hidden">
          {charity.imageUrl ? (
            <img src={charity.imageUrl} alt={charity.name} className="w-full h-full object-cover" />
          ) : (
            <Globe size={28} className="text-cyan-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-cyan-500 tracking-[0.3em] uppercase mb-2">This Month's Spotlight</div>
          <h3 className="text-3xl font-black text-white mb-3">{charity.name}</h3>
          <p className="text-white/50 mb-6 leading-relaxed">{charity.description}</p>
          <div className="flex flex-wrap gap-6 mb-6">
            <div>
              <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Total Raised</div>
              <div className="text-xl font-black text-white">£{Number(charity.raised || 0).toLocaleString('en-GB')}</div>
            </div>
            <div>
              <div className="text-xs text-white/30 uppercase tracking-widest mb-1">Impact</div>
              <div className="text-xl font-black text-white">{charity.impact || 'Verified partner'}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.isArray(charity.events) && charity.events.length > 0 && charity.events.map((event, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50">
                <Calendar size={10} />
                {event.title || 'Upcoming event'}
              </div>
            ))}
            <button onClick={() => navigate('charities')}
              className="flex items-center gap-2 px-4 py-1.5 bg-cyan-500 text-black rounded-full text-[10px] font-black tracking-widest hover:bg-cyan-400 transition-all">
              View All Charities <ArrowRight size={10} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
