/**
 * Represents a campus facility (e.g. auditorium, lab, sports ground).
 */
export class Facility {
  private _facilityId: string;
  private _name: string;
  private _available: boolean;

  constructor(facilityId: string, name: string) {
    this._facilityId = facilityId;
    this._name = name;
    this._available = true;
  }

  /** Stub — would normally check booking records. */
  checkAvailability(): boolean {
    return this._available;
  }

  setAvailable(available: boolean): void {
    this._available = available;
  }

  get facilityId(): string { return this._facilityId; }
  get name(): string       { return this._name; }
}
