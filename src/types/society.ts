export type UserRole = 'admin' | 'resident' | 'security' | 'staff';

export interface ResidentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  flatNumber: string; // e.g. "A-402"
  block: string;      // e.g. "Tower A"
  role: 'owner' | 'tenant';
  intercom: string;
  vehicles: VehicleInfo[];
  domesticStaffIds: string[];
}

export interface VehicleInfo {
  id: string;
  type: 'car' | 'bike' | 'ev';
  model: string;
  registrationNumber: string;
  parkingSlot: string;
}

export type VisitorType = 'guest' | 'delivery' | 'cab' | 'service';
export type VisitorStatus = 'expected' | 'in_campus' | 'checked_out' | 'denied';

export interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  visitorType: VisitorType;
  flatNumber: string;
  hostName: string;
  passCode: string; // 6 digits for gate entry
  company?: string; // e.g. "Amazon", "Uber", "Urban Company"
  purpose: string;
  vehicleNumber?: string;
  expectedDate: string; // YYYY-MM-DD
  status: VisitorStatus;
  checkInTime?: string;
  checkOutTime?: string;
  entryGate?: string;
  notes?: string;
  createdAt: string;
}

export type BillStatus = 'paid' | 'pending' | 'overdue' | 'partially_paid';

export interface PaymentTransaction {
  id: string;
  amount: number;
  paidAt: string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Net Banking' | 'Cheque / Offline';
  transactionId: string;
  receiptNumber: string;
  remainingAfter: number;
  notes?: string;
}

export interface MaintenanceBill {
  id: string;
  flatNumber: string;
  residentName: string;
  month: string; // e.g. "September 2026"
  dueDate: string;
  amount: number; // Total invoiced amount
  paidAmount?: number; // Total amount paid so far across all installments
  remainingAmount?: number; // Remaining balance due (amount - paidAmount)
  breakup: {
    maintenanceFee: number;
    sinkingFund: number;
    waterCharges: number;
    parkingCharges: number;
    penalty: number;
  };
  status: BillStatus;
  paidAt?: string;
  paymentMethod?: 'UPI' | 'Credit Card' | 'Net Banking' | 'Cheque / Offline';
  transactionId?: string;
  receiptNumber?: string;
  payments?: PaymentTransaction[]; // History of all partial & full payment installments
  lastEmailedAt?: string;
  lastEmailedTo?: string;
}

export type ComplaintCategory = 'plumbing' | 'electrical' | 'lift' | 'security' | 'housekeeping' | 'carpentry' | 'other';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface ComplaintComment {
  id: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  flatNumber: string;
  residentName: string;
  residentPhone: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  title: string;
  description: string;
  status: ComplaintStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  rating?: number; // 1-5
  comments: ComplaintComment[];
}

export interface Amenity {
  id: string;
  name: string;
  category: 'sports' | 'leisure' | 'events' | 'wellness';
  description: string;
  capacity: number;
  openHours: string;
  pricePerHour: number;
  location: string;
  iconName: string;
  imageUrl: string;
  availableSlots: string[]; // ["06:00 - 08:00", "08:00 - 10:00", ...]
  rules: string[];
}

export interface AmenityBooking {
  id: string;
  amenityId: string;
  amenityName: string;
  flatNumber: string;
  residentName: string;
  residentPhone: string;
  date: string;
  slot: string;
  guestsCount: number;
  totalCost: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  bookingRef: string;
  createdAt: string;
}

export type NoticeCategory = 'general' | 'emergency' | 'maintenance' | 'event' | 'rules';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  isPinned: boolean;
  publishedDate: string;
  authorName: string;
  authorRole: string;
  targetBlocks: string[]; // ['All'] or ['Tower A', 'Tower B']
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface CommunityPoll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt: string;
  createdAt: string;
  votedFlatNumbers: string[]; // Track which flats have cast votes
}

export interface StaffMember {
  id: string;
  name: string;
  roleTitle: string; // e.g. "Senior Electrician", "Chief Guard"
  category: 'security' | 'electrician' | 'plumber' | 'gardener' | 'housekeeping' | 'manager';
  phone: string;
  shift: 'Day Shift (08:00 - 20:00)' | 'Night Shift (20:00 - 08:00)' | 'General (09:00 - 18:00)';
  status: 'on_duty' | 'off_duty' | 'on_leave';
  assignedComplaintsCount: number;
  rating: number;
}

export interface DomesticWorker {
  id: string;
  name: string;
  role: 'House Maid' | 'Cook' | 'Driver' | 'Car Cleaner' | 'Babysitter';
  phone: string;
  passId: string;
  flatsAssigned: string[];
  isInside: boolean;
  lastPunch: string;
  verified: boolean;
}

export interface EmergencySOS {
  id: string;
  flatNumber: string;
  residentName: string;
  phone: string;
  type: 'medical' | 'fire' | 'security' | 'lift_stuck';
  timestamp: string;
  status: 'active' | 'responding' | 'resolved';
  respondedBy?: string;
  notes?: string;
}

export interface FlatRecord {
  flatNumber: string;
  block: string;
  floor: number;
  ownerName: string;
  occupantType: 'Owner' | 'Tenant' | 'Vacant';
  contact: string;
  intercom: string;
  membersCount: number;
  maintenanceDue: number;
}

export interface BillEmailLog {
  id: string;
  billId: string;
  flatNumber: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  sentAt: string;
  type: 'invoice' | 'receipt' | 'reminder';
  amount: number;
  remainingAmount: number;
  status: 'sent' | 'delivered';
}

