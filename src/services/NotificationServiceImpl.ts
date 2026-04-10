import { randomUUID } from "crypto";
import { NotificationService } from "../interfaces/NotificationService";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { NotificationRepository } from "../repositories/NotificationRepository";

/**
 * Console-based notification service.
 *
 * Implements NotificationService — so it can be plugged into
 * any subject (e.g. ServiceRequest) as an observer.
 *
 * POLYMORPHISM: callers depend on the interface, not this class.
 */
export class NotificationServiceImpl implements NotificationService {
  private readonly notificationRepository: NotificationRepository;

  constructor(notificationRepository: NotificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  sendNotification(user: User, message: string): void {
    // Build a Notification entity (so we have a record) and
    // "send" it. In a real system this would persist to DB
    // and dispatch via email/SMS.
    const notification = new Notification(randomUUID(), message, user.userId);
    this.notificationRepository.save(notification);
    notification.send();
  }
}
