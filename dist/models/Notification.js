"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
/**
 * Notification entity — a record of a message delivered to a user.
 */
class Notification {
    constructor(notificationId, message, userId) {
        this._notificationId = notificationId;
        this._message = message;
        this._userId = userId;
        this._sentAt = new Date();
    }
    /** Console-based delivery — fine for the academic project. */
    send() {
        console.log(`[NOTIFICATION -> ${this._userId}] ${this._message}`);
    }
    get notificationId() { return this._notificationId; }
    get message() { return this._message; }
    get sentAt() { return this._sentAt; }
    get userId() { return this._userId; }
}
exports.Notification = Notification;
//# sourceMappingURL=Notification.js.map