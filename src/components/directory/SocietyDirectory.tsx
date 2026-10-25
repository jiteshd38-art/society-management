import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { AssignResidentModal } from '../modals/AssignResidentModal';
import { AddUnitModal } from '../modals/AddUnitModal';
import {
  Building2,
  Users,
  Search,
  PhoneCall,
  Mail,
  Shield,
  Phone,
  Filter,
  UserCheck,
  UserPlus,
  Home,
  AlertCircle,
  Plus,
  LogOut,
  Sparkles,
  Key
} from 'lucide-react';

export const SocietyDirectory: React.FC = () => {
  const { flats, emergencyContacts, markUnitAsVacant, currentRole } = useSociety();
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<'all' | 'occupied' | 'vacant'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'flats' | 'committee' | 'emergency'>('flats');

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [preselectedFlat, setPreselectedFlat] = useState<string | undefined>(undefined);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [confirmVacateFlat, setConfirmVacateFlat] = useState<string | null>(null);

  const vacantCount = flats.filter(f => f.occupantType === 'Vacant').length;
  const occupiedCount = flats.length - vacantCount;

  const filteredFlats = flats.filter(f => {
    const matchesBlock = selectedBlock === 'all' || f.block === selectedBlock;
    const matchesOccupancy =
      occupancyFilter === 'all' ||
      (occupancyFilter === 'vacant' && f.occupantType === 'Vacant') ||
      (occupancyFilter === 'occupied' && f.occupantType !== 'Vacant');

    const matchesSearch =
      f.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.intercom.includes(searchQuery);

    return matchesBlock && matchesOccupancy && matchesSearch;
  });

  const handleOpenAssignModal = (flatNumber?: string) => {
    setPreselectedFlat(flatNumber);
    setShowAssignModal(true);
  };

  const handleVacateConfirm = async (flatNumber: string) => {
    await markUnitAsVacant(flatNumber);
    setConfirmVacateFlat(null);
  };

  const committeeMembers = [
    { name: 'Ramesh Patel', role: 'Chairman / President', flat: 'A-101', phone: '+91 98111 22334', email: 'chairman@palmheights.org' },
    { name: 'Sunita Deshmukh', role: 'Hon. Secretary', flat: 'C-104', phone: '+91 99302 88471', email: 'secretary@palmheights.org' },
    { name: 'Dr. Suresh Sen', role: 'Treasurer', flat: 'B-204', phone: '+91 98555 66778', email: 'treasurer@palmheights.org' },
    { name: 'Rajinder Gill', role: 'Facilities & Security Head', flat: 'D-201', phone: '+91 98999 00112', email: 'facilities@palmheights.org' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-sky-50 border border-blue-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" /> Society Member &amp; Unit Directory
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resident &amp; Committee Directory</h1>
          <p className="text-xs text-slate-600 mt-1">
            Searchable intercom numbers • Onboard residents to vacant units • 24/7 Security &amp; Committee contacts
          </p>
        </div>

        {/* Tab Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAssignModal()}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Resident</span>
          </button>

          <button
            onClick={() => setShowAddUnitModal(true)}
            className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Unit</span>
          </button>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('flats')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'flats' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flats ({flats.length})
            </button>
            <button
              onClick={() => setActiveTab('committee')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'committee' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Committee
            </button>
            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'emergency' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Emergency Dials
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'flats' && (
        <div className="space-y-4">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">Total Society Units</span>
                <p className="text-xl font-black text-slate-900">{flats.length}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500">Occupied Units</span>
                <p className="text-xl font-black text-emerald-700">{occupiedCount}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Home className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-amber-200/90 bg-amber-50/20 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-800">Vacant Units</span>
                <p className="text-xl font-black text-amber-600">{vacantCount}</p>
              </div>
              <button
                onClick={() => {
                  setOccupancyFilter('vacant');
                }}
                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold shadow-2xs transition-colors"
              >
                View Vacant
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Tower Filters & Occupancy Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setOccupancyFilter('all')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    occupancyFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({flats.length})
                </button>
                <button
                  onClick={() => setOccupancyFilter('occupied')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    occupancyFilter === 'occupied'
                      ? 'bg-white text-emerald-800 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Occupied ({occupiedCount})
                </button>
                <button
                  onClick={() => setOccupancyFilter('vacant')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    occupancyFilter === 'vacant'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'text-amber-800 hover:text-amber-900'
                  }`}
                >
                  Vacant ({vacantCount})
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All Towers' },
                  { id: 'Tower A', label: 'Tower A' },
                  { id: 'Tower B', label: 'Tower B' },
                  { id: 'Tower C', label: 'Tower C' },
                  { id: 'Tower D', label: 'Tower D' },
                ].map(block => (
                  <button
                    key={block.id}
                    onClick={() => setSelectedBlock(block.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedBlock === block.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {block.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search flat # or resident name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-full sm:w-64 shadow-2xs"
              />
            </div>
          </div>

          {/* Flats Grid */}
          {filteredFlats.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No units found matching filters</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try switching tower filters, clearing search query, or onboard a resident to a vacant unit.
              </p>
              {occupancyFilter === 'vacant' && (
                <button
                  onClick={() => setShowAddUnitModal(true)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  + Add New Vacant Unit
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredFlats.map(flat => {
                const isVacant = flat.occupantType === 'Vacant';

                return (
                  <div
                    key={flat.flatNumber}
                    className={`p-4 rounded-2xl flex flex-col justify-between space-y-3 transition-all border ${
                      isVacant
                        ? 'bg-amber-50/40 border-amber-300 hover:border-amber-400 shadow-xs'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-base">Flat {flat.flatNumber}</span>
                          {isVacant && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Vacant
                            </span>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {flat.block} • Floor {flat.floor}
                        </span>
                      </div>

                      {isVacant ? (
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                            <Key className="w-3.5 h-3.5 text-amber-600" />
                            <span>Unoccupied • Ready for Move-In</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            No resident assigned. Intercom line is set to #{flat.intercom}.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-slate-900">{flat.ownerName}</p>
                          <p className="text-[11px] text-slate-500">
                            {flat.occupantType} • {flat.membersCount} resident{flat.membersCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Intercom</span>
                        <span className="font-mono text-emerald-700 font-bold">{flat.intercom}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isVacant ? (
                          <button
                            onClick={() => handleOpenAssignModal(flat.flatNumber)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Onboard Resident</span>
                          </button>
                        ) : (
                          <>
                            {flat.contact && (
                              <a
                                href={`tel:${flat.contact}`}
                                className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1 text-[11px] transition-colors"
                              >
                                <PhoneCall className="w-3 h-3 text-blue-600" />
                                <span>Call</span>
                              </a>
                            )}

                            {confirmVacateFlat === flat.flatNumber ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleVacateConfirm(flat.flatNumber)}
                                  className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700"
                                >
                                  Yes, Vacate
                                </button>
                                <button
                                  onClick={() => setConfirmVacateFlat(null)}
                                  className="px-2 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmVacateFlat(flat.flatNumber)}
                                title="Mark unit as vacant"
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <LogOut className="w-3 h-3" />
                                <span className="hidden sm:inline">Vacate</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'committee' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {committeeMembers.map((cm, i) => (
            <div key={i} className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg">
                  {cm.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{cm.name}</h3>
                  <span className="px-2 py-0.5 rounded-sm bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold uppercase">
                    {cm.role}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Flat Address:</span>
                  <span className="font-semibold text-slate-900">Flat {cm.flat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Direct Phone:</span>
                  <span className="text-slate-900 font-mono">{cm.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Official Email:</span>
                  <span className="text-blue-700 font-mono font-medium">{cm.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {emergencyContacts.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
              No emergency contacts recorded in database.
            </div>
          ) : (
            emergencyContacts.map((ec, idx) => (
              <div key={ec.id || idx} className="p-5 bg-white border border-red-200 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
                <div>
                  <span className="px-2 py-0.5 rounded-sm bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase">
                    {ec.available}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1.5">{ec.label}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Intercom: <span className="text-emerald-700 font-bold">{ec.intercom}</span>
                  </p>
                </div>

                <a
                  href={`tel:${ec.phone}`}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" /> Dial Now
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <AssignResidentModal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setPreselectedFlat(undefined);
        }}
        preselectedFlatNumber={preselectedFlat}
      />

      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
      />
    </div>
  );
};
