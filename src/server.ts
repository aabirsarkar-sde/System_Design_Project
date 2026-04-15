import bcrypt from "bcryptjs";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import {
  RequestCategory,
  RequestPriority,
  RequestStatus,
} from "@prisma/client";
import { randomUUID } from "crypto";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import {
  allowedRequestCategories,
  allowedRequestPriorities,
  categoryLabel,
  iconForCategory,
  priorityWeight,
  requestStatusOrder,
} from "./lib/serviceRequest";
import {
  campusPulse,
  eventStream,
  fieldUnits,
  quickLaunch,
  ticketFormConfig,
} from "./lib/staticData";

const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: env.frontendOrigin,
    methods: ["GET", "POST", "PATCH"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
    maxAge: 600,
  }),
);
app.use(express.json({ limit: "50kb" }));

void env.databaseUrl;

class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

type AsyncRouteHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

function asyncHandler(handler: AsyncRouteHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

function ensureUserId(userId: unknown): string {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new HttpError(400, "userId is required");
  }

  return userId.trim();
}

function asIsoDate(date: Date): string {
  return date.toISOString();
}

function ticketCodeFromRequestId(requestId: string): string {
  return `TK-${requestId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function validateCreateRequestPayload(payload: unknown): {
  userId: string;
  title: string;
  description: string;
  category: RequestCategory;
  building: string;
  room: string;
  priority: RequestPriority;
} {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Invalid payload");
  }

  const input = payload as Record<string, unknown>;
  const userId = ensureUserId(input.userId);
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  const building = typeof input.building === "string" ? input.building.trim() : "";
  const room = typeof input.room === "string" ? input.room.trim() : "";
  const category = input.category;
  const priority = input.priority;

  if (title.length < 6 || title.length > 120) {
    throw new HttpError(400, "title must be between 6 and 120 characters");
  }

  if (description.length < 10 || description.length > 2000) {
    throw new HttpError(400, "description must be between 10 and 2000 characters");
  }

  if (building.length < 2 || building.length > 100) {
    throw new HttpError(400, "building must be between 2 and 100 characters");
  }

  if (room.length < 1 || room.length > 50) {
    throw new HttpError(400, "room must be between 1 and 50 characters");
  }

  if (
    typeof category !== "string" ||
    !allowedRequestCategories.includes(category as RequestCategory)
  ) {
    throw new HttpError(400, "category is invalid");
  }

  if (
    typeof priority !== "string" ||
    !allowedRequestPriorities.includes(priority as RequestPriority)
  ) {
    throw new HttpError(400, "priority is invalid");
  }

  return {
    userId,
    title,
    description,
    category: category as RequestCategory,
    building,
    room,
    priority: priority as RequestPriority,
  };
}

function validateLoginPayload(payload: unknown): {
  enrollmentNumber: string;
  password: string;
} {
  if (!payload || typeof payload !== "object") {
    throw new HttpError(400, "Invalid login payload");
  }

  const input = payload as Record<string, unknown>;
  const enrollmentNumber =
    typeof input.enrollmentNumber === "string"
      ? input.enrollmentNumber.trim()
      : "";
  const password =
    typeof input.password === "string" ? input.password.trim() : "";

  if (enrollmentNumber.length < 4) {
    throw new HttpError(400, "enrollmentNumber must be at least 4 characters");
  }

  if (password.length < 4) {
    throw new HttpError(400, "password must be at least 4 characters");
  }

  return {
    enrollmentNumber,
    password,
  };
}

function mapAuthenticatedUser(user: {
  userId: string;
  enrollmentNumber: string | null;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  seatNumber: number | null;
  classroomNumber: string | null;
}): {
  userId: string;
  enrollmentNumber: string | null;
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  seatNumber: number | null;
  classroomNumber: string | null;
} {
  return {
    userId: user.userId,
    enrollmentNumber: user.enrollmentNumber,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    seatNumber: user.seatNumber,
    classroomNumber: user.classroomNumber,
  };
}

app.get(
  "/api/health",
  asyncHandler(async (_req: Request, res: Response) => {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  }),
);

app.post(
  "/api/auth/login",
  asyncHandler(async (req: Request, res: Response) => {
    const payload = validateLoginPayload(req.body);
    const user = await prisma.user.findUnique({
      where: { enrollmentNumber: payload.enrollmentNumber },
      select: {
        userId: true,
        enrollmentNumber: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        passwordHash: true,
        seatNumber: true,
        classroomNumber: true,
      },
    });

    if (!user) {
      throw new HttpError(401, "Invalid enrollment number or password");
    }

    const passwordMatches = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid enrollment number or password");
    }

    res.json({
      user: mapAuthenticatedUser(user),
    });
  }),
);

app.get(
  "/api/header/me",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = ensureUserId(req.query.userId);
    const [user, unreadNotifications] = await Promise.all([
      prisma.user.findUnique({
        where: { userId },
        select: {
          userId: true,
          enrollmentNumber: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          seatNumber: true,
          classroomNumber: true,
        },
      }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.json({
      ...mapAuthenticatedUser(user),
      unreadNotifications,
    });
  }),
);

app.get(
  "/api/dashboard/resident",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = ensureUserId(req.query.userId);
    const now = new Date();

    const [user, activeRequests, upcomingBookings, recentRequests] =
      await Promise.all([
        prisma.user.findUnique({
          where: { userId },
          select: {
            userId: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            enrollmentNumber: true,
            seatNumber: true,
            classroomNumber: true,
          },
        }),
        prisma.serviceRequest.count({
          where: {
            userId,
            status: {
              not: "RESOLVED",
            },
          },
        }),
        prisma.booking.count({
          where: {
            userId,
            cancelled: false,
            bookingDate: {
              gt: now,
            },
          },
        }),
        prisma.serviceRequest.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            requestId: true,
            ticketCode: true,
            title: true,
            building: true,
            room: true,
            status: true,
            category: true,
            createdAt: true,
          },
        }),
      ]);

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    res.json({
      userName: user.name,
      activeRequests,
      upcomingBookings,
      quickLaunch,
      recentRequests: recentRequests.map((request) => ({
        requestId: request.requestId,
        ticketCode: request.ticketCode,
        title: request.title,
        meta: `${request.building} • ${request.room}`,
        status: request.status,
        icon: iconForCategory(request.category),
        createdAt: asIsoDate(request.createdAt),
      })),
      campusPulse,
    });
  }),
);

app.get(
  "/api/dashboard/admin",
  asyncHandler(async (_req: Request, res: Response) => {
    const now = new Date();
    const requests = await prisma.serviceRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const totalOpen = requests.filter((request) => request.status !== "RESOLVED")
      .length;
    const highPriority = requests.filter(
      (request) =>
        request.priority === "HIGH" || request.priority === "EMERGENCY",
    ).length;
    const resolvedToday = requests.filter((request) => {
      if (request.status !== "RESOLVED") {
        return false;
      }

      return request.updatedAt.toDateString() === now.toDateString();
    }).length;

    const queue = [...requests]
      .sort((left, right) => {
        const statusOrder =
          requestStatusOrder.indexOf(left.status) -
          requestStatusOrder.indexOf(right.status);

        if (statusOrder !== 0) {
          return statusOrder;
        }

        return priorityWeight(right.priority) - priorityWeight(left.priority);
      })
      .slice(0, 8)
      .map((request, index) => ({
        requestId: request.requestId,
        ticketCode: request.ticketCode,
        requesterName: request.user.name,
        requesterUnit: `${request.building} ${request.room}`,
        requesterAvatar:
          request.user.avatarUrl ?? "https://i.pravatar.cc/150?u=unknown",
        category: categoryLabel(request.category),
        status: request.status,
        priority: request.priority,
        assignedAvatars: [
          `https://i.pravatar.cc/150?u=tech-${index + 1}`,
          `https://i.pravatar.cc/150?u=tech-${index + 9}`,
        ],
      }));

    res.json({
      stats: {
        totalOpen,
        highPriority,
        avgResolution: "2.4h",
        resolvedToday,
      },
      queue,
      fieldUnits,
      eventStream,
    });
  }),
);

app.get(
  "/api/analytics",
  asyncHandler(async (_req: Request, res: Response) => {
    const [totalRequests, groupedCategories] = await Promise.all([
      prisma.serviceRequest.count(),
      prisma.serviceRequest.groupBy({
        by: ["category"],
        _count: {
          _all: true,
        },
      }),
    ]);

    const total = totalRequests || 1;

    const topCategories = groupedCategories
      .map((category) => ({
        category: categoryLabel(category.category),
        percentage: Math.round((category._count._all / total) * 100),
      }))
      .sort((left, right) => right.percentage - left.percentage)
      .slice(0, 3);

    res.json({
      resolutionTime: {
        value: "1.8h",
        trendLabel: "22% improved",
        bars: [40, 60, 45, 80, 30, 50, 25],
      },
      requestVolume: [20, 45, 30, 80, 60],
      topCategories,
      insight: {
        title: "Deep Dive Insights Generated",
        description:
          "Analytics engine detects a rise in HVAC-related maintenance during afternoon shifts in the Engineering Complex. Proactive inspection for Units A and B is recommended.",
        action: "Schedule Proactive Audit",
      },
    });
  }),
);

app.get(
  "/api/facilities",
  asyncHandler(async (_req: Request, res: Response) => {
    const facilities = await prisma.facility.findMany({
      orderBy: { facilityId: "asc" },
      select: {
        facilityId: true,
        name: true,
        available: true,
        status: true,
        location: true,
        capacityLabel: true,
        hvacStatus: true,
        powerStatus: true,
      },
    });

    res.json({
      facilities: facilities.map((facility) => ({
        facilityId: facility.facilityId,
        name: facility.name,
        available: facility.available,
        status: facility.status,
        location: facility.location,
        capacity: facility.capacityLabel,
        hvacStatus: facility.hvacStatus,
        powerStatus: facility.powerStatus ?? undefined,
      })),
    });
  }),
);

app.get(
  "/api/requests/board",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = ensureUserId(req.query.userId);
    const requests = await prisma.serviceRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        requestId: true,
        ticketCode: true,
        title: true,
        description: true,
        priority: true,
        commentCount: true,
        attachmentCount: true,
        assigneeAvatarUrl: true,
        status: true,
      },
    });

    const cards = requests.map((request, index) => ({
      requestId: request.requestId,
      ticketCode: request.ticketCode,
      title: request.title,
      description: request.description,
      priority: request.priority,
      comments: request.commentCount,
      attachments: request.attachmentCount,
      assigneeAvatar:
        request.assigneeAvatarUrl ??
        `https://i.pravatar.cc/150?u=assignee-${index + 1}`,
      status: request.status,
    }));

    const submitted = cards.filter((card) => card.status === "PENDING");
    const inProgress = cards.filter(
      (card) =>
        card.status === "IN_PROGRESS" ||
        card.status === "DISPATCHED" ||
        card.status === "SCHEDULED",
    );
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
  }),
);

app.get("/api/ticket/form-config", (_req: Request, res: Response) => {
  res.json(ticketFormConfig);
});

app.post(
  "/api/requests",
  asyncHandler(async (req: Request, res: Response) => {
    const payload = validateCreateRequestPayload(req.body);
    const user = await prisma.user.findUnique({
      where: { userId: payload.userId },
      select: { userId: true },
    });

    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const requestId = randomUUID();
    const request = await prisma.serviceRequest.create({
      data: {
        requestId,
        ticketCode: ticketCodeFromRequestId(requestId),
        title: payload.title,
        description: payload.description,
        category: payload.category,
        building: payload.building,
        room: payload.room,
        priority: payload.priority,
        status: "PENDING",
        commentCount: 0,
        attachmentCount: 0,
        assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-new",
        userId: payload.userId,
      },
      select: {
        requestId: true,
        ticketCode: true,
        status: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      requestId: request.requestId,
      ticketCode: request.ticketCode,
      status: request.status,
      createdAt: asIsoDate(request.createdAt),
    });
  }),
);

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const statusCode =
      error instanceof HttpError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Unexpected server error";

    if (statusCode >= 500) {
      console.error(error);
    }

    res.status(statusCode).json({ message });
  },
);

async function start() {
  await prisma.$connect();

  const server = app.listen(env.port, () => {
    console.log(`Backend API listening on port ${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });
}

void start().catch(async (error) => {
  console.error("Failed to start backend API.");
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
