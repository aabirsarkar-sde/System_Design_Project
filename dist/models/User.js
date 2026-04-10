"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
/**
 * Base User class.
 * Demonstrates ENCAPSULATION (private/protected fields + getters)
 * and is the parent class for Admin (INHERITANCE).
 */
class User {
    constructor(userId, name, email, role, avatarUrl) {
        this._userId = userId;
        this._name = name;
        this._email = email;
        this._role = role;
        this._avatarUrl = avatarUrl;
    }
    // Stubs — real auth would live in an AuthService.
    login() {
        console.log(`${this._name} logged in.`);
    }
    logout() {
        console.log(`${this._name} logged out.`);
    }
    get userId() { return this._userId; }
    get name() { return this._name; }
    get email() { return this._email; }
    get role() { return this._role; }
    get avatarUrl() { return this._avatarUrl; }
}
exports.User = User;
//# sourceMappingURL=User.js.map