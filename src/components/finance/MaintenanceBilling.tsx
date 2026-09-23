import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { useGoogleAuth } from '../../context/GoogleAuthContext';
import { sendEmailViaGmail } from '../../services/gmailService';
import { MaintenanceBill } from '../../types/society';
import { SendBillEmailModal } from '../modals/SendBillEmailModal';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  Plus,
  TrendingUp,
  Building,
  Receipt,
  FileCheck,
  History,
  AlertCircle,
  ArrowRight,
  Mail,
  Send,
  Check,
  ExternalLink,
  ShieldCheck,
  X
} from 'lucide-react';

interface MaintenanceBillingProps {
  onOpenPaymentModal: (bill: MaintenanceBill) => void;
}

export const MaintenanceBilling: React.FC<MaintenanceBillingProps> = ({ onOpenPaymentModal }) => {
  const {
    bills,
    currentRole,
    currentResident,
    flats,
    allResidents,
    generateSocietyBill,
    emailLogs,
    sendBulkBillReminders
  } = useSociety();
  const { accessToken, isConnected, user } = useGoogleAuth();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'partially_paid' | 'overdue' | 'paid'>('all');
  const [filterFlat, setFilterFlat] = useState<string>(currentRole === 'resident' ? currentResident.flatNumber : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<MaintenanceBill | null>(null);

  // Email modal states
  const [emailModalBill, setEmailModalBill] = useState<MaintenanceBill | null>(null);
  const [showEmailLogsModal, setShowEmailLogsModal] = useState(false);
  const [isBulkSending, setIsBulkSending] = useState(false);

  // Admin new bill state
  const [showNewBillForm, setShowNewBillForm] = useState(false);
  const [targetFlat, setTargetFlat] = useState('A-101');
  const [billMonth, setBillMonth] = useState('October 2026');
  const [billAmount, setBillAmount] = useState('4200');

  // Helper calculations for actual amounts collected & remaining
  const getBillPaidAmount = (b: MaintenanceBill) => {
    if (b.paidAmount !== undefined) return b.paidAmount;
    if (b.status === 'paid') return b.amount;
    return 0;
  };

  const getBillRemainingDue = (b: MaintenanceBill) => {
    if (b.remainingAmount !== undefined) return b.remainingAmount;
    if (b.status === 'paid') return 0;
    return b.amount;
  };

  const totalCollected = bills.reduce((acc, b) => acc + getBillPaidAmount(b), 0);
  const totalPending = bills.reduce((acc, b) => acc + getBillRemainingDue(b), 0);
  const billsAwaitingClearance = bills.filter(b => b.status === 'pending' || b.status === 'overdue' || b.status === 'partially_paid');

  const filteredBills = bills.filter(b => {
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'pending'
        ? b.status === 'pending' || b.status === 'partially_paid'
        : b.status === filterStatus;

    const matchesFlat = filterFlat === 'all' || b.flatNumber === filterFlat;
    const matchesSearch =
      b.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.month.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesFlat && matchesSearch;
  });

  const handleGenerateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(billAmount);
    if (!amt || isNaN(amt)) return;

    generateSocietyBill(targetFlat, billMonth, amt);
    setShowNewBillForm(false);
  };

  const handleBulkReminders = async () => {
    setIsBulkSending(true);
    try {
      if (accessToken) {
        // Send real emails via Gmail API to all units with pending dues
        for (const bill of billsAwaitingClearance) {
          const resident = allResidents.find(r => r.flatNumber === bill.flatNumber);
          const email = resident?.email || `${bill.flatNumber.toLowerCase()}@palmheights.residency.org`;
          const remaining = getBillRemainingDue(bill);
          try {
            await sendEmailViaGmail({
              accessToken,
              recipientEmail: email,
              subject: `[Maintenance Notice] Pending Dues of ₹${remaining.toLocaleString('en-IN')} - Unit ${bill.flatNumber}`,
              bodyText: `Dear ${bill.residentName},\n\nThis is a reminder regarding your maintenance dues of ₹${remaining.toLocaleString('en-IN')} for Unit ${bill.flatNumber} (${bill.month}). Kindly clear your balance before ${bill.dueDate}.\n\nThank you,\nPalm Heights Management Committee`,
              bill
            });
          } catch (err) {
            console.warn(`Failed to dispatch Gmail for flat ${bill.flatNumber}:`, err);
          }
        }
      }

      await sendBulkBillReminders();
    } finally {
      setIsBulkSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <CreditCard className="w-3.5 h-3.5" /> Society Accounts & Invoicing
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Maintenance Bills & Financial Ledger</h1>
          <p className="text-xs text-slate-600 mt-1">
            Automated monthly billing • Partial installment payments • Instant email invoices & payment receipts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Email Audit Log Button */}
          <button
            onClick={() => setShowEmailLogsModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
            title="View audit logs of sent emails"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Email Logs</span>
            {emailLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {emailLogs.length}
              </span>
            )}
          </button>

          {currentRole === 'admin' && (
            <>
              {/* Bulk Email Reminders */}
              <button
                disabled={isBulkSending || billsAwaitingClearance.length === 0}
                onClick={handleBulkReminders}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                title="Send email notices to all units with pending maintenance dues"
              >
                {isBulkSending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-blue-700" />
                    <span>Email All Pending ({billsAwaitingClearance.length})</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setShowNewBillForm(!showNewBillForm)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Raise Maintenance Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* Admin New Bill Drawer */}
      {showNewBillForm && currentRole === 'admin' && (
        <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            Raise Individual / Supplemental Maintenance Invoice
          </h3>

          <form onSubmit={handleGenerateBill} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Unit</label>
              <select
                value={targetFlat}
                onChange={e => setTargetFlat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
              >
                {flats.map(f => (
                  <option key={f.flatNumber} value={f.flatNumber}>
                    {f.flatNumber} - {f.ownerName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Billing Month</label>
              <input
                type="text"
                value={billMonth}
                onChange={e => setBillMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Bill Amount (₹)</label>
              <input
                type="number"
                value={billAmount}
                onChange={e => setBillAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                Issue Invoice
              </button>
              <button
                type="button"
                onClick={() => setShowNewBillForm(false)}
                className="px-3 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Collections Received
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Includes full and partial installment receipts
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Outstanding / Remaining Dues
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700 font-mono">
              ₹{totalPending.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {billsAwaitingClearance.length} invoices awaiting full settlement
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Sinking & Reserve Corpus
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700 font-mono">
              ₹14,80,000
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Term deposit fixed for lift & DG long-term overhaul
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'pending', label: 'Pending / Dues' },
            { id: 'partially_paid', label: 'Partially Paid' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'paid', label: 'Paid & Settled' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === st.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {currentRole !== 'resident' && (
            <select
              value={filterFlat}
              onChange={e => setFilterFlat(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
            >
              <option value="all">All Flats</option>
              {flats.map(f => (
                <option key={f.flatNumber} value={f.flatNumber}>
                  {f.flatNumber} ({f.ownerName})
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search bill or month..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 w-48 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Bills Table / Cards */}
      <div className="space-y-3">
        {filteredBills.length > 0 ? (
          filteredBills.map(bill => {
            const paid = getBillPaidAmount(bill);
            const remaining = getBillRemainingDue(bill);
            const pct = bill.amount > 0 ? Math.min(100, Math.round((paid / bill.amount) * 100)) : 100;

            return (
              <div
                key={bill.id}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-300 shadow-2xs"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <CreditCard className={`w-6 h-6 ${
                      bill.status === 'paid'
                        ? 'text-emerald-600'
                        : bill.status === 'partially_paid'
                        ? 'text-amber-600'
                        : bill.status === 'overdue'
                        ? 'text-red-600'
                        : 'text-slate-600'
                    }`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Flat {bill.flatNumber} • {bill.month}
                      </h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        bill.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : bill.status === 'partially_paid'
                          ? 'bg-amber-50 text-amber-700 border border-amber-300'
                          : bill.status === 'overdue'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {bill.status === 'partially_paid' ? 'Partially Paid' : bill.status}
                      </span>

                      {bill.payments && bill.payments.length > 0 && (
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({bill.payments.length} installment{bill.payments.length > 1 ? 's' : ''})
                        </span>
                      )}

                      {/* Emailed status pill */}
                      {bill.lastEmailedAt && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <Mail className="w-3 h-3 text-blue-600" />
                          Emailed ({bill.lastEmailedAt})
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      Resident: {bill.residentName} • Due Date: <span className="font-mono text-slate-800 font-semibold">{bill.dueDate}</span>
                    </p>

                    {/* Progress Bar for Partial Payments */}
                    {bill.status === 'partially_paid' && (
                      <div className="mt-2.5 max-w-sm">
                        <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                          <span>Paid: <strong className="font-mono text-emerald-700">₹{paid.toLocaleString('en-IN')}</strong> of ₹{bill.amount.toLocaleString('en-IN')}</span>
                          <span className="font-bold text-amber-700 font-mono">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 flex-wrap">
                      <span>Base: ₹{bill.breakup.maintenanceFee}</span>
                      <span>Sinking: ₹{bill.breakup.sinkingFund}</span>
                      <span>Water: ₹{bill.breakup.waterCharges}</span>
                      <span>Parking: ₹{bill.breakup.parkingCharges}</span>
                      {bill.breakup.penalty > 0 && (
                        <span className="text-red-600 font-semibold">Late Fine: +₹{bill.breakup.penalty}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                  <div className="text-left md:text-right">
                    {bill.status === 'partially_paid' ? (
                      <>
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                          Remaining Due Balance
                        </span>
                        <span className="text-xl font-bold font-mono text-amber-700">
                          ₹{remaining.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Total Bill: ₹{bill.amount.toLocaleString('en-IN')}
                        </span>
                      </>
                    ) : bill.status === 'paid' ? (
                      <>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Settled</span>
                        <span className="text-xl font-bold font-mono text-emerald-700">
                          ₹{bill.amount.toLocaleString('en-IN')}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Payable Dues</span>
                        <span className="text-xl font-bold font-mono text-slate-900">
                          ₹{bill.amount.toLocaleString('en-IN')}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Send Email Button */}
                    <button
                      onClick={() => setEmailModalBill(bill)}
                      className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold"
                      title={bill.status === 'paid' ? 'Email Official Receipt' : 'Email Invoice & Payment Notice'}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">
                        {bill.status === 'paid' ? 'Email Receipt' : 'Email Bill'}
                      </span>
                    </button>

                    {bill.status !== 'paid' ? (
                      <button
                        onClick={() => onOpenPaymentModal(bill)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        {bill.status === 'partially_paid' ? 'Pay Balance' : 'Pay Now'}
                      </button>
                    ) : null}

                    {/* View Receipts or Installments */}
                    {(bill.status === 'paid' || (bill.payments && bill.payments.length > 0)) && (
                      <button
                        onClick={() => setSelectedReceipt(bill)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                        {bill.payments && bill.payments.length > 1 ? 'Installments' : 'Receipt'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200/90 rounded-2xl text-slate-500 text-xs shadow-2xs">
            No bills matching criteria.
          </div>
        )}
      </div>

      {/* Receipt / Installment History Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Official Maintenance Receipt Ledger</h3>
                <p className="text-[10px] text-slate-500">Palm Heights Co-op Housing Society Ltd.</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between font-mono pb-2 border-b border-slate-200">
                <span className="text-slate-500">Bill Identifier:</span>
                <span className="font-bold text-emerald-700">{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Number:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.flatNumber} ({selectedReceipt.residentName})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Period:</span>
                <span className="text-slate-800 font-medium">{selectedReceipt.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Invoiced Amount:</span>
                <span className="font-mono text-slate-900 font-bold">₹{selectedReceipt.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Settled So Far:</span>
                <span className="font-mono text-emerald-700 font-bold">
                  ₹{getBillPaidAmount(selectedReceipt).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Outstanding remaining due banner */}
              <div className={`p-2.5 rounded-lg border flex justify-between items-center ${
                getBillRemainingDue(selectedReceipt) <= 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <span className="font-bold text-[11px] uppercase tracking-wider">
                  Remaining Bill Due:
                </span>
                <span className="font-mono font-black text-sm">
                  ₹{getBillRemainingDue(selectedReceipt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Installments History */}
            {selectedReceipt.payments && selectedReceipt.payments.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-emerald-600" />
                  Recorded Installment Transactions ({selectedReceipt.payments.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedReceipt.payments.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800 font-mono">
                          #{idx + 1} Paid: ₹{p.amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-emerald-700 font-mono font-semibold text-[11px]">
                          {p.receiptNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>{p.paidAt} via {p.paymentMethod} (Ref: {p.transactionId})</span>
                        <span className="font-mono">Remaining after: ₹{p.remainingAfter.toLocaleString('en-IN')}</span>
                      </div>
                      {p.notes && <p className="text-[10px] text-slate-400 italic">{p.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedReceipt.paidAt ? (
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Settled On:</span>
                  <span className="text-slate-800">{selectedReceipt.paidAt} via {selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Receipt Ref:</span>
                  <span className="text-emerald-700 font-bold">{selectedReceipt.receiptNumber || 'REC-2026-0901'}</span>
                </div>
              </div>
            ) : null}

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Print Receipt
                </button>
                <button
                  onClick={() => {
                    const b = selectedReceipt;
                    setSelectedReceipt(null);
                    setEmailModalBill(b);
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" /> Email Receipt
                </button>
              </div>

              <div className="flex gap-2">
                {getBillRemainingDue(selectedReceipt) > 0 && (
                  <button
                    onClick={() => {
                      const b = selectedReceipt;
                      setSelectedReceipt(null);
                      onOpenPaymentModal(b);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Pay Remaining Dues
                  </button>
                )}
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Audit Log History Modal */}
      {showEmailLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Dispatched Email Audit Log</h3>
                  <p className="text-[11px] text-slate-500">Official log of sent invoices, payment notices, and receipts</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailLogsModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emailLogs.length > 0 ? (
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {emailLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          log.type === 'receipt'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.type === 'reminder'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.type}
                        </span>
                        Unit {log.flatNumber} • {log.recipientName}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium truncate">{log.subject}</p>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono pt-1">
                      <span>To: {log.recipientEmail}</span>
                      <span>{log.sentAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                No emails dispatched yet. Click "Email Bill" on any invoice to send one.
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowEmailLogsModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Bill Email Modal */}
      <SendBillEmailModal
        isOpen={!!emailModalBill}
        bill={emailModalBill}
        onClose={() => setEmailModalBill(null)}
      />
    </div>
  );
};
