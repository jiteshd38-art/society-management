import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { Amenity, AmenityBooking } from '../../types/society';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Trophy,
  Waves,
  PartyPopper,
  Flame,
  CheckCircle2,
  XCircle,
  QrCode
} from 'lucide-react';

interface AmenitiesBookingProps {
  onOpenBookingModal: (amenity: Amenity) => void;
}

export const AmenitiesBooking: React.FC<AmenitiesBookingProps> = ({ onOpenBookingModal }) => {
  const { amenities, bookings, currentResident, cancelAmenityBooking } = useSociety();
  const [activeTab, setActiveTab] = useState<'catalog' | 'my_bookings'>('catalog');

  const myBookings = bookings.filter(b => b.flatNumber === currentResident.flatNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5" /> Luxury Society Clubhouse & Sports
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Facility & Amenities Reservation</h1>
          <p className="text-xs text-slate-600 mt-1">
            Complimentary & paid slots • Automatic guest gate pass generation • Timed entry control
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'catalog' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Amenities
          </button>
          <button
            onClick={() => setActiveTab('my_bookings')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'my_bookings' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Bookings ({myBookings.length})
          </button>
        </div>
      </div>

      {/* Catalog View */}
      {activeTab === 'catalog' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {amenities.map(item => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col transition-all hover:border-slate-300 hover:shadow-md"
            >
              {/* Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold border border-slate-200 shadow-2xs">
                    {item.location}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold font-mono shadow-xs">
                    {item.pricePerHour === 0 ? 'Complimentary' : `₹${item.pricePerHour}/slot`}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 py-2 border-y border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{item.openHours}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>Capacity: {item.capacity} guests</span>
                    </div>
                  </div>

                  {/* Rules preview */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Policy:</span>
                    <p className="text-[11px] text-slate-600 line-clamp-1">• {item.rules[0]}</p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenBookingModal(item)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Reserve Time Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* My Bookings List */
        <div className="space-y-3">
          {myBookings.length > 0 ? (
            myBookings.map(b => (
              <div
                key={b.id}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-emerald-600">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-700">{b.bookingRef}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{b.amenityName}</h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Date: <strong className="text-slate-900">{b.date}</strong> • Slot: <strong className="text-emerald-700">{b.slot}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Guests: {b.guestsCount} • Flat: {b.flatNumber} ({b.residentName}) • Total: ₹{b.totalCost}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {b.status}
                  </span>
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Cancel this reservation?')) {
                          cancelAmenityBooking(b.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 text-xs font-medium rounded-xl border border-slate-200 hover:border-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-slate-200/90 rounded-2xl text-slate-500 text-xs shadow-2xs">
              No active reservations for Flat {currentResident.flatNumber}.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
