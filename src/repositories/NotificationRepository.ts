import { Notification } from "../models/Notification";

/**
 * In-memory notification repository.
 */
export class NotificationRepository {
  private notifications: Map<string, Notification> = new Map();

  save(notification: Notification): void {
    this.notifications.set(notification.notificationId, notification);
  }

  findAll(): Notification[] {
    return Array.from(this.notifications.values());
  }

  findByUserId(userId: string): Notification[] {
    return this.findAll().filter((notification) => notification.userId === userId);
  }
}
