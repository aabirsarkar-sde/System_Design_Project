"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAppContext = buildAppContext;
const RequestController_1 = require("../controllers/RequestController");
const Admin_1 = require("../models/Admin");
const Booking_1 = require("../models/Booking");
const Facility_1 = require("../models/Facility");
const User_1 = require("../models/User");
const BookingRepository_1 = require("../repositories/BookingRepository");
const FacilityRepository_1 = require("../repositories/FacilityRepository");
const NotificationRepository_1 = require("../repositories/NotificationRepository");
const RequestRepository_1 = require("../repositories/RequestRepository");
const UserRepository_1 = require("../repositories/UserRepository");
const NotificationServiceImpl_1 = require("../services/NotificationServiceImpl");
const RequestServiceImpl_1 = require("../services/RequestServiceImpl");
function createUserFixtures(userRepository) {
    const users = {
        U001: new User_1.User("U001", "Alex Chen", "alex.chen@campus.edu", "STUDENT", "https://i.pravatar.cc/150?u=u001"),
        U002: new User_1.User("U002", "Sarah Jenkins", "sarah.jenkins@campus.edu", "STAFF", "https://i.pravatar.cc/150?u=u002"),
        U003: new User_1.User("U003", "Marcus Vane", "marcus.vane@campus.edu", "FACULTY", "https://i.pravatar.cc/150?u=u003"),
        U004: new User_1.User("U004", "Li Wei", "li.wei@campus.edu", "STAFF", "https://i.pravatar.cc/150?u=u004"),
        U005: new User_1.User("U005", "Tom Reynolds", "tom.reynolds@campus.edu", "ADMIN_STAFF", "https://i.pravatar.cc/150?u=u005"),
        U006: new User_1.User("U006", "Elena K", "elena.k@campus.edu", "FACULTY", "https://i.pravatar.cc/150?u=u006"),
        A001: new Admin_1.Admin("A001", "Priya Rao", "priya.rao@campus.edu", "https://i.pravatar.cc/150?u=a001"),
    };
    Object.values(users).forEach((user) => userRepository.save(user));
    return users;
}
function createFacilityFixtures(facilityRepository) {
    const facilities = [
        new Facility_1.Facility("F001", "Engineering Complex"),
        new Facility_1.Facility("F002", "Central Library"),
        new Facility_1.Facility("F003", "Athletic Center"),
        new Facility_1.Facility("F004", "Media Studio Labs"),
    ];
    facilities.forEach((facility) => facilityRepository.save(facility));
    facilityRepository.findById("F004")?.setAvailable(false);
}
function createBookingFixtures(bookingRepository) {
    bookingRepository.save(new Booking_1.Booking("B001", new Date(Date.now() + 4 * 60 * 60 * 1000), "U001", "F001"));
    bookingRepository.save(new Booking_1.Booking("B002", new Date(Date.now() + 26 * 60 * 60 * 1000), "U003", "F002"));
    bookingRepository.save(new Booking_1.Booking("B003", new Date(Date.now() - 6 * 60 * 60 * 1000), "U001", "F003"));
}
function createRequestFixture(requestController, owner, input, status) {
    const request = requestController.createRequest(owner, input);
    if (status !== "PENDING") {
        requestController.updateRequestStatus(request, status);
    }
}
function createRequestFixtures(requestController, users) {
    createRequestFixture(requestController, users.U001, {
        title: "AC Repair - Hall 4, Unit 202",
        description: "Cooling is unstable and leaking near air outlet.",
        category: "MAINTENANCE",
        building: "Hall 4",
        room: "202",
        priority: "HIGH",
    }, "IN_PROGRESS");
    createRequestFixture(requestController, users.U001, {
        title: "Network Downtime - Study Pod 3",
        description: "No internet access and packet loss over campus Wi-Fi.",
        category: "IT_SUPPORT",
        building: "Academic Hub",
        room: "Study Pod 3",
        priority: "MEDIUM",
    }, "PENDING");
    createRequestFixture(requestController, users.U001, {
        title: "Bulb Replacement - Entrance Hall",
        description: "Main entrance light strip has failed.",
        category: "MAINTENANCE",
        building: "Main Hall",
        room: "Entrance",
        priority: "LOW",
    }, "RESOLVED");
    createRequestFixture(requestController, users.U002, {
        title: "Security Access Synchronization",
        description: "Temporary keycards are not syncing after shift changes.",
        category: "SECURITY",
        building: "Security Office",
        room: "Access Terminal",
        priority: "MEDIUM",
    }, "DISPATCHED");
    createRequestFixture(requestController, users.U003, {
        title: "HVAC Leak - Server Room",
        description: "Condensation leak close to rack B in server room.",
        category: "MAINTENANCE",
        building: "Engineering Complex",
        room: "Server Room B",
        priority: "EMERGENCY",
    }, "IN_PROGRESS");
    createRequestFixture(requestController, users.U004, {
        title: "Office Desk Relocation",
        description: "Move three desks and monitor mounts to room 301.",
        category: "SUPPLIES",
        building: "Admin Wing",
        room: "204 -> 301",
        priority: "LOW",
    }, "PENDING");
    createRequestFixture(requestController, users.U005, {
        title: "New Keycard Access",
        description: "Contractor keycard approval for west wing data center.",
        category: "SECURITY",
        building: "West Wing",
        room: "Data Center",
        priority: "HIGH",
    }, "PENDING");
    createRequestFixture(requestController, users.U006, {
        title: "Supplies Restock - Central Admin",
        description: "Restock maintenance and pantry supplies.",
        category: "SUPPLIES",
        building: "Central Admin",
        room: "Storage",
        priority: "LOW",
    }, "SCHEDULED");
}
function buildAppContext() {
    const userRepository = new UserRepository_1.UserRepository();
    const requestRepository = new RequestRepository_1.RequestRepository();
    const bookingRepository = new BookingRepository_1.BookingRepository();
    const facilityRepository = new FacilityRepository_1.FacilityRepository();
    const notificationRepository = new NotificationRepository_1.NotificationRepository();
    const notificationService = new NotificationServiceImpl_1.NotificationServiceImpl(notificationRepository);
    const requestService = new RequestServiceImpl_1.RequestServiceImpl(notificationService);
    const requestController = new RequestController_1.RequestController(requestService, requestRepository);
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
//# sourceMappingURL=appContext.js.map