import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { X, QrCode, Copy, Check, ShieldCheck, UserCheck, Car, Truck, Users } from 'lucide-react';
import { Visitor, VisitorType } from '../../types/society';

interface GatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GatePassModal: React.FC<GatePassModalProps> = ({ isOpen, onClose }) => {
  const { currentResident, preApproveVisitor } = useSociety();

  const [visitorName, setVisitorName] = useState('');
  const [phone, setPhone] = useState('');
  const [visitorType, setVisitorType] = useState<VisitorType>('guest');
  const [company, setCompany] = useState('');
  const [purpose, setPurpose] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [expectedDate, setExpectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [generatedPass, setGeneratedPass] = useState<Visitor | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    const pass = preApproveVisitor({
      visitorName,
      phone: phone.trim() || 'Not specified',
      visitorType,
      flatNumber: currentResident.flatNumber,
      hostName: currentResident.name,
      company: company.trim() || undefined,
      purpose: purpose.trim() || `${visitorType} visit to ${currentResident.flatNumber}`,
      vehicleNumber: vehicleNumber.trim() || undefined,
      expectedDate,
      entryGate: 'Main Gate 1'
    });

    setGeneratedPass(pass);
  };

  const handleCopyCode = () => {
    if (generatedPass) {
      navigator.clipboard.writeText(generatedPass.passCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setVisitorName('');
    setPhone('');
    setVisitorType('guest');
    setCompany('');
    setPurpose('');
    setVehicleNumber('');
    setGeneratedPass(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pre-Approve Visitor Gate Pass</h3>
              <p className="text-xs text-slate-500">Host: Flat {currentResident.flatNumber} ({currentResident.name})</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {!generatedPass ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Visitor Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Visitor Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: 'guest', label: 'Guest', icon: Users },
                    { type: 'delivery', label: 'Delivery', icon: Truck },
                    { type: 'cab', label: 'Cab / Taxi', icon: Car },
                    { type: 'service', label: 'Service', icon: UserCheck },
                  ].map(item => {
                    const Icon = item.icon;
                    const isSelected = visitorType === item.type;
                    return (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => setVisitorType(item.type as VisitorType)}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium transition-all ${
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

              {/* Visitor Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visitor / Driver Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Company / Service provider */}
              {(visitorType === 'delivery' || visitorType === 'cab' || visitorType === 'service') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Provider
                  </label>
                  <input
                    type="text"
                    placeholder={
                      visitorType === 'delivery'
                        ? 'e.g. Amazon, Swiggy, Zomato, BlueDart'
                        : visitorType === 'cab'
                        ? 'e.g. Uber, Ola, Private Chauffeur'
                        : 'e.g. Urban Company, Samsung Service'
                    }
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>
              )}

              {/* Vehicle & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MH 02 AB 1234"
                    value={vehicleNumber}
                    onChange={e => setVehicleNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Visit Date
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={e => setExpectedDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purpose / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner invite, Appliance repair, Package drop"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Generate Gate Pass
                </button>
              </div>
            </form>
          ) : (
            /* Pass Card View */
            <div className="space-y-6 text-center animate-in fade-in duration-300">
              <div className="p-6 bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 rounded-2xl border border-emerald-200 relative overflow-hidden shadow-xs">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-lg shadow-2xs">
                  Approved
                </div>

                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
                  Palm Heights Residency - Gate Entry Pass
                </p>
                <h4 className="text-xl font-bold text-slate-900 mb-4">{generatedPass.visitorName}</h4>

                {/* 6 Digit Pass Code Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 flex flex-col items-center justify-center">
                  <span className="text-xs text-slate-500 font-medium mb-1">Entry Pass Code (Share with Visitor)</span>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-mono font-black text-emerald-700 tracking-widest">
                      {generatedPass.passCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
                      title="Copy Passcode"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* QR Code Graphic Simulation */}
                <div className="inline-flex flex-col items-center p-3 bg-white rounded-xl shadow-xs border border-slate-200 mb-4">
                  <div className="w-28 h-28 flex items-center justify-center border-4 border-slate-800 rounded-lg bg-slate-50">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                  <span className="text-[10px] text-slate-600 font-semibold mt-1">Scan at Security Gate 1</span>
                </div>

                {/* Pass Details */}
                <div className="grid grid-cols-2 gap-2 text-left text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-600 shadow-2xs">
                  <div>
                    <span className="text-slate-500 block">Host Flat:</span>
                    <span className="font-semibold text-slate-900">Flat {generatedPass.flatNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Valid Date:</span>
                    <span className="font-semibold text-slate-900">{generatedPass.expectedDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Visitor Type:</span>
                    <span className="font-semibold text-emerald-700 capitalize">{generatedPass.visitorType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Status:</span>
                    <span className="font-semibold text-amber-700 uppercase text-[10px]">Expected at Gate</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
