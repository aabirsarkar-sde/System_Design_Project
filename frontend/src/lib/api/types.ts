export interface ApiHealthResponse {
  ok: boolean;
  timestamp: string;
}

export interface HeaderProfileResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  unreadNotifications: number;
}

export interface ResidentQuickLaunchItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

export interface ResidentRecentRequest {
  requestId: string;
  ticketCode: string;
  title: string;
  meta: string;
  status: string;
  icon: string;
  createdAt: string;
}

export interface ResidentCampusPulse {
  id: string;
  type: "feature" | "info" | "warning";
  tag?: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface ResidentDashboardResponse {
  userName: string;
  activeRequests: number;
  upcomingBookings: number;
  quickLaunch: ResidentQuickLaunchItem[];
  recentRequests: ResidentRecentRequest[];
  campusPulse: ResidentCampusPulse[];
}

export interface AdminQueueItem {
  requestId: string;
  ticketCode: string;
  requesterName: string;
  requesterUnit: string;
  requesterAvatar: string;
  category: string;
  status: string;
  priority: string;
  assignedAvatars: string[];
}

export interface AdminFieldUnit {
  label: string;
  count: number;
  percentage: number;
}

export interface AdminEvent {
  id: string;
  type: "resolved" | "alert" | "new";
  text: string;
  timestampLabel: string;
}

export interface AdminDashboardResponse {
  stats: {
    totalOpen: number;
    highPriority: number;
    avgResolution: string;
    resolvedToday: number;
  };
  queue: AdminQueueItem[];
  fieldUnits: AdminFieldUnit[];
  eventStream: AdminEvent[];
}

export interface AnalyticsResponse {
  resolutionTime: {
    value: string;
    trendLabel: string;
    bars: number[];
  };
  requestVolume: number[];
  topCategories: Array<{
    category: string;
    percentage: number;
  }>;
  insight: {
    title: string;
    description: string;
    action: string;
  };
}

export interface FacilityItem {
  facilityId: string;
  name: string;
  available: boolean;
  status: string;
  location: string;
  capacity: string;
  hvacStatus: string;
  powerStatus?: string;
}

export interface FacilitiesResponse {
  facilities: FacilityItem[];
}

export interface RequestBoardCard {
  requestId: string;
  ticketCode: string;
  title: string;
  description: string;
  priority: string;
  comments: number;
  attachments: number;
  assigneeAvatar: string;
  status: string;
}

export interface RequestBoardColumn {
  id: string;
  title: string;
  count: number;
  tone: "neutral" | "accent" | "success";
  cards: RequestBoardCard[];
}

export interface RequestBoardResponse {
  columns: RequestBoardColumn[];
}

export interface TicketFormConfigResponse {
  categories: Array<{ code: string; label: string }>;
  priorities: string[];
  slaGoal: string;
  guidelines: string[];
  campusStatus: {
    label: string;
    message: string;
    imageUrl: string;
  };
}

export interface CreateRequestPayload {
  userId: string;
  title: string;
  description: string;
  category: string;
  building: string;
  room: string;
  priority: string;
}

export interface CreateRequestResponse {
  requestId: string;
  ticketCode: string;
  status: string;
  createdAt: string;
}
