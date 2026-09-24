import { supabase, isSupabaseConfigured } from '../client';
import { Amenity, AmenityBooking } from '../../types/society';

export async function getAmenities(): Promise<Amenity[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('amenities')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase amenities fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      capacity: Number(row.capacity),
      openHours: row.open_hours,
      pricePerHour: Number(row.price_per_hour),
      location: row.location,
      iconName: row.icon_name,
      imageUrl: row.image_url,
      availableSlots: typeof row.available_slots === 'string' ? JSON.parse(row.available_slots) : (row.available_slots || []),
      rules: typeof row.rules === 'string' ? JSON.parse(row.rules) : (row.rules || [])
    }));
  } catch (err: any) {
    console.warn('Supabase query error (amenities):', err?.message || err);
    return null;
  }
}

export async function getAmenityBookings(): Promise<AmenityBooking[] | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('amenity_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase amenity bookings fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      amenityId: row.amenity_id,
      amenityName: row.amenity_name,
      flatNumber: row.flat_number,
      residentName: row.resident_name,
      residentPhone: row.resident_phone,
      date: row.date,
      slot: row.slot,
      guestsCount: Number(row.guests_count),
      totalCost: Number(row.total_cost || row.amount || 0),
      status: row.status,
      bookingRef: row.booking_ref || row.booking_code,
      createdAt: row.created_at
    }));
  } catch (err: any) {
    console.warn('Supabase query error (amenity bookings):', err?.message || err);
    return null;
  }
}
