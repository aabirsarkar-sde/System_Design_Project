"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const User_1 = require("./User");
/**
 * Admin extends User — INHERITANCE.
 * Has extra responsibilities for managing service requests.
 */
class Admin extends User_1.User {
    constructor(userId, name, email, avatarUrl) {
        super(userId, name, email, "ADMIN", avatarUrl);
    }
    /**
     * In a real system this would query a repository for pending requests.
     * Stub for the academic project.
     */
    manageRequests() {
        console.log(`Admin ${this._name} is reviewing pending requests.`);
    }
    /**
     * Updates a request status. Delegates to the ServiceRequest model
     * so its observers (Observer pattern) get notified.
     */
    updateRequestStatus(request, newStatus) {
        console.log(`Admin ${this._name} updating request ${request.requestId} -> ${newStatus}`);
        request.updateStatus(newStatus);
    }
}
exports.Admin = Admin;
//# sourceMappingURL=Admin.js.map