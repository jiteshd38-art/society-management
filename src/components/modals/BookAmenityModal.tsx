import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Amenity } from '../../types/society';
import { X, Calendar, Clock, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BookAmenityModalProps {
  isOpen: boolean;
  onClose: () => void;
  amenity: Amenity | null;
}

export const BookAmenityModal: React.FC<BookAmenityModalProps> = ({ isOpen, onClose, amenity }) => {
  const { currentResident, bookAmenity } = useSociety();

  const [date, setDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen || !amenity) return null;

  // Set default slot if none selected
  const activeSlot = selectedSlot || amenity.availableSlots[0] || '';

  const calculateTotal = () => {
    // Basic slot calculation
    return amenity.pricePerHour;
  };

  const handleConfirm = () => {
    const b = bookAmenity({
      amenityId: amenity.id,
      amenityName: amenity.name,
      flatNumber: currentResident.flatNumber,
      residentName: currentResident.name,
      residentPhone: currentResident.phone,
      date,
      slot: activeSlot,
      guestsCount,
      totalCost: calculateTotal()
    });

    setBookingRef(b.bookingRef);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setSelectedSlot('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Reserve Amenity</h3>
            <p className="text-xs text-slate-500">{amenity.name}</p>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSuccess ? (
            <div className="space-y-4">
              {/* Amenity details */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={amenity.imageUrl}
                  alt={amenity.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-slate-900">{amenity.name}</p>
                  <p className="text-slate-500 mt-0.5">{amenity.location}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-emerald-700 font-semibold">
                    <span>Rate: {amenity.pricePerHour === 0 ? 'Complimentary' : `₹${amenity.pricePerHour}/slot`}</span>
                    <span>Max Capacity: {amenity.capacity} people</span>
                  </div>
                </div>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Select Booking Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
                />
              </div>

              {/* Slot picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Available Time Slots
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {amenity.availableSlots.map(slot => {
                    const isSelected = activeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guests Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  Estimated Guests / Attendees
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={amenity.capacity}
                    value={guestsCount}
                    onChange={e => setGuestsCount(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <span className="w-12 text-center text-sm font-bold text-slate-900 bg-slate-50 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    {guestsCount}
                  </span>
                </div>
              </div>

              {/* Rules banner */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 text-xs text-slate-600 space-y-1">
                <span className="font-semibold text-slate-900 block mb-0.5">Facility Guidelines:</span>
                {amenity.rules.map((r, i) => (
                  <p key={i} className="text-[11px] flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span> {r}
                  </p>
                ))}
              </div>

              {/* Booking Cost Summary */}
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-medium text-slate-600">Booking Fee:</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {calculateTotal() === 0 ? 'Free of Charge' : `₹${calculateTotal()}`}
                </span>
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
                  onClick={handleConfirm}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Confirm Slot
                </button>
              </div>
            </div>
          ) : (
            /* Confirmation card */
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">Reservation Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">Clubhouse access logged for Flat {currentResident.flatNumber}.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between font-mono pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Pass Reference:</span>
                  <span className="font-bold text-emerald-700">{bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility:</span>
                  <span className="text-slate-900 font-semibold">{amenity.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Slot:</span>
                  <span className="text-slate-800 font-medium">{date} • {activeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guests Registered:</span>
                  <span className="text-slate-800 font-medium">{guestsCount} people</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              >
                Close & View Bookings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
