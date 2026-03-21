import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CreditCard, Dice5, HeartHandshake } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: CreditCard,
    title: 'Choose Your Plan',
    desc: 'Pick a monthly or yearly membership. Every plan shows your price, your benefits, and the charity contribution range before checkout.',
  },
  {
    step: '02',
    icon: HeartHandshake,
    title: 'Select A Charity',
    desc: 'Choose the verified cause you want to support and set the percentage of your subscription that goes directly toward impact.',
  },
  {
    step: '03',
    icon: Dice5,
    title: 'Enter Draws Automatically',
    desc: 'Your active subscription keeps you eligible for monthly draws while your dashboard tracks plan status, draw entry, and renewal timing.',
  },
  {
    step: '04',
    icon: Activity,
    title: 'Track Results Clearly',
    desc: 'See your selected charity, contribution amount, subscription status, and active benefits in one place instead of guessing what happened after payment.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 text-center sm:mb-20">
          <span className="text-xs font-bold text-cyan-500 tracking-[0.4em] uppercase block mb-4">Clear Flow</span>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
            ONE SUBSCRIPTION.
            <br />
            <span className="text-white/25">FOUR CLEAR STEPS.</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
            No guesswork about where your money goes or what happens next. Plan, charity, checkout, and confirmation
            all follow one simple path.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STEPS.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group relative rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-1 hover:border-cyan-500/30 hover:bg-white/[0.045] sm:rounded-[28px] sm:p-8"
            >
              <div className="text-[44px] sm:text-[60px] font-black text-white/5 absolute top-4 right-5 sm:right-6 leading-none select-none">{item.step}</div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
                <item.icon size={22} className="text-cyan-400" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-white mb-3">{item.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
