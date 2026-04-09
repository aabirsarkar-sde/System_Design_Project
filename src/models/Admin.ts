import { User } from "./User";
import { ServiceRequest } from "./ServiceRequest";

/**
 * Admin extends User — INHERITANCE.
 * Has extra responsibilities for managing service requests.
 */
export class Admin extends User {
  constructor(userId: string, name: string, email: string) {
    super(userId, name, email, "ADMIN");
  }

  /**
   * In a real system this would query a repository for pending requests.
   * Stub for the academic project.
   */
  manageRequests(): void {
    console.log(`Admin ${this._name} is reviewing pending requests.`);
  }

  /**
   * Updates a request status. Delegates to the ServiceRequest model
   * so its observers (Observer pattern) get notified.
   */
  updateRequestStatus(request: ServiceRequest, newStatus: string): void {
    console.log(`Admin ${this._name} updating request ${request.requestId} -> ${newStatus}`);
    request.updateStatus(newStatus);
  }
}
