"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationServiceImpl = void 0;
const crypto_1 = require("crypto");
const Notification_1 = require("../models/Notification");
/**
 * Console-based notification service.
 *
 * Implements NotificationService — so it can be plugged into
 * any subject (e.g. ServiceRequest) as an observer.
 *
 * POLYMORPHISM: callers depend on the interface, not this class.
 */
class NotificationServiceImpl {
    constructor(notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    sendNotification(user, message) {
        // Build a Notification entity (so we have a record) and
        // "send" it. In a real system this would persist to DB
        // and dispatch via email/SMS.
        const notification = new Notification_1.Notification((0, crypto_1.randomUUID)(), message, user.userId);
        this.notificationRepository.save(notification);
        notification.send();
    }
}
exports.NotificationServiceImpl = NotificationServiceImpl;
//# sourceMappingURL=NotificationServiceImpl.js.map