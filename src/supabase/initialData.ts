import {
  FlatRecord,
  ResidentUser,
  Visitor,
  MaintenanceBill,
  Complaint,
  Amenity,
  AmenityBooking,
  Notice,
  CommunityPoll,
  StaffMember,
  DomesticWorker,
  EmergencySOS,
  BillEmailLog
} from '../types/society';
import { EmergencyContact } from './types';

export const INITIAL_FLATS: FlatRecord[] = [
  { flatNumber: 'A-101', block: 'Tower A', floor: 1, ownerName: 'Ramesh Patel', occupantType: 'Owner', contact: '+91 98111 22334', intercom: '1101', membersCount: 4, maintenanceDue: 0 },
  { flatNumber: 'A-102', block: 'Tower A', floor: 1, ownerName: 'Vacant (Unassigned)', occupantType: 'Vacant', contact: '', intercom: '1102', membersCount: 0, maintenanceDue: 0 },
  { flatNumber: 'A-201', block: 'Tower A', floor: 2, ownerName: 'Meera Nambiar', occupantType: 'Tenant', contact: '+91 98222 33445', intercom: '1201', membersCount: 2, maintenanceDue: 3500 },
  { flatNumber: 'A-301', block: 'Tower A', floor: 3, ownerName: 'Vacant (Unassigned)', occupantType: 'Vacant', contact: '', intercom: '1301', membersCount: 0, maintenanceDue: 0 },
  { flatNumber: 'A-302', block: 'Tower A', floor: 3, ownerName: 'Anand Kulkarni', occupantType: 'Owner', contact: '+91 98333 44556', intercom: '1302', membersCount: 3, maintenanceDue: 0 },
  { flatNumber: 'A-402', block: 'Tower A', floor: 4, ownerName: 'Aditya Sharma', occupantType: 'Owner', contact: '+91 98201 44521', intercom: '1402', membersCount: 3, maintenanceDue: 4200 },
  { flatNumber: 'A-501', block: 'Tower A', floor: 5, ownerName: 'Farhan Zaidi', occupantType: 'Owner', contact: '+91 98444 55667', intercom: '1501', membersCount: 4, maintenanceDue: 0 },
  { flatNumber: 'B-103', block: 'Tower B', floor: 1, ownerName: 'Vacant (Unassigned)', occupantType: 'Vacant', contact: '', intercom: '2103', membersCount: 0, maintenanceDue: 0 },
  { flatNumber: 'B-204', block: 'Tower B', floor: 2, ownerName: 'Dr. Suresh Sen', occupantType: 'Owner', contact: '+91 98555 66778', intercom: '2204', membersCount: 2, maintenanceDue: 0 },
  { flatNumber: 'B-303', block: 'Tower B', floor: 3, ownerName: 'Vacant (Unassigned)', occupantType: 'Vacant', contact: '', intercom: '2303', membersCount: 0, maintenanceDue: 0 },
  { flatNumber: 'B-502', block: 'Tower B', floor: 5, ownerName: 'Geeta Agarwal', occupantType: 'Tenant', contact: '+91 98666 77889', intercom: '2502', membersCount: 3, maintenanceDue: 7000 },
  { flatNumber: 'B-801', block: 'Tower B', floor: 8, ownerName: 'Priya Mukherjee', occupantType: 'Owner', contact: '+91 98450 11982', intercom: '2801', membersCount: 2, maintenanceDue: 0 },
  { flatNumber: 'C-104', block: 'Tower C', floor: 1, ownerName: 'Vikram Deshmukh', occupantType: 'Owner', contact: '+91 99302 88471', intercom: '3104', membersCount: 5, maintenanceDue: 0 },
  { flatNumber: 'C-202', block: 'Tower C', floor: 2, ownerName: 'Vacant (Unassigned)', occupantType: 'Vacant', contact: '', intercom: '3202', membersCount: 0, maintenanceDue: 0 },
  { flatNumber: 'C-303', block: 'Tower C', floor: 3, ownerName: 'Kunal Malhotra', occupantType: 'Owner', contact: '+91 98777 88990', intercom: '3303', membersCount: 3, maintenanceDue: 0 },
  { flatNumber: 'C-501', block: 'Tower C', floor: 5, ownerName: 'Vacant (Unassigned)', occupantType: 'Vacant', contact: '', intercom: '3501', membersCount: 0, maintenanceDue: 0 },
  { flatNumber: 'C-602', block: 'Tower C', floor: 6, ownerName: 'Tanvi Joshi', occupantType: 'Tenant', contact: '+91 98888 99001', intercom: '3602', membersCount: 1, maintenanceDue: 1500 },
  { flatNumber: 'D-102', block: 'Tower D', floor: 1, ownerName: 'Vacant (Unassigned)', occupantType: 'Vacant', contact: '', intercom: '4102', membersCount: 0, maintenanceDue: 0 },
  { flatNumber: 'D-201', block: 'Tower D', floor: 2, ownerName: 'Rajinder Gill', occupantType: 'Owner', contact: '+91 98999 00112', intercom: '4201', membersCount: 4, maintenanceDue: 0 },
  { flatNumber: 'D-404', block: 'Tower D', floor: 4, ownerName: 'Sanjay Reddy', occupantType: 'Owner', contact: '+91 99000 11223', intercom: '4404', membersCount: 4, maintenanceDue: 8400 },
  { flatNumber: 'D-701', block: 'Tower D', floor: 7, ownerName: 'David Christopher', occupantType: 'Owner', contact: '+91 99111 22334', intercom: '4701', membersCount: 2, maintenanceDue: 0 }
];

export const INITIAL_RESIDENTS: ResidentUser[] = [
  {
    id: 'res-1',
    name: 'Aditya Sharma',
    email: 'aditya.sharma@example.com',
    phone: '+91 98201 44521',
    flatNumber: 'A-402',
    block: 'Tower A',
    role: 'owner',
    intercom: '1402',
    vehicles: [
      { id: 'v-1', type: 'car', model: 'Honda City (Grey)', registrationNumber: 'MH 02 CZ 4421', parkingSlot: 'B1-24' },
      { id: 'v-2', type: 'ev', model: 'Ather 450X (White)', registrationNumber: 'MH 02 EV 9081', parkingSlot: 'B1-24A' }
    ],
    domesticStaffIds: ['dom-1', 'dom-3']
  },
  {
    id: 'res-2',
    name: 'Priya Mukherjee',
    email: 'priya.m@example.com',
    phone: '+91 98450 11982',
    flatNumber: 'B-801',
    block: 'Tower B',
    role: 'owner',
    intercom: '2801',
    vehicles: [
      { id: 'v-3', type: 'car', model: 'Hyundai Creta (Blue)', registrationNumber: 'MH 02 ER 8892', parkingSlot: 'B2-12' }
    ],
    domesticStaffIds: ['dom-2']
  },
  {
    id: 'res-3',
    name: 'Vikram Deshmukh',
    email: 'vikram.deshmukh@example.com',
    phone: '+91 99302 88471',
    flatNumber: 'C-104',
    block: 'Tower C',
    role: 'owner',
    intercom: '3104',
    vehicles: [
      { id: 'v-4', type: 'car', model: 'Toyota Innova Crysta', registrationNumber: 'MH 02 BK 1212', parkingSlot: 'B1-02' },
      { id: 'v-5', type: 'bike', model: 'Royal Enfield Hunter 350', registrationNumber: 'MH 02 EA 4410', parkingSlot: 'B1-02B' }
    ],
    domesticStaffIds: ['dom-1', 'dom-4']
  }
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'vis-1',
    visitorName: 'Rajesh Verma',
    phone: '+91 98111 99882',
    visitorType: 'guest',
    flatNumber: 'A-402',
    hostName: 'Aditya Sharma',
    passCode: '482910',
    purpose: 'Family Weekend Dinner',
    vehicleNumber: 'MH 02 AX 9801',
    expectedDate: '2026-09-24',
    status: 'in_campus',
    checkInTime: '06:45 PM',
    entryGate: 'Main Gate 1',
    notes: 'Family visit with 2 adults and 1 child',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vis-2',
    visitorName: 'Amazon Delivery - Sunil K.',
    phone: '+91 98777 44321',
    visitorType: 'delivery',
    flatNumber: 'B-801',
    hostName: 'Priya Mukherjee',
    passCode: '194820',
    company: 'Amazon India',
    purpose: 'Parcel Delivery',
    expectedDate: '2026-09-24',
    status: 'checked_out',
    checkInTime: '02:15 PM',
    checkOutTime: '02:28 PM',
    entryGate: 'Gate 2 (Courier)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'vis-3',
    visitorName: 'Urban Company - AC Technician',
    phone: '+91 99222 11004',
    visitorType: 'service',
    flatNumber: 'C-104',
    hostName: 'Vikram Deshmukh',
    passCode: '729104',
    company: 'Urban Company',
    purpose: 'Split AC Deep Cleaning & Servicing',
    expectedDate: '2026-09-25',
    status: 'expected',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_BILLS: MaintenanceBill[] = [
  {
    id: 'bill-sep-a402',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    month: 'September 2026',
    dueDate: '2026-10-05',
    amount: 4200,
    paidAmount: 0,
    remainingAmount: 4200,
    breakup: {
      maintenanceFee: 2800,
      sinkingFund: 500,
      waterCharges: 400,
      parkingCharges: 500,
      penalty: 0
    },
    status: 'pending',
    payments: []
  },
  {
    id: 'bill-aug-a402',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    month: 'August 2026',
    dueDate: '2026-09-05',
    amount: 4200,
    paidAmount: 4200,
    remainingAmount: 0,
    breakup: {
      maintenanceFee: 2800,
      sinkingFund: 500,
      waterCharges: 400,
      parkingCharges: 500,
      penalty: 0
    },
    status: 'paid',
    paidAt: '2026-09-03T14:30:00Z',
    paymentMethod: 'UPI',
    transactionId: 'UPI/20260903/PH94821',
    receiptNumber: 'RCP-2026-08-042',
    payments: [
      {
        id: 'pmt-1',
        amount: 4200,
        paidAt: '2026-09-03T14:30:00Z',
        paymentMethod: 'UPI',
        transactionId: 'UPI/20260903/PH94821',
        receiptNumber: 'RCP-2026-08-042',
        remainingAfter: 0
      }
    ],
    lastEmailedAt: '2026-09-03T14:31:00Z',
    lastEmailedTo: 'aditya.sharma@example.com'
  },
  {
    id: 'bill-sep-b801',
    flatNumber: 'B-801',
    residentName: 'Priya Mukherjee',
    month: 'September 2026',
    dueDate: '2026-10-05',
    amount: 3800,
    paidAmount: 3800,
    remainingAmount: 0,
    breakup: {
      maintenanceFee: 2600,
      sinkingFund: 500,
      waterCharges: 400,
      parkingCharges: 300,
      penalty: 0
    },
    status: 'paid',
    paidAt: '2026-09-20T11:15:00Z',
    paymentMethod: 'Net Banking',
    transactionId: 'HDFC-NB-8841920',
    receiptNumber: 'RCP-2026-09-012',
    payments: [
      {
        id: 'pmt-2',
        amount: 3800,
        paidAt: '2026-09-20T11:15:00Z',
        paymentMethod: 'Net Banking',
        transactionId: 'HDFC-NB-8841920',
        receiptNumber: 'RCP-2026-09-012',
        remainingAfter: 0
      }
    ]
  },
  {
    id: 'bill-sep-d404',
    flatNumber: 'D-404',
    residentName: 'Sanjay Reddy',
    month: 'September 2026',
    dueDate: '2026-09-15',
    amount: 8400,
    paidAmount: 0,
    remainingAmount: 8400,
    breakup: {
      maintenanceFee: 5600,
      sinkingFund: 1000,
      waterCharges: 800,
      parkingCharges: 600,
      penalty: 400
    },
    status: 'overdue',
    payments: []
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-1',
    ticketNumber: 'TKT-2026-091',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    residentPhone: '+91 98201 44521',
    category: 'plumbing',
    priority: 'high',
    title: 'Water valve leakage in master bathroom washbasin',
    description: 'Slow continuous drip from angle stopcock causing dampness and water accumulation on the cabinet floor.',
    status: 'in_progress',
    assignedStaffId: 'stf-2',
    assignedStaffName: 'Ramesh Jadhav (Plumber)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    comments: [
      {
        id: 'c-1',
        authorName: 'Aditya Sharma',
        authorRole: 'resident',
        text: 'Leak appears when pressure increases in the evening.',
        createdAt: new Date(Date.now() - 80000000).toISOString()
      },
      {
        id: 'c-2',
        authorName: 'Ramesh Jadhav',
        authorRole: 'staff',
        text: 'Inspected yesterday. Replacement rubber gasket washer needed. Scheduled fix today at 02:00 PM.',
        createdAt: new Date(Date.now() - 20000000).toISOString()
      }
    ]
  },
  {
    id: 'cmp-2',
    ticketNumber: 'TKT-2026-088',
    flatNumber: 'B-801',
    residentName: 'Priya Mukherjee',
    residentPhone: '+91 98450 11982',
    category: 'electrical',
    priority: 'medium',
    title: 'Corridor emergency light fixture tripped on 8th floor',
    description: 'The automated battery inverter light near flat 801 flickers and trips the corridor MCB.',
    status: 'assigned',
    assignedStaffId: 'stf-3',
    assignedStaffName: 'Mahesh Kumar (Electrician)',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    comments: []
  },
  {
    id: 'cmp-3',
    ticketNumber: 'TKT-2026-079',
    flatNumber: 'C-104',
    residentName: 'Vikram Deshmukh',
    residentPhone: '+91 99302 88471',
    category: 'lift',
    priority: 'urgent',
    title: 'Tower C Passenger Elevator 2 jerk on 4th floor landing',
    description: 'Noticeable shudder and delay in floor door leveling when descending from 6th to 4th floor.',
    status: 'resolved',
    assignedStaffId: 'stf-4',
    assignedStaffName: 'Anil Solanki (Manager)',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    resolvedAt: new Date(Date.now() - 172800000).toISOString(),
    resolutionNotes: 'Otis elevator service technician calibrated optical leveling switches and topped hydraulic buffer fluid.',
    rating: 5,
    comments: [
      {
        id: 'c-3',
        authorName: 'Anil Solanki',
        authorRole: 'admin',
        text: 'OEM engineer attended and safety clearance certificate obtained.',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ]
  }
];

export const INITIAL_AMENITIES: Amenity[] = [
  {
    id: 'amn-1',
    name: 'Clubhouse Badminton Court',
    category: 'sports',
    description: 'BWF standard wooden synthetic court with LED floodlights and electronic scoreboard.',
    capacity: 4,
    openHours: '06:00 AM - 10:00 PM',
    pricePerHour: 150,
    location: 'Clubhouse Ground Floor',
    iconName: 'Activity',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    availableSlots: ['06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00', '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'],
    rules: ['Non-marking gum shoes mandatory', 'Maximum 4 players per court booking']
  },
  {
    id: 'amn-2',
    name: 'Infinity Swimming Pool & Kids Splash',
    category: 'wellness',
    description: 'Temperature-controlled 25m semi-Olympic lap pool, toddler wading pool, and sun deck.',
    capacity: 25,
    openHours: '06:30 AM - 09:30 PM (Closed Mondays for filtration)',
    pricePerHour: 0,
    location: 'Rooftop Terrace (Tower B)',
    iconName: 'Waves',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80',
    availableSlots: ['06:30 - 08:00', '08:00 - 09:30', '16:00 - 17:30', '17:30 - 19:00'],
    rules: ['Nylon swimsuits and silicon caps mandatory', 'Children under 10 must have adult supervision']
  },
  {
    id: 'amn-3',
    name: 'Grand Celebration Banquet Hall',
    category: 'events',
    description: 'Central air-conditioned multi-purpose hall with audio system, stage, and catering pantry.',
    capacity: 120,
    openHours: '10:00 AM - 11:00 PM',
    pricePerHour: 2500,
    location: 'Ground Pavilion',
    iconName: 'Sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80',
    availableSlots: ['10:00 - 14:00', '14:00 - 18:00', '18:00 - 23:00'],
    rules: ['Loud music must cease by 10:00 PM', 'Pre-cleaning check required']
  },
  {
    id: 'amn-4',
    name: 'Executive Co-working Lounge',
    category: 'events',
    description: 'High-speed fiber Wi-Fi, ergonomic chairs, individual study carrels, and coffee bar.',
    capacity: 18,
    openHours: '08:00 AM - 10:00 PM',
    pricePerHour: 0,
    location: 'Clubhouse Level 1',
    iconName: 'Building2',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    availableSlots: ['08:00 - 12:00', '13:00 - 17:00', '17:00 - 21:00'],
    rules: ['Keep phone conversations in phone booth', 'No open food at workstation desks']
  }
];

export const INITIAL_BOOKINGS: AmenityBooking[] = [
  {
    id: 'bok-1',
    amenityId: 'amn-1',
    amenityName: 'Clubhouse Badminton Court',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    residentPhone: '+91 98201 44521',
    date: '2026-09-25',
    slot: '19:00 - 20:00',
    guestsCount: 2,
    totalCost: 150,
    status: 'confirmed',
    bookingRef: 'BK-BADM-902',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'Scheduled Overhead Water Tank Cleaning - Tower A & B',
    content: 'Water supply will be suspended on Saturday between 10:00 AM and 03:00 PM for mandatory chemical scrubbing of the rooftop storage reservoirs. Please store necessary water beforehand.',
    category: 'maintenance',
    isPinned: true,
    publishedDate: '2026-09-24',
    authorName: 'Estate Manager',
    authorRole: 'Admin MC',
    targetBlocks: ['Tower A', 'Tower B']
  },
  {
    id: 'not-2',
    title: 'Annual General Meeting (AGM) 2026 & Financial Audit Review',
    content: 'The 8th Annual General Body Meeting of Palm Heights Cooperative Housing Society will be held at the Main Clubhouse on Sunday, October 11th at 10:30 AM. Attendance by all registered owners requested.',
    category: 'general',
    isPinned: true,
    publishedDate: '2026-09-22',
    authorName: 'Secretary',
    authorRole: 'Admin MC',
    targetBlocks: ['All']
  },
  {
    id: 'not-3',
    title: 'EV 2-Wheeler and 4-Wheeler Charging Bay Installation Drive',
    content: 'Management Committee invites applications from EV owners wishing to link dedicated sub-meters to the central basement charging distribution box. Subsidized tariff applies.',
    category: 'maintenance',
    isPinned: false,
    publishedDate: '2026-09-18',
    authorName: 'Treasurer',
    authorRole: 'Admin MC',
    targetBlocks: ['All']
  }
];

export const INITIAL_POLLS: CommunityPoll[] = [
  {
    id: 'pol-1',
    title: 'Should we install 8 dedicated high-speed DC EV Chargers in the Visitor Basement Parking?',
    description: 'Capex funded via society energy surplus reserves; usage billed per kWh on prepaid smart card.',
    options: [
      { id: 'opt-1', text: 'Yes, urgently needed', votes: 34 },
      { id: 'opt-2', text: 'Yes, but limit to 4 chargers', votes: 12 },
      { id: 'opt-3', text: 'No, explore third-party lease', votes: 4 }
    ],
    expiresAt: '2026-10-15T23:59:59Z',
    totalVotes: 50,
    createdAt: new Date().toISOString(),
    votedFlatNumbers: ['A-101', 'A-402', 'B-801', 'C-104']
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'stf-1', name: 'Dinesh Singh', roleTitle: 'Chief Security Marshal', category: 'security', phone: '+91 98210 11990', shift: 'Day Shift (08:00 - 20:00)', status: 'on_duty', assignedComplaintsCount: 0, rating: 4.9 },
  { id: 'stf-2', name: 'Ramesh Jadhav', roleTitle: 'Senior Plumber', category: 'plumber', phone: '+91 98450 77112', shift: 'General (09:00 - 18:00)', status: 'on_duty', assignedComplaintsCount: 3, rating: 4.8 },
  { id: 'stf-3', name: 'Mahesh Kumar', roleTitle: 'Certified Electrician', category: 'electrician', phone: '+91 98190 44321', shift: 'General (09:00 - 18:00)', status: 'on_duty', assignedComplaintsCount: 2, rating: 4.7 },
  { id: 'stf-4', name: 'Anil Solanki', roleTitle: 'Facility & Estate Manager', category: 'manager', phone: '+91 98200 99001', shift: 'General (09:00 - 18:00)', status: 'on_duty', assignedComplaintsCount: 0, rating: 5.0 }
];

export const INITIAL_DOMESTIC_WORKERS: DomesticWorker[] = [
  { id: 'dom-1', name: 'Sunita Bai', role: 'House Maid', phone: '+91 98700 12345', passId: 'PASS-DOM-101', flatsAssigned: ['A-402', 'C-104'], isInside: true, lastPunch: '08:15 AM (In)', verified: true },
  { id: 'dom-2', name: 'Kavita Shinde', role: 'Cook', phone: '+91 98690 54321', passId: 'PASS-DOM-102', flatsAssigned: ['B-801'], isInside: false, lastPunch: 'Yesterday 07:30 PM (Out)', verified: true },
  { id: 'dom-3', name: 'Raju Shinde', role: 'Driver', phone: '+91 98330 98765', passId: 'PASS-DOM-103', flatsAssigned: ['A-402'], isInside: true, lastPunch: '09:00 AM (In)', verified: true },
  { id: 'dom-4', name: 'Anita Gawli', role: 'Babysitter', phone: '+91 98190 88211', passId: 'PASS-DOM-104', flatsAssigned: ['C-104'], isInside: false, lastPunch: 'Yesterday 06:00 PM (Out)', verified: true }
];

export const INITIAL_SOS_ALERTS: EmergencySOS[] = [
  {
    id: 'sos-1',
    flatNumber: 'B-204',
    residentName: 'Dr. Suresh Sen',
    phone: '+91 98555 66778',
    type: 'lift_stuck',
    status: 'resolved',
    timestamp: '09:14 AM',
    notes: 'Lift stuck between 1st & 2nd floor. Security manual brake release performed safely.'
  }
];

export const INITIAL_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'ec-1', label: 'Security Gate 1 (Main Entrance)', phone: '+91 22 2849 1001', intercom: '1001', available: '24/7' },
  { id: 'ec-2', label: 'Security Gate 2 (North Gate)', phone: '+91 22 2849 1002', intercom: '1002', available: '24/7' },
  { id: 'ec-3', label: 'Estate Operations Office', phone: '+91 22 2849 1000', intercom: '1000', available: '09:00 - 18:00' },
  { id: 'ec-4', label: 'Emergency Lift Rescue Service', phone: '1800 200 4847', intercom: '9999', available: '24/7' },
  { id: 'ec-5', label: 'Nearest Hospital (Hiranandani / Lilavati)', phone: '+91 22 2576 3300', intercom: '9111', available: '24/7 Ambulance' },
  { id: 'ec-6', label: 'Local Police Station (Powai / Andheri)', phone: '100 / +91 22 2570 2690', intercom: '9100', available: '24/7' },
  { id: 'ec-7', label: 'Fire Brigade Emergency Control', phone: '101 / +91 22 2307 6111', intercom: '9101', available: '24/7' }
];

export const INITIAL_EMAIL_LOGS: BillEmailLog[] = [
  {
    id: 'eml-1',
    billId: 'bill-aug-a402',
    flatNumber: 'A-402',
    recipientEmail: 'aditya.sharma@example.com',
    recipientName: 'Aditya Sharma',
    subject: 'Palm Heights Society - Maintenance Receipt RCP-2026-08-042',
    sentAt: '2026-09-03T14:31:00Z',
    type: 'receipt',
    amount: 4200,
    remainingAmount: 0,
    status: 'sent'
  }
];
