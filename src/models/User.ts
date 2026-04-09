/**
 * Base User class.
 * Demonstrates ENCAPSULATION (private/protected fields + getters)
 * and is the parent class for Admin (INHERITANCE).
 */
export class User {
  protected _userId: string;
  protected _name: string;
  protected _email: string;
  protected _role: string;

  constructor(userId: string, name: string, email: string, role: string) {
    this._userId = userId;
    this._name = name;
    this._email = email;
    this._role = role;
  }

  // Stubs — real auth would live in an AuthService.
  login(): void {
    console.log(`${this._name} logged in.`);
  }

  logout(): void {
    console.log(`${this._name} logged out.`);
  }

  get userId(): string { return this._userId; }
  get name(): string   { return this._name; }
  get email(): string  { return this._email; }
  get role(): string   { return this._role; }
}
