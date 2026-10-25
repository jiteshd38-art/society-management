import React, { useState, useEffect } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { FlatRecord } from '../../types/society';
import {
  UserPlus,
  X,
  Building2,
  Home,
  User,
  Phone,
  Mail,
  Users,
  Car,
  Plus,
  Trash2,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface AssignResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedFlatNumber?: string;
}

interface VehicleDraft {
  type: 'car' | 'bike' | 'ev';
  model: string;
  registrationNumber: string;
  parkingSlot: string;
}

export const AssignResidentModal: React.FC<AssignResidentModalProps> = ({
  isOpen,
  onClose,
  preselectedFlatNumber
}) => {
  const { flats, assignResidentToVacantUnit } = useSociety();

  const vacantFlats = flats.filter(f => f.occupantType === 'Vacant');

  const [selectedFlatNumber, setSelectedFlatNumber] = useState<string>('');
  const [residentName, setResidentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'owner' | 'tenant'>('owner');
  const [membersCount, setMembersCount] = useState<number>(2);
  const [intercom, setIntercom] = useState('');
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicles, setVehicles] = useState<VehicleDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selected flat on open or preselect change
  useEffect(() => {
    if (preselectedFlatNumber) {
      setSelectedFlatNumber(preselectedFlatNumber);
      const flat = flats.find(f => f.flatNumber === preselectedFlatNumber);
      if (flat) {
        setIntercom(flat.intercom || '');
      }
    } else if (vacantFlats.length > 0 && !selectedFlatNumber) {
      setSelectedFlatNumber(vacantFlats[0].flatNumber);
      setIntercom(vacantFlats[0].intercom || '');
    }
  }, [isOpen, preselectedFlatNumber, flats]);

  const handleFlatChange = (flatNum: string) => {
    setSelectedFlatNumber(flatNum);
    const flat = flats.find(f => f.flatNumber === flatNum);
    if (flat) {
      setIntercom(flat.intercom || '');
    }
  };

  const handleAddVehicle = () => {
    setVehicles(prev => [
      ...prev,
      {
        type: 'car',
        model: '',
        registrationNumber: '',
        parkingSlot: `P-${selectedFlatNumber || '101'}`
      }
    ]);
  };

  const handleUpdateVehicle = (index: number, field: keyof VehicleDraft, value: string) => {
    setVehicles(prev =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleRemoveVehicle = (index: number) => {
    setVehicles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFlatNumber) {
      setErrorMessage('Please select a vacant flat unit to assign.');
      return;
    }

    if (!residentName.trim()) {
      setErrorMessage('Please provide the resident full name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('Please provide a contact phone number.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await assignResidentToVacantUnit({
        flatNumber: selectedFlatNumber,
        residentName: residentName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        membersCount: Number(membersCount) || 1,
        intercom: intercom.trim(),
        vehicles: vehicles.filter(v => v.model.trim() && v.registrationNumber.trim()),
        notes: `Move-in registered on ${moveInDate}`
      });

      if (res.success) {
        // Reset form
        setResidentName('');
        setEmail('');
        setPhone('');
        setVehicles([]);
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to onboard resident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentFlat = flats.find(f => f.flatNumber === selectedFlatNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Onboard Resident to Vacant Unit
              </h3>
              <p className="text-xs text-slate-500">
                Register new homeowner or tenant • Assign intercom &amp; gate security
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Unit Selection */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Select Vacant Unit:
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                {vacantFlats.length} Vacant Units Available
              </span>
            </div>

            {vacantFlats.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                No units are currently vacant. You can mark an existing unit as vacant from the Directory or create a new unit first.
              </div>
            ) : (
              <select
                value={selectedFlatNumber}
                onChange={e => handleFlatChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
              >
                {vacantFlats.map(vf => (
                  <option key={vf.flatNumber} value={vf.flatNumber}>
                    Flat {vf.flatNumber} • {vf.block} (Floor {vf.floor}) • Intercom {vf.intercom}
                  </option>
                ))}
              </select>
            )}

            {currentFlat && (
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1">
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  Tower: <strong>{currentFlat.block}</strong>
                </span>
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  Floor: <strong>Floor {currentFlat.floor}</strong>
                </span>
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  Intercom: <strong>{currentFlat.intercom}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Resident Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              Resident Profile &amp; Occupancy
            </h4>

            {/* Role / Ownership Segment */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Occupancy Role:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('owner')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'owner'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Homeowner (Owner)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('tenant')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    role === 'tenant'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Tenant (Leaseholder)</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Resident Full Name: *
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={residentName}
                  onChange={e => setResidentName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Contact Phone: *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Address: *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="resident@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Members Count & Intercom */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Family Members:
                </label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={membersCount}
                    onChange={e => setMembersCount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Intercom Ext:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1102"
                  value={intercom}
                  onChange={e => setIntercom(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Move-in Date:
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={e => setMoveInDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Registration Section */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Resident Vehicles &amp; Parking Pass
                </h4>
                <p className="text-[11px] text-slate-500">
                  Auto-issues RFID parking sticker &amp; gate barrier access
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVehicle}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" /> Add Vehicle
              </button>
            </div>

            {vehicles.map((v, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveVehicle(idx)}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Type
                    </label>
                    <select
                      value={v.type}
                      onChange={e => handleUpdateVehicle(idx, 'type', e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                    >
                      <option value="car">Car (4-Wheeler)</option>
                      <option value="bike">Bike (2-Wheeler)</option>
                      <option value="ev">Electric Vehicle (EV)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Model / Color
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hyundai Creta"
                      value={v.model}
                      onChange={e => handleUpdateVehicle(idx, 'model', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Registration #
                    </label>
                    <input
                      type="text"
                      placeholder="MH 02 AB 1234"
                      value={v.registrationNumber}
                      onChange={e => handleUpdateVehicle(idx, 'registrationNumber', e.target.value.toUpperCase())}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-800 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Parking Slot
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. B1-14"
                      value={v.parkingSlot}
                      onChange={e => handleUpdateVehicle(idx, 'parkingSlot', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Welcome Confirmation Box */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Automatic Verification:</strong> Onboarding this resident will update the Society Flat Directory, activate the intercom hotline, broadcast a warm community welcome notice, and persist records in the society database.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || vacantFlats.length === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              {isSubmitting ? (
                <>Saving to Database...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm &amp; Onboard Resident
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
