# C4 Context Diagram - Parking Reservation System

## Context
A web-based Parking Reservation System for internal employees to book parking spots.

## Actors
- **Employee**: Can book spots (max 5 days), check-in, release spots.
- **Manager**: Can view dashboard stats, book spots (30 days).
- **Secretary**: Admin access, manage users, manual overrides.
- **System**: The Parking Reservation App (this API).

## Containers
1.  **API Application (NestJS)**:
    -   Handles HTTP requests.
    -   Enforces business rules (Hexagonal Core).
    -   Interacts with Database.
2.  **Database (PostgreSQL)**:
    -   Stores Users, Spots, Reservations, Events.
3.  **Frontend (Web App)**:
    -   Consumed by Users. *Note: Out of scope for this API task, but key context.*
4.  **Notification Service (External)**:
    -   Receives queue messages for emails.

## Diagram (Textual)
[Employee] -> [Frontend] -> [API Application] -> [Database]
[Manager] -> [Frontend] -> [API Application] -> [External Notification Service]
