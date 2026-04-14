import { User } from "./User";
import { NotificationService } from "../interfaces/NotificationService";

export type ServiceRequestStatus = "PENDING" | "IN_PROGRESS" | "DISPATCHED" | "SCHEDULED" | "RESOLVED";

export type ServiceRequestPriority = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";

export type ServiceRequestCategory =
  | "MAINTENANCE"
  | "IT_SUPPORT"
  | "HOUSEKEEPING"
  | "SECURITY"
  | "SUPPLIES";

export interface ServiceRequestInput {
  title: string;
  description: string;
  category: ServiceRequestCategory;
  building: string;
  room: string;
  priority: ServiceRequestPriority;
}

/**
 * ServiceRequest is the SUBJECT in the Observer pattern.
 *
 * Observers (NotificationService implementations) attach to it and
 * are notified whenever the request status changes.
 */
export class ServiceRequest {
  private _requestId: string;
  private _status: ServiceRequestStatus;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _userId: string;
  private _ticketCode: string;
  private _title: string;
  private _description: string;
  private _category: ServiceRequestCategory;
  private _building: string;
  private _room: string;
  private _priority: ServiceRequestPriority;

  // The user who raised the request — kept here so observers
  // know who to notify when status changes.
  private _owner: User;

  // Loose coupling via the interface.
  private observers: NotificationService[] = [];

  constructor(requestId: string, userId: string, owner: User, input: ServiceRequestInput, ticketCode: string) {
    this._requestId = requestId;
    this._userId = userId;
    this._owner = owner;
    this._status = "PENDING";
    this._createdAt = new Date();
    this._updatedAt = this._createdAt;
    this._ticketCode = ticketCode;
    this._title = input.title;
    this._description = input.description;
    this._category = input.category;
    this._building = input.building;
    this._room = input.room;
    this._priority = input.priority;
  }

  /** Factory-style helper that mirrors the required createRequest() method. */
  static createRequest(requestId: string, owner: User, input: ServiceRequestInput, ticketCode: string): ServiceRequest {
    return new ServiceRequest(requestId, owner.userId, owner, input, ticketCode);
  }

  /**
   * Status change happens here — and this is the trigger
   * point for notifying observers.
   */
  updateStatus(newStatus: ServiceRequestStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
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
  get status(): ServiceRequestStatus { return this._status; }
  get createdAt(): Date   { return this._createdAt; }
  get updatedAt(): Date   { return this._updatedAt; }
  get userId(): string    { return this._userId; }
  get owner(): User       { return this._owner; }
  get ticketCode(): string { return this._ticketCode; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get category(): ServiceRequestCategory { return this._category; }
  get building(): string { return this._building; }
  get room(): string { return this._room; }
  get priority(): ServiceRequestPriority { return this._priority; }
}
