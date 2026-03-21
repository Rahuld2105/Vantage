import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import FeaturedCharity from '../components/charity/FeaturedCharity';
import CharityCard from '../components/charity/CharityCard';
import Footer from '../components/layout/Footer';
import { CHARITY_CATEGORIES } from '../data/charities';
import { charityAPI } from '../services/api';

const decorateCharity = (charity, index) => {
  const colorCycle = ['cyan', 'purple', 'green', 'amber', 'pink', 'blue'];
  return {
    ...charity,
    color: charity.color || colorCycle[index % colorCycle.length],
  };
};

function CharityDetailModal({ charity, onClose }) {
  const [donation, setDonation] = useState({ name: '', email: '', amount: '', message: '' });
  const [status, setStatus] = useState('');

  if (!charity) return null;

  const handleDonate = async (event) => {
    event.preventDefault();

    try {
      await charityAPI.donate(charity._id, {
        ...donation,
        amount: Number(donation.amount),
      });
      setStatus('Donation submitted successfully.');
      setDonation({ name: '', email: '', amount: '', message: '' });
    } catch (err) {
      setStatus(err.message || 'Failed to submit donation.');
    }
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-[#08090a] p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-black tracking-[0.3em] text-cyan-400 uppercase">{charity.category}</span>
            <h2 className="mt-2 text-3xl font-black text-white">{charity.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {charity.imageUrl && (
          <img src={charity.imageUrl} alt={charity.name} className="w-full h-64 object-cover rounded-[24px] mb-6" />
        )}

        <p className="text-white/60 leading-relaxed mb-6">{charity.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs text-white/35 uppercase tracking-[0.2em] mb-2">Impact</div>
            <div className="text-lg font-black text-white">{charity.impact || 'Verified charity partner'}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-xs text-white/35 uppercase tracking-[0.2em] mb-2">Total Raised</div>
            <div className="text-lg font-black text-white">£{Number(charity.raised || 0).toLocaleString('en-GB')}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-black text-white mb-4">Upcoming Events</h3>
          {Array.isArray(charity.events) && charity.events.length ? (
            <div className="space-y-3">
              {charity.events.map((event, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-bold text-white">{event.title || 'Charity event'}</div>
                  <div className="text-sm text-white/50">
                    {[event.location, event.date && new Date(event.date).toLocaleDateString('en-GB')].filter(Boolean).join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/45 text-sm">
              No upcoming events listed right now.
            </div>
          )}
        </div>

        <form onSubmit={handleDonate} className="mt-8">
          <h3 className="text-lg font-black text-white mb-4">Make an Independent Donation</h3>
          {status && (
            <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
              {status}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={donation.name} onChange={(e) => setDonation({ ...donation, name: e.target.value })}
              placeholder="Your name" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
            <input value={donation.email} onChange={(e) => setDonation({ ...donation, email: e.target.value })}
              placeholder="Email" type="email" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
            <input value={donation.amount} onChange={(e) => setDonation({ ...donation, amount: e.target.value })}
              placeholder="Amount (£)" type="number" min="1" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
            <input value={donation.message} onChange={(e) => setDonation({ ...donation, message: e.target.value })}
              placeholder="Optional message" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white" />
          </div>
          <button type="submit" className="mt-4 rounded-xl bg-cyan-500 px-5 py-3 text-xs font-black tracking-[0.2em] text-black">
            DONATE
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function CharitiesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCharities = async () => {
      try {
        setLoading(true);
        const response = await charityAPI.getAll();
        setCharities((response.data?.charities || []).map(decorateCharity));
      } catch (err) {
        setError(err.message || 'Failed to load charities');
      } finally {
        setLoading(false);
      }
    };

    loadCharities();
  }, []);

  const filtered = useMemo(() => (
    charities.filter((charity) =>
      (category === 'All' || charity.category === category) &&
      (charity.name.toLowerCase().includes(search.toLowerCase()) ||
       charity.description.toLowerCase().includes(search.toLowerCase()))
    )
  ), [charities, category, search]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-12">
          <span className="text-xs font-bold text-cyan-500 tracking-[0.4em] uppercase block mb-4">Making Impact Real</span>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">CHARITY<br />DIRECTORY</h1>
          <p className="text-white/40 max-w-xl leading-relaxed">
            Explore our verified charity partners. Every subscription contributes — you choose who receives your impact.
          </p>
        </motion.div>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search charities..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CHARITY_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-widest transition-all ${
                  category === cat
                    ? 'bg-cyan-500 text-black'
                    : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20 hover:text-white'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {category === 'All' && search === '' && (
          <div className="mb-8">
            <FeaturedCharity />
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-white/40">Loading charity directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filtered
                .filter(c => !(category === 'All' && search === '' && c.featured))
                .map((c, i) => (
                  <CharityCard key={c._id} charity={c} index={i} onSelect={setSelectedCharity} />
                ))
              }
            </AnimatePresence>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-white/30 py-20 text-sm">
            No charities match your search.
          </div>
        )}
      </div>
      <Footer />
      <CharityDetailModal charity={selectedCharity} onClose={() => setSelectedCharity(null)} />
    </div>
  );
}
