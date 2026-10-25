import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Building2, X, Plus, CheckCircle2 } from 'lucide-react';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddUnitModal: React.FC<AddUnitModalProps> = ({ isOpen, onClose }) => {
  const { addNewFlatUnit } = useSociety();

  const [tower, setTower] = useState('Tower A');
  const [floor, setFloor] = useState<number>(1);
  const [unitNumber, setUnitNumber] = useState('');
  const [intercom, setIntercom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const prefix = tower.replace('Tower ', '');
    const flatNum = unitNumber.toUpperCase().startsWith(prefix)
      ? unitNumber.toUpperCase()
      : `${prefix}-${unitNumber.replace(/[^0-9]/g, '')}`;

    if (!unitNumber.trim()) {
      setError('Please provide a unit number (e.g. 102, 304).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addNewFlatUnit({
        flatNumber: flatNum,
        block: tower,
        floor: Number(floor) || 1,
        intercom: intercom.trim() || undefined
      });

      if (res.success) {
        setUnitNumber('');
        setIntercom('');
        onClose();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add unit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Society Unit</h3>
              <p className="text-xs text-slate-500">Create new vacant unit in society registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Tower / Block:</label>
            <select
              value={tower}
              onChange={e => setTower(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-blue-600"
            >
              <option value="Tower A">Tower A</option>
              <option value="Tower B">Tower B</option>
              <option value="Tower C">Tower C</option>
              <option value="Tower D">Tower D</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Floor #:</label>
              <input
                type="number"
                min="0"
                max="30"
                value={floor}
                onChange={e => setFloor(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Number:</label>
              <input
                type="text"
                placeholder="e.g. 102 or A-102"
                value={unitNumber}
                onChange={e => setUnitNumber(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-blue-600 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Intercom Extension (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. 1102"
              value={intercom}
              onChange={e => setIntercom(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Adding...' : 'Create Vacant Unit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
