import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  ResidentUser,
  Visitor,
  MaintenanceBill,
  PaymentTransaction,
  BillEmailLog,
  Complaint,
  Amenity,
  AmenityBooking,
  Notice,
  CommunityPoll,
  StaffMember,
  DomesticWorker,
  EmergencySOS,
  FlatRecord
} from '../types/society';

import { supabase, isSupabaseConfigured } from '../supabase/client';
import { EmergencyContact } from '../supabase/types';

// Supabase queries
import { getFlats } from '../supabase/queries/flats';
import { getResidents } from '../supabase/queries/residents';
import { getVisitors } from '../supabase/queries/visitors';
import { getBills } from '../supabase/queries/bills';
import { getComplaints } from '../supabase/queries/complaints';
import { getAmenities, getAmenityBookings } from '../supabase/queries/amenities';
import { getNotices } from '../supabase/queries/notices';
import { getPolls } from '../supabase/queries/polls';
import { getStaffMembers } from '../supabase/queries/staff';
import { getDomesticWorkers } from '../supabase/queries/domesticWorkers';
import { getEmergencySOS } from '../supabase/queries/sos';
import { getEmergencyContacts } from '../supabase/queries/emergencyContacts';
import { getEmailLogs } from '../supabase/queries/emailLogs';

// Supabase mutations
import { createVisitor, updateVisitorStatus } from '../supabase/mutations/visitors';
import { createBill, recordBillPayment, updateBillEmailInfo } from '../supabase/mutations/bills';
import {
  createComplaintRecord,
  updateComplaintState,
  assignStaffToComplaint,
  addCommentToComplaint,
  rateComplaintTicket
} from '../supabase/mutations/complaints';
import { createAmenityBooking, cancelBooking } from '../supabase/mutations/amenities';
import { createNoticeRecord, deleteNoticeRecord, togglePinNoticeRecord } from '../supabase/mutations/notices';
import { createPollRecord, castPollVote } from '../supabase/mutations/polls';
import { updateStaffMemberStatus } from '../supabase/mutations/staff';
import { toggleDomesticWorkerStatus } from '../supabase/mutations/domesticWorkers';
import { createEmergencySOS, resolveEmergencySOS } from '../supabase/mutations/sos';
import { createEmailLog } from '../supabase/mutations/emailLogs';
import { assignResidentToFlat, vacateFlat, createFlat } from '../supabase/mutations/flats';
import { createResidentRecord, removeResidentByFlat } from '../supabase/mutations/residents';
import { seedSupabaseDatabase } from '../supabase/seed';
import {
  INITIAL_FLATS,
  INITIAL_RESIDENTS,
  INITIAL_VISITORS,
  INITIAL_BILLS,
  INITIAL_COMPLAINTS,
  INITIAL_AMENITIES,
  INITIAL_BOOKINGS,
  INITIAL_NOTICES,
  INITIAL_POLLS,
  INITIAL_STAFF,
  INITIAL_DOMESTIC_WORKERS,
  INITIAL_SOS_ALERTS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_EMAIL_LOGS
} from '../supabase/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface SocietyContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentResident: ResidentUser;
  setCurrentResident: (resident: ResidentUser) => void;
  allResidents: ResidentUser[];
  flats: FlatRecord[];
  visitors: Visitor[];
  bills: MaintenanceBill[];
  complaints: Complaint[];
  amenities: Amenity[];
  bookings: AmenityBooking[];
  notices: Notice[];
  polls: CommunityPoll[];
  staff: StaffMember[];
  domesticWorkers: DomesticWorker[];
  sosAlerts: EmergencySOS[];
  emergencyContacts: EmergencyContact[];
  emailLogs: BillEmailLog[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Database status
  isLoading: boolean;
  isConfigured: boolean;
  dbError: string | null;
  refreshData: () => Promise<void>;
  seedDatabase: () => Promise<{ success: boolean; message: string }>;

  // Gate & Visitors
  preApproveVisitor: (data: Omit<Visitor, 'id' | 'passCode' | 'createdAt' | 'status'>) => Visitor;
  checkInVisitorByCode: (passCode: string, gate: string) => { success: boolean; visitor?: Visitor; message: string };
  checkInVisitor: (id: string, gate: string) => void;
  checkOutVisitor: (id: string) => void;
  denyVisitor: (id: string, notes?: string) => void;
  registerWalkInVisitor: (data: {
    visitorName: string;
    phone: string;
    visitorType: Visitor['visitorType'];
    flatNumber: string;
    purpose: string;
    vehicleNumber?: string;
    company?: string;
    gate: string;
  }) => Visitor;

  // Bills & Finance
  payMaintenanceBill: (
    billId: string,
    paymentMethod: MaintenanceBill['paymentMethod'],
    customAmount?: number,
    notes?: string
  ) => {
    success: boolean;
    amountPaid: number;
    remainingAmount: number;
    receiptNumber: string;
    transactionId: string;
    status: MaintenanceBill['status'];
  };
  generateSocietyBill: (flatNumber: string, month: string, amount: number) => void;
  sendBillEmail: (
    billId: string,
    recipientEmail: string,
    customMessage?: string,
    subject?: string
  ) => Promise<{ success: boolean; message: string; log: BillEmailLog }>;
  sendBulkBillReminders: () => Promise<{ count: number; message: string }>;

  // Complaints
  createComplaint: (data: {
    flatNumber: string;
    residentName: string;
    residentPhone: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
    title: string;
    description: string;
  }) => Complaint;
  updateComplaintStatus: (id: string, status: Complaint['status'], resolutionNotes?: string) => void;
  assignComplaintStaff: (id: string, staffId: string, staffName: string) => void;
  addComplaintComment: (id: string, text: string) => void;
  rateComplaint: (id: string, rating: number) => void;

  // Amenities
  bookAmenity: (data: {
    amenityId: string;
    amenityName: string;
    flatNumber: string;
    residentName: string;
    residentPhone: string;
    date: string;
    slot: string;
    guestsCount: number;
    totalCost: number;
  }) => AmenityBooking;
  cancelAmenityBooking: (bookingId: string) => void;

  // Community Notices & Polls
  createNotice: (data: Omit<Notice, 'id' | 'publishedDate'>) => void;
  deleteNotice: (id: string) => void;
  togglePinNotice: (id: string) => void;
  votePoll: (pollId: string, optionId: string, flatNumber: string) => void;
  createPoll: (data: { title: string; description: string; options: string[]; expiresAt: string }) => void;

  // Staff & Domestic
  toggleStaffStatus: (staffId: string) => void;
  toggleDomesticWorkerPunch: (id: string) => void;

  // Emergency SOS
  triggerSOS: (type: EmergencySOS['type'], flatNumber: string, residentName: string, phone: string, notes?: string) => void;
  resolveSOS: (id: string, responderName: string) => void;

  // Flats & Residents Management
  assignResidentToVacantUnit: (data: {
    flatNumber: string;
    residentName: string;
    email: string;
    phone: string;
    role: 'owner' | 'tenant';
    membersCount: number;
    intercom?: string;
    vehicles?: {
      type: 'car' | 'bike' | 'ev';
      model: string;
      registrationNumber: string;
      parkingSlot: string;
    }[];
    notes?: string;
  }) => Promise<{ success: boolean; message: string; resident?: ResidentUser }>;
  markUnitAsVacant: (flatNumber: string) => Promise<{ success: boolean; message: string }>;
  addNewFlatUnit: (flatData: {
    flatNumber: string;
    block: string;
    floor: number;
    intercom?: string;
  }) => Promise<{ success: boolean; message: string }>;

  // Reset demo
  resetToDemoData: () => void;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

const defaultResident: ResidentUser = {
  id: 'res-default',
  name: 'Resident',
  email: 'resident@palmheights.org',
  phone: '+91 98000 00000',
  flatNumber: 'A-101',
  block: 'Tower A',
  role: 'owner',
  intercom: '1101',
  vehicles: [],
  domesticStaffIds: []
};

const loadStored = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(`ph_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const loadStoredFlats = (): FlatRecord[] => {
  const stored = loadStored<FlatRecord[]>('flats', INITIAL_FLATS);
  const hasVacant = stored.some(f => f.occupantType === 'Vacant');
  if (!hasVacant) {
    const existingNumbers = new Set(stored.map(f => f.flatNumber));
    const vacantFromInitial = INITIAL_FLATS.filter(
      f => f.occupantType === 'Vacant' && !existingNumbers.has(f.flatNumber)
    );
    return [...stored, ...vacantFromInitial];
  }
  return stored;
};

export const SocietyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [allResidents, setAllResidents] = useState<ResidentUser[]>(() => loadStored('residents', INITIAL_RESIDENTS));
  const [currentResident, setCurrentResident] = useState<ResidentUser>(() => {
    const stored = loadStored('residents', INITIAL_RESIDENTS);
    return stored.length > 0 ? stored[0] : defaultResident;
  });

  const [flats, setFlats] = useState<FlatRecord[]>(loadStoredFlats);
  const [visitors, setVisitors] = useState<Visitor[]>(() => loadStored('visitors', INITIAL_VISITORS));
  const [bills, setBills] = useState<MaintenanceBill[]>(() => loadStored('bills', INITIAL_BILLS));
  const [complaints, setComplaints] = useState<Complaint[]>(() => loadStored('complaints', INITIAL_COMPLAINTS));
  const [amenities, setAmenities] = useState<Amenity[]>(() => loadStored('amenities', INITIAL_AMENITIES));
  const [bookings, setBookings] = useState<AmenityBooking[]>(() => loadStored('bookings', INITIAL_BOOKINGS));
  const [notices, setNotices] = useState<Notice[]>(() => loadStored('notices', INITIAL_NOTICES));
  const [polls, setPolls] = useState<CommunityPoll[]>(() => loadStored('polls', INITIAL_POLLS));
  const [staff, setStaff] = useState<StaffMember[]>(() => loadStored('staff', INITIAL_STAFF));
  const [domesticWorkers, setDomesticWorkers] = useState<DomesticWorker[]>(() => loadStored('domestic', INITIAL_DOMESTIC_WORKERS));
  const [sosAlerts, setSosAlerts] = useState<EmergencySOS[]>(() => loadStored('sos', INITIAL_SOS_ALERTS));
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => loadStored('contacts', INITIAL_EMERGENCY_CONTACTS));
  const [emailLogs, setEmailLogs] = useState<BillEmailLog[]>(() => loadStored('emailLogs', INITIAL_EMAIL_LOGS));

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Synchronize local storage backups
  useEffect(() => {
    try { localStorage.setItem('ph_flats', JSON.stringify(flats)); } catch {}
  }, [flats]);
  useEffect(() => {
    try { localStorage.setItem('ph_residents', JSON.stringify(allResidents)); } catch {}
  }, [allResidents]);
  useEffect(() => {
    try { localStorage.setItem('ph_visitors', JSON.stringify(visitors)); } catch {}
  }, [visitors]);
  useEffect(() => {
    try { localStorage.setItem('ph_bills', JSON.stringify(bills)); } catch {}
  }, [bills]);
  useEffect(() => {
    try { localStorage.setItem('ph_complaints', JSON.stringify(complaints)); } catch {}
  }, [complaints]);
  useEffect(() => {
    try { localStorage.setItem('ph_bookings', JSON.stringify(bookings)); } catch {}
  }, [bookings]);
  useEffect(() => {
    try { localStorage.setItem('ph_notices', JSON.stringify(notices)); } catch {}
  }, [notices]);
  useEffect(() => {
    try { localStorage.setItem('ph_polls', JSON.stringify(polls)); } catch {}
  }, [polls]);
  useEffect(() => {
    try { localStorage.setItem('ph_staff', JSON.stringify(staff)); } catch {}
  }, [staff]);
  useEffect(() => {
    try { localStorage.setItem('ph_domestic', JSON.stringify(domesticWorkers)); } catch {}
  }, [domesticWorkers]);
  useEffect(() => {
    try { localStorage.setItem('ph_sos', JSON.stringify(sosAlerts)); } catch {}
  }, [sosAlerts]);
  useEffect(() => {
    try { localStorage.setItem('ph_emailLogs', JSON.stringify(emailLogs)); } catch {}
  }, [emailLogs]);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const generatePassCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Fetch all data from Supabase
  const loadSupabaseData = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setDbError(null);

    try {
      // Execute parallel Supabase queries
      const [
        flatsData,
        residentsData,
        visitorsData,
        billsData,
        complaintsData,
        amenitiesData,
        bookingsData,
        noticesData,
        pollsData,
        staffData,
        domesticData,
        sosData,
        contactsData,
        emailLogsData
      ] = await Promise.all([
        getFlats(),
        getResidents(),
        getVisitors(),
        getBills(),
        getComplaints(),
        getAmenities(),
        getAmenityBookings(),
        getNotices(),
        getPolls(),
        getStaffMembers(),
        getDomesticWorkers(),
        getEmergencySOS(),
        getEmergencyContacts(),
        getEmailLogs()
      ]);

      if (flatsData && flatsData.length > 0) {
        setFlats(flatsData);
      }
      if (residentsData && residentsData.length > 0) {
        setAllResidents(residentsData);
        setCurrentResident(residentsData[0]);
      }
      if (visitorsData) setVisitors(visitorsData);
      if (billsData) setBills(billsData);
      if (complaintsData) setComplaints(complaintsData);
      if (amenitiesData && amenitiesData.length > 0) setAmenities(amenitiesData);
      if (bookingsData) setBookings(bookingsData);
      if (noticesData && noticesData.length > 0) setNotices(noticesData);
      if (pollsData && pollsData.length > 0) setPolls(pollsData);
      if (staffData && staffData.length > 0) setStaff(staffData);
      if (domesticData && domesticData.length > 0) setDomesticWorkers(domesticData);
      if (sosData) setSosAlerts(sosData);
      if (contactsData && contactsData.length > 0) setEmergencyContacts(contactsData);
      if (emailLogsData) setEmailLogs(emailLogsData);

      // If database is completely empty (no flats yet), seed initial data
      if (flatsData !== null && flatsData.length === 0 && isSupabaseConfigured) {
        console.log('Database empty, auto-seeding initial records...');
        await seedSupabaseDatabase();
        const f2 = await getFlats();
        if (f2 && f2.length > 0) setFlats(f2);
      }
    } catch (err: any) {
      console.warn('Supabase query error:', err);
      setDbError('Notice: Operating with cached society records. Connect Supabase to sync remotely.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSupabaseData();
  }, [loadSupabaseData]);

  const refreshData = async () => {
    await loadSupabaseData();
    addToast('info', 'Data Refreshed', 'Synced latest records from Supabase.');
  };

  const seedDatabase = async () => {
    setIsLoading(true);
    const res = await seedSupabaseDatabase();
    if (res.success) {
      await loadSupabaseData();
      addToast('success', 'Database Initialized', res.message);
    } else {
      addToast('error', 'Seed Failed', res.message);
      setIsLoading(false);
    }
    return res;
  };

  // Gate & Visitors
  const preApproveVisitor = (data: Omit<Visitor, 'id' | 'passCode' | 'createdAt' | 'status'>): Visitor => {
    const passCode = generatePassCode();
    const tempId = `vis-${Date.now()}`;
    const now = new Date().toISOString();

    const newVisitor: Visitor = {
      ...data,
      id: tempId,
      passCode,
      status: 'expected',
      createdAt: now
    };

    // Optimistic UI update
    setVisitors(prev => [newVisitor, ...prev]);

    // Supabase mutation
    createVisitor({
      visitorName: data.visitorName,
      phone: data.phone,
      visitorType: data.visitorType,
      flatNumber: data.flatNumber,
      hostName: data.hostName,
      passCode,
      company: data.company,
      purpose: data.purpose,
      vehicleNumber: data.vehicleNumber,
      expectedDate: data.expectedDate,
      status: 'expected'
    }).catch(err => {
      console.error('Supabase insert visitor failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Gate Pass Generated', `Visitor pass code ${newVisitor.passCode} created for ${newVisitor.visitorName}.`);
    return newVisitor;
  };

  const checkInVisitorByCode = (passCode: string, gate: string) => {
    const cleanedCode = passCode.trim();
    const visitorIndex = visitors.findIndex(v => v.passCode === cleanedCode && v.status === 'expected');

    if (visitorIndex === -1) {
      const alreadyIn = visitors.find(v => v.passCode === cleanedCode && v.status === 'in_campus');
      if (alreadyIn) {
        return { success: false, message: `Pass code ${passCode} was already checked in at ${alreadyIn.checkInTime}.` };
      }
      return { success: false, message: `Invalid or expired gate pass code "${passCode}".` };
    }

    const matchedVisitor = visitors[visitorIndex];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated: Visitor = {
      ...matchedVisitor,
      status: 'in_campus',
      checkInTime: nowTime,
      entryGate: gate || 'Main Gate 1'
    };

    setVisitors(prev => {
      const copy = [...prev];
      copy[visitorIndex] = updated;
      return copy;
    });

    updateVisitorStatus(matchedVisitor.id, 'in_campus', {
      checkInTime: nowTime,
      entryGate: gate || 'Main Gate 1'
    }).catch(err => {
      console.error('Supabase update visitor failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Gate Entry Allowed', `${updated.visitorName} checked in to Flat ${updated.flatNumber} via ${updated.entryGate}.`);
    return { success: true, visitor: updated, message: `Check-in approved for ${updated.visitorName}.` };
  };

  const checkInVisitor = (id: string, gate: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => (v.id === id ? { ...v, status: 'in_campus', checkInTime: nowTime, entryGate: gate } : v)));

    updateVisitorStatus(id, 'in_campus', { checkInTime: nowTime, entryGate: gate }).catch(err => {
      console.error('Supabase update visitor failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('info', 'Check-In Confirmed', 'Visitor status marked as inside campus in Supabase.');
  };

  const checkOutVisitor = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => (v.id === id ? { ...v, status: 'checked_out', checkOutTime: nowTime } : v)));

    updateVisitorStatus(id, 'checked_out', { checkOutTime: nowTime }).catch(err => {
      console.error('Supabase checkout failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('info', 'Exit Logged', 'Visitor exit recorded.');
  };

  const denyVisitor = (id: string, notes?: string) => {
    setVisitors(prev => prev.map(v => (v.id === id ? { ...v, status: 'denied', notes: notes || 'Denied by gate security' } : v)));

    updateVisitorStatus(id, 'denied', { notes: notes || 'Denied by gate security' }).catch(err => {
      console.error('Supabase deny failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('warning', 'Visitor Denied', 'Entry was refused and logged.');
  };

  const registerWalkInVisitor = (data: {
    visitorName: string;
    phone: string;
    visitorType: Visitor['visitorType'];
    flatNumber: string;
    purpose: string;
    vehicleNumber?: string;
    company?: string;
    gate: string;
  }): Visitor => {
    const host = flats.find(f => f.flatNumber === data.flatNumber)?.ownerName || 'Resident';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const passCode = generatePassCode();
    const tempId = `vis-${Date.now()}`;
    const now = new Date().toISOString();

    const newVisitor: Visitor = {
      id: tempId,
      visitorName: data.visitorName,
      phone: data.phone,
      visitorType: data.visitorType,
      flatNumber: data.flatNumber,
      hostName: host,
      passCode,
      company: data.company,
      purpose: data.purpose,
      vehicleNumber: data.vehicleNumber,
      expectedDate: now.split('T')[0],
      status: 'in_campus',
      checkInTime: nowTime,
      entryGate: data.gate || 'Main Gate 1',
      createdAt: now
    };

    setVisitors(prev => [newVisitor, ...prev]);

    createVisitor({
      visitorName: data.visitorName,
      phone: data.phone,
      visitorType: data.visitorType,
      flatNumber: data.flatNumber,
      hostName: host,
      passCode,
      company: data.company,
      purpose: data.purpose,
      vehicleNumber: data.vehicleNumber,
      expectedDate: now.split('T')[0],
      status: 'in_campus',
      checkInTime: nowTime,
      entryGate: data.gate || 'Main Gate 1'
    }).catch(err => {
      console.error('Supabase walkin failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Walk-in Visitor Logged', `${newVisitor.visitorName} approved for Flat ${newVisitor.flatNumber}.`);
    return newVisitor;
  };

  // Maintenance Bills & Finance
  const payMaintenanceBill = (
    billId: string,
    paymentMethod: MaintenanceBill['paymentMethod'],
    customAmount?: number,
    notes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const txnId = `TXN-${Date.now().toString().slice(-8)}`;
    const recNo = `REC-2026-${Math.floor(100 + Math.random() * 900)}`;

    let targetFlat = '';
    let amountPaid = 0;
    let remainingAmount = 0;
    let finalStatus: MaintenanceBill['status'] = 'paid';
    let updatedBillObj: any = null;

    setBills(prev => {
      const updated = prev.map(b => {
        if (b.id === billId) {
          targetFlat = b.flatNumber;
          const currentPaid = b.paidAmount ?? (b.status === 'paid' ? b.amount : 0);
          const currentRemaining = b.remainingAmount !== undefined ? b.remainingAmount : Math.max(0, b.amount - currentPaid);

          amountPaid = customAmount !== undefined && customAmount > 0
            ? Math.min(customAmount, currentRemaining)
            : currentRemaining;

          const newPaid = currentPaid + amountPaid;
          remainingAmount = Math.max(0, b.amount - newPaid);
          finalStatus = remainingAmount <= 0 ? 'paid' : 'partially_paid';

          const newTransaction: PaymentTransaction = {
            id: `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            amount: amountPaid,
            paidAt: today,
            paymentMethod: paymentMethod || 'UPI',
            transactionId: txnId,
            receiptNumber: recNo,
            remainingAfter: remainingAmount,
            notes: notes || (remainingAmount <= 0 ? 'Cleared in full' : 'Partial payment')
          };

          const fullPayments = [...(b.payments || []), newTransaction];

          updatedBillObj = {
            ...b,
            status: finalStatus,
            paidAmount: newPaid,
            remainingAmount,
            paidAt: today,
            paymentMethod: paymentMethod || 'UPI',
            transactionId: txnId,
            receiptNumber: recNo,
            payments: fullPayments
          };

          return updatedBillObj;
        }
        return b;
      });

      // Update flat maintenance due
      if (targetFlat) {
        const flatPendingTotal = updated
          .filter(b => b.flatNumber === targetFlat && b.status !== 'paid')
          .reduce((sum, b) => {
            const rem = b.remainingAmount !== undefined ? b.remainingAmount : b.amount;
            return sum + rem;
          }, 0);

        setFlats(fPrev => fPrev.map(f => (f.flatNumber === targetFlat ? { ...f, maintenanceDue: flatPendingTotal } : f)));
      }

      return updated;
    });

    if (updatedBillObj) {
      recordBillPayment(billId, {
        paidAmount: updatedBillObj.paidAmount,
        remainingAmount,
        status: finalStatus,
        paidAt: today,
        paymentMethod: paymentMethod || 'UPI',
        transactionId: txnId,
        receiptNumber: recNo,
        payments: updatedBillObj.payments
      }).catch(err => {
        console.error('Supabase recordBillPayment failed:', err);
        addToast('error', 'Database Error', err.message);
      });
    }

    if (remainingAmount <= 0) {
      addToast('success', 'Bill Settled in Full', `Payment of ₹${amountPaid.toLocaleString('en-IN')} received. Bill is fully cleared! Receipt: ${recNo}`);
    } else {
      addToast('info', 'Partial Payment Received', `Payment of ₹${amountPaid.toLocaleString('en-IN')} received. Remaining balance: ₹${remainingAmount.toLocaleString('en-IN')}. Receipt: ${recNo}`);
    }

    return {
      success: true,
      amountPaid,
      remainingAmount,
      receiptNumber: recNo,
      transactionId: txnId,
      status: finalStatus
    };
  };

  const generateSocietyBill = (flatNumber: string, month: string, amount: number) => {
    const resident = flats.find(f => f.flatNumber === flatNumber);
    const newBill: MaintenanceBill = {
      id: `bill-${Date.now()}`,
      flatNumber,
      residentName: resident?.ownerName || 'Resident',
      month,
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      amount,
      paidAmount: 0,
      remainingAmount: amount,
      payments: [],
      breakup: {
        maintenanceFee: Math.round(amount * 0.75),
        sinkingFund: Math.round(amount * 0.1),
        waterCharges: Math.round(amount * 0.08),
        parkingCharges: Math.round(amount * 0.07),
        penalty: 0
      },
      status: 'pending'
    };

    setBills(prev => [newBill, ...prev]);
    setFlats(prev => prev.map(f => (f.flatNumber === flatNumber ? { ...f, maintenanceDue: f.maintenanceDue + amount } : f)));

    createBill(newBill).catch(err => {
      console.error('Supabase createBill failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('info', 'Invoice Raised', `New bill for Flat ${flatNumber} generated in Supabase.`);
  };

  const sendBillEmail = async (
    billId: string,
    recipientEmail: string,
    customMessage?: string,
    subject?: string
  ): Promise<{ success: boolean; message: string; log: BillEmailLog }> => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) {
      throw new Error(`Bill ${billId} not found`);
    }

    const todayDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isPaid = bill.status === 'paid';
    const emailType: BillEmailLog['type'] = isPaid
      ? 'receipt'
      : bill.status === 'partially_paid'
      ? 'reminder'
      : 'invoice';
    const remaining = bill.remainingAmount !== undefined ? bill.remainingAmount : (isPaid ? 0 : bill.amount);

    const emailSubject = subject || (
      isPaid
        ? `[Official Receipt] Maintenance Cleared - Unit ${bill.flatNumber} (${bill.month})`
        : bill.status === 'partially_paid'
        ? `[Installment Notice] Remaining Maintenance Due: ₹${remaining.toLocaleString('en-IN')} - Unit ${bill.flatNumber} (${bill.month})`
        : `[Maintenance Invoice] Due Notice - Unit ${bill.flatNumber} (${bill.month})`
    );

    const logEntry: BillEmailLog = {
      id: `email-${Date.now()}`,
      billId: bill.id,
      flatNumber: bill.flatNumber,
      recipientEmail,
      recipientName: bill.residentName,
      subject: emailSubject,
      sentAt: todayDate,
      type: emailType,
      amount: bill.amount,
      remainingAmount: remaining,
      status: 'delivered'
    };

    setEmailLogs(prev => [logEntry, ...prev]);

    setBills(prev => prev.map(b => {
      if (b.id === billId) {
        return {
          ...b,
          lastEmailedAt: todayDate,
          lastEmailedTo: recipientEmail
        };
      }
      return b;
    }));

    // Persist to Supabase
    createEmailLog(logEntry).catch(console.error);
    updateBillEmailInfo(bill.id, todayDate, recipientEmail).catch(console.error);

    addToast(
      'success',
      'Email Dispatched',
      `${emailType === 'receipt' ? 'Receipt' : 'Invoice'} delivered to ${recipientEmail}`
    );

    return {
      success: true,
      message: `Email successfully sent to ${recipientEmail}`,
      log: logEntry
    };
  };

  const sendBulkBillReminders = async (): Promise<{ count: number; message: string }> => {
    const overdueBills = bills.filter(b => b.status === 'overdue' || b.status === 'pending');
    let count = 0;

    for (const bill of overdueBills) {
      const resEmail = allResidents.find(r => r.flatNumber === bill.flatNumber)?.email || `${bill.flatNumber.toLowerCase()}@palmheights.org`;
      await sendBillEmail(bill.id, resEmail);
      count++;
    }

    return { count, message: `Dispatched ${count} maintenance billing reminder notifications.` };
  };

  // Complaints
  const createComplaint = (data: {
    flatNumber: string;
    residentName: string;
    residentPhone: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
    title: string;
    description: string;
  }): Complaint => {
    const tempId = `cmp-${Date.now()}`;
    const now = new Date().toISOString();
    const ticketNumber = `TKT-${now.slice(2, 4)}${now.slice(5, 7)}-${Math.floor(100 + Math.random() * 900)}`;

    const newComplaint: Complaint = {
      id: tempId,
      ticketNumber,
      flatNumber: data.flatNumber,
      residentName: data.residentName,
      residentPhone: data.residentPhone,
      category: data.category,
      priority: data.priority,
      title: data.title,
      description: data.description,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      comments: []
    };

    setComplaints(prev => [newComplaint, ...prev]);

    createComplaintRecord(data).catch(err => {
      console.error('Supabase create complaint failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Ticket Logged', `Complaint ${ticketNumber} recorded and dispatched to estate facility desk.`);
    return newComplaint;
  };

  const updateComplaintStatus = (id: string, status: Complaint['status'], resolutionNotes?: string) => {
    const now = new Date().toISOString();
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          updatedAt: now,
          resolvedAt: status === 'resolved' || status === 'closed' ? now : c.resolvedAt,
          resolutionNotes: resolutionNotes || c.resolutionNotes
        };
      }
      return c;
    }));

    updateComplaintState(id, status, resolutionNotes).catch(err => {
      console.error('Supabase updateComplaintState failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('info', 'Status Updated', `Ticket status updated to ${status}.`);
  };

  const assignComplaintStaff = (id: string, staffId: string, staffName: string) => {
    const now = new Date().toISOString();
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'assigned',
          assignedStaffId: staffId,
          assignedStaffName: staffName,
          updatedAt: now
        };
      }
      return c;
    }));

    assignStaffToComplaint(id, staffId, staffName).catch(err => {
      console.error('Supabase assign staff failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Staff Assigned', `Work order assigned to ${staffName}.`);
  };

  const addComplaintComment = (id: string, text: string) => {
    const complaint = complaints.find(c => c.id === id);
    if (!complaint) return;

    const newComment = {
      id: `cmnt-${Date.now()}`,
      authorName: currentRole === 'admin' ? 'Management Committee' : currentResident.name,
      authorRole: currentRole,
      text,
      createdAt: new Date().toISOString()
    };

    setComplaints(prev => prev.map(c => (c.id === id ? { ...c, comments: [...c.comments, newComment] } : c)));

    addCommentToComplaint(id, complaint.comments, newComment).catch(err => {
      console.error('Supabase add comment failed:', err);
      addToast('error', 'Database Error', err.message);
    });
  };

  const rateComplaint = (id: string, rating: number) => {
    setComplaints(prev => prev.map(c => (c.id === id ? { ...c, rating } : c)));
    rateComplaintTicket(id, rating).catch(err => {
      console.error('Supabase rate complaint failed:', err);
    });
    addToast('success', 'Feedback Submitted', `Rated ${rating}/5 stars. Thank you!`);
  };

  // Amenities
  const bookAmenity = (data: {
    amenityId: string;
    amenityName: string;
    flatNumber: string;
    residentName: string;
    residentPhone: string;
    date: string;
    slot: string;
    guestsCount: number;
    totalCost: number;
  }): AmenityBooking => {
    const tempId = `bkg-${Date.now()}`;
    const bookingRef = `PH-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: AmenityBooking = {
      ...data,
      id: tempId,
      bookingRef,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);

    createAmenityBooking(data).catch(err => {
      console.error('Supabase amenity booking failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Amenity Reserved', `${data.amenityName} confirmed for ${data.date} (${data.slot}). Ref: ${bookingRef}`);
    return newBooking;
  };

  const cancelAmenityBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b)));
    cancelBooking(bookingId).catch(err => {
      console.error('Supabase cancel booking failed:', err);
      addToast('error', 'Database Error', err.message);
    });
    addToast('info', 'Booking Cancelled', 'Amenity slot released.');
  };

  // Community Notices & Polls
  const createNotice = (data: Omit<Notice, 'id' | 'publishedDate'>) => {
    const tempId = `not-${Date.now()}`;
    const newNotice: Notice = {
      ...data,
      id: tempId,
      publishedDate: new Date().toISOString().split('T')[0]
    };

    setNotices(prev => [newNotice, ...prev]);

    createNoticeRecord(data).catch(err => {
      console.error('Supabase createNotice failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Notice Published', `"${data.title}" posted to society board.`);
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    deleteNoticeRecord(id).catch(err => {
      console.error('Supabase deleteNotice failed:', err);
      addToast('error', 'Database Error', err.message);
    });
    addToast('info', 'Notice Removed', 'Notice deleted from society board.');
  };

  const togglePinNotice = (id: string) => {
    const target = notices.find(n => n.id === id);
    if (!target) return;
    setNotices(prev => prev.map(n => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
    togglePinNoticeRecord(id, target.isPinned).catch(err => {
      console.error('Supabase toggle pin failed:', err);
    });
  };

  const createPoll = (data: { title: string; description: string; options: string[]; expiresAt: string }) => {
    const tempId = `poll-${Date.now()}`;
    const newPoll: CommunityPoll = {
      id: tempId,
      title: data.title,
      description: data.description,
      options: data.options.map((text, idx) => ({ id: `opt-${idx + 1}`, text, votes: 0 })),
      totalVotes: 0,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
      votedFlatNumbers: []
    };

    setPolls(prev => [newPoll, ...prev]);

    createPollRecord(data).catch(err => {
      console.error('Supabase createPoll failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Poll Launched', `Community poll "${data.title}" is now open for voting.`);
  };

  const votePoll = (pollId: string, optionId: string, flatNumber: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    if (poll.votedFlatNumbers.includes(flatNumber)) {
      addToast('warning', 'Already Voted', `Flat ${flatNumber} has already cast a vote on this poll.`);
      return;
    }

    const updatedOptions = poll.options.map(opt => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt));
    const updatedPoll: CommunityPoll = {
      ...poll,
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1,
      votedFlatNumbers: [...poll.votedFlatNumbers, flatNumber]
    };

    setPolls(prev => prev.map(p => (p.id === pollId ? updatedPoll : p)));

    castPollVote(pollId, poll, optionId, flatNumber).catch(err => {
      console.error('Supabase castPollVote failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Vote Recorded', `Vote from Flat ${flatNumber} successfully registered.`);
  };

  // Staff & Domestic
  const toggleStaffStatus = (staffId: string) => {
    const st = staff.find(s => s.id === staffId);
    if (!st) return;
    const nextStatus = st.status === 'on_duty' ? 'off_duty' : 'on_duty';

    setStaff(prev => prev.map(s => (s.id === staffId ? { ...s, status: nextStatus } : s)));

    updateStaffMemberStatus(staffId, nextStatus).catch(err => {
      console.error('Supabase updateStaffMemberStatus failed:', err);
    });

    addToast('info', 'Staff Status Updated', `${st.name} is now ${nextStatus.replace('_', ' ')}.`);
  };

  const toggleDomesticWorkerPunch = (id: string) => {
    const w = domesticWorkers.find(item => item.id === id);
    if (!w) return;

    toggleDomesticWorkerStatus(id, w.isInside).then(({ isInside, lastPunch }) => {
      setDomesticWorkers(prev => prev.map(item => (item.id === id ? { ...item, isInside, lastPunch } : item)));
      addToast('success', 'Gate Punch Recorded', `${w.name} marked ${isInside ? 'INSIDE' : 'OUTSIDE'} campus at ${lastPunch}.`);
    }).catch(err => {
      console.error('Supabase toggleDomesticWorkerStatus failed:', err);
      addToast('error', 'Database Error', err.message);
    });
  };

  // Emergency SOS
  const triggerSOS = (type: EmergencySOS['type'], flatNumber: string, residentName: string, phone: string, notes?: string) => {
    const tempId = `sos-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newSOS: EmergencySOS = {
      id: tempId,
      flatNumber,
      residentName,
      phone,
      type,
      timestamp: timeStr,
      status: 'active',
      notes
    };

    setSosAlerts(prev => [newSOS, ...prev]);

    createEmergencySOS({ type, flatNumber, residentName, phone, notes }).catch(err => {
      console.error('Supabase createEmergencySOS failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('error', 'EMERGENCY BROADCAST ACTIVATED', `SOS panic alert triggered for Flat ${flatNumber} (${type.toUpperCase()})! Security alerted.`);
  };

  const resolveSOS = (id: string, responderName: string) => {
    setSosAlerts(prev => prev.map(s => (s.id === id ? { ...s, status: 'resolved', respondedBy: responderName } : s)));

    resolveEmergencySOS(id, responderName).catch(err => {
      console.error('Supabase resolveEmergencySOS failed:', err);
      addToast('error', 'Database Error', err.message);
    });

    addToast('success', 'Emergency Resolved', `Alert cleared by ${responderName}.`);
  };

  // Flats & Residents Management
  const assignResidentToVacantUnit = async (data: {
    flatNumber: string;
    residentName: string;
    email: string;
    phone: string;
    role: 'owner' | 'tenant';
    membersCount: number;
    intercom?: string;
    vehicles?: {
      type: 'car' | 'bike' | 'ev';
      model: string;
      registrationNumber: string;
      parkingSlot: string;
    }[];
    notes?: string;
  }): Promise<{ success: boolean; message: string; resident?: ResidentUser }> => {
    try {
      const targetFlat = flats.find(f => f.flatNumber === data.flatNumber);
      if (!targetFlat) {
        addToast('error', 'Flat Not Found', `Unit ${data.flatNumber} does not exist in society records.`);
        return { success: false, message: 'Flat not found' };
      }

      const intercomNum = data.intercom || targetFlat.intercom || '1000';
      const newResidentId = `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const newResident: ResidentUser = {
        id: newResidentId,
        name: data.residentName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        flatNumber: data.flatNumber,
        block: targetFlat.block,
        role: data.role,
        intercom: intercomNum,
        vehicles: (data.vehicles || []).map((v, i) => ({
          id: `v-${Date.now()}-${i}`,
          type: v.type,
          model: v.model,
          registrationNumber: v.registrationNumber,
          parkingSlot: v.parkingSlot
        })),
        domesticStaffIds: []
      };

      // 1. Update Flat record
      setFlats(prevFlats =>
        prevFlats.map(f => {
          if (f.flatNumber === data.flatNumber) {
            return {
              ...f,
              ownerName: data.residentName.trim(),
              occupantType: data.role === 'owner' ? 'Owner' : 'Tenant',
              contact: data.phone.trim(),
              intercom: intercomNum,
              membersCount: data.membersCount || 1,
            };
          }
          return f;
        })
      );

      // 2. Add to residents list
      setAllResidents(prev => [newResident, ...prev]);

      // 3. Welcome notice broadcast
      const welcomeNotice: Notice = {
        id: `notice-welcome-${Date.now()}`,
        title: `Welcome to Palm Heights: ${data.residentName} (Flat ${data.flatNumber})`,
        content: `Warm greetings to our new resident ${data.residentName} moving into Flat ${data.flatNumber} (${targetFlat.block}) as ${data.role === 'owner' ? 'Homeowner' : 'Tenant'}. Let's welcome them to our society!`,
        category: 'general',
        isPinned: false,
        publishedDate: new Date().toISOString().split('T')[0],
        authorName: 'Estate Management Committee',
        authorRole: 'Admin',
        targetBlocks: ['All']
      };
      setNotices(prev => [welcomeNotice, ...prev]);

      // 4. Supabase persistence if connected
      if (isSupabaseConfigured) {
        assignResidentToFlat(data.flatNumber, {
          residentName: data.residentName.trim(),
          role: data.role === 'owner' ? 'Owner' : 'Tenant',
          contact: data.phone.trim(),
          intercom: intercomNum,
          membersCount: data.membersCount || 1
        }).catch(err => console.warn('Supabase assignResidentToFlat error:', err));

        createResidentRecord(newResident).catch(err => console.warn('Supabase createResidentRecord error:', err));
        createNoticeRecord(welcomeNotice).catch(err => console.warn('Supabase createNoticeRecord error:', err));
      }

      addToast(
        'success',
        'Resident Onboarded Successfully',
        `${data.residentName} has been assigned to Flat ${data.flatNumber} (${targetFlat.block}). Intercom & directory records updated.`
      );

      return { success: true, message: 'Resident assigned successfully', resident: newResident };
    } catch (err: any) {
      console.error('Failed to assign resident:', err);
      addToast('error', 'Onboarding Failed', err?.message || 'Could not assign resident.');
      return { success: false, message: err?.message || 'Failed to assign resident' };
    }
  };

  const markUnitAsVacant = async (flatNumber: string): Promise<{ success: boolean; message: string }> => {
    try {
      const targetFlat = flats.find(f => f.flatNumber === flatNumber);
      if (!targetFlat) {
        addToast('error', 'Flat Not Found', `Flat ${flatNumber} not found.`);
        return { success: false, message: 'Flat not found' };
      }

      setFlats(prevFlats =>
        prevFlats.map(f => {
          if (f.flatNumber === flatNumber) {
            return {
              ...f,
              ownerName: 'Vacant (Unassigned)',
              occupantType: 'Vacant',
              contact: '',
              membersCount: 0
            };
          }
          return f;
        })
      );

      // Remove resident records for this flat
      setAllResidents(prev => prev.filter(r => r.flatNumber !== flatNumber));

      if (isSupabaseConfigured) {
        vacateFlat(flatNumber).catch(err => console.warn('Supabase vacateFlat error:', err));
        removeResidentByFlat(flatNumber).catch(err => console.warn('Supabase removeResidentByFlat error:', err));
      }

      addToast('info', 'Unit Vacated', `Flat ${flatNumber} has been updated to Vacant status.`);
      return { success: true, message: 'Unit marked as vacant' };
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Failed to vacate unit');
      return { success: false, message: err?.message || 'Failed to vacate unit' };
    }
  };

  const addNewFlatUnit = async (flatData: {
    flatNumber: string;
    block: string;
    floor: number;
    intercom?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const exists = flats.some(f => f.flatNumber.toLowerCase() === flatData.flatNumber.toLowerCase());
      if (exists) {
        addToast('warning', 'Unit Already Exists', `Flat ${flatData.flatNumber} is already in the society database.`);
        return { success: false, message: 'Flat already exists' };
      }

      const newFlat: FlatRecord = {
        flatNumber: flatData.flatNumber.toUpperCase(),
        block: flatData.block,
        floor: flatData.floor,
        ownerName: 'Vacant (Unassigned)',
        occupantType: 'Vacant',
        contact: '',
        intercom: flatData.intercom || `${flatData.block.replace('Tower ', '')}${flatData.flatNumber.replace(/[^0-9]/g, '')}`.slice(0, 4) || '1000',
        membersCount: 0,
        maintenanceDue: 0
      };

      setFlats(prev => [...prev, newFlat]);

      if (isSupabaseConfigured) {
        createFlat(newFlat).catch(err => console.warn('Supabase createFlat error:', err));
      }

      addToast('success', 'New Unit Created', `Flat ${newFlat.flatNumber} (${newFlat.block}) added as a vacant unit.`);
      return { success: true, message: 'Flat created successfully' };
    } catch (err: any) {
      addToast('error', 'Error', err?.message || 'Failed to add flat');
      return { success: false, message: err?.message || 'Failed to add flat' };
    }
  };

  // Reset demo
  const resetToDemoData = async () => {
    try {
      const keys = ['flats', 'residents', 'visitors', 'bills', 'complaints', 'bookings', 'notices', 'polls', 'staff', 'domestic', 'sos', 'contacts', 'emailLogs'];
      keys.forEach(k => localStorage.removeItem(`ph_${k}`));
    } catch {}

    setFlats(INITIAL_FLATS);
    setAllResidents(INITIAL_RESIDENTS);
    setCurrentResident(INITIAL_RESIDENTS[0] || defaultResident);
    setVisitors(INITIAL_VISITORS);
    setBills(INITIAL_BILLS);
    setComplaints(INITIAL_COMPLAINTS);
    setAmenities(INITIAL_AMENITIES);
    setBookings(INITIAL_BOOKINGS);
    setNotices(INITIAL_NOTICES);
    setPolls(INITIAL_POLLS);
    setStaff(INITIAL_STAFF);
    setDomesticWorkers(INITIAL_DOMESTIC_WORKERS);
    setSosAlerts(INITIAL_SOS_ALERTS);
    setEmergencyContacts(INITIAL_EMERGENCY_CONTACTS);
    setEmailLogs(INITIAL_EMAIL_LOGS);

    if (isSupabaseConfigured) {
      await seedDatabase();
    } else {
      addToast('success', 'Reset Complete', 'Default Palm Heights society dataset restored.');
    }
  };

  return (
    <SocietyContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentResident,
        setCurrentResident,
        allResidents,
        flats,
        visitors,
        bills,
        complaints,
        amenities,
        bookings,
        notices,
        polls,
        staff,
        domesticWorkers,
        sosAlerts,
        emergencyContacts,
        emailLogs,
        toasts,
        addToast,
        removeToast,
        isLoading,
        isConfigured: isSupabaseConfigured,
        dbError,
        refreshData,
        seedDatabase,
        preApproveVisitor,
        checkInVisitorByCode,
        checkInVisitor,
        checkOutVisitor,
        denyVisitor,
        registerWalkInVisitor,
        payMaintenanceBill,
        generateSocietyBill,
        sendBillEmail,
        sendBulkBillReminders,
        createComplaint,
        updateComplaintStatus,
        assignComplaintStaff,
        addComplaintComment,
        rateComplaint,
        bookAmenity,
        cancelAmenityBooking,
        createNotice,
        deleteNotice,
        togglePinNotice,
        votePoll,
        createPoll,
        toggleStaffStatus,
        toggleDomesticWorkerPunch,
        triggerSOS,
        resolveSOS,
        assignResidentToVacantUnit,
        markUnitAsVacant,
        addNewFlatUnit,
        resetToDemoData
      }}
    >
      {children}
    </SocietyContext.Provider>
  );
};

export const useSociety = () => {
  const context = useContext(SocietyContext);
  if (!context) {
    throw new Error('useSociety must be used within a SocietyProvider');
  }
  return context;
};
