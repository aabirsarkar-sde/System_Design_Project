# Campus Service Management System

A backend starter project for managing campus services, facility bookings, and user requests. Built using clean architecture, OOP, SOLID principles, and the Observer design pattern.

## Project Overview

The Campus Service Management System lets students raise service requests (e.g. maintenance, IT, housekeeping), lets administrators manage and update those requests, and notifies users automatically whenever the status of their request changes. It also models facilities and bookings for future phases.

## Features (Phase 1)

- User and Admin management (role-based)
- Create and track service requests
- Admin-driven status updates
- Automatic user notifications on status change (Observer pattern)
- Facility and Booking models (foundation for Phase 2)
- Console-based notification delivery
- SQL schema for all core entities

## Tech Stack

- **Language:** TypeScript (Node.js runtime)
- **Persistence (Phase 1):** In-memory repositories
- **Database (schema only, Phase 1):** SQL (works with MySQL / PostgreSQL / SQLite)
- **Build:** `tsc` (TypeScript compiler) — optionally `ts-node` for direct execution

## Folder Structure

```
/src
  /models          -> Domain entities (User, Admin, ServiceRequest, ...)
  /interfaces      -> Service contracts (NotificationService, RequestService)
  /services        -> Concrete service implementations
  /controllers     -> Thin entry points that call services
  /repositories    -> In-memory data access layer
  main.ts          -> Demo flow
/db                -> SQL schema
/diagrams          -> UML / class diagrams (to be added)
/docs              -> Project documentation
package.json
tsconfig.json
```

## Design Patterns Used

### Observer Pattern
- **Subject:** `ServiceRequest`
- **Observer:** `NotificationService` (interface) / `NotificationServiceImpl`
- When `ServiceRequest.updateStatus()` is called, `notifyObservers()` fires and every attached `NotificationService` sends a message to the request's owner.
- Observers are attached via `attachObserver()` — typically by `RequestServiceImpl` at request creation time.

This decouples *what changed* from *who needs to know about it*. Adding email or SMS notifications later just means writing another `NotificationService` implementation — no changes to `ServiceRequest`.

## OOP Concepts Used

- **Encapsulation** — all model fields are private/protected with getters
- **Inheritance** — `Admin extends User`
- **Polymorphism** — services depend on interfaces (`NotificationService`, `RequestService`), not concrete classes
- **Abstraction** — interfaces in `/interfaces` define contracts the rest of the code depends on

### SOLID highlights
- **S**RP — each class has one job (controllers route, services orchestrate, repos store)
- **O**CP — new notification channels can be added without modifying existing code
- **L**SP — `Admin` can stand in anywhere `User` is expected
- **I**SP — small, focused interfaces
- **D**IP — high-level modules depend on abstractions, wired manually in `main.ts`

## How to Run

From the project root:

```bash
# 1. Install dev dependencies (TypeScript + ts-node)
npm install

# Option A — run directly with ts-node (fastest for dev)
npm run dev

# Option B — compile to /dist then execute
npm run build
npm start
```

Expected output (abridged):

```
Asha logged in.
Request <uuid> created by Asha
Mr. Rao logged in.
Admin Mr. Rao is reviewing pending requests.
Admin Mr. Rao updating request <uuid> -> IN_PROGRESS
[NOTIFICATION -> U001] Your request <uuid> is now: IN_PROGRESS
Admin Mr. Rao updating request <uuid> -> RESOLVED
[NOTIFICATION -> U001] Your request <uuid> is now: RESOLVED
Asha logged out.
Mr. Rao logged out.
```

To set up the database schema:

```bash
# Example with SQLite
sqlite3 campus.db < db/schema.sql
```
