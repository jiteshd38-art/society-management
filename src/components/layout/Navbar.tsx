import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import { useGoogleAuth } from '../../context/GoogleAuthContext';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { DatabaseConfigModal } from '../common/DatabaseConfigModal';
import { UserRole } from '../../types/society';
import {
  Building2,
  Crown,
  Home,
  Shield,
  Wrench,
  Siren,
  Bell,
  RotateCcw,
  ChevronDown,
  Car,
  User,
  CheckCircle2,
  AlertTriangle,
  Database
} from 'lucide-react';

interface NavbarProps {
  onOpenSOS: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSOS }) => {
  const {
    currentRole,
    setCurrentRole,
    currentResident,
    setCurrentResident,
    allResidents,
    visitors,
    notices,
    sosAlerts,
    resetToDemoData,
    dbError,
    isConfigured
  } = useSociety();

  const { user, isConnected, logout } = useGoogleAuth();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showFlatMenu, setShowFlatMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbModal, setShowDbModal] = useState(false);

  const activeSOS = sosAlerts.filter(s => s.status === 'active');
  const recentVisitors = visitors.slice(0, 3);
  const recentNotices = notices.slice(0, 2);

  const roleConfig: Record<UserRole, { label: string; sub: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    admin: { label: 'Admin (MC)', sub: 'Management Committee', icon: Crown, color: 'text-amber-800 bg-amber-50 border-amber-200' },
    resident: { label: 'Resident', sub: `Flat ${currentResident.flatNumber}`, icon: Home, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
    security: { label: 'Security Gate', sub: 'Gate 1 Console', icon: Shield, color: 'text-blue-800 bg-blue-50 border-blue-200' },
    staff: { label: 'Facility Staff', sub: 'Maintenance Desk', icon: Wrench, color: 'text-purple-800 bg-purple-50 border-purple-200' },
  };

  const CurrentRoleIcon = roleConfig[currentRole].icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Critical SOS banner if any active emergencies */}
      {activeSOS.length > 0 && (
        <div className="bg-red-600 text-white px-4 py-1.5 text-xs font-bold flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Siren className="w-4 h-4 shrink-0" />
            <span>CRITICAL ALERT: {activeSOS.length} active emergency alert(s) in society!</span>
          </div>
          <button
            onClick={onOpenSOS}
            className="underline hover:text-red-100 uppercase tracking-wider text-[11px]"
          >
            Open SOS Command Console
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Society Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-700/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Palm Heights
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-block">
                  Smart Society OS
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                184 Units • Towers A, B, C & D
              </p>
            </div>
          </div>

          {/* Right Actions: Role Selector, Flat Selector, SOS, Notifications, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Flat selector (if resident role is active) */}
            {currentRole === 'resident' && (
              <div className="relative">
                <button
                  onClick={() => setShowFlatMenu(!showFlatMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs text-slate-700 transition-colors"
                  title="Switch Demo Flat"
                >
                  <Home className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-900">{currentResident.flatNumber}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {showFlatMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Switch Demo Flat
                    </div>
                    {allResidents.map(res => (
                      <button
                        key={res.id}
                        onClick={() => {
                          setCurrentResident(res);
                          setShowFlatMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          currentResident.id === res.id ? 'bg-emerald-50 text-emerald-800 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{res.flatNumber} • {res.name}</p>
                          <p className="text-[10px] text-slate-500">{res.block} • {res.vehicles.length} vehicle(s)</p>
                        </div>
                        {currentResident.id === res.id && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Google Account / Gmail status */}
            {isConnected && user ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-[11px] text-slate-700 max-w-[130px] truncate" title={user.email || ''}>
                  {user.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-[10px] text-slate-400 hover:text-red-600 ml-0.5 cursor-pointer"
                  title="Disconnect Google Account"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="hidden lg:block">
                <GoogleSignInButton label="Connect Gmail" className="!py-1.5 !px-2.5 !text-[11px] !rounded-xl" />
              </div>
            )}

            {/* Role Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${roleConfig[currentRole].color}`}
              >
                <CurrentRoleIcon className="w-4 h-4" />
                <div className="text-left hidden md:block">
                  <span className="leading-none block">{roleConfig[currentRole].label}</span>
                </div>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-2xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Switch Operating Role
                  </div>
                  {(['admin', 'resident', 'security', 'staff'] as UserRole[]).map(roleKey => {
                    const cfg = roleConfig[roleKey];
                    const Icon = cfg.icon;
                    const isActive = currentRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          setCurrentRole(roleKey);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          isActive ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${cfg.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 leading-tight">{cfg.label}</p>
                          <p className="text-[10px] text-slate-500">{cfg.sub}</p>
                        </div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Panic SOS Button */}
            <button
              onClick={onOpenSOS}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-700/30 transition-all hover:scale-105 active:scale-95"
              title="Emergency SOS Panic Trigger"
            >
              <Siren className="w-4 h-4 animate-spin-slow" />
              <span className="hidden sm:inline">SOS Panic</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Society Activity</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Live</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {recentVisitors.map(vis => (
                      <div key={vis.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                          <span>Gate Activity</span>
                          <span>{vis.checkInTime || 'Expected'}</span>
                        </div>
                        <p className="text-slate-900 font-semibold">
                          {vis.visitorName} ({vis.visitorType})
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">Flat {vis.flatNumber} • {vis.status.replace('_', ' ')}</p>
                      </div>
                    ))}

                    {recentNotices.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 mb-0.5">
                          <span className="text-amber-700 font-bold">Notice</span>
                          <span>{n.publishedDate}</span>
                        </div>
                        <p className="text-slate-900 font-medium line-clamp-1">{n.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Supabase Database Connection Button */}
            <button
              onClick={() => setShowDbModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
                !isConfigured
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  : dbError
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              }`}
              title="Supabase Database Status & Configuration"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Supabase</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  !isConfigured
                    ? 'bg-slate-400'
                    : dbError
                    ? 'bg-amber-500 animate-pulse'
                    : 'bg-emerald-500'
                }`}
              />
            </button>

            {/* Reset to Demo Data button */}
            <button
              onClick={() => {
                if (window.confirm('Reset society database to factory demo defaults?')) {
                  resetToDemoData();
                }
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              title="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <DatabaseConfigModal isOpen={showDbModal} onClose={() => setShowDbModal(false)} />
    </header>
  );
};
