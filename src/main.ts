import { RequestController } from "./controllers/RequestController";
import { NotificationService } from "./interfaces/NotificationService";
import { RequestService } from "./interfaces/RequestService";
import { Admin } from "./models/Admin";
import { User } from "./models/User";
import { RequestRepository } from "./repositories/RequestRepository";
import { UserRepository } from "./repositories/UserRepository";
import { NotificationServiceImpl } from "./services/NotificationServiceImpl";
import { RequestServiceImpl } from "./services/RequestServiceImpl";

/**
 * Demonstrates the basic functional flow:
 *   1. Create a user
 *   2. Create a service request
 *   3. Admin updates the status
 *   4. Notification fires (Observer pattern)
 */
function main(): void {
  // ----- Wiring (manual dependency injection) -----
  const notificationService: NotificationService = new NotificationServiceImpl();
  const requestService: RequestService = new RequestServiceImpl(notificationService);

  const userRepository = new UserRepository();
  const requestRepository = new RequestRepository();
  const requestController = new RequestController(requestService, requestRepository);

  // ----- 1. Create a user -----
  const student = new User("U001", "Asha", "asha@campus.edu", "STUDENT");
  userRepository.save(student);
  student.login();

  // ----- 2. Create a service request -----
  const request = requestController.createRequest(student);

  // ----- 3. Admin updates the status -----
  const admin = new Admin("A001", "Mr. Rao", "rao@campus.edu");
  admin.login();
  admin.manageRequests();
  // Going through the controller keeps everything consistent.
  requestController.updateRequestStatus(request, "IN_PROGRESS");
  requestController.updateRequestStatus(request, "RESOLVED");

  // ----- 4. The notification was triggered automatically
  //         each time the status changed (Observer pattern).

  student.logout();
  admin.logout();
}

main();
