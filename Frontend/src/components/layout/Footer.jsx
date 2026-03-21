import React from 'react';
import { ArrowUpRight, Zap } from 'lucide-react';
import { useApp } from '../../Context/AppContext';

const FOOTER_LINKS = ['Privacy', 'Charity Partners', 'Draw Rules', 'Terms'];

export default function Footer() {
  const { navigate } = useApp();

  return (
    <footer className="border-t border-white/5 bg-[#020203] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-white/8 bg-white/[0.025] p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <button onClick={() => navigate('home')} className="group flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors group-hover:bg-cyan-500/10">
                <Zap size={16} className="fill-current text-cyan-400" />
              </div>
              <div>
                <span className="block text-base font-black uppercase tracking-tight text-white">Vantage Impact</span>
                <span className="block text-[10px] uppercase tracking-[0.28em] text-white/30">Membership with visible impact</span>
              </div>
            </button>

            <p className="mt-5 text-sm leading-relaxed text-white/45">
              A clearer subscription journey for golfers who want transparent pricing, monthly prize participation,
              and a visible charity contribution from day one.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
            {FOOTER_LINKS.map((link) => (
              <button
                key={link}
                type="button"
                className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.26em] text-white/35 transition-colors hover:text-white/70"
              >
                {link}
                <ArrowUpRight size={12} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/5 pt-6 text-[10px] uppercase tracking-[0.24em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <div>Copyright 2026 Vantage Impact. All rights reserved.</div>
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
