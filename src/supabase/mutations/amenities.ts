import { supabase, isSupabaseConfigured } from '../client';
import { AmenityBooking } from '../../types/society';

export async function createAmenityBooking(
  data: Omit<AmenityBooking, 'id' | 'status' | 'bookingRef' | 'createdAt'>
): Promise<AmenityBooking> {
  const id = `bkg-${Date.now()}`;
  const now = new Date().toISOString();
  const bookingRef = `PH-${Math.floor(1000 + Math.random() * 9000)}`;

  const newBooking: AmenityBooking = {
    ...data,
    id,
    bookingRef,
    status: 'confirmed',
    createdAt: now
  };

  if (!isSupabaseConfigured) {
    return newBooking;
  }

  try {
    const row = {
      id: newBooking.id,
      amenity_id: newBooking.amenityId,
      amenity_name: newBooking.amenityName,
      flat_number: newBooking.flatNumber,
      resident_name: newBooking.residentName,
      resident_phone: newBooking.residentPhone,
      date: newBooking.date,
      slot: newBooking.slot,
      guests_count: newBooking.guestsCount,
      total_cost: newBooking.totalCost,
      status: newBooking.status,
      booking_ref: newBooking.bookingRef,
      created_at: now
    };

    const { error } = await supabase.from('amenity_bookings').insert([row]);
    if (error) {
      console.warn('Supabase create amenity booking notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (createAmenityBooking):', err?.message || err);
  }

  return newBooking;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await supabase
      .from('amenity_bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);

    if (error) {
      console.warn('Supabase cancel booking notice:', error.message);
    }
  } catch (err: any) {
    console.warn('Supabase mutation error (cancelBooking):', err?.message || err);
  }
}
