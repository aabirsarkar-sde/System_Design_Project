"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
/**
 * In-memory notification repository.
 */
class NotificationRepository {
    constructor() {
        this.notifications = new Map();
    }
    save(notification) {
        this.notifications.set(notification.notificationId, notification);
    }
    findAll() {
        return Array.from(this.notifications.values());
    }
    findByUserId(userId) {
        return this.findAll().filter((notification) => notification.userId === userId);
    }
}
exports.NotificationRepository = NotificationRepository;
//# sourceMappingURL=NotificationRepository.js.map