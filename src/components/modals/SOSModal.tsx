import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { EmergencySOS } from '../../types/society';
import { X, Siren, Flame, HeartPulse, ShieldAlert, Disc3, PhoneCall, CheckCircle } from 'lucide-react';
import { INITIAL_EMERGENCY_CONTACTS } from '../../data/mockData';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose }) => {
  const { currentResident, currentRole, triggerSOS, sosAlerts, resolveSOS } = useSociety();
  const [selectedType, setSelectedType] = useState<EmergencySOS['type']>('medical');
  const [notes, setNotes] = useState('');
  const [triggered, setTriggered] = useState(false);

  if (!isOpen) return null;

  const handleTrigger = (type: EmergencySOS['type']) => {
    setSelectedType(type);
    triggerSOS(
      type,
      currentResident.flatNumber,
      currentResident.name,
      currentResident.phone,
      notes.trim() || undefined
    );
    setTriggered(true);
  };

  const activeAlerts = sosAlerts.filter(a => a.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border-2 border-red-500 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white animate-pulse shadow-xs">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-red-900 uppercase tracking-wider">
                Emergency Panic Alert (SOS)
              </h3>
              <p className="text-xs text-red-700 font-medium">
                Broadcasting directly to Main Security Gate 1 & Estate Duty Officer
              </p>
            </div>
          </div>
          <button
            onClick={() => { setTriggered(false); onClose(); }}
            className="text-red-500 hover:text-red-800 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active alerts warning if any */}
          {activeAlerts.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wider block">
                🚨 Live Active Emergencies ({activeAlerts.length})
              </span>
              {activeAlerts.map(alert => (
                <div key={alert.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-red-200 text-xs shadow-2xs">
                  <div>
                    <span className="font-bold text-red-900 uppercase">{alert.type} Alert</span>
                    <p className="text-red-700 text-[11px] font-medium">Flat {alert.flatNumber} • {alert.residentName} • {alert.timestamp}</p>
                  </div>
                  {(currentRole === 'admin' || currentRole === 'security' || currentRole === 'staff') && (
                    <button
                      onClick={() => resolveSOS(alert.id, currentRole.toUpperCase())}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!triggered ? (
            <>
              <p className="text-xs text-slate-600 font-medium">
                Select emergency category below. Guards at Gate 1 & Tower lobbies will receive an audible alarm with your flat location:
              </p>

              {/* Emergency Category Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTrigger('medical')}
                  className="p-4 rounded-xl bg-red-50/70 border border-red-200 hover:bg-red-100/70 text-left transition-all group hover:scale-[1.02] shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <HeartPulse className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Medical Emergency</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Ambulance dispatch, stretcher & first-aid support</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrigger('fire')}
                  className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 hover:bg-orange-100/70 text-left transition-all group hover:scale-[1.02] shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center mb-2 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <Flame className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Fire / Smoke Alert</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Fire extinguishers & building evacuation crew</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrigger('lift_stuck')}
                  className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100/70 text-left transition-all group hover:scale-[1.02] shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Disc3 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Lift Trapped</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Elevator ARD failure, technician manual key rescue</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrigger('security')}
                  className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 hover:bg-purple-100/70 text-left transition-all group hover:scale-[1.02] shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Intruder / Security</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Unknown trespasser, door harassment, immediate backup</p>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Optional details (Floor, Room, specific distress):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elder fell down in balcony, require wheelchair"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 shadow-2xs"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50 animate-bounce">
                <Siren className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">EMERGENCY BROADCAST SENT!</h4>
                <p className="text-xs text-red-700 font-medium mt-1">
                  Security guards at Gate 1 and Floor Marshall notified for Flat {currentResident.flatNumber}.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-1">
                <p className="text-slate-700"><span className="text-slate-500 font-medium">Flat:</span> {currentResident.flatNumber}</p>
                <p className="text-slate-700"><span className="text-slate-500 font-medium">Contact:</span> {currentResident.phone}</p>
                <p className="text-slate-700"><span className="text-slate-500 font-medium">Intercom:</span> {currentResident.intercom}</p>
              </div>
              <button
                type="button"
                onClick={() => { setTriggered(false); onClose(); }}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors shadow-xs"
              >
                Close Window
              </button>
            </div>
          )}

          {/* Direct Emergency Call List */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Direct Emergency Quick Dials:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {INITIAL_EMERGENCY_CONTACTS.slice(0, 4).map((c, idx) => (
                <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="min-w-0 pr-1">
                    <p className="font-semibold text-slate-800 truncate">{c.label}</p>
                    <p className="text-[10px] text-emerald-700 font-mono font-semibold">IC: {c.intercom}</p>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-600 hover:text-white transition-colors shrink-0 border border-emerald-200"
                    title={`Call ${c.phone}`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
