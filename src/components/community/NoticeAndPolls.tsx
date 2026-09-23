import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Notice, NoticeCategory } from '../../types/society';
import {
  FileText,
  Vote,
  Pin,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  Megaphone
} from 'lucide-react';

export const NoticeAndPolls: React.FC = () => {
  const {
    notices,
    polls,
    currentRole,
    currentResident,
    createNotice,
    deleteNotice,
    togglePinNotice,
    votePoll,
    createPoll
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'notices' | 'polls'>('notices');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New Notice form
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>('general');
  const [isPinned, setIsPinned] = useState(false);

  // New Poll form
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollDesc, setPollDesc] = useState('');
  const [pollOpt1, setPollOpt1] = useState('');
  const [pollOpt2, setPollOpt2] = useState('');
  const [pollOpt3, setPollOpt3] = useState('');

  const filteredNotices = notices.filter(n => {
    return filterCategory === 'all' || n.category === filterCategory;
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    createNotice({
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      category: noticeCategory,
      isPinned,
      authorName: currentRole === 'admin' ? 'Managing Committee Office' : currentResident.name,
      authorRole: currentRole === 'admin' ? 'Secretary' : `Flat ${currentResident.flatNumber}`,
      targetBlocks: ['All']
    });

    setNoticeTitle('');
    setNoticeContent('');
    setShowNoticeForm(false);
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollTitle.trim() || !pollOpt1.trim() || !pollOpt2.trim()) return;

    const opts = [pollOpt1.trim(), pollOpt2.trim()];
    if (pollOpt3.trim()) opts.push(pollOpt3.trim());

    createPoll({
      title: pollTitle.trim(),
      description: pollDesc.trim(),
      options: opts,
      expiresAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
    });

    setPollTitle('');
    setPollDesc('');
    setPollOpt1('');
    setPollOpt2('');
    setPollOpt3('');
    setShowPollForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-orange-50 border border-amber-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <Megaphone className="w-3.5 h-3.5" /> Society Governance & Digital Democracy
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notice Board & Resident Polls</h1>
          <p className="text-xs text-slate-600 mt-1">
            Official announcements • Maintenance shutdowns • Democratic AGM voting on society resolutions
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('notices')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'notices' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Notices ({notices.length})
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'polls' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Polls ({polls.length})
          </button>
        </div>
      </div>

      {/* Notices View */}
      {activeTab === 'notices' ? (
        <div className="space-y-5">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Circulars' },
                { id: 'maintenance', label: 'Maintenance' },
                { id: 'rules', label: 'Rules & Bylaws' },
                { id: 'event', label: 'Events' },
                { id: 'general', label: 'General' },
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilterCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterCategory === c.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {currentRole === 'admin' && (
              <button
                onClick={() => setShowNoticeForm(!showNoticeForm)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Broadcast Notice
              </button>
            )}
          </div>

          {/* Form to create notice */}
          {showNoticeForm && (
            <form onSubmit={handleCreateNotice} className="p-5 bg-white border border-amber-200 rounded-2xl space-y-4 shadow-xs animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                Publish Circular to Society Notice Board
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Circular Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mandatory Fire Alarm Drill & Evacuation Testing"
                    value={noticeTitle}
                    onChange={e => setNoticeTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={e => setNoticeCategory(e.target.value as NoticeCategory)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="rules">Rules & Bylaws</option>
                    <option value="event">Event / Festive</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Circular Content *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed text of the circular..."
                  value={noticeContent}
                  onChange={e => setNoticeContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={e => setIsPinned(e.target.checked)}
                    className="accent-amber-600 rounded"
                  />
                  <span>Pin to top of notice board as high priority</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoticeForm(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    Publish Circular
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Notices List */}
          <div className="space-y-4">
            {filteredNotices.map(notice => (
              <div
                key={notice.id}
                className={`p-5 rounded-2xl border transition-all ${
                  notice.isPinned
                    ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase border border-slate-200">
                      {notice.category}
                    </span>
                    <span className="text-xs text-slate-500">{notice.publishedDate}</span>
                  </div>

                  {currentRole === 'admin' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinNotice(notice.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Toggle Pin"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="p-1.5 text-slate-400 hover:text-red-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{notice.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                  {notice.content}
                </p>

                <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Issued by: <strong className="text-slate-800">{notice.authorName} ({notice.authorRole})</strong></span>
                  <span>Target: {notice.targetBlocks.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Polls View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              1 Flat = 1 Vote • Society Democratic Resolutions
            </p>
            {currentRole === 'admin' && (
              <button
                onClick={() => setShowPollForm(!showPollForm)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Launch Society Poll
              </button>
            )}
          </div>

          {showPollForm && (
            <form onSubmit={handleCreatePoll} className="p-5 bg-white border border-amber-200 rounded-2xl space-y-3 shadow-xs animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Vote className="w-4 h-4 text-amber-600" />
                Create New Resolution Ballot
              </h3>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Resolution Question *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Should society install solar panels on Tower A and B roofs?"
                  value={pollTitle}
                  onChange={e => setPollTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Background Details</label>
                <textarea
                  rows={2}
                  placeholder="Explanation of costs, benefits, timelines..."
                  value={pollDesc}
                  onChange={e => setPollDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Option 1 (e.g. Yes, approve)"
                  value={pollOpt1}
                  onChange={e => setPollOpt1(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Option 2 (e.g. No, reject)"
                  value={pollOpt2}
                  onChange={e => setPollOpt2(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                />
                <input
                  type="text"
                  placeholder="Option 3 (Optional)"
                  value={pollOpt3}
                  onChange={e => setPollOpt3(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-600 shadow-2xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPollForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Launch Ballot
                </button>
              </div>
            </form>
          )}

          {/* Active Polls List */}
          <div className="space-y-4">
            {polls.map(poll => {
              const hasVoted = poll.votedFlatNumbers.includes(currentResident.flatNumber);

              return (
                <div key={poll.id} className="p-6 bg-white border border-slate-200/90 rounded-2xl space-y-4 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Total Votes Cast: <strong className="text-slate-900 font-mono">{poll.totalVotes}</strong></span>
                      <span>Voting closes on: {poll.expiresAt}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{poll.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{poll.description}</p>
                  </div>

                  {/* Options & Live Progress Bars */}
                  <div className="space-y-2.5">
                    {poll.options.map(opt => {
                      const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                      return (
                        <div
                          key={opt.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-800">{opt.text}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500 font-mono text-[11px]">{opt.votes} votes ({pct}%)</span>
                              {!hasVoted && (
                                <button
                                  onClick={() => votePoll(poll.id, opt.id, currentResident.flatNumber)}
                                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                                >
                                  Vote
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasVoted && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Flat {currentResident.flatNumber} has registered a ballot in this resolution.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
