import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Visitor, VisitorType } from '../../types/society';
import {
  ShieldCheck,
  QrCode,
  Users,
  Truck,
  Car,
  UserCheck,
  Search,
  Plus,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  PhoneCall
} from 'lucide-react';

interface VisitorManagementProps {
  onOpenGatePassModal: () => void;
}

export const VisitorManagement: React.FC<VisitorManagementProps> = ({ onOpenGatePassModal }) => {
  const {
    visitors,
    checkInVisitorByCode,
    checkOutVisitor,
    denyVisitor,
    registerWalkInVisitor,
    flats
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'in_campus' | 'pre_approved' | 'all_history' | 'walk_in'>('in_campus');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<{ success?: boolean; message: string } | null>(null);

  // Walk-in form state
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinType, setWalkinType] = useState<VisitorType>('delivery');
  const [walkinFlat, setWalkinFlat] = useState('A-402');
  const [walkinPurpose, setWalkinPurpose] = useState('');
  const [walkinCompany, setWalkinCompany] = useState('Amazon Prime');
  const [walkinVehicle, setWalkinVehicle] = useState('');
  const [walkinGate, setWalkinGate] = useState('Main Gate 1');

  // Filter visitors
  const filteredVisitors = visitors.filter(v => {
    const matchesSearch =
      v.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.passCode.includes(searchQuery) ||
      (v.company && v.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || v.visitorType === selectedType;

    if (activeTab === 'in_campus') {
      return matchesSearch && matchesType && v.status === 'in_campus';
    }
    if (activeTab === 'pre_approved') {
      return matchesSearch && matchesType && v.status === 'expected';
    }
    return matchesSearch && matchesType;
  });

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    const res = checkInVisitorByCode(verificationCode.trim(), 'Main Gate 1');
    setVerifyStatus(res);
    if (res.success) {
      setVerificationCode('');
    }
    setTimeout(() => setVerifyStatus(null), 5000);
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) return;

    registerWalkInVisitor({
      visitorName: walkinName,
      phone: walkinPhone.trim() || 'Unspecified',
      visitorType: walkinType,
      flatNumber: walkinFlat,
      purpose: walkinPurpose || `${walkinType} visit`,
      company: walkinCompany || undefined,
      vehicleNumber: walkinVehicle || undefined,
      gate: walkinGate
    });

    setWalkinName('');
    setWalkinPhone('');
    setWalkinVehicle('');
    setWalkinPurpose('');
    setActiveTab('in_campus');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Gated Security Access Control
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Visitor & Gate Pass Management</h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time digital entry logging • OTP / Passcode authentication • Vehicle number plate verification
          </p>
        </div>

        <button
          onClick={onOpenGatePassModal}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Pre-Approved Pass
        </button>
      </div>

      {/* Security Gate Passcode Verifier Box */}
      <div className="p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <form onSubmit={handleVerifyCode} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0 uppercase tracking-wider">
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Verify Entry Code:</span>
          </div>
          <input
            type="text"
            maxLength={6}
            placeholder="Type 6-digit pass code (e.g. 482910)"
            value={verificationCode}
            onChange={e => setVerificationCode(e.target.value)}
            className="flex-1 w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm font-mono text-slate-900 tracking-widest placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Check In
          </button>
        </form>

        {verifyStatus && (
          <div className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            verifyStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {verifyStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <XCircle className="w-4 h-4 shrink-0 text-red-600" />}
            <span>{verifyStatus.message}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'in_campus', label: `In Campus (${visitors.filter(v => v.status === 'in_campus').length})` },
            { id: 'pre_approved', label: `Pre-Approved (${visitors.filter(v => v.status === 'expected').length})` },
            { id: 'all_history', label: `All Records (${visitors.length})` },
            { id: 'walk_in', label: '+ Log Walk-In' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab !== 'walk_in' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search visitor, flat, code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              />
            </div>

            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden focus:border-emerald-600 shadow-2xs"
            >
              <option value="all">All Types</option>
              <option value="guest">Guest</option>
              <option value="delivery">Delivery</option>
              <option value="cab">Cab</option>
              <option value="service">Service</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'walk_in' ? (
        /* Walk-In Form */
        <div className="max-w-2xl bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            Instant Walk-In Visitor Registration
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Log delivery personnel, couriers, or walk-in guests directly at security gate
          </p>

          <form onSubmit={handleWalkInSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Singh"
                  value={walkinName}
                  onChange={e => setWalkinName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={walkinPhone}
                  onChange={e => setWalkinPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={walkinType}
                  onChange={e => setWalkinType(e.target.value as VisitorType)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                >
                  <option value="delivery">Delivery</option>
                  <option value="guest">Guest</option>
                  <option value="cab">Cab / Taxi</option>
                  <option value="service">Technician / Service</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination Flat *</label>
                <select
                  value={walkinFlat}
                  onChange={e => setWalkinFlat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                >
                  {flats.map(f => (
                    <option key={f.flatNumber} value={f.flatNumber}>
                      {f.flatNumber} ({f.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gate Assigned</label>
                <select
                  value={walkinGate}
                  onChange={e => setWalkinGate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                >
                  <option>Main Gate 1</option>
                  <option>North Gate 2</option>
                  <option>Service Gate 3</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Zomato, Amazon, Blinkit"
                  value={walkinCompany}
                  onChange={e => setWalkinCompany(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Plate (If any)</label>
                <input
                  type="text"
                  placeholder="e.g. MH 02 BZ 9912"
                  value={walkinVehicle}
                  onChange={e => setWalkinVehicle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Notes</label>
              <input
                type="text"
                placeholder="e.g. Grocery delivery box, AC maintenance"
                value={walkinPurpose}
                onChange={e => setWalkinPurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('in_campus')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Check In Visitor Now
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Visitor List Grid */
        <div className="space-y-3">
          {filteredVisitors.length > 0 ? (
            filteredVisitors.map(vis => (
              <div
                key={vis.id}
                className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 shadow-2xs"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    {vis.visitorType === 'delivery' ? (
                      <Truck className="w-5 h-5 text-blue-600" />
                    ) : vis.visitorType === 'cab' ? (
                      <Car className="w-5 h-5 text-amber-600" />
                    ) : vis.visitorType === 'service' ? (
                      <UserCheck className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Users className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">{vis.visitorName}</h4>
                      {vis.company && (
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {vis.company}
                        </span>
                      )}
                      <span className="text-slate-500 text-xs">• {vis.phone}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1">
                      Visiting Flat <span className="font-bold text-slate-900">{vis.flatNumber}</span> (Host: {vis.hostName}) • {vis.purpose}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                      <span>Pass Code: <strong className="font-mono text-emerald-700 font-bold text-xs">{vis.passCode}</strong></span>
                      {vis.vehicleNumber && <span>Vehicle: <strong className="font-mono text-slate-800">{vis.vehicleNumber}</strong></span>}
                      {vis.checkInTime && <span>Entered: <strong className="text-slate-800">{vis.checkInTime}</strong></span>}
                      {vis.checkOutTime && <span>Departed: <strong className="text-slate-800">{vis.checkOutTime}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Right Status / Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
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

                  {vis.status === 'expected' && (
                    <button
                      onClick={() => checkInVisitorByCode(vis.passCode, 'Main Gate 1')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                    >
                      Allow In
                    </button>
                  )}

                  {vis.status === 'in_campus' && (
                    <button
                      onClick={() => checkOutVisitor(vis.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 text-xs font-bold rounded-xl border border-red-200 transition-colors"
                    >
                      Log Exit
                    </button>
                  )}

                  {vis.status === 'expected' && (
                    <button
                      onClick={() => denyVisitor(vis.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors"
                    >
                      Deny
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200/90 rounded-2xl text-slate-500 text-xs shadow-2xs">
              No matching visitors found for the selected view.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
