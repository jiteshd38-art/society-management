import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { useGoogleAuth } from '../../context/GoogleAuthContext';
import { sendEmailViaGmail } from '../../services/gmailService';
import { MaintenanceBill } from '../../types/society';
import {
  X,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  Printer,
  Calculator,
  ArrowRight,
  History,
  Check,
  Percent,
  Clock,
  AlertCircle,
  Mail
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bill }) => {
  const { payMaintenanceBill, sendBillEmail, allResidents } = useSociety();
  const { accessToken } = useGoogleAuth();
  const [method, setMethod] = useState<'UPI' | 'Credit Card' | 'Net Banking'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Partial vs Full payment selection
  const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full');
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('aditya.sharma@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [expiry, setExpiry] = useState('08/29');
  const [cvv, setCvv] = useState('821');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Last payment record for receipt view
  const [receiptData, setReceiptData] = useState<{
    amountPaid: number;
    remainingAmount: number;
    receiptNumber: string;
    transactionId: string;
    totalBill: number;
    totalPaidOverall: number;
    isFullSettlement: boolean;
  } | null>(null);

  // Compute current financial balance for this bill
  const totalBillAmount = bill ? bill.amount : 0;
  const alreadyPaid = bill
    ? bill.paidAmount !== undefined
      ? bill.paidAmount
      : bill.status === 'paid'
      ? bill.amount
      : 0
    : 0;

  const currentDue = bill
    ? bill.remainingAmount !== undefined
      ? bill.remainingAmount
      : Math.max(0, totalBillAmount - alreadyPaid)
    : 0;

  // Sync default payment amount when bill changes
  useEffect(() => {
    if (bill) {
      const due = bill.remainingAmount !== undefined
        ? bill.remainingAmount
        : Math.max(0, bill.amount - (bill.paidAmount || 0));

      setPaymentType('full');
      // Default partial amount to 50% rounded
      const half = Math.max(500, Math.round(due / 2));
      setCustomAmountStr(half > due ? due.toString() : half.toString());
      setIsSuccess(false);
      setReceiptData(null);
      setShowHistory(false);
      setEmailSent(false);
      setEmailSending(false);
    }
  }, [bill]);

  const handleEmailReceipt = async () => {
    if (!bill) return;
    setEmailSending(true);
    try {
      const resident = allResidents.find(r => r.flatNumber === bill.flatNumber);
      const email = resident?.email || `${bill.flatNumber.toLowerCase()}@palmheights.residency.org`;
      const note = `Dear ${bill.residentName},\n\nAttached is your official payment acknowledgment receipt for Flat ${bill.flatNumber} (${bill.month}). Remaining due balance: ₹${receiptData?.remainingAmount || 0}.\n\nThank you,\nPalm Heights Accounts Division`;
      const subj = `[Official Receipt] Payment Cleared - Unit ${bill.flatNumber} (${bill.month})`;

      if (accessToken) {
        await sendEmailViaGmail({
          accessToken,
          recipientEmail: email,
          subject: subj,
          bodyText: note,
          bill
        });
      }

      await sendBillEmail(bill.id, email, note, subj);
      setEmailSent(true);
    } catch (e) {
      console.error('Failed to email receipt:', e);
    } finally {
      setEmailSending(false);
    }
  };

  if (!isOpen || !bill) return null;

  // Calculate amount to pay based on selection
  let parsedCustom = parseFloat(customAmountStr);
  if (isNaN(parsedCustom) || parsedCustom < 0) parsedCustom = 0;

  const amountToPay = paymentType === 'full'
    ? currentDue
    : Math.min(parsedCustom, currentDue);

  // Calculate live remaining bill due after this payment
  const remainingDueAfter = Math.max(0, currentDue - amountToPay);
  const totalPaidAfter = alreadyPaid + amountToPay;
  const percentageCovered = totalBillAmount > 0
    ? Math.min(100, Math.round((totalPaidAfter / totalBillAmount) * 100))
    : 100;

  const handlePay = () => {
    if (amountToPay <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const res = payMaintenanceBill(
        bill.id,
        method,
        amountToPay,
        paymentType === 'full'
          ? `Settled full due balance of ₹${amountToPay}`
          : `Partial installment of ₹${amountToPay} (Remaining due: ₹${remainingDueAfter})`
      );

      setReceiptData({
        amountPaid: res.amountPaid,
        remainingAmount: res.remainingAmount,
        receiptNumber: res.receiptNumber,
        transactionId: res.transactionId,
        totalBill: totalBillAmount,
        totalPaidOverall: alreadyPaid + res.amountPaid,
        isFullSettlement: res.remainingAmount <= 0
      });

      setIsProcessing(false);
      setIsSuccess(true);
    }, 1100);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    setReceiptData(null);
    onClose();
  };

  const handlePresetSelect = (fraction: number) => {
    const val = Math.round(currentDue * fraction);
    setCustomAmountStr(val.toString());
  };

  const handleResetForAnotherPayment = () => {
    if (receiptData && receiptData.remainingAmount > 0) {
      setPaymentType('full');
      setCustomAmountStr(Math.round(receiptData.remainingAmount / 2).toString());
      setIsSuccess(false);
      setReceiptData(null);
    } else {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Maintenance Bill Payment</h3>
                {alreadyPaid > 0 && bill.status !== 'paid' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                    Partially Paid
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Flat {bill.flatNumber} • {bill.month} • Due Date: {bill.dueDate}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {!isSuccess ? (
            <div className="space-y-5">
              {/* Account Balance Snapshot */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Current Outstanding Due
                    </span>
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      ₹{currentDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Total Invoiced: ₹{totalBillAmount.toLocaleString('en-IN')}</span>
                    {alreadyPaid > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 block">
                        ✓ ₹{alreadyPaid.toLocaleString('en-IN')} already paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar of invoice clearance */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                    <span>Invoice Settlement Progress</span>
                    <span className="font-semibold text-emerald-700 font-mono">{percentageCovered}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    {alreadyPaid > 0 && (
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${Math.round((alreadyPaid / totalBillAmount) * 100)}%` }}
                        title={`Already Paid: ₹${alreadyPaid}`}
                      />
                    )}
                    {amountToPay > 0 && (
                      <div
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${Math.round((amountToPay / totalBillAmount) * 100)}%` }}
                        title={`Paying Now: ₹${amountToPay}`}
                      />
                    )}
                  </div>
                </div>

                {/* Collapsible Fee Breakdown */}
                <div className="pt-1">
                  <details className="group text-xs text-slate-600">
                    <summary className="cursor-pointer font-medium text-slate-600 hover:text-slate-900 select-none flex items-center justify-between list-none">
                      <span>View Detailed Bill Breakup</span>
                      <span className="text-emerald-700 text-[11px] group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="pt-2 mt-1 border-t border-slate-200/60 space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span>Base Society Maintenance:</span>
                        <span className="font-mono text-slate-800">₹{bill.breakup.maintenanceFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sinking & Capital Reserve:</span>
                        <span className="font-mono text-slate-800">₹{bill.breakup.sinkingFund}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Water Meter Surcharge:</span>
                        <span className="font-mono text-slate-800">₹{bill.breakup.waterCharges}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Designated Parking Slot:</span>
                        <span className="font-mono text-slate-800">₹{bill.breakup.parkingCharges}</span>
                      </div>
                      {bill.breakup.penalty > 0 && (
                        <div className="flex justify-between text-amber-700 font-semibold">
                          <span>Late Payment Fine:</span>
                          <span className="font-mono">+₹{bill.breakup.penalty}</span>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              </div>

              {/* Payment Type Selection: Full vs Partial */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Payment Amount Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentType('full')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      paymentType === 'full'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Pay in Full</span>
                      {paymentType === 'full' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-lg font-mono font-black text-slate-900">
                      ₹{currentDue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Clear entire remaining balance once
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentType('partial')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      paymentType === 'partial'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Partial Payment</span>
                      {paymentType === 'partial' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-lg font-mono font-black text-slate-900">
                      Custom Amount
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Pay an installment, balance remains
                    </p>
                  </button>
                </div>
              </div>

              {/* Partial Amount Input & Quick Chips */}
              {paymentType === 'partial' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Enter Amount to Pay Now (₹)
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Max due: <strong className="font-mono text-slate-800">₹{currentDue.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={currentDue}
                      value={customAmountStr}
                      onChange={e => {
                        const val = e.target.value;
                        const num = parseFloat(val);
                        if (num > currentDue) {
                          setCustomAmountStr(currentDue.toString());
                        } else {
                          setCustomAmountStr(val);
                        }
                      }}
                      placeholder={`e.g. ${Math.round(currentDue / 2)}`}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                    />
                  </div>

                  {/* Quick percentage & installment presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Quick Installment Presets:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(0.25)}
                        className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors text-center shadow-2xs"
                      >
                        25% (₹{Math.round(currentDue * 0.25)})
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(0.50)}
                        className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors text-center shadow-2xs"
                      >
                        50% (₹{Math.round(currentDue * 0.50)})
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePresetSelect(0.75)}
                        className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors text-center shadow-2xs"
                      >
                        75% (₹{Math.round(currentDue * 0.75)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomAmountStr(currentDue.toString())}
                        className="py-1.5 px-2 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors text-center shadow-2xs"
                      >
                        100% (Full)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE REMAINING BILL DUE CALCULATION CARD */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-xl shadow-sm border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold uppercase tracking-wider">
                    <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                    Live Due Calculation
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Installment Analysis
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Due</span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      ₹{currentDue.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-2 bg-emerald-950/80 rounded-lg border border-emerald-700/80">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block">Paying Now</span>
                    <span className="text-sm font-mono font-bold text-emerald-300">
                      -₹{amountToPay.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className={`p-2 rounded-lg border ${
                    remainingDueAfter === 0
                      ? 'bg-emerald-950/90 border-emerald-500'
                      : 'bg-amber-950/90 border-amber-600/80'
                  }`}>
                    <span className="text-[10px] text-amber-300 uppercase tracking-wider block font-bold">
                      Remaining Due
                    </span>
                    <span className={`text-base font-mono font-black ${
                      remainingDueAfter === 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      ₹{remainingDueAfter.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Status indicator message */}
                <div className="pt-1 text-xs">
                  {remainingDueAfter === 0 ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/50 p-2 rounded-lg border border-emerald-800/50">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Full Clearance:</strong> Your maintenance dues for {bill.month} will be 100% settled!
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-950/50 p-2 rounded-lg border border-amber-800/50">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>Partial Payment:</strong> An outstanding balance of{' '}
                        <strong className="font-mono text-white">₹{remainingDueAfter.toLocaleString('en-IN')}</strong> will remain due before {bill.dueDate}.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Previous Payment History (if any) */}
              {bill.payments && bill.payments.length > 0 && (
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-emerald-600" />
                      Previous Installments for this Bill ({bill.payments.length})
                    </span>
                    <span className="text-[11px] text-emerald-700">{showHistory ? 'Hide' : 'View History'}</span>
                  </button>

                  {showHistory && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2 text-xs">
                      {bill.payments.map((p, idx) => (
                        <div key={p.id || idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px]">
                          <div>
                            <span className="font-bold text-slate-800">Installment #{idx + 1}: ₹{p.amount.toLocaleString('en-IN')}</span>
                            <span className="text-slate-500 block text-[10px]">{p.paidAt} • {p.paymentMethod}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-700 font-semibold">{p.receiptNumber}</span>
                            <span className="text-slate-500 block text-[10px]">Due after: ₹{p.remainingAfter.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Payment Gateway / Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'Credit Card', label: 'Card', icon: CreditCard },
                    { id: 'Net Banking', label: 'NetBanking', icon: Building },
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = method === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMethod(item.id as any)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-semibold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Method-specific inputs */}
              {method === 'UPI' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white p-2 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center shadow-2xs">
                      <QrCode className="w-16 h-16 text-slate-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 font-medium">Scan QR or enter UPI VPA</p>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@bank"
                        className="mt-1 w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                      />
                      <div className="flex gap-2 mt-2">
                        {['GooglePay', 'PhonePe', 'Paytm'].map(app => (
                          <span key={app} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md shadow-2xs">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {method === 'Credit Card' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Valid Thru</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cvv}
                        onChange={e => setCvv(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'Net Banking' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="block text-[11px] font-semibold text-slate-600">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={e => setSelectedBank(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  >
                    <option>HDFC Bank</option>
                    <option>State Bank of India (SBI)</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>256-bit encrypted society escrow payment gateway.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing || amountToPay <= 0}
                  onClick={handlePay}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authorizing Payment...
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{amountToPay.toLocaleString('en-IN')}</span>
                      <span className="text-xs font-normal opacity-90">
                        {paymentType === 'full' || remainingDueAfter === 0 ? '(Full Settle)' : `(Remaining: ₹${remainingDueAfter})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Success Receipt View */
            <div className="space-y-6 text-center py-2 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900">
                  {receiptData?.isFullSettlement
                    ? 'Payment Received — Bill Fully Cleared!'
                    : 'Partial Payment Received!'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Society accounts ledger updated. Official acknowledgment receipt generated.
                </p>
              </div>

              {/* Detailed Receipt Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-3 shadow-2xs">
                <div className="flex justify-between border-b border-slate-200 pb-2.5 font-mono">
                  <span className="text-slate-500">Receipt Number:</span>
                  <span className="font-bold text-emerald-700">{receiptData?.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Unit:</span>
                  <span className="text-slate-900 font-semibold">{bill.flatNumber} ({bill.residentName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billing Period:</span>
                  <span className="text-slate-800 font-medium">{bill.month}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Gateway / Mode:</span>
                  <span className="text-slate-800 font-medium">{method} (Ref: {receiptData?.transactionId})</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-slate-700">
                  <span>Total Invoiced Amount:</span>
                  <span className="font-mono font-medium">₹{receiptData?.totalBill.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="text-emerald-700">Amount Paid in this Transaction:</span>
                  <span className="font-mono text-emerald-700 text-sm">
                    ₹{receiptData?.amountPaid.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Settled Across All Installments:</span>
                  <span className="font-mono font-semibold">
                    ₹{receiptData?.totalPaidOverall.toLocaleString('en-IN')} / ₹{receiptData?.totalBill.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* HIGHLIGHTED REMAINING BALANCE DUE ROW */}
                <div className={`p-3 rounded-xl border flex justify-between items-center ${
                  (receiptData?.remainingAmount || 0) <= 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Remaining Bill Due Balance:
                    </span>
                    <span className="text-[11px] opacity-80">
                      {(receiptData?.remainingAmount || 0) <= 0
                        ? 'No dues remaining for this month'
                        : `Payable before due date (${bill.dueDate})`}
                    </span>
                  </div>
                  <span className="text-xl font-mono font-black">
                    ₹{(receiptData?.remainingAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>

                  <button
                    type="button"
                    disabled={emailSending || emailSent}
                    onClick={handleEmailReceipt}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                      emailSent
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {emailSending ? 'Sending...' : emailSent ? 'Receipt Emailed!' : 'Email Receipt'}
                  </button>
                </div>

                <div className="flex gap-2">
                  {receiptData && receiptData.remainingAmount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetForAnotherPayment}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold rounded-xl transition-colors"
                    >
                      Pay More Now
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
