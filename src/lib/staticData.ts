export const quickLaunch = [
  {
    id: "maintenance",
    title: "Maintenance",
    description: "Report plumbing, electrical or structural issues.",
    icon: "wrench",
    href: "/ticket/new",
  },
  {
    id: "it",
    title: "IT Support",
    description: "Network connectivity or hardware assistance.",
    icon: "router",
    href: "/ticket/new",
  },
  {
    id: "housekeeping",
    title: "Housekeeping",
    description: "Schedule deep cleaning or waste disposal.",
    icon: "trash",
    href: "/ticket/new",
  },
  {
    id: "new-ticket",
    title: "New Ticket",
    description: "Start a custom service request or general inquiry.",
    icon: "plus",
    href: "/ticket/new",
  },
] as const;

export const campusPulse = [
  {
    id: "library-hours",
    type: "feature" as const,
    tag: "UPDATE",
    title: "Central Library Hours Extended",
    description:
      "During the exam period, library facilities remain open 24/7 with active shuttle service.",
    imageUrl:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "dining-menu",
    type: "info" as const,
    title: "New Dining Menu",
    description: "The main cafeteria is launching a new organic menu starting Monday.",
  },
  {
    id: "power-test",
    type: "warning" as const,
    title: "Maintenance Notice",
    description: "Brief power surge test in North Block expected tomorrow at 04:00 AM.",
  },
] as const;

export const fieldUnits = [
  { label: "On-Site Dispatch", count: 14, percentage: 65 },
  { label: "In Transit", count: 6, percentage: 30 },
  { label: "Off Duty", count: 4, percentage: 15 },
] as const;

export const eventStream = [
  {
    id: "evt-1",
    type: "resolved" as const,
    text: "Unit Delta-4 resolved REQ-8881 in Library West.",
    timestampLabel: "2 minutes ago",
  },
  {
    id: "evt-2",
    type: "alert" as const,
    text: "System alert detected fluctuations in Sci-Tech Cluster.",
    timestampLabel: "14 minutes ago",
  },
  {
    id: "evt-3",
    type: "new" as const,
    text: "Dr. Elena K submitted a high-priority equipment request.",
    timestampLabel: "21 minutes ago",
  },
] as const;

export const ticketFormConfig = {
  categories: [
    { code: "MAINTENANCE", label: "Maintenance" },
    { code: "IT_SUPPORT", label: "IT Support" },
    { code: "HOUSEKEEPING", label: "Housekeeping" },
    { code: "SECURITY", label: "Security" },
    { code: "SUPPLIES", label: "Supplies" },
  ],
  priorities: ["LOW", "MEDIUM", "HIGH", "EMERGENCY"],
  slaGoal: "24-48 Hours",
  guidelines: [
    "Provide high-resolution photos of equipment tags if possible.",
    "Ensure access permissions are granted for the scheduled maintenance window.",
    "Emergency leaks or electrical hazards should be flagged with priority EMERGENCY.",
  ],
  campusStatus: {
    label: "CAMPUS STATUS",
    message: "North Wing systems operating at 98% efficiency",
    imageUrl:
      "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
} as const;
