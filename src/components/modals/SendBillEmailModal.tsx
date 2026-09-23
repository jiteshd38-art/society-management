import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { useGoogleAuth } from '../../context/GoogleAuthContext';
import { sendEmailViaGmail } from '../../services/gmailService';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { MaintenanceBill } from '../../types/society';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Edit3,
  FileText,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  Inbox
} from 'lucide-react';

interface SendBillEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: MaintenanceBill | null;
}

export const SendBillEmailModal: React.FC<SendBillEmailModalProps> = ({ isOpen, onClose, bill }) => {
  const { sendBillEmail, allResidents } = useSociety();
  const { user, accessToken, isConnected, logout, login } = useGoogleAuth();

  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [includeCcAccounts, setIncludeCcAccounts] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isScopeError, setIsScopeError] = useState(false);
  const [sentDetails, setSentDetails] = useState<{
    recipient: string;
    sentAt: string;
    subject: string;
    sender: string;
    googleMessageId?: string;
  } | null>(null);

  // Compute bill financial balances
  const paidAmount = bill
    ? bill.paidAmount !== undefined
      ? bill.paidAmount
      : bill.status === 'paid'
      ? bill.amount
      : 0
    : 0;

  const remainingDue = bill
    ? bill.remainingAmount !== undefined
      ? bill.remainingAmount
      : Math.max(0, bill.amount - paidAmount)
    : 0;

  const isPaid = bill?.status === 'paid';
  const isPartial = bill?.status === 'partially_paid' || (paidAmount > 0 && remainingDue > 0);

  // Pre-fill fields whenever the modal opens with a new bill
  useEffect(() => {
    if (bill) {
      // Find matching resident email
      const resident = allResidents.find(r => r.flatNumber === bill.flatNumber);
      const defaultEmail = resident?.email || `${bill.flatNumber.toLowerCase()}@palmheights.residency.org`;
      setRecipientEmail(defaultEmail);

      // Default subject
      if (isPaid) {
        setSubject(`[Official Receipt] Maintenance Cleared - Unit ${bill.flatNumber} (${bill.month})`);
      } else if (isPartial) {
        setSubject(`[Installment Reminder] Remaining Due: ₹${remainingDue.toLocaleString('en-IN')} - Unit ${bill.flatNumber} (${bill.month})`);
      } else {
        setSubject(`[Maintenance Invoice] Due Notice - Unit ${bill.flatNumber} (${bill.month})`);
      }

      // Default note
      if (isPaid) {
        setCustomNote(
          `Dear ${bill.residentName},\n\nThank you for settling your society maintenance bill for ${bill.month}. Attached is your official digital payment receipt and statement for your records.`
        );
      } else if (isPartial) {
        setCustomNote(
          `Dear ${bill.residentName},\n\nWe have received an installment of ₹${paidAmount.toLocaleString('en-IN')} towards your ${bill.month} maintenance bill. An outstanding balance of ₹${remainingDue.toLocaleString('en-IN')} remains due before ${bill.dueDate}.\n\nYou can pay online via UPI or Card anytime.`
        );
      } else {
        setCustomNote(
          `Dear ${bill.residentName},\n\nPlease find attached your monthly maintenance invoice of ₹${bill.amount.toLocaleString('en-IN')} for ${bill.month}. Kindly clear the dues on or before ${bill.dueDate} to avoid late penalty charges.\n\nPartial payment installments are also accepted through the society portal.`
        );
      }

      setActiveTab('compose');
      setIsSent(false);
      setSentDetails(null);
      setSendError(null);
      setIsScopeError(false);
    }
  }, [bill, isPaid, isPartial, paidAmount, remainingDue, allResidents]);

  if (!isOpen || !bill) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;
    setSendError(null);
    setIsScopeError(false);

    setIsSending(true);
    try {
      let googleMsgId: string | undefined;

      // If connected to Gmail API, send the real email directly to the recipient!
      if (accessToken) {
        const gmailResult = await sendEmailViaGmail({
          accessToken,
          recipientEmail: recipientEmail.trim(),
          subject: subject.trim(),
          bodyText: customNote,
          ccEmail: includeCcAccounts ? 'accounts@palmheights.residency.org' : undefined,
          bill
        });
        googleMsgId = gmailResult.id;
      }

      // Record in local society context ledger and logs
      const res = await sendBillEmail(bill.id, recipientEmail.trim(), customNote, subject);

      setSentDetails({
        recipient: recipientEmail.trim(),
        sentAt: res.log.sentAt,
        subject: res.log.subject,
        sender: user?.email || 'accounts@palmheights.residency.org',
        googleMessageId: googleMsgId
      });
      setIsSent(true);
    } catch (err: any) {
      console.error('Failed to send email:', err);
      const errMsg = err?.message || 'Failed to dispatch email.';
      const isScope =
        errMsg.toLowerCase().includes('scope') ||
        errMsg.toLowerCase().includes('insufficient') ||
        errMsg.toLowerCase().includes('403');
      setIsScopeError(isScope);
      setSendError(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const handleReauth = async () => {
    try {
      await logout();
      await login();
      setSendError(null);
      setIsScopeError(false);
    } catch (e) {
      console.error('Re-auth failed:', e);
    }
  };

  // Generate mailto link for direct sending in user's default client (Gmail, Outlook)
  const generateMailtoBody = () => {
    return (
      `${customNote}\n\n` +
      `========================================\n` +
      `PALM HEIGHTS CO-OPERATIVE HOUSING SOCIETY LTD.\n` +
      `Maintenance Invoicing & Accounts Division\n` +
      `========================================\n\n` +
      `Bill Identifier: ${bill.id}\n` +
      `Target Unit: Flat ${bill.flatNumber} (${bill.residentName})\n` +
      `Billing Month: ${bill.month}\n` +
      `Due Date: ${bill.dueDate}\n` +
      `Current Status: ${bill.status.toUpperCase()}\n\n` +
      `FINANCIAL BREAKUP:\n` +
      `- Base Maintenance: ₹${bill.breakup.maintenanceFee}\n` +
      `- Sinking & Capital Reserve: ₹${bill.breakup.sinkingFund}\n` +
      `- Water Charges: ₹${bill.breakup.waterCharges}\n` +
      `- Parking Slot: ₹${bill.breakup.parkingCharges}\n` +
      (bill.breakup.penalty > 0 ? `- Late Fee Fine: ₹${bill.breakup.penalty}\n` : '') +
      `----------------------------------------\n` +
      `Total Invoiced Amount: ₹${bill.amount}\n` +
      `Amount Paid So Far: ₹${paidAmount}\n` +
      `REMAINING DUE BALANCE: ₹${remainingDue}\n` +
      `----------------------------------------\n\n` +
      `PAYMENT OPTIONS:\n` +
      `UPI ID: society.palmheights@icici\n` +
      `Account: Palm Heights Residency Accounts\n` +
      `IFSC: ICIC0001092 | A/C: 98120048190\n\n` +
      `Or pay directly via the Palm Heights Residency ERP portal.\n` +
      `Thank you,\nManagement Committee, Palm Heights Co-op Housing Society Ltd.`
    );
  };

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(
      subject
    )}&cc=${includeCcAccounts ? encodeURIComponent('accounts@palmheights.residency.org') : ''}&body=${encodeURIComponent(
      generateMailtoBody()
    )}`;
    window.location.href = mailtoUrl;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(generateMailtoBody());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClose = () => {
    setIsSent(false);
    setSentDetails(null);
    setSendError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {isPaid ? 'Send Maintenance Receipt' : 'Send Maintenance Bill'}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isPartial
                    ? 'bg-amber-50 text-amber-700 border border-amber-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  Flat {bill.flatNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Official digital notification with detailed dues calculation & payment link
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Account Connection Status Banner */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs gap-3 flex-wrap">
          {isConnected && user ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600">Sending via connected Gmail:</span>
              <strong className="text-slate-900 font-mono">{user.email}</strong>
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                Gmail API Active
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-700">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Connect your Google account to send real emails directly to the recipient's inbox.</span>
            </div>
          )}

          {!isConnected ? (
            <GoogleSignInButton label="Connect Gmail Account" className="!py-1.5 !px-3 !text-[11px]" />
          ) : (
            <button
              onClick={logout}
              className="text-[11px] text-slate-500 hover:text-red-600 underline font-medium cursor-pointer"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Content */}
        {!isSent ? (
          <div>
            {/* Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 gap-4">
              <button
                type="button"
                onClick={() => setActiveTab('compose')}
                className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'compose'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> Compose Email
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`py-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'preview'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Rich Inbox Preview
              </button>
            </div>

            <div className="p-6 max-h-[72vh] overflow-y-auto">
              {sendError && (
                <div className="p-3.5 mb-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <p className="font-bold text-red-900">Email Dispatch Issue</p>
                    <p className="text-red-700">{sendError}</p>

                    {isScopeError && (
                      <div className="pt-2 border-t border-red-200/80 space-y-2">
                        <p className="text-[11px] text-red-800">
                          Your Google session needs to be refreshed to grant the newly configured <strong>Gmail Send</strong> permission. Click below to sign in and grant the permission:
                        </p>
                        <button
                          type="button"
                          onClick={handleReauth}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-[11px] shadow-xs cursor-pointer transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Re-authorize Google Account (Grant Gmail Permission)
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'compose' ? (
                <form onSubmit={handleSend} className="space-y-4">
                  {/* Recipient */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Recipient Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={e => setRecipientEmail(e.target.value)}
                      placeholder="recipient@gmail.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs font-mono"
                    />

                    {/* Quick Recipient Suggestions */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[11px] text-slate-500">Quick set:</span>
                      <button
                        type="button"
                        onClick={() => setRecipientEmail('jiteshD38@gmail.com')}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] rounded-md border border-emerald-300 font-semibold transition-colors cursor-pointer"
                      >
                        jiteshD38@gmail.com (Your Email)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipientEmail('aditya.sharma@example.com')}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-md transition-colors cursor-pointer"
                      >
                        aditya.sharma@example.com
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipientEmail(`${bill.flatNumber.toLowerCase()}@palmheights.residency.org`)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded-md transition-colors cursor-pointer"
                      >
                        Unit Email
                      </button>
                    </div>
                  </div>

                  {/* CC & Subject */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                      />
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={includeCcAccounts}
                          onChange={e => setIncludeCcAccounts(e.target.checked)}
                          className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">
                          CC Committee Accounts
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Personalized Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Personalized Message to Resident
                    </label>
                    <textarea
                      rows={4}
                      value={customNote}
                      onChange={e => setCustomNote(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs leading-relaxed"
                    />
                  </div>

                  {/* Bill Summary Banner attached to email */}
                  <div className="p-3.5 bg-gradient-to-r from-slate-50 to-emerald-50/40 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Attached Statement Summary
                      </span>
                      <span className="font-mono text-slate-600">{bill.month}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase">Invoiced</span>
                        <span className="font-mono font-bold text-slate-800">₹{bill.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-emerald-600 block uppercase">Paid So Far</span>
                        <span className="font-mono font-bold text-emerald-700">₹{paidAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className={`p-2 rounded-lg border ${
                        remainingDue <= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                      }`}>
                        <span className="text-[10px] text-amber-800 block uppercase font-bold">Remaining Due</span>
                        <span className="font-mono font-black text-amber-900">₹{remainingDue.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleOpenMailClient}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Opens your installed mail app (Gmail, Outlook, etc.)"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open in Mail App
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy Text'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>

                      {isConnected ? (
                        <button
                          type="submit"
                          disabled={isSending}
                          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSending ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Sending via Gmail...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Send Email
                            </>
                          )}
                        </button>
                      ) : (
                        <GoogleSignInButton
                          label="Sign in & Send via Gmail"
                          onSuccess={() => {}}
                          className="!py-2 !px-4"
                        />
                      )}
                    </div>
                  </div>
                </form>
              ) : (
                /* Rich HTML Email Inbox Preview */
                <div className="space-y-4">
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs space-y-1 font-mono text-slate-600">
                    <div><strong>From:</strong> {user?.email || 'accounts@palmheights.residency.org'}</div>
                    <div><strong>To:</strong> {recipientEmail || 'recipient@example.com'}</div>
                    {includeCcAccounts && <div><strong>Cc:</strong> accounts@palmheights.residency.org</div>}
                    <div><strong>Subject:</strong> <span className="text-slate-900 font-sans font-bold">{subject}</span></div>
                  </div>

                  {/* Mock Email Template Container */}
                  <div className="border border-slate-300 rounded-2xl overflow-hidden shadow-xs bg-white text-slate-800">
                    {/* Email Header */}
                    <div className="bg-emerald-700 p-5 text-white flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-base tracking-tight">Palm Heights Co-op Housing Society</h4>
                        <p className="text-[11px] text-emerald-100">Official Society Maintenance Statement & Notice</p>
                      </div>
                      <div className="text-right text-[11px] font-mono text-emerald-100">
                        Reg: BOM/HSG/2021-998
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="p-6 space-y-4 text-xs leading-relaxed">
                      <div className="whitespace-pre-line text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {customNote}
                      </div>

                      {/* Financial Statement Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 flex justify-between text-xs border-b border-slate-200">
                          <span>Unit {bill.flatNumber} • {bill.month} Statement</span>
                          <span>Due Date: {bill.dueDate}</span>
                        </div>

                        <div className="p-4 space-y-2 text-xs">
                          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                            <span>Base Society Maintenance Fee</span>
                            <span className="font-mono text-slate-900">₹{bill.breakup.maintenanceFee}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                            <span>Sinking & Capital Reserve Fund</span>
                            <span className="font-mono text-slate-900">₹{bill.breakup.sinkingFund}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                            <span>Water Meter Charges</span>
                            <span className="font-mono text-slate-900">₹{bill.breakup.waterCharges}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                            <span>Designated Parking Slot Fee</span>
                            <span className="font-mono text-slate-900">₹{bill.breakup.parkingCharges}</span>
                          </div>
                          {bill.breakup.penalty > 0 && (
                            <div className="flex justify-between py-1 border-b border-slate-100 text-red-600 font-semibold">
                              <span>Late Payment Penalty</span>
                              <span className="font-mono">+₹{bill.breakup.penalty}</span>
                            </div>
                          )}

                          <div className="flex justify-between pt-2 text-slate-800 font-bold border-t border-slate-200">
                            <span>Total Invoiced</span>
                            <span className="font-mono">₹{bill.amount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-emerald-700 font-bold">
                            <span>Total Settled (Installments)</span>
                            <span className="font-mono">₹{paidAmount.toLocaleString('en-IN')}</span>
                          </div>

                          {/* Big Remaining Due Highlight */}
                          <div className={`mt-3 p-3 rounded-xl border flex justify-between items-center ${
                            remainingDue <= 0
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-amber-50 border-amber-300 text-amber-950'
                          }`}>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider block">
                                Remaining Due Balance:
                              </span>
                              <span className="text-[11px] opacity-80">
                                {remainingDue <= 0 ? 'All dues cleared in full' : `Payable before ${bill.dueDate}`}
                              </span>
                            </div>
                            <span className="text-xl font-mono font-black">
                              ₹{remainingDue.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Options in email */}
                      {remainingDue > 0 && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                          <span className="font-bold text-slate-800 block text-xs">Direct Payment Coordinates:</span>
                          <p><strong>Instant UPI:</strong> <code className="bg-white px-1.5 py-0.5 rounded-sm border border-slate-200 font-mono">society.palmheights@icici</code></p>
                          <p><strong>Bank Transfer:</strong> Palm Heights Residency Ltd • ICICI Bank • A/C: 98120048190 • IFSC: ICIC0001092</p>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 text-center pt-2">
                        Sent via Google Workspace Gmail API • Palm Heights Residency Management System.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('compose')}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      Back to Compose
                    </button>
                    {isConnected ? (
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> Send Email
                      </button>
                    ) : (
                      <GoogleSignInButton
                        label="Sign in & Send via Gmail"
                        onSuccess={() => {}}
                        className="!py-1.5 !px-3"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Email Successfully Sent Screen */
          <div className="p-8 text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Email Dispatched Successfully!</h4>
              <p className="text-xs text-slate-500 mt-1">
                The maintenance statement has been delivered directly to the recipient's inbox.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Delivered To:</span>
                <span className="font-mono font-bold text-slate-900">{sentDetails?.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sent From:</span>
                <span className="font-mono text-slate-800">{sentDetails?.sender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sent Timestamp:</span>
                <span className="text-slate-800">{sentDetails?.sentAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subject:</span>
                <span className="text-slate-800 truncate max-w-[240px]">{sentDetails?.subject}</span>
              </div>
              {sentDetails?.googleMessageId && (
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Gmail Message ID:</span>
                  <span className="text-emerald-700 font-bold">{sentDetails.googleMessageId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-mono font-bold text-amber-800">₹{remainingDue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-700 font-semibold">
                <span>Dispatch Status:</span>
                <span>Delivered & Logged via Gmail API</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSent(false);
                  setSentDetails(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                Send Another Email
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Done & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
