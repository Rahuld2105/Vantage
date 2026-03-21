import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Target, Globe, Award, ShieldCheck, Wallet, BadgeCheck } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import HowItWorks from '../components/home/HowItWorks';
import DrawEngine from '../components/home/DrawEngine';
import StatsBar from '../components/home/StatsBar';
import LiveFeedToast from '../components/home/LiveFeedToast';
import FeaturedCharity from '../components/charity/FeaturedCharity';
import Footer from '../components/layout/Footer';
import { useApp } from '../Context/AppContext';

const MISSION_POINTS = [
  {
    icon: Target,
    title: 'Know What You Pay For',
    desc: 'Plans, billing frequency, and contribution percentages are shown before checkout so the membership feels transparent from the start.',
  },
  {
    icon: Globe,
    title: 'Support One Cause Clearly',
    desc: 'Pick a verified charity, see your contribution amount, and understand how your subscription connects to impact.',
  },
  {
    icon: Award,
    title: 'Track Membership And Rewards',
    desc: 'Your dashboard brings together draw entry, subscription status, renewals, charity details, and progress without making you hunt for answers.',
  },
];

const TRUST_BLOCKS = [
  {
    icon: ShieldCheck,
    title: 'Verified Causes',
    desc: 'The platform presents active charity partners and keeps the selected cause visible through checkout and inside the dashboard.',
  },
  {
    icon: Wallet,
    title: 'Clear Subscription Logic',
    desc: 'Users should always know whether they are choosing a plan, supporting a cause, or paying for membership benefits. The flow now reflects that more explicitly.',
  },
  {
    icon: BadgeCheck,
    title: 'Trackable Outcomes',
    desc: 'Prize, contribution, status, and renewal information deserve the same visibility as the site visuals. That trust layer matters for conversion.',
  },
];

export default function HomePage() {
  const { navigate } = useApp();

  return (
    <div>
      <HeroSection />

      <section className="px-4 sm:px-6 -mt-6 sm:-mt-10 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Plans', value: '$29 to $249', note: 'Monthly or yearly options' },
            { label: 'Charity Share', value: '10% to 50%', note: 'Chosen before payment' },
            { label: 'Checkout', value: 'Secure Stripe', note: 'Review before you pay' },
          ].map((item) => (
            <div key={item.label} className="rounded-[24px] border border-white/10 bg-[#0b0d10]/90 backdrop-blur-xl p-5 sm:p-6">
              <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-cyan-500 mb-2">{item.label}</div>
              <div className="text-2xl font-black text-white mb-2">{item.value}</div>
              <div className="text-sm text-white/45">{item.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="charities" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8">
            <span className="text-xs font-bold text-cyan-500 tracking-[0.4em] uppercase block mb-2">Charity Spotlight</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">SEE THE CAUSE BEFORE YOU SUBSCRIBE</h2>
            <p className="text-white/45 mt-3 max-w-2xl">
              The charity choice is not hidden at the end of the journey. Users should be able to understand where support is going before checkout begins.
            </p>
          </motion.div>
          <FeaturedCharity />
        </div>
      </section>

      <section id="mission" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-16 items-center">
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-bold text-cyan-500 tracking-[0.4em] uppercase mb-6 block">Why It Works</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-8 leading-tight text-white">
                MAKE THE
                <br />
                MEMBERSHIP CLEAR.
              </h2>
              <div className="space-y-10">
                {MISSION_POINTS.map((item, i) => (
                  <div key={i} className="flex gap-4 sm:gap-6 group">
                    <div className="shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-500 group-hover:bg-cyan-500/10 transition-colors">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-white">{item.title}</h4>
                      <p className="text-white/45 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="relative rounded-[28px] sm:rounded-[40px] overflow-hidden border border-white/10 bg-[#071015] p-5 sm:p-8 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {TRUST_BLOCKS.map((item) => (
                    <div key={item.title} className="rounded-[24px] sm:rounded-[28px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
                      <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                        <item.icon size={20} className="text-cyan-400" />
                      </div>
                      <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[24px] sm:rounded-[28px] border border-cyan-500/20 bg-cyan-500/8 p-5 sm:p-6">
                  <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-cyan-400 mb-2">Member Promise</div>
                  <div className="text-xl md:text-2xl font-black text-white mb-2">One plan. One chosen cause. One place to track everything.</div>
                  <p className="text-sm text-white/55 max-w-2xl">
                    The product should feel simple enough for first-time visitors and trustworthy enough for paying members. That is the standard the journey should keep meeting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <DrawEngine />
      <StatsBar />

      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic mb-6">SUBSCRIBE WITH CONFIDENCE.</h2>
            <p className="text-white/45 mb-10 max-w-2xl mx-auto">
              Review the plan, choose a charity, confirm your details, and complete secure checkout. The journey should feel as clear as the mission.
            </p>
            <button
              onClick={() => navigate('subscribe')}
              className="w-full sm:w-auto px-8 sm:px-16 py-5 sm:py-6 bg-white text-black font-black text-sm tracking-widest rounded-2xl hover:bg-cyan-400 transition-all inline-flex items-center justify-center gap-3 group shadow-2xl"
            >
              REVIEW PLANS <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
      <LiveFeedToast />
    </div>
  );
}
