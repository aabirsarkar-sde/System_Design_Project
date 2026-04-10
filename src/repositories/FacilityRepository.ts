import { Facility } from "../models/Facility";

/**
 * In-memory facility repository.
 */
export class FacilityRepository {
  private facilities: Map<string, Facility> = new Map();

  save(facility: Facility): void {
    this.facilities.set(facility.facilityId, facility);
  }

  findById(facilityId: string): Facility | undefined {
    return this.facilities.get(facilityId);
  }

  findAll(): Facility[] {
    return Array.from(this.facilities.values());
  }
}
