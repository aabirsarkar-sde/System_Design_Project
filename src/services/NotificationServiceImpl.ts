import { randomUUID } from "crypto";
import { NotificationService } from "../interfaces/NotificationService";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

/**
 * Console-based notification service.
 *
 * Implements NotificationService — so it can be plugged into
 * any subject (e.g. ServiceRequest) as an observer.
 *
 * POLYMORPHISM: callers depend on the interface, not this class.
 */
export class NotificationServiceImpl implements NotificationService {
  sendNotification(user: User, message: string): void {
    // Build a Notification entity (so we have a record) and
    // "send" it. In a real system this would persist to DB
    // and dispatch via email/SMS.
    const notification = new Notification(randomUUID(), message, user.userId);
    notification.send();
  }
}
