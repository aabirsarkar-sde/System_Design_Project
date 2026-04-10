import { Booking } from "../models/Booking";

/**
 * In-memory booking repository.
 */
export class BookingRepository {
  private bookings: Map<string, Booking> = new Map();

  save(booking: Booking): void {
    this.bookings.set(booking.bookingId, booking);
  }

  findById(bookingId: string): Booking | undefined {
    return this.bookings.get(bookingId);
  }

  findAll(): Booking[] {
    return Array.from(this.bookings.values());
  }

  findByUserId(userId: string): Booking[] {
    return this.findAll().filter((booking) => booking.userId === userId);
  }
}
