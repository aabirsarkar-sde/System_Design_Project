"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
/**
 * In-memory user repository (Phase 1).
 * Will be swapped for a real DB-backed repo later —
 * controllers depend on this class only by reference.
 */
class UserRepository {
    constructor() {
        this.users = new Map();
    }
    save(user) {
        this.users.set(user.userId, user);
    }
    findById(userId) {
        return this.users.get(userId);
    }
    findAll() {
        return Array.from(this.users.values());
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map