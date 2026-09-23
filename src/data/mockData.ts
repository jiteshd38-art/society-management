import {
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
  FlatRecord
} from '../types/society';

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
      { id: 'v-3', type: 'car', model: 'Hyundai Creta (Black)', registrationNumber: 'MH 02 DX 7710', parkingSlot: 'B2-12' }
    ],
    domesticStaffIds: ['dom-2']
  },
  {
    id: 'res-3',
    name: 'Vikram & Sunita Deshmukh',
    email: 'deshmukh.vikram@example.com',
    phone: '+91 99302 88471',
    flatNumber: 'C-104',
    block: 'Tower C',
    role: 'owner',
    intercom: '3104',
    vehicles: [
      { id: 'v-4', type: 'car', model: 'Toyota Fortuner', registrationNumber: 'MH 02 BW 1109', parkingSlot: 'B1-05' },
      { id: 'v-5', type: 'car', model: 'Tesla Model 3', registrationNumber: 'MH 02 EV 3312', parkingSlot: 'B1-06' }
    ],
    domesticStaffIds: ['dom-1', 'dom-4']
  }
];

export const INITIAL_FLATS: FlatRecord[] = [
  { flatNumber: 'A-101', block: 'Tower A', floor: 1, ownerName: 'Ramesh Patel', occupantType: 'Owner', contact: '+91 98111 22334', intercom: '1101', membersCount: 4, maintenanceDue: 0 },
  { flatNumber: 'A-201', block: 'Tower A', floor: 2, ownerName: 'Meera Nambiar', occupantType: 'Tenant', contact: '+91 98222 33445', intercom: '1201', membersCount: 2, maintenanceDue: 3500 },
  { flatNumber: 'A-302', block: 'Tower A', floor: 3, ownerName: 'Anand Kulkarni', occupantType: 'Owner', contact: '+91 98333 44556', intercom: '1302', membersCount: 3, maintenanceDue: 0 },
  { flatNumber: 'A-402', block: 'Tower A', floor: 4, ownerName: 'Aditya Sharma', occupantType: 'Owner', contact: '+91 98201 44521', intercom: '1402', membersCount: 3, maintenanceDue: 4200 },
  { flatNumber: 'A-501', block: 'Tower A', floor: 5, ownerName: 'Farhan Zaidi', occupantType: 'Owner', contact: '+91 98444 55667', intercom: '1501', membersCount: 4, maintenanceDue: 0 },
  { flatNumber: 'B-204', block: 'Tower B', floor: 2, ownerName: 'Dr. Suresh Sen', occupantType: 'Owner', contact: '+91 98555 66778', intercom: '2204', membersCount: 2, maintenanceDue: 0 },
  { flatNumber: 'B-502', block: 'Tower B', floor: 5, ownerName: 'Geeta Agarwal', occupantType: 'Tenant', contact: '+91 98666 77889', intercom: '2502', membersCount: 3, maintenanceDue: 7000 },
  { flatNumber: 'B-801', block: 'Tower B', floor: 8, ownerName: 'Priya Mukherjee', occupantType: 'Owner', contact: '+91 98450 11982', intercom: '2801', membersCount: 2, maintenanceDue: 0 },
  { flatNumber: 'C-104', block: 'Tower C', floor: 1, ownerName: 'Vikram Deshmukh', occupantType: 'Owner', contact: '+91 99302 88471', intercom: '3104', membersCount: 5, maintenanceDue: 0 },
  { flatNumber: 'C-303', block: 'Tower C', floor: 3, ownerName: 'Kunal Malhotra', occupantType: 'Owner', contact: '+91 98777 88990', intercom: '3303', membersCount: 3, maintenanceDue: 0 },
  { flatNumber: 'C-602', block: 'Tower C', floor: 6, ownerName: 'Tanvi Joshi', occupantType: 'Tenant', contact: '+91 98888 99001', intercom: '3602', membersCount: 1, maintenanceDue: 1500 },
  { flatNumber: 'D-201', block: 'Tower D', floor: 2, ownerName: 'Rajinder Gill', occupantType: 'Owner', contact: '+91 98999 00112', intercom: '4201', membersCount: 4, maintenanceDue: 0 },
  { flatNumber: 'D-404', block: 'Tower D', floor: 4, ownerName: 'Sanjay Reddy', occupantType: 'Owner', contact: '+91 99000 11223', intercom: '4404', membersCount: 4, maintenanceDue: 8400 },
  { flatNumber: 'D-701', block: 'Tower D', floor: 7, ownerName: 'David Christopher', occupantType: 'Owner', contact: '+91 99111 22334', intercom: '4701', membersCount: 2, maintenanceDue: 0 },
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'vis-1',
    visitorName: 'Rajesh Kumar',
    phone: '+91 98190 23412',
    visitorType: 'delivery',
    flatNumber: 'A-402',
    hostName: 'Aditya Sharma',
    passCode: '482910',
    company: 'Amazon Prime',
    purpose: 'Package delivery (OTP verified)',
    vehicleNumber: 'MH 02 CQ 1184',
    expectedDate: '2026-09-23',
    status: 'in_campus',
    checkInTime: '10:15 AM',
    entryGate: 'Main Gate 1',
    createdAt: '2026-09-23T09:40:00Z'
  },
  {
    id: 'vis-2',
    visitorName: 'Mohit Varma',
    phone: '+91 98760 54321',
    visitorType: 'guest',
    flatNumber: 'A-402',
    hostName: 'Aditya Sharma',
    passCode: '619284',
    purpose: 'Family weekend dinner & stay',
    vehicleNumber: 'MH 04 ER 8892',
    expectedDate: '2026-09-23',
    status: 'expected',
    entryGate: 'Main Gate 1',
    notes: 'Pre-approved parking space B1-Visitor-03',
    createdAt: '2026-09-23T08:00:00Z'
  },
  {
    id: 'vis-3',
    visitorName: 'Suresh (Driver)',
    phone: '+91 99201 88321',
    visitorType: 'cab',
    flatNumber: 'B-801',
    hostName: 'Priya Mukherjee',
    passCode: '105829',
    company: 'Uber Premier',
    purpose: 'Airport pickup',
    vehicleNumber: 'MH 01 AB 4901',
    expectedDate: '2026-09-23',
    status: 'checked_out',
    checkInTime: '08:45 AM',
    checkOutTime: '09:05 AM',
    entryGate: 'North Gate 2',
    createdAt: '2026-09-23T08:30:00Z'
  },
  {
    id: 'vis-4',
    visitorName: 'Ramesh (Technician)',
    phone: '+91 98111 44556',
    visitorType: 'service',
    flatNumber: 'C-104',
    hostName: 'Vikram Deshmukh',
    passCode: '827104',
    company: 'Urban Company',
    purpose: 'AC Gas Refill & Service',
    expectedDate: '2026-09-23',
    status: 'in_campus',
    checkInTime: '09:30 AM',
    entryGate: 'Service Gate 3',
    createdAt: '2026-09-23T09:00:00Z'
  },
  {
    id: 'vis-5',
    visitorName: 'Unknown Canvasser',
    phone: '+91 91234 56789',
    visitorType: 'guest',
    flatNumber: 'B-502',
    hostName: 'Geeta Agarwal',
    passCode: '000000',
    purpose: 'Commercial pamphlet distribution',
    expectedDate: '2026-09-23',
    status: 'denied',
    entryGate: 'Main Gate 1',
    notes: 'Denied entry by resident confirmation call',
    createdAt: '2026-09-23T07:50:00Z'
  }
];

export const INITIAL_BILLS: MaintenanceBill[] = [
  {
    id: 'bill-2026-09-A402',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    month: 'September 2026',
    dueDate: '2026-09-28',
    amount: 4200,
    paidAmount: 0,
    remainingAmount: 4200,
    payments: [],
    breakup: {
      maintenanceFee: 3200,
      sinkingFund: 400,
      waterCharges: 300,
      parkingCharges: 300,
      penalty: 0
    },
    status: 'pending'
  },
  {
    id: 'bill-2026-08-A402',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    month: 'August 2026',
    dueDate: '2026-08-25',
    amount: 4200,
    breakup: {
      maintenanceFee: 3200,
      sinkingFund: 400,
      waterCharges: 300,
      parkingCharges: 300,
      penalty: 0
    },
    status: 'paid',
    paidAt: '2026-08-18',
    paymentMethod: 'UPI',
    transactionId: 'UPI-984201948201',
    receiptNumber: 'REC-2026-08-042'
  },
  {
    id: 'bill-2026-09-B801',
    flatNumber: 'B-801',
    residentName: 'Priya Mukherjee',
    month: 'September 2026',
    dueDate: '2026-09-28',
    amount: 3800,
    breakup: {
      maintenanceFee: 2900,
      sinkingFund: 400,
      waterCharges: 250,
      parkingCharges: 250,
      penalty: 0
    },
    status: 'paid',
    paidAt: '2026-09-05',
    paymentMethod: 'Credit Card',
    transactionId: 'CC-TXN-7739182',
    receiptNumber: 'REC-2026-09-018'
  },
  {
    id: 'bill-2026-09-C104',
    flatNumber: 'C-104',
    residentName: 'Vikram Deshmukh',
    month: 'September 2026',
    dueDate: '2026-09-28',
    amount: 5400,
    breakup: {
      maintenanceFee: 4200,
      sinkingFund: 500,
      waterCharges: 350,
      parkingCharges: 350,
      penalty: 0
    },
    status: 'paid',
    paidAt: '2026-09-02',
    paymentMethod: 'Net Banking',
    transactionId: 'NB-HDFC-9918274',
    receiptNumber: 'REC-2026-09-003'
  },
  {
    id: 'bill-2026-08-B502',
    flatNumber: 'B-502',
    residentName: 'Geeta Agarwal',
    month: 'August 2026',
    dueDate: '2026-08-25',
    amount: 3500,
    breakup: {
      maintenanceFee: 2800,
      sinkingFund: 300,
      waterCharges: 200,
      parkingCharges: 200,
      penalty: 200
    },
    status: 'overdue'
  },
  {
    id: 'bill-2026-09-B502',
    flatNumber: 'B-502',
    residentName: 'Geeta Agarwal',
    month: 'September 2026',
    dueDate: '2026-09-28',
    amount: 3500,
    breakup: {
      maintenanceFee: 2800,
      sinkingFund: 300,
      waterCharges: 200,
      parkingCharges: 200,
      penalty: 0
    },
    status: 'pending'
  },
  {
    id: 'bill-2026-09-C602',
    flatNumber: 'C-602',
    residentName: 'Tanvi Joshi',
    month: 'September 2026',
    dueDate: '2026-09-28',
    amount: 3500,
    paidAmount: 2000,
    remainingAmount: 1500,
    breakup: {
      maintenanceFee: 2700,
      sinkingFund: 300,
      waterCharges: 250,
      parkingCharges: 250,
      penalty: 0
    },
    status: 'partially_paid',
    paidAt: '2026-09-12',
    paymentMethod: 'UPI',
    transactionId: 'TXN-90218491',
    receiptNumber: 'REC-2026-09-088',
    payments: [
      {
        id: 'pay-sample-1',
        amount: 2000,
        paidAt: '2026-09-12',
        paymentMethod: 'UPI',
        transactionId: 'TXN-90218491',
        receiptNumber: 'REC-2026-09-088',
        remainingAfter: 1500,
        notes: 'Partial installment #1'
      }
    ]
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'comp-101',
    ticketNumber: 'TKT-2026-091',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    residentPhone: '+91 98201 44521',
    category: 'plumbing',
    priority: 'high',
    title: 'Kitchen drainage pipe seep & leakage',
    description: 'Persistent water seepage under the sink cupboard affecting the main wall. Requires pipe joint re-sealing or elbow replacement.',
    status: 'assigned',
    assignedStaffId: 'stf-2',
    assignedStaffName: 'Manoj Shinde (Plumber)',
    createdAt: '2026-09-22T14:30:00Z',
    updatedAt: '2026-09-23T09:15:00Z',
    comments: [
      {
        id: 'c-1',
        authorName: 'Aditya Sharma',
        authorRole: 'resident',
        text: 'Leakage noticed yesterday evening after heavy kitchen use.',
        createdAt: '2026-09-22T14:30:00Z'
      },
      {
        id: 'c-2',
        authorName: 'Admin Desk',
        authorRole: 'admin',
        text: 'Assigned to plumber Manoj Shinde. Inspection scheduled between 2:00 PM and 4:00 PM today.',
        createdAt: '2026-09-23T09:15:00Z'
      }
    ]
  },
  {
    id: 'comp-102',
    ticketNumber: 'TKT-2026-088',
    flatNumber: 'A-302',
    residentName: 'Anand Kulkarni',
    residentPhone: '+91 98333 44556',
    category: 'lift',
    priority: 'urgent',
    title: 'Passenger Lift #2 jerky stop at 4th floor',
    description: 'Tower A lift #2 jerks abruptly before leveling at the 4th floor landing. Needs immediate sensor calibration.',
    status: 'in_progress',
    assignedStaffId: 'stf-1',
    assignedStaffName: 'Rajeev Mehta (Estate Supervisor)',
    createdAt: '2026-09-21T18:10:00Z',
    updatedAt: '2026-09-23T08:00:00Z',
    comments: [
      {
        id: 'c-3',
        authorName: 'Rajeev Mehta',
        authorRole: 'staff',
        text: 'Otis technicians called on site. Drive inverted controller being examined.',
        createdAt: '2026-09-22T11:00:00Z'
      }
    ]
  },
  {
    id: 'comp-103',
    ticketNumber: 'TKT-2026-082',
    flatNumber: 'B-801',
    residentName: 'Priya Mukherjee',
    residentPhone: '+91 98450 11982',
    category: 'electrical',
    priority: 'medium',
    title: 'Corridor motion sensor light not triggering',
    description: 'The automated LED lamp in 8th floor corridor outside 801-804 remains off in the dark.',
    status: 'resolved',
    assignedStaffId: 'stf-3',
    assignedStaffName: 'Dilip Kumar (Electrician)',
    createdAt: '2026-09-18T10:00:00Z',
    updatedAt: '2026-09-19T16:20:00Z',
    resolvedAt: '2026-09-19T16:20:00Z',
    resolutionNotes: 'PIR sensor wiring tightened and lux threshold re-calibrated. Tested working.',
    rating: 5,
    comments: [
      {
        id: 'c-4',
        authorName: 'Dilip Kumar',
        authorRole: 'staff',
        text: 'Sensor replaced with fresh Philips 12W motion detector. Problem resolved.',
        createdAt: '2026-09-19T16:20:00Z'
      }
    ]
  }
];

export const INITIAL_AMENITIES: Amenity[] = [
  {
    id: 'amenity-1',
    name: 'Clubhouse Banquet & Party Hall',
    category: 'events',
    description: 'Air-conditioned hall with 120 guest capacity, audio-visual system, pantry buffet counter, and banquet chairs.',
    capacity: 120,
    openHours: '09:00 AM - 11:00 PM',
    pricePerHour: 1500,
    location: 'Central Clubhouse, Level 1',
    iconName: 'PartyPopper',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    availableSlots: ['09:00 - 13:00', '14:00 - 18:00', '19:00 - 23:00'],
    rules: [
      'No loud music past 10:00 PM as per local council guidelines',
      'Refundable security deposit of ₹3,000 applies for catering clean-up',
      'Resident must be physically present during event'
    ]
  },
  {
    id: 'amenity-2',
    name: 'Rooftop Infinity Swimming Pool',
    category: 'wellness',
    description: 'Olympic half-length heated pool with toddler splash pool, sun loungers, and certified lifeguard on duty.',
    capacity: 25,
    openHours: '06:00 AM - 10:00 AM & 04:00 PM - 09:00 PM',
    pricePerHour: 0,
    location: 'Tower C, Terrace Floor 14',
    iconName: 'Waves',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
    availableSlots: ['06:00 - 08:00', '08:00 - 10:00', '16:00 - 18:00', '18:00 - 20:00'],
    rules: [
      'Nylon / lycra swimwear mandatory',
      'Shower before entering the pool water',
      'Children under 12 require adult guardian supervision'
    ]
  },
  {
    id: 'amenity-3',
    name: 'Indoor Badminton & Squash Arena',
    category: 'sports',
    description: 'Twin wooden synthetic floored courts with tournament standard LED floodlights and equipment rack.',
    capacity: 8,
    openHours: '06:00 AM - 10:30 PM',
    pricePerHour: 100,
    location: 'Sports Pavilion, Basement 1',
    iconName: 'Trophy',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
    availableSlots: ['06:00 - 07:00', '07:00 - 08:00', '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'],
    rules: [
      'Non-marking gum rubber sole shoes strictly required',
      'Maximum 1 hour booking per flat per day to allow fair access',
      'Turn off court lights when leaving'
    ]
  },
  {
    id: 'amenity-4',
    name: 'Sky Lounge & BBQ Terrace',
    category: 'leisure',
    description: 'Landscaped rooftop garden with electric barbecue stations, ambient lighting, and panoramic city views.',
    capacity: 35,
    openHours: '05:00 PM - 10:30 PM',
    pricePerHour: 500,
    location: 'Tower A, 15th Floor Skydeck',
    iconName: 'Flame',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    availableSlots: ['17:00 - 19:30', '20:00 - 22:30'],
    rules: [
      'Clean barbecue grill grates after usage',
      'No open charcoal fires allowed (electric stations only)',
      'Respect silence zone after 10:00 PM'
    ]
  }
];

export const INITIAL_BOOKINGS: AmenityBooking[] = [
  {
    id: 'book-1',
    amenityId: 'amenity-3',
    amenityName: 'Indoor Badminton & Squash Arena',
    flatNumber: 'A-402',
    residentName: 'Aditya Sharma',
    residentPhone: '+91 98201 44521',
    date: '2026-09-24',
    slot: '18:00 - 19:00',
    guestsCount: 2,
    totalCost: 100,
    status: 'confirmed',
    bookingRef: 'BK-BADM-9821',
    createdAt: '2026-09-22T11:00:00Z'
  },
  {
    id: 'book-2',
    amenityId: 'amenity-1',
    amenityName: 'Clubhouse Banquet & Party Hall',
    flatNumber: 'C-104',
    residentName: 'Vikram Deshmukh',
    residentPhone: '+91 99302 88471',
    date: '2026-09-27',
    slot: '19:00 - 23:00',
    guestsCount: 65,
    totalCost: 6000,
    status: 'confirmed',
    bookingRef: 'BK-HALL-4412',
    createdAt: '2026-09-15T15:30:00Z'
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: 'Urgent: Overhead Water Tank Cleaning & Pipeline Sanitization',
    content: 'Please be advised that annual overhead water tank cleaning and UV chlorination for Towers A & B will be conducted on Thursday, Sept 25th between 10:00 AM and 3:00 PM. Water supply will remain paused during these hours. Please store sufficient potable water.',
    category: 'maintenance',
    isPinned: true,
    publishedDate: '2026-09-22',
    authorName: 'Estate Management Office',
    authorRole: 'Facility Head',
    targetBlocks: ['All']
  },
  {
    id: 'not-2',
    title: 'Installation of Fast EV Charging Stations in Basement 2',
    content: 'Following our recent resolution, 8 dedicated 22kW AC fast-charging points by Tata Power EZ Charge have been energized in Basement 2 near Pillar B2-40. Residents can download the EZ Charge app or scan the QR code to charge. Society RFID cards are also available at the estate office.',
    category: 'general',
    isPinned: true,
    publishedDate: '2026-09-20',
    authorName: 'Managing Committee',
    authorRole: 'Secretary',
    targetBlocks: ['All']
  },
  {
    id: 'not-3',
    title: 'Annual General Body Meeting (AGM) Notice & Financial Audit',
    content: 'The 12th Annual General Meeting of Palm Heights Co-operative Housing Society will convene on Sunday, October 11th at 10:30 AM in the Clubhouse Banquet. Key agenda: 1) Approval of FY25-26 audited accounts, 2) Lift modernization proposal, 3) Solar rooftop phase 2 expansion.',
    category: 'rules',
    isPinned: false,
    publishedDate: '2026-09-17',
    authorName: 'Ramesh Patel',
    authorRole: 'Society Chairman',
    targetBlocks: ['All']
  },
  {
    id: 'not-4',
    title: 'Society Festive Gala: Deepavali / Diwali Celebration Planning',
    content: 'Join the Cultural Sub-Committee this Saturday at 6:30 PM in the Clubhouse lounge to volunteer for food stalls, cultural dances, diya decoration competition, and eco-friendly fireworks display for our kids!',
    category: 'event',
    isPinned: false,
    publishedDate: '2026-09-15',
    authorName: 'Sunita Deshmukh',
    authorRole: 'Cultural Secretary',
    targetBlocks: ['All']
  }
];

export const INITIAL_POLLS: CommunityPoll[] = [
  {
    id: 'poll-1',
    title: 'Proposal: Convert unused lawn corner into Padel / Pickleball Court?',
    description: 'The sports committee proposes laying a high-performance synthetic acrylic pickleball court in the north corner behind Tower D. Estimated capital expenditure: ₹4.2 Lakhs funded from sinking fund surplus.',
    options: [
      { id: 'opt-1', text: 'Yes, fully support pickleball court installation', votes: 42 },
      { id: 'opt-2', text: 'No, preserve natural green lawn with open grass', votes: 19 },
      { id: 'opt-3', text: 'Prefer children sensory play equipment instead', votes: 14 }
    ],
    totalVotes: 75,
    expiresAt: '2026-10-05',
    createdAt: '2026-09-18T10:00:00Z',
    votedFlatNumbers: ['B-801', 'C-104']
  },
  {
    id: 'poll-2',
    title: 'Should society switch to 100% cashless maintenance via App Gateway?',
    description: 'Discontinuing physical cheque deposits to cut bank reconciliation delays, bounce charges, and manual bookkeeping.',
    options: [
      { id: 'opt-21', text: 'Yes, 100% digital payments only (UPI / Card / NetBanking)', votes: 88 },
      { id: 'opt-22', text: 'Keep physical cheque dropbox for senior citizens', votes: 23 }
    ],
    totalVotes: 111,
    expiresAt: '2026-09-30',
    createdAt: '2026-09-12T09:00:00Z',
    votedFlatNumbers: ['A-402', 'B-801', 'C-104', 'A-101']
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf-1',
    name: 'Rajeev Mehta',
    roleTitle: 'Estate & Facility Operations Manager',
    category: 'manager',
    phone: '+91 98200 11990',
    shift: 'General (09:00 - 18:00)',
    status: 'on_duty',
    assignedComplaintsCount: 2,
    rating: 4.9
  },
  {
    id: 'stf-2',
    name: 'Manoj Shinde',
    roleTitle: 'Senior Licensed Plumber',
    category: 'plumber',
    phone: '+91 97654 32109',
    shift: 'Day Shift (08:00 - 20:00)',
    status: 'on_duty',
    assignedComplaintsCount: 3,
    rating: 4.8
  },
  {
    id: 'stf-3',
    name: 'Dilip Kumar',
    roleTitle: 'Chief Electrician & DG Operator',
    category: 'electrician',
    phone: '+91 98901 23456',
    shift: 'Day Shift (08:00 - 20:00)',
    status: 'on_duty',
    assignedComplaintsCount: 1,
    rating: 4.7
  },
  {
    id: 'stf-4',
    name: 'Subhash Singh',
    roleTitle: 'Head Security Officer (Gate 1)',
    category: 'security',
    phone: '+91 99887 76655',
    shift: 'Day Shift (08:00 - 20:00)',
    status: 'on_duty',
    assignedComplaintsCount: 0,
    rating: 4.9
  },
  {
    id: 'stf-5',
    name: 'Santosh Yadav',
    roleTitle: 'Night Security Guard (Patrolling)',
    category: 'security',
    phone: '+91 98776 65544',
    shift: 'Night Shift (20:00 - 08:00)',
    status: 'off_duty',
    assignedComplaintsCount: 0,
    rating: 4.6
  },
  {
    id: 'stf-6',
    name: 'Gopal Krishna',
    roleTitle: 'Landscape & Arborist Head',
    category: 'gardener',
    phone: '+91 97665 54433',
    shift: 'Day Shift (08:00 - 20:00)',
    status: 'on_duty',
    assignedComplaintsCount: 0,
    rating: 4.8
  }
];

export const INITIAL_DOMESTIC_WORKERS: DomesticWorker[] = [
  {
    id: 'dom-1',
    name: 'Kavita Bai',
    role: 'House Maid',
    phone: '+91 98211 99012',
    passId: 'PASS-DOM-109',
    flatsAssigned: ['A-402', 'A-302', 'C-104'],
    isInside: true,
    lastPunch: '08:15 AM today',
    verified: true
  },
  {
    id: 'dom-2',
    name: 'Laxmi Devi',
    role: 'Cook',
    phone: '+91 98322 88123',
    passId: 'PASS-DOM-214',
    flatsAssigned: ['B-801', 'B-702'],
    isInside: true,
    lastPunch: '07:30 AM today',
    verified: true
  },
  {
    id: 'dom-3',
    name: 'Ramu Kadam',
    role: 'Car Cleaner',
    phone: '+91 98433 77234',
    passId: 'PASS-DOM-301',
    flatsAssigned: ['A-402', 'A-501', 'B-801', 'D-404'],
    isInside: false,
    lastPunch: '06:00 AM (Checked out 08:30 AM)',
    verified: true
  },
  {
    id: 'dom-4',
    name: 'Mohammad Rafiq',
    role: 'Driver',
    phone: '+91 98544 66345',
    passId: 'PASS-DOM-420',
    flatsAssigned: ['C-104'],
    isInside: true,
    lastPunch: '08:45 AM today',
    verified: true
  }
];

export const INITIAL_EMERGENCY_CONTACTS = [
  { label: 'Security Gate 1 (Main Entrance)', phone: '+91 22 2849 1001', intercom: '1001', available: '24/7' },
  { label: 'Security Gate 2 (North Gate)', phone: '+91 22 2849 1002', intercom: '1002', available: '24/7' },
  { label: 'Estate Operations Office', phone: '+91 22 2849 1000', intercom: '1000', available: '09:00 - 18:00' },
  { label: 'Emergency Lift Rescue Service', phone: '1800 200 4847', intercom: '9999', available: '24/7' },
  { label: 'Nearest Hospital (Lilavati / Hiranandani)', phone: '+91 22 2576 3300', intercom: '9111', available: '24/7 Ambulance' },
  { label: 'Local Police Station (Powai / Andheri)', phone: '100 / +91 22 2570 2690', intercom: '9100', available: '24/7' },
  { label: 'Fire Brigade Emergency Control', phone: '101 / +91 22 2307 6111', intercom: '9101', available: '24/7' }
];
