"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestServiceImpl = void 0;
const crypto_1 = require("crypto");
const ServiceRequest_1 = require("../models/ServiceRequest");
/**
 * Concrete request service.
 *
 * Responsibilities (Single Responsibility Principle):
 *  - Create new service requests
 *  - Update their status
 *  - Wire up notification observers automatically
 */
class RequestServiceImpl {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    createRequest(user, input) {
        const requestId = (0, crypto_1.randomUUID)();
        const ticketCode = `TK-${requestId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
        const request = ServiceRequest_1.ServiceRequest.createRequest(requestId, user, input, ticketCode);
        // Attach the notification observer so the user gets
        // pinged whenever the status changes.
        request.attachObserver(this.notificationService);
        console.log(`Request ${request.requestId} created by ${user.name}`);
        return request;
    }
    updateRequestStatus(request, newStatus) {
        request.updateStatus(newStatus); // triggers notifyObservers internally
    }
}
exports.RequestServiceImpl = RequestServiceImpl;
//# sourceMappingURL=RequestServiceImpl.js.map