import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { ComplaintCategory, ComplaintPriority } from '../../types/society';
import { X, Wrench, AlertCircle, Sparkles } from 'lucide-react';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({ isOpen, onClose }) => {
  const { currentResident, createComplaint } = useSociety();

  const [category, setCategory] = useState<ComplaintCategory>('plumbing');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createComplaint({
      flatNumber: currentResident.flatNumber,
      residentName: currentResident.name,
      residentPhone: currentResident.phone,
      category,
      priority,
      title: title.trim(),
      description: description.trim()
    });

    setTitle('');
    setDescription('');
    setCategory('plumbing');
    setPriority('medium');
    onClose();
  };

  const setSampleTicket = (sampleCategory: ComplaintCategory, sampleTitle: string, sampleDesc: string) => {
    setCategory(sampleCategory);
    setTitle(sampleTitle);
    setDescription(sampleDesc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Raise Maintenance Ticket</h3>
              <p className="text-xs text-slate-500">Flat {currentResident.flatNumber} ({currentResident.name})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick presets */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Common Issues (Click to populate):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSampleTicket('plumbing', 'Low water pressure in master bathroom', 'Water pressure dropped significantly in shower & geyser line since morning.')}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium"
              >
                🚿 Low Water Pressure
              </button>
              <button
                type="button"
                onClick={() => setSampleTicket('electrical', 'Main MCB tripping repeatedly', 'The 32A distribution box switch trips when both ACs turn on. Smells faint warmth.')}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium"
              >
                ⚡ MCB Tripping
              </button>
              <button
                type="button"
                onClick={() => setSampleTicket('lift', 'Tower Lift door sensor getting stuck', 'The optical safety beam on lift #1 does not close smoothly on 4th floor.')}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors font-medium"
              >
                🛗 Lift Door Sensor
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'plumbing', label: 'Plumbing', icon: '🔧' },
                { id: 'electrical', label: 'Electrical', icon: '⚡' },
                { id: 'lift', label: 'Elevator / Lift', icon: '🛗' },
                { id: 'housekeeping', label: 'Housekeeping', icon: '🧹' },
                { id: 'security', label: 'Security / Gate', icon: '🛡️' },
                { id: 'carpentry', label: 'Carpentry / Civil', icon: '🔨' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as ComplaintCategory)}
                  className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                    category === cat.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Urgency Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'text-slate-700' },
                { id: 'medium', label: 'Medium', color: 'text-blue-700' },
                { id: 'high', label: 'High', color: 'text-amber-700' },
                { id: 'urgent', label: 'Emergency', color: 'text-red-700' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as ComplaintPriority)}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center ${
                    priority === p.id
                      ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-xs'
                      : `bg-slate-50 border-slate-200 ${p.color} hover:bg-slate-100`
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Summary *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master bedroom toilet flush valve overflowing"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Location Specifics *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide exact details so technicians bring correct spares..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Lodge Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
