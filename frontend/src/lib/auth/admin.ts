import type { AuthenticatedUser } from "@/lib/api/types";

/** Must match `SOLE_ADMIN_ENROLLMENT` in `src/server.ts`. */
export const SOLE_ADMIN_ENROLLMENT = "2401010085";

export function isSoleAdmin(user: AuthenticatedUser | null | undefined): boolean {
  if (!user) {
    return false;
  }
  return (
    user.enrollmentNumber === SOLE_ADMIN_ENROLLMENT && user.role === "ADMIN"
  );
}
