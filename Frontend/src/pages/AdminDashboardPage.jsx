import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminAPI, charityAPI, drawAPI } from '../services/api';
import { useApp } from '../Context/AppContext';
import Footer from '../components/layout/Footer';

function StatCard({ label, value }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[28px] border border-white/10 bg-white/5 p-6"
    >
      <p className="text-[11px] font-black tracking-[0.3em] text-cyan-400 uppercase">{label}</p>
      <p className="mt-4 text-3xl font-black text-white">{value}</p>
    </motion.div>
  );
}

const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:6000/api').replace(/\/api$/, '');
const resolveProofUrl = (proofUrl) =>
  proofUrl?.startsWith('http://') || proofUrl?.startsWith('https://')
    ? proofUrl
    : `${API_ROOT}${proofUrl}`;

const emptyCharityForm = {
  name: '',
  category: 'Water',
  description: '',
  impact: '',
  raised: 0,
  imageUrl: '',
  featured: false,
  eventsText: '',
};

const toEventLines = (events = []) =>
  events
    .map((event) => [event.title, event.location, event.date ? new Date(event.date).toISOString().split('T')[0] : ''].join('|'))
    .join('\n');

const fromEventLines = (value = '') =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, location, date] = line.split('|').map((part) => part?.trim() || '');
      return {
        title,
        location,
        ...(date && { date }),
      };
    });

export default function AdminDashboardPage() {
  const { user } = useApp();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [winners, setWinners] = useState([]);
  const [charities, setCharities] = useState([]);
  const [draftDraw, setDraftDraw] = useState(null);
  const [selectedUserScores, setSelectedUserScores] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [charityForm, setCharityForm] = useState(emptyCharityForm);
  const [editingCharityId, setEditingCharityId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    loadUsers(query);
  }, [query]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsResponse, subscriptionsResponse, winnersResponse, charitiesResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSubscriptions(),
        adminAPI.getWinners(),
        charityAPI.getAll(),
      ]);

      setStats(statsResponse.data);
      setSubscriptions(subscriptionsResponse.data || []);
      setWinners(winnersResponse.data?.winners || []);
      setCharities(charitiesResponse.data?.charities || []);

      try {
        const draftResponse = await drawAPI.getDraft();
        setDraftDraw(draftResponse.data || null);
      } catch {
        setDraftDraw(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async (searchTerm = '') => {
    try {
      const response = await adminAPI.getUsers(1, 20, searchTerm);
      setUsers(response.data?.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    }
  };

  const loadUserScores = async (id) => {
    try {
      const response = await adminAPI.getUserScores(id);
      setSelectedUserId(id);
      setSelectedUserScores((response.data || []).map((score) => ({
        value: score.value,
        date: new Date(score.date).toISOString().split('T')[0],
      })));
    } catch (err) {
      setError(err.message || 'Failed to load user scores');
    }
  };

  const saveUserScores = async () => {
    try {
      await adminAPI.replaceUserScores(selectedUserId, selectedUserScores);
      setMessage('User scores updated');
    } catch (err) {
      setError(err.message || 'Failed to save scores');
    }
  };

  const handleUserAccessUpdate = async (id, payload) => {
    try {
      await adminAPI.updateUser(id, payload);
      setMessage('User updated');
      await loadUsers(query);
    } catch (err) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleSubscriptionUpdate = async (id, payload) => {
    try {
      await adminAPI.updateSubscription(id, payload);
      setMessage('Subscription updated');
      const response = await adminAPI.getSubscriptions();
      setSubscriptions(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to update subscription');
    }
  };

  const handleWinnerAction = async (winnerId, action) => {
    try {
      await adminAPI.verifyWinner(winnerId, action);
      setMessage(`Winner marked as ${action}`);
      const response = await adminAPI.getWinners();
      setWinners(response.data?.winners || []);
    } catch (err) {
      setError(err.message || 'Failed to update winner');
    }
  };

  const handleCharitySubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...charityForm,
      raised: Number(charityForm.raised || 0),
      events: fromEventLines(charityForm.eventsText),
    };

    try {
      if (editingCharityId) {
        await charityAPI.update(editingCharityId, payload);
        setMessage('Charity updated');
      } else {
        await charityAPI.create(payload);
        setMessage('Charity created');
      }

      setCharityForm(emptyCharityForm);
      setEditingCharityId('');
      const response = await charityAPI.getAll();
      setCharities(response.data?.charities || []);
    } catch (err) {
      setError(err.message || 'Failed to save charity');
    }
  };

  const handleDeleteCharity = async (id) => {
    try {
      await charityAPI.remove(id);
      setMessage('Charity removed');
      const response = await charityAPI.getAll();
      setCharities(response.data?.charities || []);
    } catch (err) {
      setError(err.message || 'Failed to remove charity');
    }
  };

  const handleSimulate = async (logic) => {
    try {
      const response = await drawAPI.simulate(draftDraw._id, logic);
      setDraftDraw(response.data);
      setMessage(`Draw simulated with ${logic} logic`);
    } catch (err) {
      setError(err.message || 'Failed to simulate draw');
    }
  };

  const handlePublish = async () => {
    try {
      const response = await drawAPI.publish(draftDraw._id);
      setDraftDraw(response.data);
      setMessage('Draw published');
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Failed to publish draw');
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setQuery(search);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-400 rounded-full animate-spin" />
          </div>
          <p className="text-white/40 text-sm mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </motion.div>
        )}
        {message && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {message}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="block text-xs font-black tracking-[0.4em] text-amber-300 uppercase">Admin Control</span>
            <h1 className="mt-2 text-4xl font-black text-white">Welcome, {user?.name || 'Admin'}</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/50">
              Manage users, subscriptions, scores, charities, draws, winners, and reporting from one place.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Members" value={stats?.totalUsers ?? 0} />
          <StatCard label="Active Subs" value={stats?.activeSubscriptions ?? 0} />
          <StatCard label="Charity Raised" value={`GBP ${Number(stats?.totalCharityRaised || 0).toLocaleString('en-GB')}`} />
          <StatCard label="Prize Pool" value={`GBP ${Number(stats?.totalPrizePool || 0).toLocaleString('en-GB')}`} />
          <StatCard label="Avg Pool" value={`GBP ${Number(stats?.averagePrizePool || 0).toLocaleString('en-GB')}`} />
          <StatCard label="Paid Winners" value={stats?.paidWinners ?? 0} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">Users & Scores</h2>
                <p className="mt-1 text-sm text-white/45">Search users, update access, and edit their latest 5 scores.</p>
              </div>
              <form onSubmit={handleSearch} className="flex w-full max-w-md gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users"
                  className="flex-1 rounded-2xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-amber-400"
                />
                <button type="submit" className="rounded-2xl bg-amber-300 px-5 py-3 text-xs font-black tracking-[0.2em] text-black">
                  SEARCH
                </button>
              </form>
            </div>

            <div className="mt-6 space-y-3">
              {users.map((member) => (
                <div key={member._id} className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          value={member.name || ''}
                          onChange={(event) => setUsers((current) => current.map((item) => item._id === member._id ? { ...item, name: event.target.value } : item))}
                          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                        />
                        <input
                          value={member.email || ''}
                          onChange={(event) => setUsers((current) => current.map((item) => item._id === member._id ? { ...item, email: event.target.value } : item))}
                          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div className="text-xs text-white/35 mt-2">
                        Subscription: {member.subscription ? `${member.subscription.plan} | ${member.subscription.status}` : 'none'}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => handleUserAccessUpdate(member._id, { name: member.name, email: member.email, role: member.role, isActive: member.isActive })}
                        className="rounded-xl bg-white px-3 py-2 text-xs font-black text-black">
                        SAVE PROFILE
                      </button>
                      <button onClick={() => handleUserAccessUpdate(member._id, { role: member.role === 'admin' ? 'user' : 'admin', isActive: member.isActive })}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white">
                        ROLE: {member.role}
                      </button>
                      <button onClick={() => handleUserAccessUpdate(member._id, { role: member.role, isActive: !member.isActive })}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white">
                        {member.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                      </button>
                      <button onClick={() => loadUserScores(member._id)}
                        className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-black">
                        EDIT SCORES
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedUserId && (
              <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                <h3 className="text-lg font-black text-white mb-4">Edit User Scores</h3>
                <div className="space-y-3">
                  {selectedUserScores.map((score, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="number"
                        min="1"
                        max="45"
                        value={score.value}
                        onChange={(e) => {
                          const nextScores = [...selectedUserScores];
                          nextScores[index] = { ...nextScores[index], value: Number(e.target.value) };
                          setSelectedUserScores(nextScores);
                        }}
                        className="w-24 rounded-xl border border-white/10 bg-[#0b0b0d] px-3 py-2 text-white"
                      />
                      <input
                        type="date"
                        value={score.date}
                        onChange={(e) => {
                          const nextScores = [...selectedUserScores];
                          nextScores[index] = { ...nextScores[index], date: e.target.value };
                          setSelectedUserScores(nextScores);
                        }}
                        className="rounded-xl border border-white/10 bg-[#0b0b0d] px-3 py-2 text-white"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={saveUserScores}
                  className="mt-4 rounded-xl bg-cyan-500 px-4 py-3 text-xs font-black tracking-[0.2em] text-black">
                  SAVE SCORES
                </button>
              </div>
            )}
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-white">Subscriptions</h2>
            <div className="mt-6 space-y-3">
              {subscriptions.map((subscription) => (
                <div key={subscription._id} className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="font-black text-white">{subscription.userId?.name || 'Unknown user'}</div>
                    <div className="text-sm text-white/45">
                      {subscription.plan} | {subscription.billing} | {subscription.charityId?.name || 'No charity'}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['active', 'inactive', 'cancelled', 'past_due'].map((status) => (
                      <button key={status}
                        onClick={() => handleSubscriptionUpdate(subscription._id, { status, cancelAtPeriodEnd: subscription.cancelAtPeriodEnd })}
                        className={`rounded-xl border px-3 py-2 text-xs font-black ${subscription.status === status ? 'border-amber-300 text-amber-300' : 'border-white/10 text-white'}`}>
                        {status.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-white">Winner Verification</h2>
            <div className="mt-6 space-y-3">
              {winners.map((winner) => (
                <div key={winner._id} className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="font-black text-white">{winner.userId?.name || 'Winner'}</div>
                    <div className="text-sm text-white/45">
                      {winner.tier} | GBP {Number(winner.prizeAmount || 0).toFixed(2)} | {winner.paymentStatus}
                    </div>
                    {winner.proofUrl && (
                      <a
                        href={resolveProofUrl(winner.proofUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-xs text-cyan-300 hover:text-cyan-200"
                      >
                        VIEW UPLOADED PROOF
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleWinnerAction(winner._id, 'approve')}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white">
                      APPROVE
                    </button>
                    <button onClick={() => handleWinnerAction(winner._id, 'reject')}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white">
                      REJECT
                    </button>
                    <button onClick={() => handleWinnerAction(winner._id, 'paid')}
                      className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-black">
                      MARK PAID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-white">Charities</h2>
            <form onSubmit={handleCharitySubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={charityForm.name} onChange={(e) => setCharityForm({ ...charityForm, name: e.target.value })}
                placeholder="Charity name" className="rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-white" />
              <select value={charityForm.category} onChange={(e) => setCharityForm({ ...charityForm, category: e.target.value })}
                className="rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-white">
                {['Water', 'Education', 'Health', 'Food', 'Environment'].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input value={charityForm.impact} onChange={(e) => setCharityForm({ ...charityForm, impact: e.target.value })}
                placeholder="Impact" className="rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-white" />
              <input value={charityForm.imageUrl} onChange={(e) => setCharityForm({ ...charityForm, imageUrl: e.target.value })}
                placeholder="Image URL" className="rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-white" />
              <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-sm text-white">
                <input
                  type="checkbox"
                  checked={!!charityForm.featured}
                  onChange={(e) => setCharityForm({ ...charityForm, featured: e.target.checked })}
                />
                Featured charity
              </label>
              <input value={charityForm.raised} onChange={(e) => setCharityForm({ ...charityForm, raised: e.target.value })}
                placeholder="Raised amount" type="number" className="rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-white" />
              <textarea value={charityForm.description} onChange={(e) => setCharityForm({ ...charityForm, description: e.target.value })}
                placeholder="Description" className="md:col-span-2 rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-white min-h-28" />
              <textarea
                value={charityForm.eventsText}
                onChange={(e) => setCharityForm({ ...charityForm, eventsText: e.target.value })}
                placeholder="Events: one per line as Title|Location|YYYY-MM-DD"
                className="md:col-span-2 rounded-xl border border-white/10 bg-[#0b0b0d] px-4 py-3 text-white min-h-28"
              />
              <button type="submit" className="rounded-xl bg-cyan-500 px-4 py-3 text-xs font-black tracking-[0.2em] text-black">
                {editingCharityId ? 'UPDATE CHARITY' : 'CREATE CHARITY'}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              {charities.map((charity) => (
                <div key={charity._id} className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="font-black text-white">{charity.name}</div>
                    <div className="text-sm text-white/45">{charity.category} | GBP {Number(charity.raised || 0).toLocaleString('en-GB')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => {
                      setEditingCharityId(charity._id);
                      setCharityForm({
                        ...emptyCharityForm,
                        ...charity,
                        eventsText: toEventLines(charity.events || []),
                      });
                    }}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white">
                      EDIT
                    </button>
                    <button onClick={() => handleDeleteCharity(charity._id)}
                      className="rounded-xl border border-red-500/30 px-3 py-2 text-xs font-black text-red-300">
                      DELETE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-white">Draw Controls</h2>
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0b0d] p-5">
              <div className="text-sm text-white/45 mb-2">Draft draw</div>
              <div className="text-white font-black">
                {draftDraw ? `${draftDraw.month} | ${draftDraw.status}` : 'No draft available'}
              </div>
              {draftDraw?.numbers?.length > 0 && (
                <div className="text-sm text-cyan-300 mt-2">Numbers: {draftDraw.numbers.join(', ')}</div>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={() => handleSimulate('random')}
                  className="rounded-xl border border-white/10 px-4 py-3 text-xs font-black text-white">
                  SIMULATE RANDOM
                </button>
                <button onClick={() => handleSimulate('algorithmic')}
                  className="rounded-xl border border-white/10 px-4 py-3 text-xs font-black text-white">
                  SIMULATE ALGORITHMIC
                </button>
                <button onClick={handlePublish}
                  className="rounded-xl bg-amber-300 px-4 py-3 text-xs font-black text-black">
                  PUBLISH DRAW
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-black text-white">Draw Analytics</h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="text-xs text-white/35 uppercase tracking-[0.2em]">Random Draws</div>
                <div className="mt-2 text-2xl font-black text-white">{stats?.drawStats?.randomDraws ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="text-xs text-white/35 uppercase tracking-[0.2em]">Algorithmic Draws</div>
                <div className="mt-2 text-2xl font-black text-white">{stats?.drawStats?.algorithmicDraws ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="text-xs text-white/35 uppercase tracking-[0.2em]">Rollover Months</div>
                <div className="mt-2 text-2xl font-black text-white">{stats?.drawStats?.rolloverMonths ?? 0}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
                <div className="text-xs text-white/35 uppercase tracking-[0.2em]">Biggest Jackpot</div>
                <div className="mt-2 text-2xl font-black text-white">GBP {Number(stats?.drawStats?.biggestJackpot || 0).toLocaleString('en-GB')}</div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b0b0d] p-4">
              <div className="text-xs text-white/35 uppercase tracking-[0.2em] mb-3">Tier Breakdown</div>
              <div className="space-y-2">
                {(stats?.tierBreakdown || []).map((tier) => (
                  <div key={tier._id} className="flex items-center justify-between text-sm text-white/70">
                    <span>{tier._id}</span>
                    <span>{tier.winners} winners | GBP {Number(tier.totalPaidOut || 0).toLocaleString('en-GB')}</span>
                  </div>
                ))}
                {(!stats?.tierBreakdown || stats.tierBreakdown.length === 0) && (
                  <div className="text-sm text-white/40">No published winner data yet.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}
