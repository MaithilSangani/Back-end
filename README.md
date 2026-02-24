# Support Ticket Management API

A backend for a company helpdesk system built with **NestJS**, **TypeORM**, and **MySQL**.

Employees raise tickets, support staff handle them, and managers track everything.

## Tech Stack

- **NestJS 11** — Framework
- **TypeORM** — ORM
- **MySQL** — Database (phpMyAdmin)
- **JWT** — Authentication
- **bcrypt** — Password hashing
- **Swagger** — API documentation

## Prerequisites

- **Node.js** >= 18
- **MySQL** server running (e.g., via XAMPP/phpMyAdmin)
- Create a database named `support_tickets` in phpMyAdmin

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment** — edit `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=root
   DB_PASSWORD=
   DB_DATABASE=support_tickets
   JWT_SECRET=super_secret_jwt_key_change_in_production
   JWT_EXPIRES_IN=1d
   ```

3. **Seed the database** (creates roles + default MANAGER user):
   ```bash
   npm run seed
   ```
   This creates:
   - 3 roles: `MANAGER`, `SUPPORT`, `USER`
   - Default admin: `admin@example.com` / `admin123`

4. **Run the server:**
   ```bash
   npm run start:dev
   ```

5. **Open Swagger UI:** [http://localhost:3000/docs](http://localhost:3000/docs)

## API Endpoints

| Endpoint | Method | Roles |
|---|---|---|
| `/auth/login` | POST | Public |
| `/users` | POST | MANAGER |
| `/users` | GET | MANAGER |
| `/tickets` | POST | USER, MANAGER |
| `/tickets` | GET | MANAGER (all), SUPPORT (assigned), USER (own) |
| `/tickets/:id/assign` | PATCH | MANAGER, SUPPORT |
| `/tickets/:id/status` | PATCH | MANAGER, SUPPORT |
| `/tickets/:id` | DELETE | MANAGER |
| `/tickets/:id/comments` | POST | MANAGER; SUPPORT if assigned; USER if owner |
| `/tickets/:id/comments` | GET | MANAGER; SUPPORT if assigned; USER if owner |
| `/comments/:id` | PATCH | MANAGER or comment author |
| `/comments/:id` | DELETE | MANAGER or comment author |

## Testing Flow

1. **Login as MANAGER:**
   ```
   POST /auth/login
   { "email": "admin@example.com", "password": "admin123" }
   ```
   Copy `access_token` from the response.

2. **Create users** (as MANAGER):
   ```
   POST /users
   Authorization: Bearer <token>
   { "name": "Support Agent", "email": "support@example.com", "password": "pass123", "role": "SUPPORT" }
   ```

3. **Create a ticket** (as USER):
   ```
   POST /tickets
   { "title": "My issue title", "description": "Detailed description of the issue", "priority": "HIGH" }
   ```

4. **Assign ticket** (as MANAGER/SUPPORT):
   ```
   PATCH /tickets/1/assign
   { "assigned_to": 2 }
   ```

5. **Update status** (follows OPEN → IN_PROGRESS → RESOLVED → CLOSED):
   ```
   PATCH /tickets/1/status
   { "status": "IN_PROGRESS" }
   ```

## Business Rules

- **Title**: minimum 5 characters
- **Description**: minimum 10 characters
- **Status transitions**: OPEN → IN_PROGRESS → RESOLVED → CLOSED (one step at a time)
- **Assignment**: Cannot assign tickets to users with role USER
- **Passwords**: Stored hashed with bcrypt
- **Auth**: Bearer JWT token required on all protected endpoints

## Project Structure

```
src/
├── auth/           # Authentication (login, JWT, guards)
├── comments/       # Ticket comments CRUD
├── common/         # Shared guards and decorators (RBAC)
├── entities/       # TypeORM entities (Role, User, Ticket, etc.)
├── tickets/        # Ticket CRUD with lifecycle management
├── users/          # User management (MANAGER only)
├── app.module.ts   # Root module
├── main.ts         # Bootstrap with Swagger + validation
└── seed.ts         # Database seeder
```
