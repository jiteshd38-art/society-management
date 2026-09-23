import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  INITIAL_RESIDENTS,
  INITIAL_FLATS,
  INITIAL_VISITORS,
  INITIAL_BILLS,
  INITIAL_COMPLAINTS,
  INITIAL_AMENITIES,
  INITIAL_BOOKINGS,
  INITIAL_NOTICES,
  INITIAL_POLLS,
  INITIAL_STAFF,
  INITIAL_DOMESTIC_WORKERS
} from '../data/mockData';

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
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

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
  emailLogs: BillEmailLog[];
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

  // Reset demo
  resetToDemoData: () => void;
}

const SocietyContext = createContext<SocietyContextType | undefined>(undefined);

const STORAGE_PREFIX = 'palm_heights_erp_v1_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

export const SocietyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => loadStorage('role', 'admin'));
  const [allResidents] = useState<ResidentUser[]>(INITIAL_RESIDENTS);
  const [currentResident, setCurrentResident] = useState<ResidentUser>(() => loadStorage('resident', INITIAL_RESIDENTS[0]));

  const [flats, setFlats] = useState<FlatRecord[]>(() => loadStorage('flats', INITIAL_FLATS));
  const [visitors, setVisitors] = useState<Visitor[]>(() => loadStorage('visitors', INITIAL_VISITORS));
  const [bills, setBills] = useState<MaintenanceBill[]>(() => loadStorage('bills', INITIAL_BILLS));
  const [complaints, setComplaints] = useState<Complaint[]>(() => loadStorage('complaints', INITIAL_COMPLAINTS));
  const [amenities, setAmenities] = useState<Amenity[]>(() => loadStorage('amenities', INITIAL_AMENITIES));
  const [bookings, setBookings] = useState<AmenityBooking[]>(() => loadStorage('bookings', INITIAL_BOOKINGS));
  const [notices, setNotices] = useState<Notice[]>(() => loadStorage('notices', INITIAL_NOTICES));
  const [polls, setPolls] = useState<CommunityPoll[]>(() => loadStorage('polls', INITIAL_POLLS));
  const [staff, setStaff] = useState<StaffMember[]>(() => loadStorage('staff', INITIAL_STAFF));
  const [domesticWorkers, setDomesticWorkers] = useState<DomesticWorker[]>(() => loadStorage('domesticWorkers', INITIAL_DOMESTIC_WORKERS));
  const [sosAlerts, setSosAlerts] = useState<EmergencySOS[]>(() => loadStorage('sosAlerts', []));
  const [emailLogs, setEmailLogs] = useState<BillEmailLog[]>(() => loadStorage('emailLogs', []));

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage
  useEffect(() => { saveStorage('role', currentRole); }, [currentRole]);
  useEffect(() => { saveStorage('resident', currentResident); }, [currentResident]);
  useEffect(() => { saveStorage('flats', flats); }, [flats]);
  useEffect(() => { saveStorage('visitors', visitors); }, [visitors]);
  useEffect(() => { saveStorage('bills', bills); }, [bills]);
  useEffect(() => { saveStorage('complaints', complaints); }, [complaints]);
  useEffect(() => { saveStorage('amenities', amenities); }, [amenities]);
  useEffect(() => { saveStorage('bookings', bookings); }, [bookings]);
  useEffect(() => { saveStorage('notices', notices); }, [notices]);
  useEffect(() => { saveStorage('polls', polls); }, [polls]);
  useEffect(() => { saveStorage('staff', staff); }, [staff]);
  useEffect(() => { saveStorage('domesticWorkers', domesticWorkers); }, [domesticWorkers]);
  useEffect(() => { saveStorage('sosAlerts', sosAlerts); }, [sosAlerts]);
  useEffect(() => { saveStorage('emailLogs', emailLogs); }, [emailLogs]);

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

  // Helper to generate a 6-digit gate passcode
  const generatePassCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const preApproveVisitor = (data: Omit<Visitor, 'id' | 'passCode' | 'createdAt' | 'status'>): Visitor => {
    const newVisitor: Visitor = {
      ...data,
      id: `vis-${Date.now()}`,
      passCode: generatePassCode(),
      status: 'expected',
      createdAt: new Date().toISOString()
    };
    setVisitors(prev => [newVisitor, ...prev]);
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

    addToast('success', 'Gate Entry Allowed', `${updated.visitorName} checked in to Flat ${updated.flatNumber} via ${updated.entryGate}.`);
    return { success: true, visitor: updated, message: `Check-in approved for ${updated.visitorName}.` };
  };

  const checkInVisitor = (id: string, gate: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'in_campus',
          checkInTime: nowTime,
          entryGate: gate || 'Main Gate 1'
        };
      }
      return v;
    }));
    addToast('info', 'Check-In Confirmed', 'Visitor status marked as inside campus.');
  };

  const checkOutVisitor = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'checked_out',
          checkOutTime: nowTime
        };
      }
      return v;
    }));
    addToast('info', 'Exit Logged', 'Visitor marked checked out of society.');
  };

  const denyVisitor = (id: string, notes?: string) => {
    setVisitors(prev => prev.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'denied',
          notes: notes || 'Denied by gate security'
        };
      }
      return v;
    }));
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

    const newVisitor: Visitor = {
      id: `vis-${Date.now()}`,
      visitorName: data.visitorName,
      phone: data.phone,
      visitorType: data.visitorType,
      flatNumber: data.flatNumber,
      hostName: host,
      passCode: generatePassCode(),
      company: data.company,
      purpose: data.purpose,
      vehicleNumber: data.vehicleNumber,
      expectedDate: new Date().toISOString().split('T')[0],
      status: 'in_campus',
      checkInTime: nowTime,
      entryGate: data.gate || 'Main Gate 1',
      createdAt: new Date().toISOString()
    };

    setVisitors(prev => [newVisitor, ...prev]);
    addToast('success', 'Walk-in Visitor Logged', `${newVisitor.visitorName} approved for Flat ${newVisitor.flatNumber}.`);
    return newVisitor;
  };

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

    setBills(prev => {
      const updated = prev.map(b => {
        if (b.id === billId) {
          targetFlat = b.flatNumber;
          const currentPaid = b.paidAmount ?? (b.status === 'paid' ? b.amount : 0);
          const currentRemaining = b.remainingAmount !== undefined ? b.remainingAmount : Math.max(0, b.amount - currentPaid);

          // If customAmount specified, pay that much (capped at current remaining); otherwise pay remaining in full
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

          return {
            ...b,
            status: finalStatus,
            paidAmount: newPaid,
            remainingAmount: remainingAmount,
            paidAt: today,
            paymentMethod: paymentMethod || 'UPI',
            transactionId: txnId,
            receiptNumber: recNo,
            payments: [...(b.payments || []), newTransaction]
          };
        }
        return b;
      });

      // Update the flat's remaining maintenance dues
      if (targetFlat) {
        const flatPendingTotal = updated
          .filter(b => b.flatNumber === targetFlat && b.status !== 'paid')
          .reduce((sum, b) => {
            const rem = b.remainingAmount !== undefined ? b.remainingAmount : b.amount;
            return sum + rem;
          }, 0);

        setFlats(fPrev => fPrev.map(f => {
          if (f.flatNumber === targetFlat) {
            return { ...f, maintenanceDue: flatPendingTotal };
          }
          return f;
        }));
      }

      return updated;
    });

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
    setFlats(prev => prev.map(f => f.flatNumber === flatNumber ? { ...f, maintenanceDue: f.maintenanceDue + amount } : f));
    addToast('info', 'Invoice Raised', `New bill for Flat ${flatNumber} generated.`);
  };

  const sendBillEmail = async (
    billId: string,
    recipientEmail: string,
    customMessage?: string,
    subject?: string
  ): Promise<{ success: boolean; message: string; log: BillEmailLog }> => {
    await new Promise(resolve => setTimeout(resolve, 600));

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
      id: `email-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
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
    await new Promise(resolve => setTimeout(resolve, 800));

    const pendingBills = bills.filter(b => b.status === 'pending' || b.status === 'overdue' || b.status === 'partially_paid');
    const todayDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newLogs: BillEmailLog[] = [];

    pendingBills.forEach(b => {
      const resident = allResidents.find(r => r.flatNumber === b.flatNumber);
      const email = resident?.email || `${b.flatNumber.toLowerCase()}@palmheights.residency.org`;
      const remaining = b.remainingAmount !== undefined ? b.remainingAmount : b.amount;

      newLogs.push({
        id: `email-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        billId: b.id,
        flatNumber: b.flatNumber,
        recipientEmail: email,
        recipientName: b.residentName,
        subject: `[Maintenance Notice] Pending Dues of ₹${remaining.toLocaleString('en-IN')} - Unit ${b.flatNumber}`,
        sentAt: todayDate,
        type: b.status === 'partially_paid' ? 'reminder' : 'invoice',
        amount: b.amount,
        remainingAmount: remaining,
        status: 'delivered'
      });
    });

    setEmailLogs(prev => [...newLogs, ...prev]);

    setBills(prev => prev.map(b => {
      if (b.status === 'pending' || b.status === 'overdue' || b.status === 'partially_paid') {
        const resident = allResidents.find(r => r.flatNumber === b.flatNumber);
        return {
          ...b,
          lastEmailedAt: todayDate,
          lastEmailedTo: resident?.email || `${b.flatNumber.toLowerCase()}@palmheights.residency.org`
        };
      }
      return b;
    }));

    addToast('success', 'Bulk Invoices Sent', `Dispatched emails to ${pendingBills.length} units with outstanding dues.`);
    return {
      count: pendingBills.length,
      message: `Sent reminders to ${pendingBills.length} units.`
    };
  };

  const createComplaint = (data: {
    flatNumber: string;
    residentName: string;
    residentPhone: string;
    category: Complaint['category'];
    priority: Complaint['priority'];
    title: string;
    description: string;
  }): Complaint => {
    const tktNum = `TKT-2026-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const newTicket: Complaint = {
      id: `comp-${Date.now()}`,
      ticketNumber: tktNum,
      ...data,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      comments: [
        {
          id: `c-${Date.now()}`,
          authorName: data.residentName,
          authorRole: 'resident',
          text: data.description,
          createdAt: now
        }
      ]
    };

    setComplaints(prev => [newTicket, ...prev]);
    addToast('success', 'Ticket Raised', `Helpdesk ticket ${tktNum} lodged. Facility team notified.`);
    return newTicket;
  };

  const updateComplaintStatus = (id: string, status: Complaint['status'], resolutionNotes?: string) => {
    const now = new Date().toISOString();
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          updatedAt: now,
          ...(status === 'resolved' || status === 'closed' ? { resolvedAt: now, resolutionNotes } : {})
        };
      }
      return c;
    }));
    addToast('info', 'Ticket Updated', `Complaint status transitioned to ${status.replace('_', ' ')}.`);
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
          updatedAt: now,
          comments: [
            ...c.comments,
            {
              id: `c-${Date.now()}`,
              authorName: 'Helpdesk Admin',
              authorRole: 'admin',
              text: `Assigned task to technician ${staffName}.`,
              createdAt: now
            }
          ]
        };
      }
      return c;
    }));
    addToast('success', 'Staff Assigned', `Assigned complaint to ${staffName}.`);
  };

  const addComplaintComment = (id: string, text: string) => {
    const authorName = currentRole === 'resident' ? currentResident.name : currentRole === 'admin' ? 'Management Office' : 'Operations Desk';
    const now = new Date().toISOString();

    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          updatedAt: now,
          comments: [
            ...c.comments,
            {
              id: `c-${Date.now()}`,
              authorName,
              authorRole: currentRole,
              text,
              createdAt: now
            }
          ]
        };
      }
      return c;
    }));
  };

  const rateComplaint = (id: string, rating: number) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, rating, status: 'closed' } : c));
    addToast('success', 'Thank You!', `Rated ${rating}/5 stars. Ticket marked closed.`);
  };

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
    const bookingRef = `BK-${data.amenityName.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: AmenityBooking = {
      id: `book-${Date.now()}`,
      ...data,
      status: 'confirmed',
      bookingRef,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    addToast('success', 'Facility Booked!', `Confirmed reservation for ${data.amenityName} (${bookingRef}).`);
    return newBooking;
  };

  const cancelAmenityBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    addToast('info', 'Booking Cancelled', 'Amenity slot has been freed.');
  };

  const createNotice = (data: Omit<Notice, 'id' | 'publishedDate'>) => {
    const newNotice: Notice = {
      ...data,
      id: `not-${Date.now()}`,
      publishedDate: new Date().toISOString().split('T')[0]
    };
    setNotices(prev => [newNotice, ...prev]);
    addToast('success', 'Notice Broadcasted', `Circular "${newNotice.title}" published to notice board.`);
  };

  const deleteNotice = (id: string) => {
    setNotices(prev => prev.filter(n => n.id !== id));
    addToast('info', 'Notice Deleted', 'Notice removed from active board.');
  };

  const togglePinNotice = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n));
  };

  const votePoll = (pollId: string, optionId: string, flatNumber: string) => {
    setPolls(prev => prev.map(p => {
      if (p.id === pollId) {
        if (p.votedFlatNumbers.includes(flatNumber)) {
          addToast('warning', 'Already Voted', `Flat ${flatNumber} has already registered a vote in this poll.`);
          return p;
        }

        const updatedOptions = p.options.map(opt => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        addToast('success', 'Vote Casted', 'Your response has been recorded.');

        return {
          ...p,
          options: updatedOptions,
          totalVotes: p.totalVotes + 1,
          votedFlatNumbers: [...p.votedFlatNumbers, flatNumber]
        };
      }
      return p;
    }));
  };

  const createPoll = (data: { title: string; description: string; options: string[]; expiresAt: string }) => {
    const newPoll: CommunityPoll = {
      id: `poll-${Date.now()}`,
      title: data.title,
      description: data.description,
      options: data.options.map((optText, index) => ({
        id: `opt-${Date.now()}-${index}`,
        text: optText,
        votes: 0
      })),
      totalVotes: 0,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
      votedFlatNumbers: []
    };
    setPolls(prev => [newPoll, ...prev]);
    addToast('success', 'Poll Launched', `Society poll launched for voting.`);
  };

  const toggleStaffStatus = (staffId: string) => {
    setStaff(prev => prev.map(s => {
      if (s.id === staffId) {
        const nextStatus = s.status === 'on_duty' ? 'off_duty' : 'on_duty';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const toggleDomesticWorkerPunch = (id: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDomesticWorkers(prev => prev.map(w => {
      if (w.id === id) {
        const nextState = !w.isInside;
        return {
          ...w,
          isInside: nextState,
          lastPunch: nextState ? `${nowTime} (Entered)` : `${nowTime} (Exited)`
        };
      }
      return w;
    }));
    addToast('info', 'Gate Punch Recorded', 'Domestic staff biometric log updated.');
  };

  const triggerSOS = (type: EmergencySOS['type'], flatNumber: string, residentName: string, phone: string, notes?: string) => {
    const newSOS: EmergencySOS = {
      id: `sos-${Date.now()}`,
      flatNumber,
      residentName,
      phone,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'active',
      notes
    };
    setSosAlerts(prev => [newSOS, ...prev]);
    addToast('error', 'EMERGENCY SOS BROADCASTED', `CRITICAL: ${type.toUpperCase()} alert triggered from Flat ${flatNumber}! Security dispatched.`);
  };

  const resolveSOS = (id: string, responderName: string) => {
    setSosAlerts(prev => prev.map(s => s.id === id ? { ...s, status: 'resolved', respondedBy: responderName } : s));
    addToast('success', 'SOS Resolved', `Emergency marked resolved by ${responderName}.`);
  };

  const resetToDemoData = () => {
    setFlats(INITIAL_FLATS);
    setVisitors(INITIAL_VISITORS);
    setBills(INITIAL_BILLS);
    setComplaints(INITIAL_COMPLAINTS);
    setAmenities(INITIAL_AMENITIES);
    setBookings(INITIAL_BOOKINGS);
    setNotices(INITIAL_NOTICES);
    setPolls(INITIAL_POLLS);
    setStaff(INITIAL_STAFF);
    setDomesticWorkers(INITIAL_DOMESTIC_WORKERS);
    setSosAlerts([]);
    setCurrentResident(INITIAL_RESIDENTS[0]);
    setCurrentRole('admin');

    localStorage.clear();
    addToast('info', 'Demo Data Reset', 'Application has been reset to original factory demo state.');
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
        toasts,
        addToast,
        removeToast,
        preApproveVisitor,
        checkInVisitorByCode,
        checkInVisitor,
        checkOutVisitor,
        denyVisitor,
        registerWalkInVisitor,
        payMaintenanceBill,
        generateSocietyBill,
        emailLogs,
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
