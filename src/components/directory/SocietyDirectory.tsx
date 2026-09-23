import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { INITIAL_EMERGENCY_CONTACTS } from '../../data/mockData';
import {
  Building2,
  Users,
  Search,
  PhoneCall,
  Mail,
  Shield,
  Phone,
  Filter,
  UserCheck
} from 'lucide-react';

export const SocietyDirectory: React.FC = () => {
  const { flats } = useSociety();
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'flats' | 'committee' | 'emergency'>('flats');

  const filteredFlats = flats.filter(f => {
    const matchesBlock = selectedBlock === 'all' || f.block === selectedBlock;
    const matchesSearch =
      f.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.intercom.includes(searchQuery);

    return matchesBlock && matchesSearch;
  });

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
            <Building2 className="w-3.5 h-3.5" /> Society Member & Emergency Roster
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Resident & Committee Directory</h1>
          <p className="text-xs text-slate-600 mt-1">
            Searchable intercom numbers • Managing Committee contacts • 24/7 Gate & Medical emergency hotlines
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto shadow-2xs">
          <button
            onClick={() => setActiveTab('flats')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'flats' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flats ({flats.length})
          </button>
          <button
            onClick={() => setActiveTab('committee')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'committee' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Committee
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'emergency' ? 'bg-white text-red-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Emergency Dials
          </button>
        </div>
      </div>

      {activeTab === 'flats' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedBlock === block.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {block.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search flat # or owner name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 w-56 shadow-2xs"
              />
            </div>
          </div>

          {/* Flats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFlats.map(flat => (
              <div
                key={flat.flatNumber}
                className="p-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col justify-between space-y-3 hover:border-slate-300 shadow-2xs transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-base">Flat {flat.flatNumber}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                      {flat.block} • Floor {flat.floor}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800">{flat.ownerName}</p>
                  <p className="text-[11px] text-slate-500">{flat.occupantType} • {flat.membersCount} residents</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Intercom</span>
                    <span className="font-mono text-emerald-700 font-bold">{flat.intercom}</span>
                  </div>

                  <a
                    href={`tel:${flat.contact}`}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
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
          {INITIAL_EMERGENCY_CONTACTS.map((ec, idx) => (
            <div key={idx} className="p-5 bg-white border border-red-200 rounded-2xl flex items-center justify-between gap-4 shadow-2xs">
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
          ))}
        </div>
      )}
    </div>
  );
};
