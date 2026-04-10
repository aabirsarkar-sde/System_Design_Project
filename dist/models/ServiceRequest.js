"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequest = void 0;
/**
 * ServiceRequest is the SUBJECT in the Observer pattern.
 *
 * Observers (NotificationService implementations) attach to it and
 * are notified whenever the request status changes.
 */
class ServiceRequest {
    constructor(requestId, userId, owner, input, ticketCode) {
        // Loose coupling via the interface.
        this.observers = [];
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
    static createRequest(requestId, owner, input, ticketCode) {
        return new ServiceRequest(requestId, owner.userId, owner, input, ticketCode);
    }
    /**
     * Status change happens here — and this is the trigger
     * point for notifying observers.
     */
    updateStatus(newStatus) {
        this._status = newStatus;
        this._updatedAt = new Date();
        this.notifyObservers(`Your request ${this._requestId} is now: ${newStatus}`);
    }
    // -------- Observer pattern plumbing --------
    attachObserver(observer) {
        this.observers.push(observer);
    }
    detachObserver(observer) {
        this.observers = this.observers.filter((o) => o !== observer);
    }
    notifyObservers(message) {
        for (const observer of this.observers) {
            observer.sendNotification(this._owner, message);
        }
    }
    // -------- Getters --------
    get requestId() { return this._requestId; }
    get status() { return this._status; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    get userId() { return this._userId; }
    get owner() { return this._owner; }
    get ticketCode() { return this._ticketCode; }
    get title() { return this._title; }
    get description() { return this._description; }
    get category() { return this._category; }
    get building() { return this._building; }
    get room() { return this._room; }
    get priority() { return this._priority; }
}
exports.ServiceRequest = ServiceRequest;
//# sourceMappingURL=ServiceRequest.js.map