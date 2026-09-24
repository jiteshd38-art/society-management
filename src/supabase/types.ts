import {
  UserRole,
  ResidentUser,
  Visitor,
  MaintenanceBill,
  PaymentTransaction,
  Complaint,
  Amenity,
  AmenityBooking,
  Notice,
  CommunityPoll,
  StaffMember,
  DomesticWorker,
  EmergencySOS,
  FlatRecord,
  BillEmailLog
} from '../types/society';

export interface EmergencyContact {
  id: string;
  label: string;
  phone: string;
  intercom: string;
  available: string;
}

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  flat_number: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Database schema table interfaces
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: SupabaseProfile;
        Insert: Partial<SupabaseProfile> & { id: string; email: string };
        Update: Partial<SupabaseProfile>;
      };
      flats: {
        Row: {
          flat_number: string;
          block: string;
          floor: number;
          owner_name: string;
          occupant_type: 'Owner' | 'Tenant' | 'Vacant';
          contact: string;
          intercom: string;
          members_count: number;
          maintenance_due: number;
          created_at: string;
        };
      };
      residents: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          flat_number: string;
          block: string;
          role: 'owner' | 'tenant';
          intercom: string;
          vehicles: any;
          domestic_staff_ids: string[];
          created_at: string;
        };
      };
      visitors: {
        Row: {
          id: string;
          visitor_name: string;
          phone: string;
          visitor_type: Visitor['visitorType'];
          flat_number: string;
          host_name: string;
          pass_code: string;
          company: string | null;
          purpose: string;
          vehicle_number: string | null;
          expected_date: string;
          status: Visitor['status'];
          check_in_time: string | null;
          check_out_time: string | null;
          entry_gate: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      maintenance_bills: {
        Row: {
          id: string;
          flat_number: string;
          resident_name: string;
          month: string;
          due_date: string;
          amount: number;
          paid_amount: number;
          remaining_amount: number;
          breakup: any;
          status: MaintenanceBill['status'];
          paid_at: string | null;
          payment_method: string | null;
          transaction_id: string | null;
          receipt_number: string | null;
          payments: any;
          last_emailed_at: string | null;
          last_emailed_to: string | null;
          created_at: string;
        };
      };
      complaints: {
        Row: {
          id: string;
          ticket_number: string;
          flat_number: string;
          resident_name: string;
          resident_phone: string;
          category: Complaint['category'];
          priority: Complaint['priority'];
          title: string;
          description: string;
          status: Complaint['status'];
          assigned_staff_id: string | null;
          assigned_staff_name: string | null;
          resolved_at: string | null;
          resolution_notes: string | null;
          rating: number | null;
          comments: any;
          created_at: string;
          updated_at: string;
        };
      };
      amenities: {
        Row: {
          id: string;
          name: string;
          category: Amenity['category'];
          description: string;
          capacity: number;
          open_hours: string;
          price_per_hour: number;
          location: string;
          icon_name: string;
          image_url: string;
          available_slots: any;
          rules: any;
          created_at: string;
        };
      };
      amenity_bookings: {
        Row: {
          id: string;
          amenity_id: string;
          amenity_name: string;
          flat_number: string;
          resident_name: string;
          resident_phone: string;
          date: string;
          slot: string;
          guests_count: number;
          total_cost: number;
          status: AmenityBooking['status'];
          booking_ref: string;
          created_at: string;
        };
      };
      notices: {
        Row: {
          id: string;
          title: string;
          content: string;
          category: Notice['category'];
          is_pinned: boolean;
          published_date: string;
          author_name: string;
          author_role: string;
          target_blocks: any;
          created_at: string;
        };
      };
      community_polls: {
        Row: {
          id: string;
          title: string;
          description: string;
          options: any;
          total_votes: number;
          expires_at: string;
          voted_flat_numbers: any;
          created_at: string;
        };
      };
      staff_members: {
        Row: {
          id: string;
          name: string;
          role_title: string;
          category: StaffMember['category'];
          phone: string;
          shift: StaffMember['shift'];
          status: StaffMember['status'];
          assigned_complaints_count: number;
          rating: number;
          created_at: string;
        };
      };
      domestic_workers: {
        Row: {
          id: string;
          name: string;
          role: DomesticWorker['role'];
          phone: string;
          pass_id: string;
          flats_assigned: any;
          is_inside: boolean;
          last_punch: string | null;
          verified: boolean;
          created_at: string;
        };
      };
      emergency_sos: {
        Row: {
          id: string;
          flat_number: string;
          resident_name: string;
          phone: string;
          type: EmergencySOS['type'];
          timestamp: string;
          status: EmergencySOS['status'];
          responded_by: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      bill_email_logs: {
        Row: {
          id: string;
          bill_id: string;
          flat_number: string;
          recipient_email: string;
          recipient_name: string;
          subject: string;
          sent_at: string;
          type: BillEmailLog['type'];
          amount: number;
          remaining_amount: number;
          status: BillEmailLog['status'];
          created_at: string;
        };
      };
      emergency_contacts: {
        Row: EmergencyContact;
      };
    };
  };
}
