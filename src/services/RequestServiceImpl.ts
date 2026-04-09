import { randomUUID } from "crypto";
import { NotificationService } from "../interfaces/NotificationService";
import { RequestService } from "../interfaces/RequestService";
import { ServiceRequest } from "../models/ServiceRequest";
import { User } from "../models/User";

/**
 * Concrete request service.
 *
 * Responsibilities (Single Responsibility Principle):
 *  - Create new service requests
 *  - Update their status
 *  - Wire up notification observers automatically
 */
export class RequestServiceImpl implements RequestService {
  // Default observer attached to every new request.
  // Injected via the constructor — Dependency Injection.
  private readonly notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  createRequest(user: User): ServiceRequest {
    const request = ServiceRequest.createRequest(randomUUID(), user);
    // Attach the notification observer so the user gets
    // pinged whenever the status changes.
    request.attachObserver(this.notificationService);
    console.log(`Request ${request.requestId} created by ${user.name}`);
    return request;
  }

  updateRequestStatus(request: ServiceRequest, newStatus: string): void {
    request.updateStatus(newStatus); // triggers notifyObservers internally
  }
}
