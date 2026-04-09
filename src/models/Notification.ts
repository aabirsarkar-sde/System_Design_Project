/**
 * Notification entity — a record of a message delivered to a user.
 */
export class Notification {
  private _notificationId: string;
  private _message: string;
  private _sentAt: Date;
  private _userId: string;

  constructor(notificationId: string, message: string, userId: string) {
    this._notificationId = notificationId;
    this._message = message;
    this._userId = userId;
    this._sentAt = new Date();
  }

  /** Console-based delivery — fine for the academic project. */
  send(): void {
    console.log(`[NOTIFICATION -> ${this._userId}] ${this._message}`);
  }

  get notificationId(): string { return this._notificationId; }
  get message(): string        { return this._message; }
  get sentAt(): Date           { return this._sentAt; }
  get userId(): string         { return this._userId; }
}
