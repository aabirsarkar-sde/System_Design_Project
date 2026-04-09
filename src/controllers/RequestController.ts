import { RequestService } from "../interfaces/RequestService";
import { ServiceRequest } from "../models/ServiceRequest";
import { User } from "../models/User";
import { RequestRepository } from "../repositories/RequestRepository";

/**
 * Thin controller that sits between the "outside world"
 * and the service layer. Keeps the service layer free of
 * any presentation/transport concerns.
 */
export class RequestController {
  private readonly requestService: RequestService;
  private readonly requestRepository: RequestRepository;

  constructor(requestService: RequestService, requestRepository: RequestRepository) {
    this.requestService = requestService;
    this.requestRepository = requestRepository;
  }

  createRequest(user: User): ServiceRequest {
    const request = this.requestService.createRequest(user);
    this.requestRepository.save(request);
    return request;
  }

  updateRequestStatus(request: ServiceRequest, newStatus: string): void {
    this.requestService.updateRequestStatus(request, newStatus);
  }
}
