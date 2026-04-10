import { randomUUID } from "crypto";
import { NotificationService } from "../interfaces/NotificationService";
import { RequestService } from "../interfaces/RequestService";
import { ServiceRequest, ServiceRequestInput, ServiceRequestStatus } from "../models/ServiceRequest";
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

  createRequest(user: User, input: ServiceRequestInput): ServiceRequest {
    const requestId = randomUUID();
    const ticketCode = `TK-${requestId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
    const request = ServiceRequest.createRequest(requestId, user, input, ticketCode);
    // Attach the notification observer so the user gets
    // pinged whenever the status changes.
    request.attachObserver(this.notificationService);
    console.log(`Request ${request.requestId} created by ${user.name}`);
    return request;
  }

  updateRequestStatus(request: ServiceRequest, newStatus: ServiceRequestStatus): void {
    request.updateStatus(newStatus); // triggers notifyObservers internally
  }
}
