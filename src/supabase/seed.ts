import { supabase, isSupabaseConfigured } from './client';
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
  INITIAL_EMERGENCY_CONTACTS
} from './initialData';

export async function seedSupabaseDatabase(): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase project is not yet configured. Please provide your Supabase URL and Anon Key in settings.'
    };
  }

  try {
    // 1. Seed Flats
    const flatsRows = INITIAL_FLATS.map(f => ({
      flat_number: f.flatNumber,
      block: f.block,
      floor: f.floor,
      owner_name: f.ownerName,
      occupant_type: f.occupantType,
      contact: f.contact,
      intercom: f.intercom,
      members_count: f.membersCount,
      maintenance_due: f.maintenanceDue
    }));
    await supabase.from('flats').upsert(flatsRows, { onConflict: 'flat_number' });

    // 2. Seed Residents
    const residentsRows = INITIAL_RESIDENTS.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      flat_number: r.flatNumber,
      block: r.block,
      role: r.role,
      intercom: r.intercom,
      vehicles: r.vehicles,
      domestic_staff_ids: r.domesticStaffIds
    }));
    await supabase.from('residents').upsert(residentsRows, { onConflict: 'id' });

    // 3. Seed Visitors
    const visitorsRows = INITIAL_VISITORS.map(v => ({
      id: v.id,
      visitor_name: v.visitorName,
      phone: v.phone,
      visitor_type: v.visitorType,
      flat_number: v.flatNumber,
      host_name: v.hostName,
      pass_code: v.passCode,
      company: v.company || null,
      purpose: v.purpose,
      vehicle_number: v.vehicleNumber || null,
      expected_date: v.expectedDate,
      status: v.status,
      check_in_time: v.checkInTime || null,
      check_out_time: v.checkOutTime || null,
      entry_gate: v.entryGate || null,
      created_at: v.createdAt
    }));
    await supabase.from('visitors').upsert(visitorsRows, { onConflict: 'id' });

    // 4. Seed Bills
    const billsRows = INITIAL_BILLS.map(b => ({
      id: b.id,
      flat_number: b.flatNumber,
      resident_name: b.residentName,
      month: b.month,
      due_date: b.dueDate,
      amount: b.amount,
      paid_amount: b.paidAmount,
      remaining_amount: b.remainingAmount,
      breakup: b.breakup,
      status: b.status,
      paid_at: b.paidAt || null,
      payment_method: b.paymentMethod || null,
      transaction_id: b.transactionId || null,
      receipt_number: b.receiptNumber || null,
      payments: b.payments,
      last_emailed_at: b.lastEmailedAt || null,
      last_emailed_to: b.lastEmailedTo || null
    }));
    await supabase.from('maintenance_bills').upsert(billsRows, { onConflict: 'id' });

    // 5. Seed Complaints
    const complaintsRows = INITIAL_COMPLAINTS.map(c => ({
      id: c.id,
      ticket_number: c.ticketNumber,
      flat_number: c.flatNumber,
      resident_name: c.residentName,
      resident_phone: c.residentPhone,
      category: c.category,
      priority: c.priority,
      title: c.title,
      description: c.description,
      status: c.status,
      assigned_staff_id: c.assignedStaffId || null,
      assigned_staff_name: c.assignedStaffName || null,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
      resolved_at: c.resolvedAt || null,
      resolution_notes: c.resolutionNotes || null,
      rating: c.rating || null,
      comments: c.comments
    }));
    await supabase.from('complaints').upsert(complaintsRows, { onConflict: 'id' });

    // 6. Seed Amenities
    const amenitiesRows = INITIAL_AMENITIES.map(a => ({
      id: a.id,
      name: a.name,
      category: a.category,
      description: a.description,
      capacity: a.capacity,
      open_hours: a.openHours,
      price_per_hour: a.pricePerHour,
      location: a.location,
      icon_name: a.iconName,
      image_url: a.imageUrl,
      available_slots: a.availableSlots,
      rules: a.rules
    }));
    await supabase.from('amenities').upsert(amenitiesRows, { onConflict: 'id' });

    // 7. Seed Bookings
    const bookingsRows = INITIAL_BOOKINGS.map(bk => ({
      id: bk.id,
      amenity_id: bk.amenityId,
      amenity_name: bk.amenityName,
      flat_number: bk.flatNumber,
      resident_name: bk.residentName,
      resident_phone: bk.residentPhone,
      date: bk.date,
      slot: bk.slot,
      guests_count: bk.guestsCount,
      total_cost: bk.totalCost,
      status: bk.status,
      booking_ref: bk.bookingRef,
      created_at: bk.createdAt
    }));
    await supabase.from('amenity_bookings').upsert(bookingsRows, { onConflict: 'id' });

    // 8. Seed Notices
    const noticesRows = INITIAL_NOTICES.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      category: n.category,
      is_pinned: n.isPinned,
      published_date: n.publishedDate,
      author_name: n.authorName,
      author_role: n.authorRole,
      target_blocks: n.targetBlocks
    }));
    await supabase.from('notices').upsert(noticesRows, { onConflict: 'id' });

    // 9. Seed Polls
    const pollsRows = INITIAL_POLLS.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      options: p.options,
      expires_at: p.expiresAt,
      created_at: p.createdAt,
      voted_flat_numbers: p.votedFlatNumbers,
      total_votes: p.totalVotes
    }));
    await supabase.from('community_polls').upsert(pollsRows, { onConflict: 'id' });

    // 10. Seed Staff Members
    const staffRows = INITIAL_STAFF.map(s => ({
      id: s.id,
      name: s.name,
      role_title: s.roleTitle,
      category: s.category,
      phone: s.phone,
      shift: s.shift,
      status: s.status,
      assigned_complaints_count: s.assignedComplaintsCount,
      rating: s.rating
    }));
    await supabase.from('staff_members').upsert(staffRows, { onConflict: 'id' });

    // 11. Seed Domestic Workers
    const domesticRows = INITIAL_DOMESTIC_WORKERS.map(d => ({
      id: d.id,
      name: d.name,
      role: d.role,
      phone: d.phone,
      pass_id: d.passId,
      flats_assigned: d.flatsAssigned,
      is_inside: d.isInside,
      last_punch: d.lastPunch,
      verified: d.verified
    }));
    await supabase.from('domestic_workers').upsert(domesticRows, { onConflict: 'id' });

    // 12. Seed Emergency Contacts
    const ecRows = INITIAL_EMERGENCY_CONTACTS.map(e => ({
      id: e.id,
      label: e.label,
      phone: e.phone,
      intercom: e.intercom,
      available: e.available
    }));
    await supabase.from('emergency_contacts').upsert(ecRows, { onConflict: 'id' });

    return { success: true, message: 'Supabase database successfully initialized with Palm Heights society records!' };
  } catch (err: any) {
    console.error('Error seeding Supabase database:', err);
    return { success: false, message: err?.message || 'Failed to seed database' };
  }
}
