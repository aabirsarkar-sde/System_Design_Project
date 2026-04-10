import { RequestController } from "../controllers/RequestController";
import { Admin } from "../models/Admin";
import { Booking } from "../models/Booking";
import { Facility } from "../models/Facility";
import { ServiceRequestInput, ServiceRequestStatus } from "../models/ServiceRequest";
import { User } from "../models/User";
import { BookingRepository } from "../repositories/BookingRepository";
import { FacilityRepository } from "../repositories/FacilityRepository";
import { NotificationRepository } from "../repositories/NotificationRepository";
import { RequestRepository } from "../repositories/RequestRepository";
import { UserRepository } from "../repositories/UserRepository";
import { NotificationServiceImpl } from "../services/NotificationServiceImpl";
import { RequestServiceImpl } from "../services/RequestServiceImpl";

export interface AppContext {
  userRepository: UserRepository;
  requestRepository: RequestRepository;
  bookingRepository: BookingRepository;
  facilityRepository: FacilityRepository;
  notificationRepository: NotificationRepository;
  requestController: RequestController;
}

function createUserFixtures(userRepository: UserRepository): Record<string, User> {
  const users: Record<string, User> = {
    U001: new User("U001", "Alex Chen", "alex.chen@campus.edu", "STUDENT", "https://i.pravatar.cc/150?u=u001"),
    U002: new User("U002", "Sarah Jenkins", "sarah.jenkins@campus.edu", "STAFF", "https://i.pravatar.cc/150?u=u002"),
    U003: new User("U003", "Marcus Vane", "marcus.vane@campus.edu", "FACULTY", "https://i.pravatar.cc/150?u=u003"),
    U004: new User("U004", "Li Wei", "li.wei@campus.edu", "STAFF", "https://i.pravatar.cc/150?u=u004"),
    U005: new User("U005", "Tom Reynolds", "tom.reynolds@campus.edu", "ADMIN_STAFF", "https://i.pravatar.cc/150?u=u005"),
    U006: new User("U006", "Elena K", "elena.k@campus.edu", "FACULTY", "https://i.pravatar.cc/150?u=u006"),
    A001: new Admin("A001", "Priya Rao", "priya.rao@campus.edu", "https://i.pravatar.cc/150?u=a001"),
  };

  Object.values(users).forEach((user) => userRepository.save(user));
  return users;
}

function createFacilityFixtures(facilityRepository: FacilityRepository): void {
  const facilities = [
    new Facility("F001", "Engineering Complex"),
    new Facility("F002", "Central Library"),
    new Facility("F003", "Athletic Center"),
    new Facility("F004", "Media Studio Labs"),
  ];

  facilities.forEach((facility) => facilityRepository.save(facility));
  facilityRepository.findById("F004")?.setAvailable(false);
}

function createBookingFixtures(bookingRepository: BookingRepository): void {
  bookingRepository.save(new Booking("B001", new Date(Date.now() + 4 * 60 * 60 * 1000), "U001", "F001"));
  bookingRepository.save(new Booking("B002", new Date(Date.now() + 26 * 60 * 60 * 1000), "U003", "F002"));
  bookingRepository.save(new Booking("B003", new Date(Date.now() - 6 * 60 * 60 * 1000), "U001", "F003"));
}

function createRequestFixture(
  requestController: RequestController,
  owner: User,
  input: ServiceRequestInput,
  status: ServiceRequestStatus,
): void {
  const request = requestController.createRequest(owner, input);
  if (status !== "PENDING") {
    requestController.updateRequestStatus(request, status);
  }
}

function createRequestFixtures(requestController: RequestController, users: Record<string, User>): void {
  createRequestFixture(
    requestController,
    users.U001,
    {
      title: "AC Repair - Hall 4, Unit 202",
      description: "Cooling is unstable and leaking near air outlet.",
      category: "MAINTENANCE",
      building: "Hall 4",
      room: "202",
      priority: "HIGH",
    },
    "IN_PROGRESS",
  );

  createRequestFixture(
    requestController,
    users.U001,
    {
      title: "Network Downtime - Study Pod 3",
      description: "No internet access and packet loss over campus Wi-Fi.",
      category: "IT_SUPPORT",
      building: "Academic Hub",
      room: "Study Pod 3",
      priority: "MEDIUM",
    },
    "PENDING",
  );

  createRequestFixture(
    requestController,
    users.U001,
    {
      title: "Bulb Replacement - Entrance Hall",
      description: "Main entrance light strip has failed.",
      category: "MAINTENANCE",
      building: "Main Hall",
      room: "Entrance",
      priority: "LOW",
    },
    "RESOLVED",
  );

  createRequestFixture(
    requestController,
    users.U002,
    {
      title: "Security Access Synchronization",
      description: "Temporary keycards are not syncing after shift changes.",
      category: "SECURITY",
      building: "Security Office",
      room: "Access Terminal",
      priority: "MEDIUM",
    },
    "DISPATCHED",
  );

  createRequestFixture(
    requestController,
    users.U003,
    {
      title: "HVAC Leak - Server Room",
      description: "Condensation leak close to rack B in server room.",
      category: "MAINTENANCE",
      building: "Engineering Complex",
      room: "Server Room B",
      priority: "EMERGENCY",
    },
    "IN_PROGRESS",
  );

  createRequestFixture(
    requestController,
    users.U004,
    {
      title: "Office Desk Relocation",
      description: "Move three desks and monitor mounts to room 301.",
      category: "SUPPLIES",
      building: "Admin Wing",
      room: "204 -> 301",
      priority: "LOW",
    },
    "PENDING",
  );

  createRequestFixture(
    requestController,
    users.U005,
    {
      title: "New Keycard Access",
      description: "Contractor keycard approval for west wing data center.",
      category: "SECURITY",
      building: "West Wing",
      room: "Data Center",
      priority: "HIGH",
    },
    "PENDING",
  );

  createRequestFixture(
    requestController,
    users.U006,
    {
      title: "Supplies Restock - Central Admin",
      description: "Restock maintenance and pantry supplies.",
      category: "SUPPLIES",
      building: "Central Admin",
      room: "Storage",
      priority: "LOW",
    },
    "SCHEDULED",
  );
}

export function buildAppContext(): AppContext {
  const userRepository = new UserRepository();
  const requestRepository = new RequestRepository();
  const bookingRepository = new BookingRepository();
  const facilityRepository = new FacilityRepository();
  const notificationRepository = new NotificationRepository();

  const notificationService = new NotificationServiceImpl(notificationRepository);
  const requestService = new RequestServiceImpl(notificationService);
  const requestController = new RequestController(requestService, requestRepository);

  const users = createUserFixtures(userRepository);
  createFacilityFixtures(facilityRepository);
  createBookingFixtures(bookingRepository);
  createRequestFixtures(requestController, users);

  return {
    userRepository,
    requestRepository,
    bookingRepository,
    facilityRepository,
    notificationRepository,
    requestController,
  };
}
