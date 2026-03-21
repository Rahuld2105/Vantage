import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Info, AlertCircle, ShieldCheck, HeartHandshake, CreditCard } from 'lucide-react';
import StepIndicator from '../components/subscribe/StepIndicator';
import PlanSelector from '../components/subscribe/PlanSelector';
import CharitySelector from '../components/subscribe/CharitySelector';
import Footer from '../components/layout/Footer';
import { PLANS } from '../data/plans';
import { CHARITIES as FALLBACK_CHARITIES } from '../data/charities';
import { charityAPI, subscriptionAPI } from '../services/api';
import { useApp } from '../Context/AppContext';

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

const decorateCharity = (charity, index) => {
  const colorCycle = ['cyan', 'purple', 'green', 'amber', 'pink', 'blue'];
  return {
    ...charity,
    uid: charity._id ?? charity.id ?? null,
    color: charity.color || colorCycle[index % colorCycle.length],
    impact: charity.impact || 'Verified charity partner',
    events: Array.isArray(charity.events)
      ? charity.events
          .map((event) => {
            if (!event) return null;
            if (typeof event === 'string') return event;
            const parts = [event.title, event.location].filter(Boolean);
            return parts.join(' - ') || null;
          })
          .filter(Boolean)
      : [],
  };
};

const JOURNEY_NOTES = [
  {
    icon: CreditCard,
    title: 'Transparent pricing',
    desc: 'Choose monthly or yearly billing before checkout. Your plan price is fixed and visible throughout the flow.',
  },
  {
    icon: HeartHandshake,
    title: 'Charity first',
    desc: 'Pick your verified charity and set the percentage of your subscription directed toward impact.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure confirmation',
    desc: 'Review your details before paying. Stripe handles payment while your dashboard tracks the resulting subscription.',
  },
];

export default function SubscribePage() {
  const { user, isLoggedIn, register, loading, error, clearError } = useApp();
  const [step, setStep] = useState(1);
  const [billing, setBilling] = useState('monthly');
  const [tier, setTier] = useState(PLANS[1]?.id ?? PLANS[0]?.id ?? null);
  const [charity, setCharity] = useState(null);
  const [charityPct, setCharityPct] = useState(10);
  const [charities, setCharities] = useState([]);
  const [charityLoading, setCharityLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const plan = useMemo(
    () => PLANS.find((item) => item.id === tier) ?? PLANS[0],
    [tier]
  );
  const price = billing === 'monthly' ? plan.monthly : plan.yearly;

  const selectedCharity = useMemo(
    () => charities.find((item) => item.uid === charity) || null,
    [charities, charity]
  );

  const charityAmt = ((price * charityPct) / 100).toFixed(2);
  const membershipAmt = (price - Number(charityAmt)).toFixed(2);

  useEffect(() => {
    if (!isLoggedIn) return;
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [isLoggedIn, user?.email, user?.name]);

  const applyCharityOptions = (items) => {
    const normalized = items
      .map(decorateCharity)
      .filter((item) => item.uid && MONGO_ID_REGEX.test(String(item.uid)));

    setCharities(normalized);

    if (normalized.length) {
      setCharity((current) => current ?? normalized[0].uid);
    } else {
      setCharity(null);
    }
  };

  useEffect(() => {
    const loadCharities = async () => {
      try {
        setCharityLoading(true);
        setFormError('');
        const response = await charityAPI.getAll();
        const nextCharities = response.data?.charities || [];

        if (nextCharities.length) {
          applyCharityOptions(nextCharities);
        } else {
          // fallback to built-in seed data if backend returns empty list
          applyCharityOptions(FALLBACK_CHARITIES);
          setFormError('No charities from backend, using internal defaults.');
        }
      } catch (err) {
        console.error('Charity load failed:', err);
        const fallback = FALLBACK_CHARITIES;
        if (fallback.length) {
          applyCharityOptions(fallback);
          setFormError('Unable to load charities from server; using local defaults.');
        } else {
          setCharities([]);
          setCharity(null);
          setFormError('Unable to load charities right now. Please try again shortly.');
        }
      } finally {
        setCharityLoading(false);
      }
    };

    loadCharities();
  }, []);

  const handleStartCheckout = async () => {
    setFormError('');
    clearError();

    if (!charity || !MONGO_ID_REGEX.test(String(charity))) {
      setFormError('Please select a valid charity');
      return;
    }

    try {
      const checkoutResponse = await subscriptionAPI.createCheckout(
        plan.name.toLowerCase(),
        billing,
        charity,
        charityPct
      );

      const checkoutUrl = checkoutResponse.data?.url;
      if (!checkoutUrl) {
        throw new Error('Checkout session created without a Stripe URL');
      }

      window.location.href = checkoutUrl;
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleCompleteSubscription = async () => {
    setFormError('');
    clearError();

    if (isLoggedIn) {
      await handleStartCheckout();
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setFormError('All fields are required');
      return;
    }

    if (!charity || !MONGO_ID_REGEX.test(String(charity))) {
      setFormError('Please select a valid charity');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        charityId: charity,
        charityPercent: charityPct,
      });

      await handleStartCheckout();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <span className="text-[11px] sm:text-xs font-bold text-cyan-500 tracking-[0.3em] sm:tracking-[0.4em] uppercase block mb-4">Membership Checkout</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
            CHOOSE A PLAN.
            <br />
            CHOOSE A CAUSE.
          </h1>
          <p className="max-w-3xl text-white/55 text-sm sm:text-base md:text-lg leading-relaxed">
            This flow should feel simple: select your membership, choose your charity, review your details, then
            complete secure Stripe checkout.
          </p>
        </motion.div>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {JOURNEY_NOTES.map((item) => (
              <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                  <item.icon size={18} className="text-cyan-400" />
                </div>
                <h3 className="text-sm font-black text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-[24px] sm:rounded-[28px] border border-white/10 bg-[#080a0d] p-4 sm:p-6 md:p-8">
          <StepIndicator currentStep={step} />

          {step === 1 && (
            <PlanSelector
              billing={billing}
              setBilling={setBilling}
              tier={tier}
              setTier={setTier}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            charityLoading ? (
              <div className="py-12 text-center text-white/40">Loading charities...</div>
            ) : (
              <>
                {formError && !charities.length && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
                    {formError}
                  </div>
                )}
                <CharitySelector
                  charities={charities}
                  charity={charity}
                  setCharity={setCharity}
                  charityPct={charityPct}
                  setCharityPct={setCharityPct}
                  billing={billing}
                  price={price}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              </>
            )
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h3 className="text-lg sm:text-xl font-black text-white mb-2">
                {isLoggedIn ? 'Review And Confirm' : 'Create Account And Review'}
              </h3>
              <p className="text-sm text-white/45 mb-6">
                {isLoggedIn
                  ? 'You are already signed in, so we will use your existing account details for checkout.'
                  : 'Create your member account once, then we will take you directly to secure checkout.'}
              </p>

              {(formError || error) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6 flex gap-3 text-sm text-red-400"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>{formError || error}</div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 sm:gap-6 mb-6">
                <div className="p-4 sm:p-5 bg-white/5 border border-white/10 rounded-2xl text-sm space-y-2">
                  {[
                    { label: 'Plan', value: `${plan.name} - ${billing}` },
                    { label: 'Price', value: `$${price}/${billing === 'monthly' ? 'mo' : 'yr'}` },
                    { label: 'Charity', value: selectedCharity?.name ?? '-', highlight: true },
                    { label: 'Charity share', value: `${charityPct}% ($${charityAmt})`, highlight: true },
                    { label: 'Membership share', value: `$${membershipAmt}` },
                    ...(isLoggedIn
                      ? [
                          { label: 'Name', value: user?.name ?? '-' },
                          { label: 'Email', value: user?.email ?? '-' },
                        ]
                      : []),
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                      <span className="text-white/40 text-xs sm:text-sm">{row.label}</span>
                      <span className={`font-bold text-right text-xs sm:text-sm ${row.highlight ? 'text-cyan-400' : 'text-white'}`}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 sm:p-5 bg-cyan-500/6 border border-cyan-500/20 rounded-2xl">
                  <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-cyan-400 mb-3">Before You Pay</div>
                  <div className="space-y-3 text-sm text-white/65">
                    <p>Your selected charity and contribution percentage stay visible through checkout.</p>
                    <p>Stripe handles payment securely. Your dashboard is where plan status and contribution details appear after confirmation.</p>
                    <p>Monthly draw entry depends on having an active subscription in your account.</p>
                  </div>
                </div>
              </div>

              {isLoggedIn ? (
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70">
                    Signed-in members do not need to register again. Your existing account will be used for subscription checkout.
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white/30">
                    <Info size={14} className="shrink-0 text-white/20" />
                    After payment, return to the dashboard to review subscription status, renewal timing, and charity contribution details.
                  </div>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFormError(''); }}
                    placeholder="Full Name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                  <input
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormError(''); }}
                    placeholder="Email Address"
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                  <input
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFormError(''); }}
                    placeholder="Password (min 6 chars)"
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                  <input
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setFormError(''); }}
                    placeholder="Confirm Password"
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-xs text-white/30">
                    <Info size={14} className="shrink-0 text-white/20" />
                    Account creation happens first, then secure Stripe checkout opens immediately with the selected plan and charity.
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-6 py-4 bg-white/5 text-white/60 font-bold text-xs tracking-widest rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  BACK
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSubscription}
                  disabled={
                    loading ||
                    charityLoading ||
                    !charity ||
                    (!isLoggedIn && (!name || !email || !password || !confirmPassword))
                  }
                  className="flex-1 py-4 bg-white text-black font-black text-sm tracking-widest rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loading
                    ? (isLoggedIn ? 'STARTING CHECKOUT...' : 'CREATING ACCOUNT...')
                    : (isLoggedIn ? 'REVIEW PAYMENT IN STRIPE' : 'CREATE ACCOUNT & CONTINUE')}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <div className="mt-20"><Footer /></div>
    </div>
  );
}
