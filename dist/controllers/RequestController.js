"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
/**
 * Thin controller that sits between the "outside world"
 * and the service layer. Keeps the service layer free of
 * any presentation/transport concerns.
 */
class RequestController {
    constructor(requestService, requestRepository) {
        this.requestService = requestService;
        this.requestRepository = requestRepository;
    }
    createRequest(user, input) {
        const request = this.requestService.createRequest(user, input);
        this.requestRepository.save(request);
        return request;
    }
    updateRequestStatus(request, newStatus) {
        this.requestService.updateRequestStatus(request, newStatus);
    }
}
exports.RequestController = RequestController;
//# sourceMappingURL=RequestController.js.map