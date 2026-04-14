"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
/**
 * Booking links a User to a Facility on a particular date.
 */
class Booking {
    constructor(bookingId, bookingDate, userId, facilityId) {
        this._bookingId = bookingId;
        this._bookingDate = bookingDate;
        this._userId = userId;
        this._facilityId = facilityId;
        this._cancelled = false;
    }
    createBooking() {
        console.log(`Booking ${this._bookingId} created for facility ${this._facilityId}`);
    }
    cancelBooking() {
        this._cancelled = true;
        console.log(`Booking ${this._bookingId} cancelled.`);
    }
    get bookingId() { return this._bookingId; }
    get bookingDate() { return this._bookingDate; }
    get userId() { return this._userId; }
    get facilityId() { return this._facilityId; }
    get cancelled() { return this._cancelled; }
}
exports.Booking = Booking;
//# sourceMappingURL=Booking.js.map