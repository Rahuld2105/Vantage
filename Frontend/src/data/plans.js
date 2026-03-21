export const PLANS = [
  {
    id: 0,
    name: 'Catalyst',
    monthly: 29,
    yearly: 278,
    impact: 'Clean water for 2 families/month',
    perks: ['Real-time impact tracking', 'Draw entries each month', 'Charity contribution'],
  },
  {
    id: 1,
    name: 'Architect',
    monthly: 89,
    yearly: 854,
    impact: 'Funds 1 school year for a student',
    perks: ['All Catalyst perks', 'Direct donor communications', 'Legacy badge'],
  },
  {
    id: 2,
    name: 'Foundational',
    monthly: 249,
    yearly: 2390,
    impact: 'Builds ¼ of a rural clinic',
    perks: ['All Architect perks', 'Project naming rights', 'Founder circle access'],
  },
];

export const DRAW_TIERS = [
  {
    match: '5-Number Match',
    share: 40,
    rollover: true,
    prize: 'Jackpot',
    colorClass: 'border-yellow-500/30 shadow-yellow-500/10',
    textColor: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  {
    match: '4-Number Match',
    share: 35,
    rollover: false,
    prize: 'Major',
    colorClass: 'border-white/10',
    textColor: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  },
  {
    match: '3-Number Match',
    share: 25,
    rollover: false,
    prize: 'Entry',
    colorClass: 'border-white/10',
    textColor: 'text-purple-400',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
];
