/**
 * Booking links a User to a Facility on a particular date.
 */
export class Booking {
  private _bookingId: string;
  private _bookingDate: Date;
  private _userId: string;
  private _facilityId: string;
  private _cancelled: boolean;

  constructor(bookingId: string, bookingDate: Date, userId: string, facilityId: string) {
    this._bookingId = bookingId;
    this._bookingDate = bookingDate;
    this._userId = userId;
    this._facilityId = facilityId;
    this._cancelled = false;
  }

  createBooking(): void {
    console.log(`Booking ${this._bookingId} created for facility ${this._facilityId}`);
  }

  cancelBooking(): void {
    this._cancelled = true;
    console.log(`Booking ${this._bookingId} cancelled.`);
  }

  get bookingId(): string  { return this._bookingId; }
  get bookingDate(): Date  { return this._bookingDate; }
  get userId(): string     { return this._userId; }
  get facilityId(): string { return this._facilityId; }
  get cancelled(): boolean { return this._cancelled; }
}
