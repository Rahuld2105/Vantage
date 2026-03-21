import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ScoreCard from '../components/dashboard/ScoreCard';
import ScoreModal from '../components/dashboard/ScoreModal';
import CharityWidget from '../components/dashboard/CharityWidget';
import DrawStatus from '../components/dashboard/DrawStatus';
import WinningsCard from '../components/dashboard/WinningsCard';
import SubscriptionCard from '../components/dashboard/SubscriptionCard';
import WinnerVerification from '../components/dashboard/WinnerVerification';
import ProfileCard from '../components/dashboard/ProfileCard';
import Footer from '../components/layout/Footer';
import { useApp } from '../Context/AppContext';
import { charityAPI, drawAPI, scoreAPI, subscriptionAPI, userAPI, winnerAPI } from '../services/api';

const PLAN_PRICES = {
  catalyst: { monthly: 29, yearly: 278 },
  architect: { monthly: 89, yearly: 854 },
  foundational: { monthly: 249, yearly: 2390 },
};

const getNextDrawDateLabel = () => {
  const now = new Date();
  const nextDrawDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return nextDrawDate.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function DashboardPage() {
  const { user, loading: authLoading, loadUser } = useApp();
  const [scores, setScores] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [drawSummary, setDrawSummary] = useState(null);
  const [winnings, setWinnings] = useState([]);
  const [charityOptions, setCharityOptions] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [showScoreModal, setModal] = useState(false);
  const [scoreModalMode, setScoreModalMode] = useState('edit');
  const [charityPct, setCharityPct] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingCharity, setSavingCharity] = useState(false);

  useEffect(() => {
    if (user?._id || user?.id) {
      loadUserData();
    }
  }, [user?._id, user?.id]);

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId || !(user?._id || user?.id)) return;

    const confirmCheckout = async () => {
      try {
        await subscriptionAPI.confirmCheckout(sessionId);
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete('session_id');
        window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}`);
        setSuccessMessage('Subscription confirmed. Your active plan and charity details are now available below.');
        await loadUserData();
      } catch (err) {
        setError(err.message);
      }
    };

    confirmCheckout();
  }, [user?._id, user?.id]);

  useEffect(() => {
    const openScoreModal = (event) => {
      setScoreModalMode(event.detail?.mode === 'add' ? 'add' : 'edit');
      setModal(true);
    };

    window.addEventListener('vantage:open-score-modal', openScoreModal);
    return () => window.removeEventListener('vantage:open-score-modal', openScoreModal);
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [scoresResponse, drawHistoryResponse, winningsResponse, charitiesResponse] = await Promise.all([
        scoreAPI.getScores(),
        drawAPI.getHistory(1),
        winnerAPI.getMyWinnings(),
        charityAPI.getAll(),
      ]);

      setScores(scoresResponse.data || []);
      setWinnings(winningsResponse.data || []);
      setCharityOptions(charitiesResponse.data?.charities || []);

      const drawHistory = drawHistoryResponse.data?.draws || [];
      const latestDraw = drawHistory[0];

      try {
        const subResponse = await subscriptionAPI.getMySubscription();
        const subscriptionData = subResponse.data;
        setSubscription(subscriptionData);
        setCharityPct(subscriptionData.charityPercent || 15);
        setSelectedCharityId(subscriptionData.charityId?._id || subscriptionData.charityId || '');

        const enteredCount = drawHistory.filter((draw) => {
          if (!subscriptionData?.createdAt) return true;
          return new Date(draw.publishedAt || draw.createdAt) >= new Date(subscriptionData.createdAt);
        }).length;

        setDrawSummary({
          isEntered: subscriptionData.status === 'active',
          statusLabel: subscriptionData.status === 'active' ? 'Entered' : subscriptionData.status,
          nextDrawDate: getNextDrawDateLabel(),
          drawsEntered: enteredCount,
          currentJackpot: latestDraw?.hadFiveMatch ? 0 : (latestDraw?.pools?.fiveMatch || 0),
        });
      } catch (err) {
        if (err.status === 404) {
          setSubscription(null);
          setCharityPct(15);
          setSelectedCharityId('');
          setDrawSummary({
            isEntered: false,
            statusLabel: 'Not Entered',
            nextDrawDate: getNextDrawDateLabel(),
            drawsEntered: 0,
            currentJackpot: latestDraw?.hadFiveMatch ? 0 : (latestDraw?.pools?.fiveMatch || 0),
          });
        } else {
          throw err;
        }
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScores = async (newScores) => {
    try {
      setError(null);
      const sorted = [...newScores]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      const response = await scoreAPI.replaceScores(sorted);
      if (response.data) {
        setScores(response.data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to save scores:', err);
    }
  };

  const handleProfileSave = async (payload) => {
    try {
      setSavingProfile(true);
      setError(null);
      await userAPI.updateProfile(payload);
      await loadUser();
      setSuccessMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCharityPreferences = async () => {
    try {
      if (!subscription || !selectedCharityId) return;
      setSavingCharity(true);
      setError(null);
      await subscriptionAPI.updateCharity(selectedCharityId, charityPct);
      setSuccessMessage('Charity preferences updated.');
      await loadUserData();
      await loadUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingCharity(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-3 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          </div>
          <p className="text-white/40 text-sm mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const subscriptionPrice = subscription
    ? PLAN_PRICES[subscription.plan]?.[subscription.billing] || 89
    : 89;

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-300">
            {successMessage}
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            {error}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-cyan-500 tracking-[0.4em] uppercase block mb-2">Member Portal</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Welcome back, <span className="text-cyan-400">{user?.name || 'Member'}</span>
            </h1>
            <p className="text-sm text-white/40 mt-3 max-w-2xl">
              Track your subscription status, charity contribution, draw eligibility, and account activity from one dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full w-full sm:w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-black text-emerald-400 tracking-widest">
              {subscription ? `${subscription.status?.toUpperCase()} - ${subscription.plan?.toUpperCase()} PLAN` : 'NO ACTIVE SUBSCRIPTION'}
            </span>
          </div>
        </motion.div>

        {!subscription && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.03] text-sm text-white/55">
            No active subscription is attached to this account yet. After checkout is confirmed, your plan, charity allocation, and draw entry status will appear here automatically.
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileCard
              key={`${user?.name || ''}-${user?.email || ''}`}
              user={user}
              onSave={handleProfileSave}
              saving={savingProfile}
            />
            <ScoreCard
              scores={scores}
              onAdd={() => {
                setScoreModalMode('add');
                setModal(true);
              }}
              onEdit={() => {
                setScoreModalMode('edit');
                setModal(true);
              }}
            />
            {subscription && (
              <CharityWidget
                charityId={subscription.charityId}
                charityPct={charityPct}
                setCharityPct={setCharityPct}
                subPrice={subscriptionPrice}
                charities={charityOptions}
                selectedCharityId={selectedCharityId}
                setSelectedCharityId={setSelectedCharityId}
                onSave={handleSaveCharityPreferences}
                saving={savingCharity}
              />
            )}
            <WinnerVerification winners={winnings} onUpdated={loadUserData} onError={setError} />
          </div>

          <div className="space-y-6">
            <DrawStatus summary={drawSummary} />
            <WinningsCard winnings={winnings} />
            {subscription && (
              <SubscriptionCard
                planName={subscription.plan || 'Architect'}
                price={subscription.billing === 'yearly' ? `${subscriptionPrice}/year` : `${subscriptionPrice}/month`}
                charityPct={charityPct}
                charityAmt={((subscriptionPrice * charityPct) / 100).toFixed(2)}
                renewDate={subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
                status={subscription.status}
              />
            )}
          </div>
        </div>
      </div>

      {showScoreModal && (
        <ScoreModal
          scores={scores}
          mode={scoreModalMode}
          onSave={handleSaveScores}
          onClose={() => setModal(false)}
        />
      )}

      <div className="mt-20"><Footer /></div>
    </div>
  );
}
