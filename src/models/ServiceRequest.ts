import { User } from "./User";
import { NotificationService } from "../interfaces/NotificationService";

/**
 * ServiceRequest is the SUBJECT in the Observer pattern.
 *
 * Observers (NotificationService implementations) attach to it and
 * are notified whenever the request status changes.
 */
export class ServiceRequest {
  private _requestId: string;
  private _status: string;
  private _createdAt: Date;
  private _userId: string;

  // The user who raised the request — kept here so observers
  // know who to notify when status changes.
  private _owner: User;

  // Loose coupling via the interface.
  private observers: NotificationService[] = [];

  constructor(requestId: string, userId: string, owner: User) {
    this._requestId = requestId;
    this._userId = userId;
    this._owner = owner;
    this._status = "PENDING";
    this._createdAt = new Date();
  }

  /** Factory-style helper that mirrors the required createRequest() method. */
  static createRequest(requestId: string, owner: User): ServiceRequest {
    return new ServiceRequest(requestId, owner.userId, owner);
  }

  /**
   * Status change happens here — and this is the trigger
   * point for notifying observers.
   */
  updateStatus(newStatus: string): void {
    this._status = newStatus;
    this.notifyObservers(`Your request ${this._requestId} is now: ${newStatus}`);
  }

  // -------- Observer pattern plumbing --------

  attachObserver(observer: NotificationService): void {
    this.observers.push(observer);
  }

  detachObserver(observer: NotificationService): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notifyObservers(message: string): void {
    for (const observer of this.observers) {
      observer.sendNotification(this._owner, message);
    }
  }

  // -------- Getters --------

  get requestId(): string { return this._requestId; }
  get status(): string    { return this._status; }
  get createdAt(): Date   { return this._createdAt; }
  get userId(): string    { return this._userId; }
  get owner(): User       { return this._owner; }
}
