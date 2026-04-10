"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Facility = void 0;
/**
 * Represents a campus facility (e.g. auditorium, lab, sports ground).
 */
class Facility {
    constructor(facilityId, name) {
        this._facilityId = facilityId;
        this._name = name;
        this._available = true;
    }
    /** Stub — would normally check booking records. */
    checkAvailability() {
        return this._available;
    }
    setAvailable(available) {
        this._available = available;
    }
    get facilityId() { return this._facilityId; }
    get name() { return this._name; }
}
exports.Facility = Facility;
//# sourceMappingURL=Facility.js.map