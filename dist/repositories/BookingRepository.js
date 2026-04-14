"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
/**
 * In-memory booking repository.
 */
class BookingRepository {
    constructor() {
        this.bookings = new Map();
    }
    save(booking) {
        this.bookings.set(booking.bookingId, booking);
    }
    findById(bookingId) {
        return this.bookings.get(bookingId);
    }
    findAll() {
        return Array.from(this.bookings.values());
    }
    findByUserId(userId) {
        return this.findAll().filter((booking) => booking.userId === userId);
    }
}
exports.BookingRepository = BookingRepository;
//# sourceMappingURL=BookingRepository.js.map