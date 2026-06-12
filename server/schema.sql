-- ParkBound database schema (MySQL)
-- Run this once to set up the database:  mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS parkbound
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parkbound;

-- Drop in reverse-dependency order so the script can be re-run cleanly.
DROP TABLE IF EXISTS plan_items;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS users;

-- A registered account.
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- A saved park day. Belongs to one user.
CREATE TABLE plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(120) NOT NULL,
  park        VARCHAR(10)  NOT NULL,           -- mk | ep | hs | ak
  visit_date  DATE NOT NULL,
  bound_film  VARCHAR(80),                     -- the film the user plans to bound to
  notes       TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_plans_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- A single show/event the user added to a plan. Belongs to one plan.
CREATE TABLE plan_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  plan_id     INT NOT NULL,
  event_title VARCHAR(160) NOT NULL,
  event_time  VARCHAR(20),
  event_type  VARCHAR(20),                     -- musical | live | cast | character | parade | dining
  location    VARCHAR(120),
  CONSTRAINT fk_items_plan
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Helpful indexes for the queries the API runs most.
CREATE INDEX idx_plans_user ON plans(user_id);
CREATE INDEX idx_items_plan ON plan_items(plan_id);
