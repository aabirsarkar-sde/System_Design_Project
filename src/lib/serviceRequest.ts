import { RequestCategory, RequestPriority, RequestStatus } from "@prisma/client";

export const requestStatusOrder: RequestStatus[] = [
  "PENDING",
  "DISPATCHED",
  "IN_PROGRESS",
  "SCHEDULED",
  "RESOLVED",
];

export const allowedRequestCategories: RequestCategory[] = [
  "MAINTENANCE",
  "IT_SUPPORT",
  "HOUSEKEEPING",
  "SECURITY",
  "SUPPLIES",
];

export const allowedRequestPriorities: RequestPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "EMERGENCY",
];

export function categoryLabel(category: RequestCategory): string {
  return category.replace(/_/g, " ");
}

export function iconForCategory(category: RequestCategory): string {
  switch (category) {
    case "MAINTENANCE":
      return "wrench";
    case "IT_SUPPORT":
      return "router";
    case "HOUSEKEEPING":
      return "trash";
    case "SECURITY":
      return "shield";
    case "SUPPLIES":
      return "package";
    default:
      return "circle";
  }
}

export function priorityWeight(priority: RequestPriority): number {
  switch (priority) {
    case "EMERGENCY":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    case "LOW":
      return 1;
    default:
      return 0;
  }
}
