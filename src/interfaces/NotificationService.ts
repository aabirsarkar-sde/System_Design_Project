import { User } from "../models/User";

/**
 * Contract for any notification delivery mechanism
 * (console, email, SMS, push). Acts as the OBSERVER
 * interface in the Observer pattern.
 *
 * Following the Dependency Inversion Principle (SOLID),
 * high-level modules depend on this abstraction, not on
 * any concrete implementation.
 */
export interface NotificationService {
  sendNotification(user: User, message: string): void;
}
