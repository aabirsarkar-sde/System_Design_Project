import { User } from "../models/User";

/**
 * In-memory user repository (Phase 1).
 * Will be swapped for a real DB-backed repo later —
 * controllers depend on this class only by reference.
 */
export class UserRepository {
  private users: Map<string, User> = new Map();

  save(user: User): void {
    this.users.set(user.userId, user);
  }

  findById(userId: string): User | undefined {
    return this.users.get(userId);
  }
}
