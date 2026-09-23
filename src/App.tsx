import React, { useState } from 'react';
import { SocietyProvider, useSociety } from './context/SocietyContext';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { Navbar } from './components/layout/Navbar';
import { ToastContainer } from './components/layout/ToastContainer';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { VisitorManagement } from './components/gate/VisitorManagement';
import { MaintenanceBilling } from './components/finance/MaintenanceBilling';
import { ComplaintDesk } from './components/helpdesk/ComplaintDesk';
import { AmenitiesBooking } from './components/amenities/AmenitiesBooking';
import { NoticeAndPolls } from './components/community/NoticeAndPolls';
import { SocietyDirectory } from './components/directory/SocietyDirectory';
import { StaffManagement } from './components/staff/StaffManagement';

// Modals
import { GatePassModal } from './components/modals/GatePassModal';
import { PaymentModal } from './components/modals/PaymentModal';
import { NewComplaintModal } from './components/modals/NewComplaintModal';
import { SOSModal } from './components/modals/SOSModal';
import { BookAmenityModal } from './components/modals/BookAmenityModal';
import { MaintenanceBill, Amenity } from './types/society';

import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  Wrench,
  Trophy,
  Megaphone,
  Building2,
  UserCheck,
  Siren
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentRole, visitors, complaints, bills } = useSociety();

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Modal states
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(null);
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'gate',
      label: 'Gate & Visitors',
      icon: ShieldCheck,
      badge: visitors.filter(v => v.status === 'in_campus').length
    },
    {
      id: 'finance',
      label: 'Maintenance Bills',
      icon: CreditCard,
      badge: bills.filter(b => b.status === 'pending' || b.status === 'overdue' || b.status === 'partially_paid').length
    },
    {
      id: 'complaints',
      label: 'Helpdesk & Tickets',
      icon: Wrench,
      badge: complaints.filter(c => c.status === 'open' || c.status === 'assigned').length
    },
    { id: 'amenities', label: 'Amenities Booking', icon: Trophy },
    { id: 'notices', label: 'Notices & Polls', icon: Megaphone },
    { id: 'directory', label: 'Directory & Intercom', icon: Building2 },
    { id: 'staff', label: 'Staff & Daily Help', icon: UserCheck },
  ];

  const handleOpenPayment = (bill: MaintenanceBill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);
  };

  const handleOpenBooking = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setShowBookingModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenSOS={() => setShowSOSModal(true)} />

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sticky top-24 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Navigation Menu
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick SOS Card in Sidebar */}
            <div className="pt-3 mt-3 border-t border-slate-100">
              <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-700">
                  <Siren className="w-4 h-4 animate-pulse text-red-600" />
                  <span>24/7 Gate Emergency</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Instant broadcast to Main Security & Medical first responders.
                </p>
                <button
                  onClick={() => setShowSOSModal(true)}
                  className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
                >
                  Trigger SOS Panic
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigateTab={(tabId) => setActiveTab(tabId)}
              onOpenGatePass={() => setShowGatePassModal(true)}
              onOpenPayment={handleOpenPayment}
              onOpenNewTicket={() => setShowNewTicketModal(true)}
            />
          )}

          {activeTab === 'gate' && (
            <VisitorManagement onOpenGatePassModal={() => setShowGatePassModal(true)} />
          )}

          {activeTab === 'finance' && (
            <MaintenanceBilling onOpenPaymentModal={handleOpenPayment} />
          )}

          {activeTab === 'complaints' && (
            <ComplaintDesk onOpenNewTicketModal={() => setShowNewTicketModal(true)} />
          )}

          {activeTab === 'amenities' && (
            <AmenitiesBooking onOpenBookingModal={handleOpenBooking} />
          )}

          {activeTab === 'notices' && <NoticeAndPolls />}

          {activeTab === 'directory' && <SocietyDirectory />}

          {activeTab === 'staff' && <StaffManagement />}
        </main>
      </div>

      {/* Global Modals */}
      <GatePassModal
        isOpen={showGatePassModal}
        onClose={() => setShowGatePassModal(false)}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bill={selectedBill}
      />

      <NewComplaintModal
        isOpen={showNewTicketModal}
        onClose={() => setShowNewTicketModal(false)}
      />

      <SOSModal
        isOpen={showSOSModal}
        onClose={() => setShowSOSModal(false)}
      />

      <BookAmenityModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        amenity={selectedAmenity}
      />

      {/* Toast notifications */}
      <ToastContainer />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>© 2026 Palm Heights Co-operative Housing Society Ltd. (Reg. No. MH/MUM/HSG/4921)</p>
          <div className="flex items-center gap-4">
            <span>24/7 Security Gate: <strong className="text-slate-700">Ext. 1001</strong></span>
            <span>Estate Helpdesk: <strong className="text-slate-700">Ext. 1000</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GoogleAuthProvider>
      <SocietyProvider>
        <MainLayout />
      </SocietyProvider>
    </GoogleAuthProvider>
  );
}
