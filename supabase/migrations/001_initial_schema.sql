-- ==============================================================================
-- Palm Heights Smart Society Management - Supabase PostgreSQL Schema & Seed Migration
-- Migration 001: Initial Schema, Row Level Security (RLS), and Society Seed Data
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES / USERS
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('admin', 'resident', 'security', 'staff')),
  flat_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FLATS (Society Units)
CREATE TABLE IF NOT EXISTS flats (
  flat_number TEXT PRIMARY KEY,
  block TEXT NOT NULL,
  floor INTEGER NOT NULL,
  owner_name TEXT NOT NULL,
  occupant_type TEXT NOT NULL CHECK (occupant_type IN ('Owner', 'Tenant', 'Vacant')),
  contact TEXT NOT NULL,
  intercom TEXT NOT NULL,
  members_count INTEGER NOT NULL DEFAULT 1,
  maintenance_due NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RESIDENTS (Directory & Resident Profiles)
CREATE TABLE IF NOT EXISTS residents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  flat_number TEXT NOT NULL REFERENCES flats(flat_number) ON DELETE CASCADE,
  block TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'tenant')),
  intercom TEXT NOT NULL,
  vehicles JSONB NOT NULL DEFAULT '[]'::jsonb,
  domestic_staff_ids TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. VISITORS & GATE PASSES
CREATE TABLE IF NOT EXISTS visitors (
  id TEXT PRIMARY KEY,
  visitor_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  visitor_type TEXT NOT NULL CHECK (visitor_type IN ('guest', 'delivery', 'cab', 'service')),
  flat_number TEXT NOT NULL,
  host_name TEXT NOT NULL,
  pass_code TEXT NOT NULL,
  company TEXT,
  purpose TEXT NOT NULL,
  vehicle_number TEXT,
  expected_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'expected' CHECK (status IN ('expected', 'in_campus', 'checked_out', 'denied')),
  check_in_time TEXT,
  check_out_time TEXT,
  entry_gate TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MAINTENANCE BILLS & INVOICES
CREATE TABLE IF NOT EXISTS maintenance_bills (
  id TEXT PRIMARY KEY,
  flat_number TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  month TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  breakup JSONB NOT NULL DEFAULT '{"maintenanceFee": 0, "sinkingFund": 0, "waterCharges": 0, "parkingCharges": 0, "penalty": 0}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'partially_paid')),
  paid_at TEXT,
  payment_method TEXT,
  transaction_id TEXT,
  receipt_number TEXT,
  payments JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_emailed_at TEXT,
  last_emailed_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. COMPLAINTS & TICKETS
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  flat_number TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  resident_phone TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('plumbing', 'electrical', 'lift', 'security', 'housekeeping', 'carpentry', 'other')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'resolved', 'closed')),
  assigned_staff_id TEXT,
  assigned_staff_name TEXT,
  resolved_at TEXT,
  resolution_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AMENITIES
CREATE TABLE IF NOT EXISTS amenities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sports', 'leisure', 'events', 'wellness')),
  description TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 10,
  open_hours TEXT NOT NULL,
  price_per_hour NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  available_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AMENITY BOOKINGS
CREATE TABLE IF NOT EXISTS amenity_bookings (
  id TEXT PRIMARY KEY,
  amenity_id TEXT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  amenity_name TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  resident_phone TEXT NOT NULL,
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  guests_count INTEGER NOT NULL DEFAULT 1,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  booking_ref TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. NOTICES & ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'emergency', 'maintenance', 'event', 'rules')),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  published_date TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  target_blocks JSONB NOT NULL DEFAULT '["All"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. COMMUNITY POLLS
CREATE TABLE IF NOT EXISTS community_polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_votes INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL,
  voted_flat_numbers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. STAFF MEMBERS
CREATE TABLE IF NOT EXISTS staff_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('security', 'electrician', 'plumber', 'gardener', 'housekeeping', 'manager')),
  phone TEXT NOT NULL,
  shift TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'on_duty' CHECK (status IN ('on_duty', 'off_duty', 'on_leave')),
  assigned_complaints_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC NOT NULL DEFAULT 5.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. DOMESTIC WORKERS (Maids, Cooks, Drivers)
CREATE TABLE IF NOT EXISTS domestic_workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('House Maid', 'Cook', 'Driver', 'Car Cleaner', 'Babysitter')),
  phone TEXT NOT NULL,
  pass_id TEXT NOT NULL UNIQUE,
  flats_assigned JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_inside BOOLEAN NOT NULL DEFAULT FALSE,
  last_punch TEXT,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. EMERGENCY SOS ALERTS
CREATE TABLE IF NOT EXISTS emergency_sos (
  id TEXT PRIMARY KEY,
  flat_number TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medical', 'fire', 'security', 'lift_stuck')),
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'responding', 'resolved')),
  responded_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. BILL EMAIL LOGS
CREATE TABLE IF NOT EXISTS bill_email_logs (
  id TEXT PRIMARY KEY,
  bill_id TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'receipt', 'reminder')),
  amount NUMERIC NOT NULL,
  remaining_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. EMERGENCY DIRECTORY CONTACTS
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  phone TEXT NOT NULL,
  intercom TEXT NOT NULL,
  available TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flats ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE domestic_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_sos ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to directory, notices, amenities, flats for authenticated and anonymous users
CREATE POLICY "Public read flats" ON flats FOR SELECT USING (true);
CREATE POLICY "Public read residents" ON residents FOR SELECT USING (true);
CREATE POLICY "Public read visitors" ON visitors FOR SELECT USING (true);
CREATE POLICY "Public insert visitors" ON visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update visitors" ON visitors FOR UPDATE USING (true);

CREATE POLICY "Public read maintenance_bills" ON maintenance_bills FOR SELECT USING (true);
CREATE POLICY "Public insert maintenance_bills" ON maintenance_bills FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update maintenance_bills" ON maintenance_bills FOR UPDATE USING (true);

CREATE POLICY "Public read complaints" ON complaints FOR SELECT USING (true);
CREATE POLICY "Public insert complaints" ON complaints FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update complaints" ON complaints FOR UPDATE USING (true);

CREATE POLICY "Public read amenities" ON amenities FOR SELECT USING (true);
CREATE POLICY "Public read amenity_bookings" ON amenity_bookings FOR SELECT USING (true);
CREATE POLICY "Public insert amenity_bookings" ON amenity_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update amenity_bookings" ON amenity_bookings FOR UPDATE USING (true);

CREATE POLICY "Public read notices" ON notices FOR SELECT USING (true);
CREATE POLICY "Public insert notices" ON notices FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update notices" ON notices FOR UPDATE USING (true);
CREATE POLICY "Public delete notices" ON notices FOR DELETE USING (true);

CREATE POLICY "Public read community_polls" ON community_polls FOR SELECT USING (true);
CREATE POLICY "Public insert community_polls" ON community_polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update community_polls" ON community_polls FOR UPDATE USING (true);

CREATE POLICY "Public read staff_members" ON staff_members FOR SELECT USING (true);
CREATE POLICY "Public update staff_members" ON staff_members FOR UPDATE USING (true);

CREATE POLICY "Public read domestic_workers" ON domestic_workers FOR SELECT USING (true);
CREATE POLICY "Public update domestic_workers" ON domestic_workers FOR UPDATE USING (true);

CREATE POLICY "Public read emergency_sos" ON emergency_sos FOR SELECT USING (true);
CREATE POLICY "Public insert emergency_sos" ON emergency_sos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update emergency_sos" ON emergency_sos FOR UPDATE USING (true);

CREATE POLICY "Public read bill_email_logs" ON bill_email_logs FOR SELECT USING (true);
CREATE POLICY "Public insert bill_email_logs" ON bill_email_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read emergency_contacts" ON emergency_contacts FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Flats
INSERT INTO flats (flat_number, block, floor, owner_name, occupant_type, contact, intercom, members_count, maintenance_due) VALUES
('A-101', 'Tower A', 1, 'Ramesh Patel', 'Owner', '+91 98111 22334', '1101', 4, 0),
('A-201', 'Tower A', 2, 'Meera Nambiar', 'Tenant', '+91 98222 33445', '1201', 2, 3500),
('A-302', 'Tower A', 3, 'Anand Kulkarni', 'Owner', '+91 98333 44556', '1302', 3, 0),
('A-402', 'Tower A', 4, 'Aditya Sharma', 'Owner', '+91 98201 44521', '1402', 3, 4200),
('A-501', 'Tower A', 5, 'Farhan Zaidi', 'Owner', '+91 98444 55667', '1501', 4, 0),
('B-204', 'Tower B', 2, 'Dr. Suresh Sen', 'Owner', '+91 98555 66778', '2204', 2, 0),
('B-502', 'Tower B', 5, 'Geeta Agarwal', 'Tenant', '+91 98666 77889', '2502', 3, 7000),
('B-801', 'Tower B', 8, 'Priya Mukherjee', 'Owner', '+91 98450 11982', '2801', 2, 0),
('C-104', 'Tower C', 1, 'Vikram Deshmukh', 'Owner', '+91 99302 88471', '3104', 5, 0),
('C-303', 'Tower C', 3, 'Kunal Malhotra', 'Owner', '+91 98777 88990', '3303', 3, 0),
('C-602', 'Tower C', 6, 'Tanvi Joshi', 'Tenant', '+91 98888 99001', '3602', 1, 1500),
('D-201', 'Tower D', 2, 'Rajinder Gill', 'Owner', '+91 98999 00112', '4201', 4, 0),
('D-404', 'Tower D', 4, 'Sanjay Reddy', 'Owner', '+91 99000 11223', '4404', 4, 8400),
('D-701', 'Tower D', 7, 'David Christopher', 'Owner', '+91 99111 22334', '4701', 2, 0)
ON CONFLICT (flat_number) DO NOTHING;

-- Seed Residents
INSERT INTO residents (id, name, email, phone, flat_number, block, role, intercom, vehicles, domestic_staff_ids) VALUES
('res-1', 'Aditya Sharma', 'aditya.sharma@example.com', '+91 98201 44521', 'A-402', 'Tower A', 'owner', '1402',
 '[{"id":"v-1","type":"car","model":"Honda City (Grey)","registrationNumber":"MH 02 CZ 4421","parkingSlot":"B1-24"},{"id":"v-2","type":"ev","model":"Ather 450X (White)","registrationNumber":"MH 02 EV 9081","parkingSlot":"B1-24A"}]'::jsonb,
 ARRAY['dom-1', 'dom-3']),
('res-2', 'Priya Mukherjee', 'priya.m@example.com', '+91 98450 11982', 'B-801', 'Tower B', 'owner', '2801',
 '[{"id":"v-3","type":"car","model":"Hyundai Creta (Black)","registrationNumber":"MH 02 DX 7710","parkingSlot":"B2-12"}]'::jsonb,
 ARRAY['dom-2']),
('res-3', 'Vikram & Sunita Deshmukh', 'deshmukh.vikram@example.com', '+91 99302 88471', 'C-104', 'Tower C', 'owner', '3104',
 '[{"id":"v-4","type":"car","model":"Toyota Fortuner","registrationNumber":"MH 02 BW 1109","parkingSlot":"B1-05"},{"id":"v-5","type":"car","model":"Tesla Model 3","registrationNumber":"MH 02 EV 3312","parkingSlot":"B1-06"}]'::jsonb,
 ARRAY['dom-1', 'dom-4'])
ON CONFLICT (id) DO NOTHING;

-- Seed Visitors
INSERT INTO visitors (id, visitor_name, phone, visitor_type, flat_number, host_name, pass_code, company, purpose, vehicle_number, expected_date, status, check_in_time, entry_gate, created_at) VALUES
('vis-1', 'Rajesh Kumar', '+91 98190 23412', 'delivery', 'A-402', 'Aditya Sharma', '482910', 'Amazon Prime', 'Package delivery (OTP verified)', 'MH 02 CQ 1184', '2026-09-24', 'in_campus', '10:15 AM', 'Main Gate 1', NOW()),
('vis-2', 'Mohit Varma', '+91 98200 87123', 'guest', 'B-801', 'Priya Mukherjee', '194820', 'Personal', 'Family weekend visit', 'MH 04 AB 9981', '2026-09-24', 'expected', NULL, NULL, NOW()),
('vis-3', 'Sunil Yadav', '+91 98711 00213', 'cab', 'C-104', 'Vikram Deshmukh', '837192', 'Uber Go', 'Airport drop pickup', 'MH 01 BY 4022', '2026-09-24', 'in_campus', '10:45 AM', 'Main Gate 1', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Maintenance Bills
INSERT INTO maintenance_bills (id, flat_number, resident_name, month, due_date, amount, paid_amount, remaining_amount, breakup, status) VALUES
('bill-101', 'A-402', 'Aditya Sharma', 'September 2026', '2026-10-05', 4200, 0, 4200, '{"maintenanceFee": 2800, "sinkingFund": 500, "waterCharges": 400, "parkingCharges": 500, "penalty": 0}'::jsonb, 'pending'),
('bill-102', 'B-801', 'Priya Mukherjee', 'September 2026', '2026-10-05', 3800, 3800, 0, '{"maintenanceFee": 2600, "sinkingFund": 400, "waterCharges": 400, "parkingCharges": 400, "penalty": 0}'::jsonb, 'paid'),
('bill-103', 'C-104', 'Vikram Deshmukh', 'September 2026', '2026-10-05', 5100, 5100, 0, '{"maintenanceFee": 3400, "sinkingFund": 600, "waterCharges": 500, "parkingCharges": 600, "penalty": 0}'::jsonb, 'paid'),
('bill-104', 'B-502', 'Geeta Agarwal', 'August 2026', '2026-09-05', 7000, 0, 7000, '{"maintenanceFee": 5200, "sinkingFund": 800, "waterCharges": 600, "parkingCharges": 400, "penalty": 0}'::jsonb, 'overdue'),
('bill-105', 'D-404', 'Sanjay Reddy', 'September 2026', '2026-10-05', 8400, 4000, 4400, '{"maintenanceFee": 6000, "sinkingFund": 1000, "waterCharges": 800, "parkingCharges": 600, "penalty": 0}'::jsonb, 'partially_paid')
ON CONFLICT (id) DO NOTHING;

-- Seed Complaints
INSERT INTO complaints (id, ticket_number, flat_number, resident_name, resident_phone, category, priority, title, description, status, assigned_staff_id, assigned_staff_name, comments) VALUES
('cmp-1', 'TKT-2409-001', 'A-402', 'Aditya Sharma', '+91 98201 44521', 'plumbing', 'high', 'Kitchen sink pipe leaking under cabinet', 'Heavy dripping sound under the main sink cabinet since last night.', 'assigned', 'stf-2', 'Ramesh Plumber', '[{"id":"c1","authorName":"Facility Helpdesk","authorRole":"staff","text":"Assigned to plumber Ramesh. ETA 2:00 PM today.","createdAt":"2026-09-24T08:30:00Z"}]'::jsonb),
('cmp-2', 'TKT-2409-002', 'B-801', 'Priya Mukherjee', '+91 98450 11982', 'electrical', 'medium', 'Corridor light fixture flickering on 8th floor', 'The ceiling tube right outside flat 801 flickers constantly.', 'open', NULL, NULL, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Amenities
INSERT INTO amenities (id, name, category, description, capacity, open_hours, price_per_hour, location, icon_name, image_url, available_slots, rules) VALUES
('amn-1', 'Clubhouse Badminton Court', 'sports', 'International grade synthetic wood court with LED glare-free floodlights.', 4, '06:00 AM - 10:00 PM', 150, 'Clubhouse Level 2', 'Trophy', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80', '["06:00 - 07:00","07:00 - 08:00","18:00 - 19:00","19:00 - 20:00","20:00 - 21:00"]'::jsonb, '["Non-marking shoes mandatory","Maximum 4 players per slot","Cancellation allowed up to 4 hrs before slot"]'::jsonb),
('amn-2', 'Skyline Swimming Pool', 'wellness', 'Half-Olympic temperature regulated swimming pool with certified lifeguard.', 25, '06:30 AM - 09:30 PM', 0, 'Terrace Deck', 'Waves', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80', '["06:30 - 08:00","08:00 - 09:30","16:30 - 18:00","18:00 - 19:30","19:30 - 21:00"]'::jsonb, '["Swimming caps and proper swimwear strictly mandatory","Children below 12 must be accompanied by adults","Shower before entering pool"]'::jsonb),
('amn-3', 'Grand Banquet & Party Hall', 'events', 'Air-conditioned acoustic hall with stage, AV sound projector, and catering pantry.', 120, '10:00 AM - 11:00 PM', 2500, 'Ground Pavilion', 'Sparkles', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80', '["10:00 - 14:00","14:00 - 18:00","18:00 - 23:00"]'::jsonb, '["Security deposit refundable post inspection","Loud music must cease by 10:00 PM as per municipal guidelines","Pre-cleaning check required"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Notices
INSERT INTO notices (id, title, content, category, is_pinned, published_date, author_name, author_role, target_blocks) VALUES
('not-1', 'Scheduled Overhead Water Tank Cleaning - Tower A & B', 'Water supply will be suspended on Saturday between 10:00 AM and 03:00 PM for mandatory chemical scrubbing of the rooftop storage reservoirs. Please store necessary water beforehand.', 'maintenance', true, '2026-09-24', 'Estate Manager', 'Admin MC', '["Tower A", "Tower B"]'::jsonb),
('not-2', 'Annual General Meeting (AGM) 2026 & Financial Audit Review', 'The 8th Annual General Body Meeting of Palm Heights Cooperative Housing Society will be held at the Main Clubhouse on Sunday, October 11th at 10:30 AM. Attendance by all registered owners requested.', 'general', true, '2026-09-22', 'Secretary', 'Admin MC', '["All"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Community Polls
INSERT INTO community_polls (id, title, description, options, total_votes, expires_at, voted_flat_numbers) VALUES
('poll-1', 'Proposal: Installation of 8 EV Fast-Charging Stations in Basement 1', 'Society is considering partnering with Tata Power to install 8 AC-001 fast EV chargers. The initial capital will be drawn from the Sinking Fund.', '[{"id":"opt-1","text":"Approve (Yes, fast-track installation)","votes":42},{"id":"opt-2","text":"Reject (Do not use Sinking Fund)","votes":8},{"id":"opt-3","text":"Need more details & solar feasibility","votes":15}]'::jsonb, 65, '2026-10-15', '["A-402","B-801"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Staff Members
INSERT INTO staff_members (id, name, role_title, category, phone, shift, status, assigned_complaints_count, rating) VALUES
('stf-1', 'Dinesh Singh', 'Chief Security Marshal', 'security', '+91 98210 11990', 'Day Shift (08:00 - 20:00)', 'on_duty', 0, 4.9),
('stf-2', 'Ramesh Jadhav', 'Senior Plumber', 'plumber', '+91 98450 77112', 'General (09:00 - 18:00)', 'on_duty', 3, 4.8),
('stf-3', 'Mahesh Kumar', 'Certified Electrician', 'electrician', '+91 98190 44321', 'General (09:00 - 18:00)', 'on_duty', 2, 4.7),
('stf-4', 'Anil Solanki', 'Facility & Estate Manager', 'manager', '+91 98200 99001', 'General (09:00 - 18:00)', 'on_duty', 0, 5.0)
ON CONFLICT (id) DO NOTHING;

-- Seed Domestic Workers
INSERT INTO domestic_workers (id, name, role, phone, pass_id, flats_assigned, is_inside, last_punch, verified) VALUES
('dom-1', 'Sunita Bai', 'House Maid', '+91 98700 12345', 'PASS-DOM-101', '["A-402", "C-104"]'::jsonb, true, '08:15 AM (In)', true),
('dom-2', 'Kavita Shinde', 'Cook', '+91 98690 54321', 'PASS-DOM-102', '["B-801"]'::jsonb, false, 'Yesterday 07:30 PM (Out)', true),
('dom-3', 'Raju Shinde', 'Driver', '+91 98330 98765', 'PASS-DOM-103', '["A-402"]'::jsonb, true, '09:00 AM (In)', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Emergency Contacts
INSERT INTO emergency_contacts (id, label, phone, intercom, available) VALUES
('ec-1', 'Security Gate 1 (Main Entrance)', '+91 22 2849 1001', '1001', '24/7'),
('ec-2', 'Security Gate 2 (North Gate)', '+91 22 2849 1002', '1002', '24/7'),
('ec-3', 'Estate Operations Office', '+91 22 2849 1000', '1000', '09:00 - 18:00'),
('ec-4', 'Emergency Lift Rescue Service', '1800 200 4847', '9999', '24/7'),
('ec-5', 'Nearest Hospital (Lilavati / Hiranandani)', '+91 22 2576 3300', '9111', '24/7 Ambulance'),
('ec-6', 'Local Police Station (Powai / Andheri)', '100 / +91 22 2570 2690', '9100', '24/7'),
('ec-7', 'Fire Brigade Emergency Control', '101 / +91 22 2307 6111', '9101', '24/7')
ON CONFLICT (id) DO NOTHING;
