import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Building2,
  Users,
  ShieldAlert,
  Wrench,
  CreditCard,
  QrCode,
  CheckCircle2,
  Clock,
  Car,
  Truck,
  Flame,
  ArrowUpRight,
  Plus,
  AlertCircle,
  FileText,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Mail
} from 'lucide-react';
import { MaintenanceBill } from '../../types/society';

interface DashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenGatePass: () => void;
  onOpenPayment: (bill: MaintenanceBill) => void;
  onOpenNewTicket: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenGatePass,
  onOpenPayment,
  onOpenNewTicket
}) => {
  const {
    currentRole,
    currentResident,
    visitors,
    bills,
    complaints,
    flats,
    amenities,
    bookings,
    notices,
    domesticWorkers,
    staff,
    checkInVisitorByCode,
    checkOutVisitor
  } = useSociety();

  // Guard quick verify state
  const [quickCode, setQuickCode] = useState('');
  const [gateMessage, setGateMessage] = useState<{ success?: boolean; text: string } | null>(null);

  // Resident specific data
  const myBills = bills.filter(b => b.flatNumber === currentResident.flatNumber);
  const pendingBill = myBills.find(b => b.status === 'pending' || b.status === 'overdue' || b.status === 'partially_paid');
  const myComplaints = complaints.filter(c => c.flatNumber === currentResident.flatNumber);
  const myVisitors = visitors.filter(v => v.flatNumber === currentResident.flatNumber);
  const myDomesticWorkers = domesticWorkers.filter(w => w.flatsAssigned.includes(currentResident.flatNumber));

  // Society-wide data
  const inCampusVisitors = visitors.filter(v => v.status === 'in_campus');
  const openComplaints = complaints.filter(c => c.status === 'open' || c.status === 'assigned' || c.status === 'in_progress');
  const totalDuesPending = flats.reduce((acc, f) => acc + f.maintenanceDue, 0);
  const pinnedNotices = notices.filter(n => n.isPinned);

  const handleVerifyPassCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCode.trim()) return;

    const res = checkInVisitorByCode(quickCode.trim(), 'Main Gate 1');
    if (res.success) {
      setGateMessage({ success: true, text: res.message });
      setQuickCode('');
    } else {
      setGateMessage({ success: false, text: res.message });
    }

    setTimeout(() => {
      setGateMessage(null);
    }, 5000);
  };

  /* ---------------------------------------------------- */
  /* ADMIN VIEW                                            */
  /* ---------------------------------------------------- */
  if (currentRole === 'admin') {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-xs relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
                👑 Management Committee Command Console
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Palm Heights Residency ERP</h1>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                Unified residential operations: 4 Towers (A, B, C, D) • 184 Flats • Automated Gate Security & Maintenance
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigateTab('gate')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Gate Operations
              </button>
              <button
                onClick={() => onNavigateTab('finance')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Accounts & Dues
              </button>
              <button
                onClick={() => onNavigateTab('notices')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600" /> Broadcast Circular
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stat KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flats Occupancy</span>
              <div className="p-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">170</span>
              <span className="text-xs text-slate-500">/ 184 Units (92.4%)</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 14 Vacant / 12 under renovation
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collections Health</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">91.8%</span>
              <span className="text-xs text-slate-500">Collected</span>
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-2">
              ₹{totalDuesPending.toLocaleString('en-IN')} pending across 4 units
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitors In Campus</span>
              <div className="p-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">{inCampusVisitors.length}</span>
              <span className="text-xs text-slate-500">active guests/cabs</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {domesticWorkers.filter(w => w.isInside).length} domestic staff inside
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open Complaints</span>
              <div className="p-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 font-mono">{openComplaints.length}</span>
              <span className="text-xs text-slate-500">active tickets</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-2">
              18 resolved this billing cycle
            </p>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Gate Activity Stream */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Live Gate Access & Visitor Stream</h3>
              </div>
              <button
                onClick={() => onNavigateTab('gate')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                Full Gate Log <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {visitors.slice(0, 5).map(vis => (
                <div key={vis.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      {vis.visitorType === 'delivery' ? <Truck className="w-4 h-4 text-blue-600" /> : <Users className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {vis.visitorName} {vis.company && <span className="text-slate-500 font-normal">({vis.company})</span>}
                      </p>
                      <p className="text-slate-500 text-[11px]">
                        Visiting Flat <span className="text-slate-800 font-semibold">{vis.flatNumber}</span> • {vis.purpose}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      vis.status === 'in_campus'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : vis.status === 'expected'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : vis.status === 'denied'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {vis.status.replace('_', ' ')}
                    </span>
                    {vis.status === 'in_campus' && (
                      <button
                        onClick={() => checkOutVisitor(vis.id)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium rounded-lg border border-slate-200 transition-colors"
                      >
                        Exit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice Board & Polls Preview */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Notice Board Highlights</h3>
              </div>
              <button
                onClick={() => onNavigateTab('notices')}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
              >
                All Notices
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map(not => (
                <div key={not.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200 font-bold uppercase">
                      {not.category}
                    </span>
                    <span className="text-slate-400">{not.publishedDate}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900 line-clamp-1">{not.title}</h4>
                  <p className="text-slate-600 line-clamp-2 text-[11px]">{not.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------- */
  /* RESIDENT VIEW                                         */
  /* ---------------------------------------------------- */
  if (currentRole === 'resident') {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
                🏡 Flat {currentResident.flatNumber} • {currentResident.block}
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome, {currentResident.name}</h1>
              <p className="text-xs text-slate-600 mt-1">
                Intercom: <span className="font-mono text-emerald-700 font-bold">{currentResident.intercom}</span> • {currentResident.role === 'owner' ? 'Owner Resident' : 'Tenant Resident'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={onOpenGatePass}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <QrCode className="w-4 h-4" /> Pre-Approve Visitor
              </button>
              <button
                onClick={onOpenNewTicket}
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center gap-1.5"
              >
                <Wrench className="w-4 h-4 text-blue-600" /> Raise Complaint
              </button>
            </div>
          </div>
        </div>

        {/* Resident Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Dues Widget */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance Dues</span>
              <div className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>

            {pendingBill ? (() => {
              const paidAmount = pendingBill.paidAmount !== undefined
                ? pendingBill.paidAmount
                : pendingBill.status === 'paid'
                ? pendingBill.amount
                : 0;
              const remainingDue = pendingBill.remainingAmount !== undefined
                ? pendingBill.remainingAmount
                : Math.max(0, pendingBill.amount - paidAmount);
              const isPartial = pendingBill.status === 'partially_paid' || (paidAmount > 0 && remainingDue > 0);
              const pct = pendingBill.amount > 0 ? Math.min(100, Math.round((paidAmount / pendingBill.amount) * 100)) : 0;

              return (
                <div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        {isPartial ? 'Remaining Balance Due' : 'Outstanding Dues'}
                      </span>
                      <p className={`text-2xl font-black font-mono ${isPartial ? 'text-amber-700' : 'text-slate-900'}`}>
                        ₹{remainingDue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    {isPartial && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        {pct}% Settled
                      </span>
                    )}
                  </div>

                  {isPartial ? (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600">
                        <span>Paid: <strong className="font-mono text-emerald-700">₹{paidAmount.toLocaleString('en-IN')}</strong></span>
                        <span>Total: <strong className="font-mono text-slate-700">₹{pendingBill.amount.toLocaleString('en-IN')}</strong></span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-amber-800 font-medium pt-0.5">
                        Balance due before {pendingBill.dueDate} ({pendingBill.month})
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 font-medium mt-1">
                      Due by {pendingBill.dueDate} ({pendingBill.month})
                    </p>
                  )}

                  <button
                    onClick={() => onOpenPayment(pendingBill)}
                    className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {isPartial ? `Pay Remaining Due (₹${remainingDue.toLocaleString('en-IN')})` : 'Pay Bill (Full or Partial)'}
                  </button>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab('finance')}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Mail className="w-3 h-3 text-blue-600" />
                      <span>Email statement or view ledger</span>
                    </button>
                    {pendingBill.lastEmailedAt && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Sent: {pendingBill.lastEmailedAt}
                      </span>
                    )}
                  </div>
                </div>
              );
            })() : (
              <div className="py-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> All Dues Cleared
                </div>
                <p className="text-xs text-slate-500 mt-1">No outstanding charges for Flat {currentResident.flatNumber}.</p>
                <button
                  onClick={() => onNavigateTab('finance')}
                  className="mt-4 text-xs text-slate-600 hover:text-slate-900 underline font-medium"
                >
                  View Past Invoices
                </button>
              </div>
            )}
          </div>

          {/* Registered Vehicles */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Registered Vehicles</span>
              <div className="p-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl">
                <Car className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              {currentResident.vehicles.map(v => (
                <div key={v.id} className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">{v.model}</p>
                    <p className="text-[11px] font-mono text-emerald-700 font-bold">{v.registrationNumber}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded text-[10px] font-semibold">
                    Slot: {v.parkingSlot}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Domestic Staff Status */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Domestic Help Presence</span>
              <div className="p-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-xl">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>

            {myDomesticWorkers.length > 0 ? (
              <div className="space-y-2">
                {myDomesticWorkers.map(w => (
                  <div key={w.id} className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{w.name} ({w.role})</p>
                      <p className="text-[10px] text-slate-500">{w.lastPunch}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      w.isInside ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {w.isInside ? 'Inside Society' : 'Outside'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">No domestic helpers assigned to this flat yet.</p>
            )}
          </div>
        </div>

        {/* 2-Column: My Recent Visitors & My Raised Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Visitors */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">My Pre-Approved & Active Guests</h3>
              </div>
              <button
                onClick={onOpenGatePass}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                + Add Guest Pass
              </button>
            </div>

            {myVisitors.length > 0 ? (
              <div className="space-y-2.5">
                {myVisitors.slice(0, 4).map(vis => (
                  <div key={vis.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-900">{vis.visitorName}</p>
                      <p className="text-[11px] text-slate-500">
                        Pass Code: <span className="font-mono text-emerald-700 font-bold">{vis.passCode}</span> • {vis.purpose}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      vis.status === 'in_campus' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {vis.status.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">No active visitors for Flat {currentResident.flatNumber}.</p>
            )}
          </div>

          {/* My Complaints */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">My Helpdesk Service Tickets</h3>
              </div>
              <button
                onClick={onOpenNewTicket}
                className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
              >
                + New Ticket
              </button>
            </div>

            {myComplaints.length > 0 ? (
              <div className="space-y-2.5">
                {myComplaints.map(tkt => (
                  <div key={tkt.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-blue-700 text-[11px]">{tkt.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        tkt.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {tkt.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">{tkt.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Assigned to: {tkt.assignedStaffName || 'Under Review by Estate Desk'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">No open tickets. All household facilities in order!</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------- */
  /* SECURITY GUARD VIEW                                   */
  /* ---------------------------------------------------- */
  if (currentRole === 'security') {
    return (
      <div className="space-y-6">
        {/* Security Gate 1 Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-indigo-50 border border-blue-100 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
                🛡️ Security Console • Main Entrance Gate 1
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gate Verification & Vehicle Control</h1>
              <p className="text-xs text-slate-600 mt-1">
                Duty Officer: <span className="text-slate-900 font-bold">Subhash Singh</span> • Shift: Day (08:00 - 20:00)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Gate System Online
              </span>
            </div>
          </div>
        </div>

        {/* Fast Passcode Check-In Console */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            Quick 6-Digit Passcode / OTP Check-In
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Ask visitor for the 6-digit entry code provided by host resident:
          </p>

          <form onSubmit={handleVerifyPassCode} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit pass code (e.g. 619284)"
              value={quickCode}
              onChange={e => setQuickCode(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-lg font-mono tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-center sm:text-left shadow-2xs"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Verify & Permit Entry
            </button>
          </form>

          {gateMessage && (
            <div className={`mt-3 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              gateMessage.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {gateMessage.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
              <span>{gateMessage.text}</span>
            </div>
          )}
        </div>

        {/* Live inside campus list */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Currently In Campus ({inCampusVisitors.length})</h3>
            </div>
            <button
              onClick={() => onNavigateTab('gate')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              Full Gate Logs
            </button>
          </div>

          <div className="space-y-2.5">
            {inCampusVisitors.map(vis => (
              <div key={vis.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">
                    {vis.visitorName} {vis.company && <span className="text-slate-500">({vis.company})</span>}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Visiting: <span className="text-slate-800 font-semibold">Flat {vis.flatNumber}</span> • Entry: {vis.checkInTime} • Code: {vis.passCode}
                  </p>
                </div>
                <button
                  onClick={() => checkOutVisitor(vis.id)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-colors"
                >
                  Log Departure
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------- */
  /* STAFF VIEW                                            */
  /* ---------------------------------------------------- */
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-indigo-50 border border-purple-100 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold mb-2">
              🔧 Facility Operations & Maintenance Desk
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Technician Task Queue & Attendance</h1>
            <p className="text-xs text-slate-600 mt-1">
              Active staff members on shift: <span className="text-slate-900 font-bold">{staff.filter(s => s.status === 'on_duty').length} on duty</span>
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('complaints')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            View All Society Complaints
          </button>
        </div>
      </div>

      {/* Assigned complaints queue */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-purple-600" />
          Active Work Orders & Maintenance Calls
        </h3>

        <div className="space-y-3">
          {complaints.filter(c => c.status !== 'closed').map(tkt => (
            <div key={tkt.id} className="p-4 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-blue-700">{tkt.ticketNumber} • Flat {tkt.flatNumber}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  tkt.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  {tkt.status.replace('_', ' ')}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{tkt.title}</p>
              <p className="text-slate-600 text-xs">{tkt.description}</p>
              <p className="text-[11px] text-slate-500">Resident: {tkt.residentName} ({tkt.residentPhone})</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
