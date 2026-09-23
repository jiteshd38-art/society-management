import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  UserCheck,
  Wrench,
  Shield,
  Clock,
  PhoneCall,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  BadgeCheck
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const {
    domesticWorkers,
    staff,
    currentRole,
    toggleStaffStatus,
    toggleDomesticWorkerPunch
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'domestic' | 'technicians'>('domestic');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDomestic = domesticWorkers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.flatsAssigned.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-white to-fuchsia-50 border border-purple-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5" /> Campus Workforce & Help Operations
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Domestic Staff & Facility Technicians</h1>
          <p className="text-xs text-slate-600 mt-1">
            Biometric Gate Punch Records • Police Verified ID Badges • On-duty Maintenance Shift Roster
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('domestic')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'domestic' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Domestic Helpers ({domesticWorkers.length})
          </button>
          <button
            onClick={() => setActiveTab('technicians')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'technicians' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Society Technicians ({staff.length})
          </button>
        </div>
      </div>

      {/* Domestic Staff Tab */}
      {activeTab === 'domestic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              Inside Campus Right Now:{' '}
              <strong className="text-emerald-700 font-mono font-bold">
                {domesticWorkers.filter(w => w.isInside).length}
              </strong>{' '}
              helpers
            </p>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, role, flat..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-1 focus:ring-purple-600 w-56 shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDomestic.map(worker => (
              <div
                key={worker.id}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-2xs transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                      {worker.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm">{worker.name}</h4>
                        {worker.verified && (
                          <span title="Police Background Verified">
                            <BadgeCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-purple-700 font-medium">{worker.role}</p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{worker.passId}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    worker.isInside
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {worker.isInside ? 'In Campus' : 'Outside'}
                  </span>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Assigned Flats:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {worker.flatsAssigned.map(f => (
                        <span key={f} className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-semibold text-slate-700 text-[11px]">
                          Flat {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Last Punch: <strong className="text-slate-800">{worker.lastPunch}</strong></span>
                    <a href={`tel:${worker.phone}`} className="text-blue-700 hover:underline flex items-center gap-1 font-medium">
                      <PhoneCall className="w-3 h-3" /> {worker.phone}
                    </a>
                  </div>
                </div>

                {/* Biometric punch toggle for security guard or admin */}
                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => toggleDomesticWorkerPunch(worker.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      worker.isInside
                        ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {worker.isInside ? 'Punch Gate Exit' : 'Punch Gate Entry'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Society Technicians Tab */}
      {activeTab === 'technicians' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map(member => (
              <div
                key={member.id}
                className="p-5 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-300 shadow-2xs transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{member.name}</h4>
                      <p className="text-xs text-purple-700 font-medium">{member.roleTitle}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'on_duty'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {member.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-200">
                    <p className="text-slate-600"><span className="text-slate-500">Shift:</span> {member.shift}</p>
                    <p className="text-slate-600"><span className="text-slate-500">Active Work Orders:</span> <strong className="text-slate-900 font-mono">{member.assignedComplaintsCount}</strong></p>
                    <p className="text-slate-600"><span className="text-slate-500">Resident Rating:</span> <strong className="text-amber-700 font-semibold">★ {member.rating} / 5.0</strong></p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <a
                    href={`tel:${member.phone}`}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5 text-xs transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Duty Desk</span>
                  </a>

                  {currentRole === 'admin' && (
                    <button
                      onClick={() => toggleStaffStatus(member.id)}
                      className="text-xs text-slate-500 hover:text-slate-900 underline"
                    >
                      Toggle Duty
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
