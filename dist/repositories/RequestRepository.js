"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRepository = void 0;
/**
 * In-memory request repository (Phase 1).
 */
class RequestRepository {
    constructor() {
        this.requests = new Map();
    }
    save(request) {
        this.requests.set(request.requestId, request);
    }
    findById(requestId) {
        return this.requests.get(requestId);
    }
    findAll() {
        return Array.from(this.requests.values());
    }
    findByUserId(userId) {
        return this.findAll().filter((request) => request.userId === userId);
    }
}
exports.RequestRepository = RequestRepository;
//# sourceMappingURL=RequestRepository.js.map