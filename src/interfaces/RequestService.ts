import { ServiceRequest, ServiceRequestInput, ServiceRequestStatus } from "../models/ServiceRequest";
import { User } from "../models/User";

/**
 * Service contract for request handling.
 * Keeping this as an interface enforces the
 * Interface Segregation + Dependency Inversion principles.
 */
export interface RequestService {
  createRequest(user: User, input: ServiceRequestInput): ServiceRequest;
  updateRequestStatus(request: ServiceRequest, newStatus: ServiceRequestStatus): void;
}
