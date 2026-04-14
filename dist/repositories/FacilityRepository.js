"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilityRepository = void 0;
/**
 * In-memory facility repository.
 */
class FacilityRepository {
    constructor() {
        this.facilities = new Map();
    }
    save(facility) {
        this.facilities.set(facility.facilityId, facility);
    }
    findById(facilityId) {
        return this.facilities.get(facilityId);
    }
    findAll() {
        return Array.from(this.facilities.values());
    }
}
exports.FacilityRepository = FacilityRepository;
//# sourceMappingURL=FacilityRepository.js.map