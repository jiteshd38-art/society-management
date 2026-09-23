import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Complaint, ComplaintStatus, ComplaintPriority, ComplaintCategory } from '../../types/society';
import {
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  UserCheck,
  MessageSquare,
  Star,
  Send,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ComplaintDeskProps {
  onOpenNewTicketModal: () => void;
}

export const ComplaintDesk: React.FC<ComplaintDeskProps> = ({ onOpenNewTicketModal }) => {
  const {
    complaints,
    currentRole,
    currentResident,
    staff,
    updateComplaintStatus,
    assignComplaintStaff,
    addComplaintComment,
    rateComplaint
  } = useSociety();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [commentText, setCommentText] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredTickets = complaints.filter(c => {
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    const matchesSearch =
      c.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;

    addComplaintComment(selectedTicket.id, commentText.trim());
    setCommentText('');

    // Refresh selected ticket
    const updated = complaints.find(c => c.id === selectedTicket.id);
    if (updated) setSelectedTicket(updated);
  };

  const handleStatusChange = (status: ComplaintStatus) => {
    if (!selectedTicket) return;
    updateComplaintStatus(selectedTicket.id, status, resolutionNote || undefined);

    const updated = complaints.find(c => c.id === selectedTicket.id);
    if (updated) {
      setSelectedTicket({ ...updated, status, resolutionNotes: resolutionNote || undefined });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Wrench className="w-3.5 h-3.5" /> Society Maintenance Helpdesk
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Requests & Complaint Portal</h1>
          <p className="text-xs text-slate-600 mt-1">
            Plumbing, Electrical, Elevator & Civil repairs • SLA tracking • Live technician dispatch
          </p>
        </div>

        <button
          onClick={onOpenNewTicketModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Lodge New Complaint
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Open', count: complaints.filter(c => c.status === 'open').length, color: 'text-amber-700' },
          { label: 'Assigned / In Progress', count: complaints.filter(c => c.status === 'assigned' || c.status === 'in_progress').length, color: 'text-blue-700' },
          { label: 'Resolved Tickets', count: complaints.filter(c => c.status === 'resolved').length, color: 'text-emerald-700' },
          { label: 'Avg Turnaround', count: '3.8 Hours', color: 'text-purple-700' },
        ].map((kpi, idx) => (
          <div key={idx} className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              {kpi.label}
            </span>
            <span className={`text-xl font-bold font-mono ${kpi.color}`}>{kpi.count}</span>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'all', label: 'All' },
            { id: 'open', label: 'Open' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-blue-600 shadow-2xs"
          >
            <option value="all">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="lift">Lift / Elevator</option>
            <option value="security">Security</option>
            <option value="housekeeping">Housekeeping</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-44 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length > 0 ? (
          filteredTickets.map(tkt => (
            <div
              key={tkt.id}
              onClick={() => setSelectedTicket(tkt)}
              className={`p-4 bg-white border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all hover:border-blue-400 shadow-2xs ${
                selectedTicket?.id === tkt.id ? 'border-blue-500 bg-blue-50/40 shadow-xs' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5 text-blue-600" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-700">{tkt.ticketNumber}</span>
                    <span className="text-slate-900 font-bold text-sm">{tkt.title}</span>
                    <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                      tkt.priority === 'urgent'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : tkt.priority === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {tkt.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 mt-1">{tkt.description}</p>

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 flex-wrap">
                    <span>Flat: <strong className="text-slate-900">{tkt.flatNumber}</strong> ({tkt.residentName})</span>
                    <span>Category: <strong className="capitalize text-slate-800">{tkt.category}</strong></span>
                    <span>Assigned: <strong className="text-emerald-700">{tkt.assignedStaffName || 'Unassigned'}</strong></span>
                    <span>Comments: {tkt.comments.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  tkt.status === 'resolved'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : tkt.status === 'in_progress'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : tkt.status === 'assigned'
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {tkt.status.replace('_', ' ')}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200/90 rounded-2xl text-slate-500 text-xs shadow-2xs">
            No complaints matching current filters.
          </div>
        )}
      </div>

      {/* Ticket Details & Discussion Slide-in / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700">{selectedTicket.ticketNumber}</span>
                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${
                    selectedTicket.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedTicket.title}</h3>
                <p className="text-xs text-slate-500">
                  Flat {selectedTicket.flatNumber} • {selectedTicket.residentName} ({selectedTicket.residentPhone})
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Description */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed">
                {selectedTicket.description}
              </div>

              {/* Staff assignment (Admin action) */}
              {currentRole === 'admin' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <span className="text-slate-700 font-semibold">Assign Technician:</span>
                  <select
                    value={selectedTicket.assignedStaffId || ''}
                    onChange={e => {
                      const stf = staff.find(s => s.id === e.target.value);
                      if (stf) {
                        assignComplaintStaff(selectedTicket.id, stf.id, `${stf.name} (${stf.roleTitle})`);
                        setSelectedTicket({
                          ...selectedTicket,
                          assignedStaffId: stf.id,
                          assignedStaffName: `${stf.name} (${stf.roleTitle})`,
                          status: 'assigned'
                        });
                      }
                    }}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 shadow-2xs"
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {s.roleTitle}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status change actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-slate-600 font-medium">Update Status:</span>
                {(['open', 'in_progress', 'resolved'] as ComplaintStatus[]).map(st => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                      selectedTicket.status === st
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Mark {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Resident rating if resolved */}
              {selectedTicket.status === 'resolved' && currentRole === 'resident' && !selectedTicket.rating && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <span className="font-semibold text-emerald-800 block">Rate Service Quality:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => {
                          rateComplaint(selectedTicket.id, star);
                          setSelectedTicket({ ...selectedTicket, rating: star, status: 'closed' });
                        }}
                        className="p-1 text-amber-500 hover:scale-125 transition-transform"
                      >
                        <Star className="w-5 h-5 fill-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Comment Thread */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-800 block">Resolution Log & Discussion:</span>
                <div className="space-y-2">
                  {selectedTicket.comments.map(comm => (
                    <div key={comm.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                        <span className="font-bold text-slate-900">{comm.authorName} ({comm.authorRole})</span>
                        <span>{new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700">{comm.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Input */}
            <form onSubmit={handlePostComment} className="p-4 border-t border-slate-200 bg-slate-50 flex gap-2">
              <input
                type="text"
                placeholder="Add technician remark or resident comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 shadow-2xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
