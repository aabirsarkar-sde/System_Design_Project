-- =====================================================
-- Campus Service Management System — Phase 1 schema
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    user_id     VARCHAR(36)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    role        VARCHAR(20)  NOT NULL  -- e.g. STUDENT, ADMIN, STAFF
);

CREATE TABLE IF NOT EXISTS facilities (
    facility_id VARCHAR(36)  PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    available   BOOLEAN      NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS service_requests (
    request_id  VARCHAR(36)  PRIMARY KEY,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id     VARCHAR(36)  NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id   VARCHAR(36) PRIMARY KEY,
    booking_date TIMESTAMP   NOT NULL,
    user_id      VARCHAR(36) NOT NULL,
    facility_id  VARCHAR(36) NOT NULL,
    cancelled    BOOLEAN     NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id)     REFERENCES users(user_id),
    FOREIGN KEY (facility_id) REFERENCES facilities(facility_id)
);

CREATE TABLE IF NOT EXISTS notifications (
    notification_id VARCHAR(36) PRIMARY KEY,
    message         TEXT        NOT NULL,
    sent_at         TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id         VARCHAR(36) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
