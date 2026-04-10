"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const appContext_1 = require("./bootstrap/appContext");
const env_1 = require("./config/env");
const app = (0, express_1.default)();
const appContext = (0, appContext_1.buildAppContext)();
app.disable("x-powered-by");
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use((0, cors_1.default)({
    origin: env_1.env.frontendOrigin,
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
    maxAge: 600,
}));
app.use(express_1.default.json({ limit: "50kb" }));
const requestStatusOrder = ["PENDING", "DISPATCHED", "IN_PROGRESS", "SCHEDULED", "RESOLVED"];
function ensureUserId(userId) {
    if (typeof userId !== "string" || userId.trim().length === 0) {
        throw new Error("userId is required");
    }
    return userId.trim();
}
function asIsoDate(date) {
    return date.toISOString();
}
function categoryLabel(category) {
    return category.replace("_", " ");
}
function iconForCategory(category) {
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
function priorityWeight(priority) {
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
function validateCreateRequestPayload(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("Invalid payload");
    }
    const input = payload;
    const userId = ensureUserId(input.userId);
    const title = typeof input.title === "string" ? input.title.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : "";
    const building = typeof input.building === "string" ? input.building.trim() : "";
    const room = typeof input.room === "string" ? input.room.trim() : "";
    const category = input.category;
    const priority = input.priority;
    const allowedCategories = [
        "MAINTENANCE",
        "IT_SUPPORT",
        "HOUSEKEEPING",
        "SECURITY",
        "SUPPLIES",
    ];
    const allowedPriorities = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];
    if (title.length < 6 || title.length > 120) {
        throw new Error("title must be between 6 and 120 characters");
    }
    if (description.length < 10 || description.length > 2000) {
        throw new Error("description must be between 10 and 2000 characters");
    }
    if (building.length < 2 || building.length > 100) {
        throw new Error("building must be between 2 and 100 characters");
    }
    if (room.length < 1 || room.length > 50) {
        throw new Error("room must be between 1 and 50 characters");
    }
    if (typeof category !== "string" || !allowedCategories.includes(category)) {
        throw new Error("category is invalid");
    }
    if (typeof priority !== "string" || !allowedPriorities.includes(priority)) {
        throw new Error("priority is invalid");
    }
    return {
        userId,
        title,
        description,
        category: category,
        building,
        room,
        priority: priority,
    };
}
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});
app.get("/api/header/me", (req, res) => {
    const userId = ensureUserId(req.query.userId);
    const user = appContext.userRepository.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const unread = appContext.notificationRepository.findByUserId(userId).length;
    res.json({
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        unreadNotifications: unread,
    });
});
app.get("/api/dashboard/resident", (req, res) => {
    const userId = ensureUserId(req.query.userId);
    const user = appContext.userRepository.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const requests = appContext.requestRepository.findByUserId(userId);
    const activeRequests = requests.filter((item) => item.status !== "RESOLVED").length;
    const upcomingBookings = appContext.bookingRepository
        .findByUserId(userId)
        .filter((booking) => !booking.cancelled && booking.bookingDate.getTime() > Date.now()).length;
    const sortedRecent = [...requests]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 3)
        .map((item) => ({
        requestId: item.requestId,
        ticketCode: item.ticketCode,
        title: item.title,
        meta: `${item.building} • ${item.room}`,
        status: item.status,
        icon: iconForCategory(item.category),
        createdAt: asIsoDate(item.createdAt),
    }));
    res.json({
        userName: user.name,
        activeRequests,
        upcomingBookings,
        quickLaunch: [
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
        ],
        recentRequests: sortedRecent,
        campusPulse: [
            {
                id: "library-hours",
                type: "feature",
                tag: "UPDATE",
                title: "Central Library Hours Extended",
                description: "During the exam period, library facilities remain open 24/7 with active shuttle service.",
                imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            },
            {
                id: "dining-menu",
                type: "info",
                title: "New Dining Menu",
                description: "The main cafeteria is launching a new organic menu starting Monday.",
            },
            {
                id: "power-test",
                type: "warning",
                title: "Maintenance Notice",
                description: "Brief power surge test in North Block expected tomorrow at 04:00 AM.",
            },
        ],
    });
});
app.get("/api/dashboard/admin", (_req, res) => {
    const requests = appContext.requestRepository.findAll();
    const totalOpen = requests.filter((request) => request.status !== "RESOLVED").length;
    const highPriority = requests.filter((request) => request.priority === "HIGH" || request.priority === "EMERGENCY").length;
    const resolvedToday = requests.filter((request) => {
        if (request.status !== "RESOLVED") {
            return false;
        }
        const now = new Date();
        return request.updatedAt.toDateString() === now.toDateString();
    }).length;
    const queue = [...requests]
        .sort((a, b) => {
        const statusOrder = requestStatusOrder.indexOf(a.status) - requestStatusOrder.indexOf(b.status);
        if (statusOrder !== 0) {
            return statusOrder;
        }
        return priorityWeight(b.priority) - priorityWeight(a.priority);
    })
        .slice(0, 8)
        .map((request) => {
        const requester = appContext.userRepository.findById(request.userId);
        return {
            requestId: request.requestId,
            ticketCode: request.ticketCode,
            requesterName: requester?.name ?? "Unknown",
            requesterUnit: `${request.building} ${request.room}`,
            requesterAvatar: requester?.avatarUrl ?? "https://i.pravatar.cc/150?u=unknown",
            category: categoryLabel(request.category),
            status: request.status,
            priority: request.priority,
            assignedAvatars: [
                "https://i.pravatar.cc/150?u=tech-1",
                "https://i.pravatar.cc/150?u=tech-2",
            ],
        };
    });
    res.json({
        stats: {
            totalOpen,
            highPriority,
            avgResolution: "2.4h",
            resolvedToday,
        },
        queue,
        fieldUnits: [
            { label: "On-Site Dispatch", count: 14, percentage: 65 },
            { label: "In Transit", count: 6, percentage: 30 },
            { label: "Off Duty", count: 4, percentage: 15 },
        ],
        eventStream: [
            {
                id: "evt-1",
                type: "resolved",
                text: "Unit Delta-4 resolved REQ-8881 in Library West.",
                timestampLabel: "2 minutes ago",
            },
            {
                id: "evt-2",
                type: "alert",
                text: "System alert detected fluctuations in Sci-Tech Cluster.",
                timestampLabel: "14 minutes ago",
            },
            {
                id: "evt-3",
                type: "new",
                text: "Dr. Elena K submitted a high-priority equipment request.",
                timestampLabel: "21 minutes ago",
            },
        ],
    });
});
app.get("/api/analytics", (_req, res) => {
    const requests = appContext.requestRepository.findAll();
    const total = requests.length || 1;
    const categoryCount = requests.reduce((accumulator, request) => {
        accumulator[request.category] = (accumulator[request.category] ?? 0) + 1;
        return accumulator;
    }, {});
    const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({
        category: categoryLabel(category),
        percentage: Math.round((count / total) * 100),
    }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3);
    const bars = [40, 60, 45, 80, 30, 50, 25];
    const requestVolume = [20, 45, 30, 80, 60];
    res.json({
        resolutionTime: {
            value: "1.8h",
            trendLabel: "22% improved",
            bars,
        },
        requestVolume,
        topCategories,
        insight: {
            title: "Deep Dive Insights Generated",
            description: "Analytics engine detects a rise in HVAC-related maintenance during afternoon shifts in the Engineering Complex. Proactive inspection for Units A and B is recommended.",
            action: "Schedule Proactive Audit",
        },
    });
});
app.get("/api/facilities", (_req, res) => {
    const details = {
        F001: { location: "North Wing", capacity: "85% Full", hvacStatus: "Warning", status: "OPERATIONAL" },
        F002: { location: "Academic Hub", capacity: "40% Full", hvacStatus: "Optimal", status: "MAINTENANCE" },
        F003: { location: "South Campus", capacity: "98% Full", hvacStatus: "Optimal", status: "OPERATIONAL" },
        F004: { location: "Arts Block", capacity: "0% (Closed)", hvacStatus: "Offline", powerStatus: "Fault Detected", status: "OFFLINE" },
    };
    const facilities = appContext.facilityRepository.findAll().map((facility) => {
        const meta = details[facility.facilityId];
        return {
            facilityId: facility.facilityId,
            name: facility.name,
            available: facility.checkAvailability(),
            status: meta?.status ?? "OPERATIONAL",
            location: meta?.location ?? "Campus",
            capacity: meta?.capacity ?? "Unknown",
            hvacStatus: meta?.hvacStatus ?? "Optimal",
            powerStatus: meta?.powerStatus,
        };
    });
    res.json({ facilities });
});
app.get("/api/requests/board", (req, res) => {
    const userId = ensureUserId(req.query.userId);
    const requests = appContext.requestRepository.findByUserId(userId);
    const cards = requests.map((request, index) => ({
        requestId: request.requestId,
        ticketCode: request.ticketCode,
        title: request.title,
        description: request.description,
        priority: request.priority,
        comments: index % 3,
        attachments: index % 2,
        assigneeAvatar: `https://i.pravatar.cc/150?u=assignee-${index + 1}`,
        status: request.status,
    }));
    const submitted = cards.filter((card) => card.status === "PENDING");
    const inProgress = cards.filter((card) => card.status === "IN_PROGRESS" || card.status === "DISPATCHED" || card.status === "SCHEDULED");
    const verification = cards.filter((card) => card.status === "RESOLVED");
    res.json({
        columns: [
            {
                id: "submitted",
                title: "Submitted",
                count: submitted.length,
                tone: "neutral",
                cards: submitted,
            },
            {
                id: "in-progress",
                title: "In-Progress",
                count: inProgress.length,
                tone: "accent",
                cards: inProgress,
            },
            {
                id: "verification",
                title: "Verification",
                count: verification.length,
                tone: "success",
                cards: verification,
            },
        ],
    });
});
app.get("/api/ticket/form-config", (_req, res) => {
    res.json({
        categories: [
            { code: "MAINTENANCE", label: "Maintenance" },
            { code: "IT_SUPPORT", label: "IT Support" },
            { code: "HOUSEKEEPING", label: "Housekeeping" },
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
            imageUrl: "https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        },
    });
});
app.post("/api/requests", (req, res) => {
    const payload = validateCreateRequestPayload(req.body);
    const user = appContext.userRepository.findById(payload.userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    const request = appContext.requestController.createRequest(user, {
        title: payload.title,
        description: payload.description,
        category: payload.category,
        building: payload.building,
        room: payload.room,
        priority: payload.priority,
    });
    res.status(201).json({
        requestId: request.requestId,
        ticketCode: request.ticketCode,
        status: request.status,
        createdAt: asIsoDate(request.createdAt),
    });
});
app.use((error, _req, res, _next) => {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    res.status(400).json({ message });
});
app.listen(env_1.env.port, () => {
    console.log(`Backend API listening on port ${env_1.env.port}`);
});
//# sourceMappingURL=server.js.map