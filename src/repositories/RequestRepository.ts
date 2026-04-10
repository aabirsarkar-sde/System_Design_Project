import { ServiceRequest } from "../models/ServiceRequest";

/**
 * In-memory request repository (Phase 1).
 */
export class RequestRepository {
  private requests: Map<string, ServiceRequest> = new Map();

  save(request: ServiceRequest): void {
    this.requests.set(request.requestId, request);
  }

  findById(requestId: string): ServiceRequest | undefined {
    return this.requests.get(requestId);
  }

  findAll(): ServiceRequest[] {
    return Array.from(this.requests.values());
  }

  findByUserId(userId: string): ServiceRequest[] {
    return this.findAll().filter((request) => request.userId === userId);
  }
}
