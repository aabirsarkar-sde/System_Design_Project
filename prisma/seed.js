const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();
const DEFAULT_CSV_PATH = "/Users/anugragupta/Downloads/Seating Plan for DVA Contest 3 - Sheet1.csv";

function resolveCsvPath() {
  const configuredPath = process.env.STUDENTS_CSV_PATH || DEFAULT_CSV_PATH;
  const absolutePath = path.resolve(configuredPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(
      `Student CSV not found at ${absolutePath}. Set STUDENTS_CSV_PATH to the correct file before seeding.`,
    );
  }

  return absolutePath;
}

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "").trim();
  const lines = raw.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = lines[0].split(",").map((value) => value.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    const entry = {};

    headers.forEach((header, index) => {
      entry[header] = values[index] ?? "";
    });

    return entry;
  });
}

function toStudentRows(records) {
  const students = [];
  const seenEnrollmentNumbers = new Set();

  for (const record of records) {
    const enrollmentNumber = String(record["Enrollment Number"] || "").trim();
    if (!enrollmentNumber || seenEnrollmentNumbers.has(enrollmentNumber)) {
      continue;
    }

    seenEnrollmentNumbers.add(enrollmentNumber);

    students.push({
      serialNumber: Number(record["S.NO."]) || null,
      enrollmentNumber,
      name: String(record["Name"] || "").trim() || enrollmentNumber,
      seatNumber: Number(record["Seat No."]) || null,
      classroomNumber: String(record["Classroom No."] || "").trim() || null,
    });
  }

  return students;
}

async function hashPassword(password, cache) {
  if (!cache.has(password)) {
    cache.set(password, await bcrypt.hash(password, 10));
  }

  return cache.get(password);
}

function ticketCodeFromId(requestId) {
  return `TK-${requestId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

async function main() {
  const csvPath = resolveCsvPath();
  const students = toStudentRows(parseCsv(csvPath));

  if (students.length === 0) {
    throw new Error("No students were parsed from the CSV.");
  }

  const passwordCache = new Map();

  const studentUsers = [];
  for (const student of students) {
    studentUsers.push({
      userId: student.enrollmentNumber,
      enrollmentNumber: student.enrollmentNumber,
      name: student.name,
      email: `${student.enrollmentNumber}@students.nst.local`,
      role: "STUDENT",
      avatarUrl: `https://i.pravatar.cc/150?u=${student.enrollmentNumber}`,
      passwordHash: await hashPassword(student.enrollmentNumber.slice(-4), passwordCache),
      serialNumber: student.serialNumber,
      seatNumber: student.seatNumber,
      classroomNumber: student.classroomNumber,
    });
  }

  const adminUser = {
    userId: "A001",
    enrollmentNumber: "ADMIN001",
    name: "Priya Rao",
    email: "priya.rao@campus.edu",
    role: "ADMIN",
    avatarUrl: "https://i.pravatar.cc/150?u=a001",
    passwordHash: await hashPassword("ADMI", passwordCache),
    serialNumber: null,
    seatNumber: null,
    classroomNumber: null,
  };

  const facilities = [
    {
      facilityId: "F001",
      name: "Engineering Complex",
      available: true,
      status: "OPERATIONAL",
      location: "North Wing",
      capacityLabel: "85% Full",
      hvacStatus: "Warning",
      powerStatus: null,
    },
    {
      facilityId: "F002",
      name: "Central Library",
      available: true,
      status: "MAINTENANCE",
      location: "Academic Hub",
      capacityLabel: "40% Full",
      hvacStatus: "Optimal",
      powerStatus: null,
    },
    {
      facilityId: "F003",
      name: "Athletic Center",
      available: true,
      status: "OPERATIONAL",
      location: "South Campus",
      capacityLabel: "98% Full",
      hvacStatus: "Optimal",
      powerStatus: null,
    },
    {
      facilityId: "F004",
      name: "Media Studio Labs",
      available: false,
      status: "OFFLINE",
      location: "Arts Block",
      capacityLabel: "0% (Closed)",
      hvacStatus: "Offline",
      powerStatus: "Fault Detected",
    },
  ];

  const demoUsers = studentUsers.slice(0, 6);
  const requestFixtures = [
    {
      userId: demoUsers[0].userId,
      title: "AC Repair - Hall 4, Unit 202",
      description: "Cooling is unstable and leaking near air outlet.",
      category: "MAINTENANCE",
      building: "Hall 4",
      room: "202",
      priority: "HIGH",
      status: "IN_PROGRESS",
      commentCount: 1,
      attachmentCount: 1,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-1",
      createdAt: hoursAgo(32),
      updatedAt: hoursAgo(6),
    },
    {
      userId: demoUsers[0].userId,
      title: "Network Downtime - Study Pod 3",
      description: "No internet access and packet loss over campus Wi-Fi.",
      category: "IT_SUPPORT",
      building: "Academic Hub",
      room: "Study Pod 3",
      priority: "MEDIUM",
      status: "PENDING",
      commentCount: 1,
      attachmentCount: 0,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-2",
      createdAt: hoursAgo(18),
      updatedAt: hoursAgo(18),
    },
    {
      userId: demoUsers[0].userId,
      title: "Bulb Replacement - Entrance Hall",
      description: "Main entrance light strip has failed.",
      category: "MAINTENANCE",
      building: "Main Hall",
      room: "Entrance",
      priority: "LOW",
      status: "RESOLVED",
      commentCount: 2,
      attachmentCount: 0,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-3",
      createdAt: hoursAgo(72),
      updatedAt: hoursAgo(12),
    },
    {
      userId: demoUsers[1].userId,
      title: "Security Access Synchronization",
      description: "Temporary keycards are not syncing after shift changes.",
      category: "SECURITY",
      building: "Security Office",
      room: "Access Terminal",
      priority: "MEDIUM",
      status: "DISPATCHED",
      commentCount: 0,
      attachmentCount: 1,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-4",
      createdAt: hoursAgo(22),
      updatedAt: hoursAgo(8),
    },
    {
      userId: demoUsers[2].userId,
      title: "HVAC Leak - Server Room",
      description: "Condensation leak close to rack B in server room.",
      category: "MAINTENANCE",
      building: "Engineering Complex",
      room: "Server Room B",
      priority: "EMERGENCY",
      status: "IN_PROGRESS",
      commentCount: 3,
      attachmentCount: 1,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-5",
      createdAt: hoursAgo(10),
      updatedAt: hoursAgo(3),
    },
    {
      userId: demoUsers[3].userId,
      title: "Office Desk Relocation",
      description: "Move three desks and monitor mounts to room 301.",
      category: "SUPPLIES",
      building: "Admin Wing",
      room: "204 -> 301",
      priority: "LOW",
      status: "PENDING",
      commentCount: 0,
      attachmentCount: 0,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-6",
      createdAt: hoursAgo(14),
      updatedAt: hoursAgo(14),
    },
    {
      userId: demoUsers[4].userId,
      title: "New Keycard Access",
      description: "Contractor keycard approval for west wing data center.",
      category: "SECURITY",
      building: "West Wing",
      room: "Data Center",
      priority: "HIGH",
      status: "PENDING",
      commentCount: 1,
      attachmentCount: 0,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-7",
      createdAt: hoursAgo(5),
      updatedAt: hoursAgo(5),
    },
    {
      userId: demoUsers[5].userId,
      title: "Supplies Restock - Central Admin",
      description: "Restock maintenance and pantry supplies.",
      category: "SUPPLIES",
      building: "Central Admin",
      room: "Storage",
      priority: "LOW",
      status: "SCHEDULED",
      commentCount: 0,
      attachmentCount: 0,
      assigneeAvatarUrl: "https://i.pravatar.cc/150?u=assignee-8",
      createdAt: hoursAgo(9),
      updatedAt: hoursAgo(2),
    },
  ].map((request) => {
    const requestId = randomUUID();

    return {
      requestId,
      ticketCode: ticketCodeFromId(requestId),
      ...request,
    };
  });

  const bookings = [
    {
      bookingId: "B001",
      bookingDate: hoursFromNow(4),
      userId: demoUsers[0].userId,
      facilityId: "F001",
      cancelled: false,
    },
    {
      bookingId: "B002",
      bookingDate: hoursFromNow(26),
      userId: demoUsers[2].userId,
      facilityId: "F002",
      cancelled: false,
    },
    {
      bookingId: "B003",
      bookingDate: hoursAgo(6),
      userId: demoUsers[0].userId,
      facilityId: "F003",
      cancelled: false,
    },
  ];

  const notifications = [
    {
      notificationId: randomUUID(),
      userId: demoUsers[0].userId,
      message: `Your request ${requestFixtures[0].requestId} is now: IN_PROGRESS`,
      sentAt: hoursAgo(6),
      readAt: null,
    },
    {
      notificationId: randomUUID(),
      userId: demoUsers[0].userId,
      message: `Your request ${requestFixtures[2].requestId} is now: RESOLVED`,
      sentAt: hoursAgo(12),
      readAt: null,
    },
    {
      notificationId: randomUUID(),
      userId: demoUsers[1].userId,
      message: `Your request ${requestFixtures[3].requestId} is now: DISPATCHED`,
      sentAt: hoursAgo(8),
      readAt: null,
    },
    {
      notificationId: randomUUID(),
      userId: demoUsers[5].userId,
      message: `Your request ${requestFixtures[7].requestId} is now: SCHEDULED`,
      sentAt: hoursAgo(2),
      readAt: null,
    },
  ];

  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.serviceRequest.deleteMany(),
    prisma.facility.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  await prisma.user.createMany({
    data: [...studentUsers, adminUser],
  });

  await prisma.facility.createMany({
    data: facilities,
  });

  await prisma.serviceRequest.createMany({
    data: requestFixtures,
  });

  await prisma.booking.createMany({
    data: bookings,
  });

  await prisma.notification.createMany({
    data: notifications,
  });

  console.log(
    `Seeded ${studentUsers.length} students, 1 admin, ${facilities.length} facilities, ${requestFixtures.length} requests, ${bookings.length} bookings, and ${notifications.length} notifications from ${csvPath}.`,
  );
}

main()
  .catch((error) => {
    console.error("Prisma seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
